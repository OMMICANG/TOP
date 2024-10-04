"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import '../styles/Kyc.css'; // Ensure you have custom styles for this page

const KYCPage: React.FC = () => {
  const router = useRouter();

  // States to manage form inputs
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [document, setDocument] = useState<File | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !address || !document) {
      alert("Please fill all fields and upload a document.");
      return;
    }

    // Mock API request to submit KYC data
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("document", document);

      // Simulating API request
      const response = await fetch("/api/submitKYC", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // If submission is successful, redirect user to a success page or dashboard
        router.push("/kyc-success");
      } else {
        alert("Error submitting KYC, please try again.");
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
      alert("There was a problem with your submission. Please try again later.");
    }
  };

  return (
    <div className="kyc-page">
      <h1>KYC Verification</h1>
      <p>Kindly fill in your details and upload a verification document.</p>
      <form onSubmit={handleSubmit} className="kyc-form">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        
        <label htmlFor="document">Upload ID Document</label>
        <input
          type="file"
          id="document"
          onChange={(e) => setDocument(e.target.files ? e.target.files[0] : null)}
          accept=".jpg,.jpeg,.png,.pdf"
          required
        />
        
        <button type="submit" className="submit-button">Submit KYC</button>
      </form>
    </div>
  );
};

export default KYCPage;
