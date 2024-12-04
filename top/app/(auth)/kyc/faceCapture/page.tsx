"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
// import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import the Next.js Image component
import Cookies from "js-cookie";
import IsMobile from "../../../components/IsMobile";
import "../../../styles/FaceCapture.css"; // Custom styling

const FaceCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // Store the captured image
  const [previewImage, setPreviewImage] = useState<string | null>(null); // For the preview
  const [hasPreviewed, setHasPreviewed] = useState(false); // Track if the user has previewed
  const router = useRouter();

  const capture = () => {
    setError(null);

    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("Failed to capture image. Please try again.");
        return;
      }

      setCapturedImage(imageSrc); // Store the captured image but don't preview it yet
      setHasPreviewed(false); // Reset preview status after every new capture
    }
  };

  const handlePreview = () => {
    if (capturedImage) {
      setPreviewImage(capturedImage); // Set the captured image for preview
      setHasPreviewed(true); // Mark the image as previewed
    }
  };

  const submitCapture = async () => {
    if (!hasPreviewed) {
      setError("Kindly, Preview Image once, before you Submit.");
      return;
    }

    setError(null);
    setCapturing(true);

    // Retrieve the UUID from localStorage
    const kycUUID = Cookies.get("kycUUID");
    if (!kycUUID) {
      setError("Session expired or invalid. Please restart the KYC process.");
      return;
    }

    if (previewImage) {
      try {
      // Convert the image from base64 to a file (Blob)
      const base64Response = await fetch(previewImage);
      const blob = await base64Response.blob();

      // Receive Api Response
      const formData = new FormData();
        formData.append("kycUUID", kycUUID);
        formData.append("faceImage", blob);

        const response = await fetch("/utils/actions/kycPhase2/", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Failed to submit face image. Try again.");
          setCapturing(false);
          return;
        }

      // Navigate to the next phase (video submission)
      router.push("/kyc/kycPhase3"); // Fix: Route to kycPhase3
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Try again.");
      setCapturing(false);
    }
  }
};

  return (
    <IsMobile>
      <div className="face-capture-container">

        <fieldset>
          <legend>face capture</legend>
          <ul>
            <li>center your face within the circle | No Facial Accessories</li>
            <li>smile for the camera</li>
            <li>capture</li>
            <li>previe || submit and continue</li>
          </ul>
        </fieldset>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="webcam-wrapper">
          <div className="circle-wrapper">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              className="webcam-feed"
            />
          </div>
        </div>

        <span className="buttonContainer">

        <button className="captureBtn" onClick={capture}>
          {capturedImage ? "Retake" : "Capture"}
        </button>

        {capturedImage && !previewImage && (
          <p>Image captured successfully! Click Preview to view Captured Image.</p>
        )}

        {previewImage && (
          <div className="preview-section">
            <h3>Preview</h3>
            {/* Use Next.js Image component for optimized rendering */}
            <Image
              src={previewImage}
              alt="Captured face"
              width={400} // Set appropriate dimensions
              height={400}
              priority
            />
            {/* <button onClick={handleClosePreview}>Close Preview</button> */}
          </div>
        )}

        {capturedImage && (
          <button onClick={handlePreview}>Preview Image</button>
        )}

        <button onClick={submitCapture} disabled={capturing}>
          {capturing ? "Processing..." : "Submit & Continue"}
        </button>

        </span>
      </div>
    </IsMobile>
  );
};

export default FaceCapture;
