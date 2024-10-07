"use client";

import React, { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

const VideoSubmission: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // For holding the entire KYC data locally (Phase 1 and Phase 2 inputs)
  const [kycData] = useState({
    name: "",  // Placeholder for name
    identityCard: null as File | null, // Placeholder for identity card (File)
    faceImage: "", // Placeholder for base64 string of face image
  });

  const startRecording = async () => {
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      setVideoBlob(blob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setCapturing(true);

    try {
      if (!videoBlob) {
        setError("Please record a video before submitting.");
        setCapturing(false);
        return;
      }

      // Upload identity document to Supabase storage
      const { data: identityData, error: identityError } = await supabase.storage
        .from("kyc_identity_cards")
        .upload(`identity-cards/${Date.now()}_${kycData.identityCard?.name}`, kycData.identityCard as File);

      if (identityError) {
        throw new Error("Failed to upload identity document.");
      }

      const identityCardURL = identityData?.path || "";

      // Upload face image to Supabase storage
      const { data: faceData, error: faceError } = await supabase.storage
        .from("kyc_face_images")
        .upload(`faces/${Date.now()}_face.png`, await fetch(kycData.faceImage).then(res => res.blob()));

      if (faceError) {
        throw new Error("Failed to upload face image.");
      }

      const faceImageURL = faceData?.path || "";

      // Upload video to Supabase storage
      const { data: videoData, error: videoError } = await supabase.storage
        .from("kyc_videos")
        .upload(`videos/${Date.now()}_video.mp4`, videoBlob);

      if (videoError) {
        throw new Error("Failed to upload video.");
      }

      const videoURL = videoData?.path || "";

      // Insert all data into Supabase (Phase 1, Phase 2, and Phase 3)
      const { error: insertError } = await supabase.from("kyc_users").insert({
        name: kycData.name,
        identity_card_url: identityCardURL,
        face_image_url: faceImageURL,
        video_url: videoURL,
      });

      if (insertError) {
        throw new Error("Failed to submit KYC data.");
      }

      // Navigate to the success page or show a success message
      router.push("/kyc/success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div>
      <h1>Video Submission</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <video ref={videoRef} autoPlay muted />
      {!recording && <button onClick={startRecording}>Start Recording</button>}
      {recording && <button onClick={stopRecording}>Stop Recording</button>}
      <button onClick={handleSubmit} disabled={capturing}>
        {capturing ? "Submitting..." : "Submit KYC"}
      </button>
    </div>
  );
};

export default VideoSubmission;
