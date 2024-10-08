"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation"; // For navigation to the next phase
import IsMobile from "../../components/IsMobile";
// import { loadReCaptcha, ReCaptcha } from "react-google-recaptcha-v3"; // V3 recaptcha
import "../../styles/Kyc.css";
import Compressor from "compressorjs"; // Import compressorjs

const KYCPhase1: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identityCard, setIdentityCard] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false); // To track upload status
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null); // For CAPTCHA Verification
  const router = useRouter(); // Use Next.js router for navigation

 // Load reCAPTCHA V3 and execute it when the component mounts
 useEffect(() => {
  const loadRecaptchaScript = () => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  const executeRecaptcha = () => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        new Promise<void>((resolve, reject) => {
          window.grecaptcha
            .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action: "kycPhase1" })
            .then((token: string) => {
              setRecaptchaToken(token);
              resolve(); // Resolving the promise after setting the token
            }, (error) => {
              reject(error); // Rejecting the promise if any error occurs
            });
        }).catch((error) => {
          if (error instanceof Error) {
            console.error("Error generating reCAPTCHA token:", error.message);
            setError("Error generating reCAPTCHA token. Please try again.");
          }
          });
      });
    }
  };

  loadRecaptchaScript();
  executeRecaptcha();
}, []);



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
    if (!sanitizedName || !sanitizedEmail || !identityCard || !recaptchaToken) { // Add for Recaptcha|| !recaptchaToken
      setError("Please fill in all the fields and complete the reCAPTCHA.");
      setUploading(false);
      return;
    }

    if (!emailRegex.test(sanitizedEmail)) {
      setError("Invalid email format.");
      setUploading(false);
      return;
    }

  // Verify reCAPTCHA token before proceeding
  try {
    const recaptchaRes = await fetch("/api/recaptcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recaptchaToken }),
    });
    const recaptchaData = await recaptchaRes.json();

    if (!recaptchaData.success) {
      setError("Failed to verify reCAPTCHA. Try again.");
      setUploading(false);
      return;
    }
    // Generate a unique UUID for the KYC process
    const kycUUID = crypto.randomUUID();

    // Upload file to Supabase storage
    let identityCardURL = "";
    if (identityCard) {
      const { data, error: uploadError } = await supabase.storage
        .from("kyc_identity_cards")
        .upload(`identity-cards/${Date.now()}_${identityCard.name}`, identityCard);

      if (uploadError) {
        setError("Failed to upload identity card. Try again.");
        setUploading(false);
        return;
      }

      identityCardURL = data?.path || "";
    }

    // Insert data into Supabase with the generated UUID
    const { error: dbError } = await supabase.from("kyc_users").insert([
      {
        uuid: kycUUID,  // Storing the UUID
        name: sanitizedName,
        email: sanitizedEmail, // Email is now sanitized
        identity_card_url: identityCardURL,
      },
    ]);

    if (dbError) {
      setError("Failed to submit. Try again.");
      setUploading(false);
      return;
    }

    // Store the UUID in localStorage for subsequent phases
    localStorage.setItem("kycUUID", kycUUID);
    console.log('Stored UUID:', kycUUID); // Log the UUID

    setSuccess(true);
    setName("");
    setEmail(""); // Reset email field
    setIdentityCard(null);
    setUploading(false);

    console.log('Stored UUID:', kycUUID); // Log the UUID

    // Navigate to Phase 2 (Face Capture)
    router.push("/kyc/faceCapture");
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);  // Log the error for debugging
    setError("An error occurred. Please try again.");
    setUploading(false);
  }
};

  return (
    <IsMobile>
      <div>
        <h1>KYC Verification - Phase 1</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>Identity details submitted successfully! Proceeding to Face Capture...</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email</label> {/* Email field */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Upload Identity Card</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Submit & Continue"}
          </button>
           {/* <ReCaptcha action="kycPhase1" verifyCallback={setRecaptchaToken} /> */}
        </form>
      </div>
    </IsMobile>
  );
};

export default KYCPhase1;



// *************************************************************************************
// "use client";

// import { useState } from "react";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from "next/navigation"; // For navigation to the next phase
// import IsMobile from "../../components/IsMobile";
// import "../../styles/Kyc.css";
// import Compressor from "compressorjs"; // Import compressorjs

// const KYCPhase1: React.FC = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState(""); // Added email field
//   const [identityCard, setIdentityCard] = useState<File | null>(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [uploading, setUploading] = useState(false); // To track upload status
//   const router = useRouter(); // Use Next.js router for navigation

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
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

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setSuccess(false);
//     setUploading(true);

//     if (!name || !email || !identityCard) {
//       setError("Please fill in all the fields.");
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
//         name,
//         email, // Adding email to the table
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
//     setIdentityCard(null);
//     setUploading(false);

//     console.log('Stored UUID:', kycUUID); // Log the UUID

//     // Navigate to Phase 2 (Face Capture)
//     router.push("/kyc/faceCapture");
//   };

//   return (
//     <IsMobile>
//       <div>
//         <h1>KYC Verification - Phase 1</h1>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {success && <p style={{ color: "green" }}>Identity details submitted successfully! Proceeding to Face Capture...</p>}
//         <form onSubmit={handleSubmit}>
//           <div>
//             <label>Name</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Email</label> {/* Email field */}
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Upload Identity Card</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               required
//             />
//           </div>
//           <button type="submit" disabled={uploading}>
//             {uploading ? "Uploading..." : "Submit & Continue"}
//           </button>
//         </form>
//       </div>
//     </IsMobile>
//   );
// };

// export default KYCPhase1;



// ***************************************************************************************************************
// "use client";

// import { useState } from "react";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from "next/navigation"; // For navigation to the next phase
// import IsMobile from "../../components/IsMobile";
// import "../../styles/Kyc.css";

// const KYCPhase1: React.FC = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState(""); // New state for email
//   const [identityCard, setIdentityCard] = useState<File | null>(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const router = useRouter(); // Use Next.js router for navigation

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setIdentityCard(file);
//     }
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setSuccess(false);

//     if (!name || !email || !identityCard) {
//       setError("Please fill in all the fields.");
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
//         return;
//       }

//       identityCardURL = data?.path || "";
//     }

//     // Insert data into Supabase with the generated UUID
//     const { error: dbError } = await supabase.from("kyc_users").insert([
//       {
//         uuid: kycUUID,  // Storing the UUID
//         name,
//         email,  // Storing email in the database
//         identity_card_url: identityCardURL,
//       },
//     ]);

//     if (dbError) {
//       setError("Failed to submit. Try again.");
//       return;
//     }

//     // Store the UUID in localStorage for subsequent phases
//     localStorage.setItem("kycUUID", kycUUID);

//     console.log('Stored UUID:', kycUUID); // Log the UUID


//     setSuccess(true);
//     setName("");
//     setEmail(""); // Clear email after success
//     setIdentityCard(null);

//     console.log('Stored UUID:', kycUUID); // Log the UUID


//     // Navigate to Phase 2 (Face Capture)
//     router.push("/kyc/faceCapture");
//   };

//   return (
//     <IsMobile>
//       <div>
//         <h1>KYC Verification - Phase 1</h1>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {success && <p style={{ color: "green" }}>Identity details submitted successfully! Proceeding to Face Capture...</p>}
//         <form onSubmit={handleSubmit}>
//           <div>
//             <label>Name</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Email</label> {/* New email field */}
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Upload Identity Card</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               required
//             />
//           </div>
//           <button type="submit">Submit & Continue</button>
//         </form>
//       </div>
//     </IsMobile>
//   );
// };

// export default KYCPhase1;




// *******************************************************************************************************************
// "use client";

// import { useState } from "react";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from "next/navigation"; // For navigation to the next phase
// import IsMobile from "../../components/IsMobile";
// import "../../styles/Kyc.css";

// const KYCPhase1: React.FC = () => {
//   const [name, setName] = useState("");
//   const [identityCard, setIdentityCard] = useState<File | null>(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const router = useRouter(); // Use Next.js router for navigation

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setIdentityCard(file);
//     }
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setSuccess(false);

//     if (!name || !identityCard) {
//       setError("Please fill in all the fields.");
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
//         return;
//       }

//       identityCardURL = data?.path || "";
//     }

//     // Insert data into Supabase with the generated UUID
//     const { error: dbError } = await supabase.from("kyc_users").insert([
//       {
//         uuid: kycUUID,  // Storing the UUID
//         name,
//         identity_card_url: identityCardURL,
//       },
//     ]);

//     if (dbError) {
//       setError("Failed to submit. Try again.");
//       return;
//     }

//     // Store the UUID in localStorage for subsequent phases
//     localStorage.setItem("kycUUID", kycUUID);

//     setSuccess(true);
//     setName("");
//     setIdentityCard(null);

//     // Navigate to Phase 2 (Face Capture)
//     router.push("/kyc/faceCapture");
//   };

//   return (
//     <IsMobile>
//       <div>
//         <h1>KYC Verification - Phase 1</h1>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {success && <p style={{ color: "green" }}>Identity details submitted successfully! Proceeding to Face Capture...</p>}
//         <form onSubmit={handleSubmit}>
//           <div>
//             <label>Name</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Upload Identity Card</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               required
//             />
//           </div>
//           <button type="submit">Submit & Continue</button>
//         </form>
//       </div>
//     </IsMobile>
//   );
// };

// export default KYCPhase1;




// **************************************************************************************************
// "use client";

// import { useState } from "react";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from "next/navigation"; // For navigation to the next phase
// import IsMobile from "../../components/IsMobile";
// import "../../styles/Kyc.css";

// const KYCPhase1: React.FC = () => {
//   const [name, setName] = useState("");
//   const [identityCard, setIdentityCard] = useState<File | null>(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const router = useRouter(); // Use Next.js router for navigation

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setIdentityCard(file);
//     }
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setSuccess(false);

//     if (!name || !identityCard) {
//       setError("Please fill in all the fields.");
//       return;
//     }

//     // Upload file to Supabase storage
//     let identityCardURL = "";
//     if (identityCard) {
//       const { data, error: uploadError } = await supabase.storage
//         .from("kyc_identity_cards")
//         .upload(`identity-cards/${Date.now()}_${identityCard.name}`, identityCard);

//       if (uploadError) {
//         setError("Failed to upload identity card. Try again.");
//         return;
//       }

//       identityCardURL = data?.path || "";
//     }

//     // Insert data into Supabase
//     const { error: dbError } = await supabase.from("kyc_users").insert([
//       {
//         name,
//         identity_card_url: identityCardURL,
//       },
//     ]);

//     if (dbError) {
//       setError("Failed to submit. Try again.");
//       return;
//     }

//     setSuccess(true);
//     setName("");
//     setIdentityCard(null);

//     // Navigate to Phase 2 (Face Capture)
//     router.push("/kyc/faceCapture");
//   };

//   return (
//     <IsMobile>
//       <div>
//         <h1>KYC Verification - Phase 1</h1>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {success && <p style={{ color: "green" }}>Identity details submitted successfully! Proceeding to Face Capture...</p>}
//         <form onSubmit={handleSubmit}>
//           <div>
//             <label>Name</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Upload Identity Card</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               required
//             />
//           </div>
//           <button type="submit">Submit & Continue</button>
//         </form>
//       </div>
//     </IsMobile>
//   );
// };

// export default KYCPhase1;






//********************************************************************** */

// "use client";

// import { useState } from "react";
// import { supabase } from "../lib/supabaseClient"; // Assuming Supabase is initialized
// import IsMobile from '../components/IsMobile';
// import '../styles/Kyc.css'; // Ensure you have custom styles for this page

// const KYCForm: React.FC = () => {
//   const [name, setName] = useState("");
//   const [identityCard, setIdentityCard] = useState<File | null>(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setIdentityCard(file);
//     }
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setSuccess(false);

//     if (!name || !identityCard) {
//       setError("Please fill in all the fields.");
//       return;
//     }

//     // Upload file to Supabase storage (optional, depends on how you want to handle identity card image)
//     let identityCardURL = "";
//     if (identityCard) {
//       const { data, error: uploadError } = await supabase.storage
//         .from("kyc_identity_cards")
//         .upload(`identity-cards/${Date.now()}_${identityCard.name}`, identityCard);

//       if (uploadError) {
//         setError("Failed to upload identity card. Try again.");
//         return;
//       }

//       identityCardURL = data?.path || "";
//     }

//     // Insert data into Supabase
//     const { error: dbError } = await supabase.from("kyc_users").insert([
//       {
//         name,
//         identity_card_url: identityCardURL,
//       },
//     ]);

//     if (dbError) {
//       setError("Failed to submit. Try again.");
//       return;
//     }

//     setSuccess(true);
//     setName("");
//     setIdentityCard(null);
//   };

//   return (
//     <IsMobile>
//     <div>
//       <h1>KYC Verification</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {success && <p style={{ color: "green" }}>KYC submitted successfully!</p>}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Name</label>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Upload Identity Card</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             required
//           />
//         </div>
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//     </IsMobile>
//   );
// };

// export default KYCForm;





// *************************************************************************
// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import '../styles/Kyc.css'; // Ensure you have custom styles for this page

// const KYCPage: React.FC = () => {
//   const router = useRouter();

//   // States to manage form inputs
//   const [name, setName] = useState("");
//   const [address, setAddress] = useState("");
//   const [document, setDocument] = useState<File | null>(null);

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!name || !address || !document) {
//       alert("Please fill all fields and upload a document.");
//       return;
//     }

//     // Mock API request to submit KYC data
//     try {
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("address", address);
//       formData.append("document", document);

//       // Simulating API request
//       const response = await fetch("/api/submitKYC", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         // If submission is successful, redirect user to a success page or dashboard
//         router.push("/kyc-success");
//       } else {
//         alert("Error submitting KYC, please try again.");
//       }
//     } catch (error) {
//       console.error("Error submitting KYC:", error);
//       alert("There was a problem with your submission. Please try again later.");
//     }
//   };

//   return (
//     <div className="kyc-page">
//       <h1>KYC Verification</h1>
//       <p>Kindly fill in your details and upload a verification document.</p>
//       <form onSubmit={handleSubmit} className="kyc-form">
//         <label htmlFor="name">Full Name</label>
//         <input
//           type="text"
//           id="name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />
        
//         <label htmlFor="address">Address</label>
//         <input
//           type="text"
//           id="address"
//           value={address}
//           onChange={(e) => setAddress(e.target.value)}
//           required
//         />
        
//         <label htmlFor="document">Upload ID Document</label>
//         <input
//           type="file"
//           id="document"
//           onChange={(e) => setDocument(e.target.files ? e.target.files[0] : null)}
//           accept=".jpg,.jpeg,.png,.pdf"
//           required
//         />
        
//         <button type="submit" className="submit-button">Submit KYC</button>
//       </form>
//     </div>
//   );
// };

// export default KYCPage;
