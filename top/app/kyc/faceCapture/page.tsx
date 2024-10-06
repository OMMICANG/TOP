"use client";

import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from 'next/navigation';

const FaceCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const router = useRouter();

  const capture = async () => {
    setError(null);
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
        setError("Failed to capture image. Please try again.");
        return;
      }

      setCapturing(true);

      // Convert the image from base64 to a file (Blob)
      const base64Response = await fetch(imageSrc);
      const blob = await base64Response.blob();

      // Upload the image to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from("kyc_face_images")
        .upload(`faces/${Date.now()}_face.png`, blob);

      if (uploadError) {
        setError("Failed to upload face image. Please try again.");
        setCapturing(false);
        return;
      }

      // Update user data in Supabase with the face image URL
      const faceImageURL = data?.path || "";
      const { error: dbError } = await supabase.from("kyc_users").update({
        face_image_url: faceImageURL,
      });

      if (dbError) {
        setError("Failed to update face image. Please try again.");
        setCapturing(false);
        return;
      }

      // Navigate to the next phase (video submission)
      router.push('/kyc/video');
    }
  };

  return (
    <div>
      <h1>Face Capture</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
      />
      <button onClick={capture} disabled={capturing}>
        {capturing ? "Processing..." : "Capture and Continue"}
      </button>
    </div>
  );
};

export default FaceCapture;
