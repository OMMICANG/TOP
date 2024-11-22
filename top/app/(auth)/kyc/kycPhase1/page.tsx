"use client";

import { useRef, useState } from "react";
// import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation"; // For navigation to the next phase
import ReCAPTCHA from "react-google-recaptcha";
import { FaCircleUser } from "react-icons/fa6";
import { verifyCaptcha } from "../../../pages/api/ServerActions";  // Recaptcha Server Path
import Cookies from "js-cookie";
import IsMobile from "../../../components/IsMobile";
import "../../../styles/KycPhase1.css";
import Compressor from "compressorjs"; // Import compressorjs

// Define the type for identity options
type IdentityOptionsType = {
  [key: string]: string[]; // This allows dynamic string keys with values as string arrays
};

// Define a list of countries and their respective identity card types
const identityOptions: IdentityOptionsType = {
  "Nigeria": ["NIN"],
  "United Kingdom": ["Passport"],
  // Add more countries and their respective IDs as needed
};
const KYCPhase1 = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(""); // New state for selected country
  const [identityType, setIdentityType] = useState(""); // State for selected identity type
  const [identityCardNumber, setIdentityCardNumber] = useState(""); // State for identity card number input
  const [identityCard, setIdentityCard] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false); // To track upload status
  const router = useRouter(); // Use Next.js router for navigation
  const recaptchaRef = useRef(null);
  const [isVerified, setIsverified] = useState<boolean>(false);

  async function handleCaptchaSubmission(token: string | null) {
    // Server function to verify captcha
    await verifyCaptcha(token)
      .then(() => setIsverified(true))
      .catch(() => setIsverified(false));
  }

  // Email Regex for stricter validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle file change with validation for file type and size
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (image)
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG and PNG are allowed.");
        return;
      }

      // Validate file size (max 5MB)
      const maxSizeInMB = 5;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSizeInMB}MB.`);
        return;
      }

      // Compress the file before setting it
      new Compressor(file, {
        quality: 0.6, // Adjust the quality of compression
        success: (compressedFile) => {
          setIdentityCard(compressedFile as File);
        },
        error(err) {
          console.error("Compression failed:", err.message);
          setError("Failed to compress the image.");
        },
      });
    }
  };

  // Handle form submission with validation and sanitization
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(true);

    // Simple input sanitization by trimming white spaces
    const sanitizedEmail = email.trim();
    const sanitizedName = name.trim();

    // Validate inputs
    if (!sanitizedName || !sanitizedEmail || !country || !identityType || !identityCardNumber || !identityCard || !isVerified) { 
      setError("Please fill in all the fields and complete the reCAPTCHA.");
      setUploading(false);
      return;
    }

    if (!emailRegex.test(sanitizedEmail)) {
      setError("Invalid email format.");
      setUploading(false);
      return;
    }

    // Server Action Event From Here
    const formData = new FormData();
    formData.append("name", sanitizedName);
    formData.append("email", sanitizedEmail);
    formData.append("country", country);
    formData.append("identityType", identityType);
    formData.append("identityCardNumber", identityCardNumber);
    formData.append("identityCard", identityCard!);

    try {
      const response = await fetch("/utils/actions/kycPhase1/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unknown error occurred");

        // Extract `kycUUID` from the result
        const { kycUUID } = result; // Adjust here
        console.log("Server Response:", result);
        if (!kycUUID) throw new Error("kycUUID not returned by server");

    // Generate a unique UUID for the KYC process
    // const kycUUID = crypto.randomUUID();

    // // Upload file to Supabase storage
    // let identityCardURL = "";

    // if (identityCard) {
    //   const { data, error: uploadError } = await supabase.storage
    //     .from("kyc_identity_cards")
    //     .upload(`identity-cards/${Date.now()}_${identityCard.name}`, identityCard);

    //   if (uploadError) {
    //     setError("Failed to upload identity card. Try again.");
    //     setUploading(false);
    //     return;
    //   }

    //   identityCardURL = supabase.storage
    //   .from("kyc_identity_cards")
    //   .getPublicUrl(data?.path)
    //   .data.publicUrl; //data?.path || "";
    // }

    // // Insert data into Supabase with the generated UUID
    // const { error: dbError } = await supabase.from("kyc_users").insert([
    //   {
    //     uuid: kycUUID,  // Storing the UUID
    //     name: sanitizedName,
    //     email: sanitizedEmail,
    //     country,  // Store selected country
    //     identity_type: identityType, // Store the selected identity type
    //     identity_card_number: identityCardNumber, // Store the ID card number
    //     identity_card_url: identityCardURL,
    //   },
    // ]);

    // if (dbError) {
    //   setError("Failed to submit. Try again.");
    //   setUploading(false);
    //   return;
    // }


    // Store the UUID in localStorage for subsequent phases
    
    Cookies.set("kycUUID", kycUUID);

    setSuccess(true);
    setName("");
    setEmail("");
    setCountry(""); // Reset country field
    setIdentityType("");
    setIdentityCardNumber("");
    setIdentityCard(null);
    setUploading(false);

    // Navigate to Phase 2 (Face Capture)
    router.push("/kyc/faceCapture");

  } catch (error) {
    setError(error.message);
  } finally {
    setName("");
    setEmail("");
    setCountry(""); // Reset country field
    setIdentityType("");
    setIdentityCardNumber("");
    setIdentityCard(null);
    setUploading(false);
  }
};

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    setIdentityType(""); // Reset identity type when country changes
    setIdentityCardNumber(""); // Reset ID card number when country changes
  };

  return (
    <IsMobile>
      <div className="kycPhase1Container">
        <span className="circleUser"><FaCircleUser /></span>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>Identity details submitted successfully! Proceeding to Face Capture...</p>}
        <form onSubmit={handleSubmit}>

          <fieldset>
            <legend>KYC VERIFICATION</legend>

            <div className="name">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter Full Name"
              />
            </div>

            <div className="email">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter Email"
              />
            </div>

            <div className="country">
              <label>Country:</label>
              <select value={country} onChange={handleCountryChange} required>
                <option value="">Select Country</option>
                {Object.keys(identityOptions).map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {country && (
              <>
                <div className="identityType">
                  <label>Identity Type:</label>
                  <select value={identityType} onChange={(e) => setIdentityType(e.target.value)} required>
                    <option value="">Select Identity Type</option>
                    {identityOptions[country]?.map((type: string) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="idNumber">
                  <label>{identityType} ID Number:</label>
                  <input
                    type="text"
                    value={identityCardNumber}
                    onChange={(e) => setIdentityCardNumber(e.target.value)}
                    required
                    placeholder={`Enter your ${identityType} number`}
                  />
                </div>
              </>
            )}


            <span className="upload">
              <label>ID:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </span>

          </fieldset>

          <span className="buttonContainer">
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Submit & Continue"}
            </button>
          </span>

          {/* reCAPTCHA component */}
          <span className="recaptcha">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              ref={recaptchaRef}
              onChange={handleCaptchaSubmission}
            />
          </span>
        </form>
      </div>
    </IsMobile>
  );
};

export default KYCPhase1;




// **********************************************************************************************************
// "use client";

// import { useRef, useState } from "react";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from "next/navigation"; // For navigation to the next phase
// import ReCAPTCHA from "react-google-recaptcha";
// import { FaCircleUser } from "react-icons/fa6";
// import { verifyCaptcha } from "../../api/ServerActions";  // Recaptcha Server Path
// import IsMobile from "../../components/IsMobile";
// import "../../styles/KycPhase1.css";
// import Compressor from "compressorjs"; // Import compressorjs

// // Define a list of countries for the dropdown
// const countries = [
//   "Nigeria", "United Kingdom",
//   // Add more countries as needed
// ];

// const KYCPhase1 = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [country, setCountry] = useState(""); // New state for selected country
//   const [identityCard, setIdentityCard] = useState<File | null>(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [uploading, setUploading] = useState(false); // To track upload status
//   const router = useRouter(); // Use Next.js router for navigation
//   const recaptchaRef = useRef(null);
//   const [isVerified, setIsverified] = useState<boolean>(false)
  
  
//     async function handleCaptchaSubmission(token: string | null) {
//       // Server function to verify captcha
//       await verifyCaptcha(token)
//         .then(() => setIsverified(true))
//         .catch(() => setIsverified(false))
//     }
  
 
//   // Email Regex for stricter validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   // Handle file change with validation for file type and size
//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       // Validate file type (image)
//       const allowedTypes = ["image/jpeg", "image/png"];
//       if (!allowedTypes.includes(file.type)) {
//         setError("Invalid file type. Only JPEG and PNG are allowed.");
//         return;
//       }

//       // Validate file size (max 5MB)
//       const maxSizeInMB = 5;
//       if (file.size > maxSizeInMB * 1024 * 1024) {
//         setError(`File is too large. Maximum size is ${maxSizeInMB}MB.`);
//         return;
//       }

//       // Compress the file before setting it
//       new Compressor(file, {
//         quality: 0.6, // Adjust the quality of compression
//         success: (compressedFile) => {
//           setIdentityCard(compressedFile as File);
//         },
//         error(err) {
//           console.error("Compression failed:", err.message);
//           setError("Failed to compress the image.");
//         },
//       });
//     }
//   };

//   // Handle form submission with validation and sanitization
//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setSuccess(false);
//     setUploading(true);

//     // Simple input sanitization by trimming white spaces
//     const sanitizedEmail = email.trim();
//     const sanitizedName = name.trim();

//     // Validate inputs
//     if (!sanitizedName || !sanitizedEmail || !country || !identityCard || !isVerified) { 
//       setError("Please fill in all the fields and complete the reCAPTCHA.");
//       setUploading(false);
//       return;
//     }

//     if (!emailRegex.test(sanitizedEmail)) {
//       setError("Invalid email format.");
//       setUploading(false);
//       return;
//     }

//     // Generate a unique UUID for the KYC process
//     const kycUUID = crypto.randomUUID();

//     // Upload file to Supabase storage
//     let identityCardURL = "";
//     if (identityCard) {
//       const { data, error: uploadError } = await supabase.storage
//         .from("kyc_identity_cards")
//         .upload(`identity-cards/${Date.now()}_${identityCard.name}`, identityCard);

//       if (uploadError) {
//         setError("Failed to upload identity card. Try again.");
//         setUploading(false);
//         return;
//       }

//       identityCardURL = data?.path || "";
//     }

//     // Insert data into Supabase with the generated UUID
//     const { error: dbError } = await supabase.from("kyc_users").insert([
//       {
//         uuid: kycUUID,  // Storing the UUID
//         name: sanitizedName,
//         email: sanitizedEmail, // Email is now sanitized
//         country,  // Store selected country
//         identity_card_url: identityCardURL,
//       },
//     ]);

//     if (dbError) {
//       setError("Failed to submit. Try again.");
//       setUploading(false);
//       return;
//     }

//     // Store the UUID in localStorage for subsequent phases
//     localStorage.setItem("kycUUID", kycUUID);
//     console.log('Stored UUID:', kycUUID); // Log the UUID

//     setSuccess(true);
//     setName("");
//     setEmail(""); // Reset email field
//     setCountry(""); // Reset country field
//     setIdentityCard(null);
//     setUploading(false);

//     console.log('Stored UUID:', kycUUID); // Log the UUID

//     // Navigate to Phase 2 (Face Capture)
//     router.push("/kyc/faceCapture");
// };

//   return (
//     <IsMobile>
//       <div className="kycPhase1Container">
//       <span className="circleUser"><FaCircleUser /></span>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {success && <p style={{ color: "green" }}>Identity details submitted successfully! Proceeding to Face Capture...</p>}
//         <form onSubmit={handleSubmit}>

//           <fieldset>
//             <legend> KYC VERIFICATION</legend>

//           <div className="name">
//             <label>Name:</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               placeholder="Enter Name"
//             />
//           </div>

//           <div className="email">
//             <label>Email:</label> {/* Email field */}
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder="Enter Email"
//             />
//           </div>

//           <div className="country">
//               <label>Country:</label>
//               <select value={country} onChange={(e) => setCountry(e.target.value)} required>
//                 <option value="">Select Country</option>
//                 {countries.map((country) => (
//                   <option key={country} value={country}>
//                     {country}
//                   </option>
//                 ))}
//               </select>
//             </div>

//           <span className="upload">
//             <label>ID:</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               required
//             />
//           </span>

//           </fieldset>

//           <span className="buttonContainer">
//           <button type="submit" disabled={uploading}>
//             {uploading ? "Uploading..." : "Submit & Continue"}
//           </button>
//           </span>


//           {/* reCAPTCHA component */}
//           <span className="recaptcha">
//           <ReCAPTCHA
//             sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
//             ref={recaptchaRef}
//             onChange={handleCaptchaSubmission}
//           />
//           </span>
//         </form>
//       </div>
//     </IsMobile>
//   );
// };

// export default KYCPhase1;