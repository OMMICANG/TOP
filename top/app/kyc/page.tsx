"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Assuming Supabase is initialized

const KYCForm: React.FC = () => {
  const [name, setName] = useState("");
  const [identityCard, setIdentityCard] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIdentityCard(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !identityCard) {
      setError("Please fill in all the fields.");
      return;
    }

    // Upload file to Supabase storage (optional, depends on how you want to handle identity card image)
    let identityCardURL = "";
    if (identityCard) {
      const { data, error: uploadError } = await supabase.storage
        .from("kyc-identity-cards")
        .upload(`identity-cards/${Date.now()}_${identityCard.name}`, identityCard);

      if (uploadError) {
        setError("Failed to upload identity card. Try again.");
        return;
      }

      identityCardURL = data?.path || "";
    }

    // Insert data into Supabase
    const { error: dbError } = await supabase.from("kyc_users").insert([
      {
        name,
        identity_card_url: identityCardURL,
      },
    ]);

    if (dbError) {
      setError("Failed to submit. Try again.");
      return;
    }

    setSuccess(true);
    setName("");
    setIdentityCard(null);
  };

  return (
    <div>
      <h1>KYC Verification</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>KYC submitted successfully!</p>}
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
          <label>Upload Identity Card</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default KYCForm;





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
