"use client";

import React, { useRef, useState, useEffect } from "react";
// import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import IsMobile from "../../../components/IsMobile";
import "../../../styles/VideoCapture.css"; // Add this for custom styling

const VideoCapture: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [timer, setTimer] = useState(0); // Timer for recording session
  const [showCountdown, setShowCountdown] = useState(3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const router = useRouter();


  //  Is Recording Effect
  useEffect(() => {
    if (isRecording) {
      const countdownTimer = setInterval(() => {
        setShowCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownTimer);
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && showCountdown === 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 10) {
            stopRecording(); // Stop recording automatically after 10 seconds
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRecording, showCountdown]);

  // Function to start video recording with a 3-second timer
  const startRecording = () => {
    setError(null);
    setShowCountdown(3); // Set 3-second countdown
    setTimer(0); // Reset timer
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Video recording is not supported in this browser.");
      return;
    }

    const countdownBeforeRecording = setTimeout(() => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true }) // Audio/Video Data Media Collection
        .then((stream) => {
          const videoElement = videoRef.current;
          if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play();
          }

          mediaRecorderRef.current = new MediaRecorder(stream);
          const chunks: Blob[] = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            chunks.push(event.data);
          };

          mediaRecorderRef.current.onstop = () => {
            const videoBlob = new Blob(chunks, { type: "video/webm" });
            setVideoBlob(videoBlob);
            stream.getTracks().forEach((track) => track.stop()); // Stop the camera
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);

          // Auto-stop after 10 seconds
          setTimeout(() => {
            stopRecording();
          }, 10000); // 10 seconds timer
        })
        .catch(() => {
          setError("Failed to access the camerahone and Microp. Please try again.");
        });
    }, 3000); // Start after 3 seconds

    return () => clearTimeout(countdownBeforeRecording);
  };

  // Function to stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Function to preview the recorded video
  const previewVideo = () => {
    if (videoBlob) {
      setIsPreviewing(true);
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.srcObject = null; // Detach camera stream
        videoElement.src = URL.createObjectURL(videoBlob); // Load recorded video
        videoElement.play();
      }
    } else {
      setError("No video recorded yet.");
    }
  };

  // Function to upload the video and send the email
  const submitVideo = async () => {
    setError(null);
    setCapturing(true);

    // Retrieve the UUID from localStorage
    const kycUUID = Cookies.get("kycUUID");
    // const kyc_progress = Cookies.get("kyc_progress");
    // console.log(kyc_progress);
    
    if (!kycUUID) {
      setError("Session expired or invalid. Please restart the KYC process.");
      setCapturing(false);
      return;
    }

    if (videoBlob) {

      try {
        const formData = new FormData();
        formData.append("kycUUID", kycUUID);
        formData.append("video", videoBlob);

        const response = await fetch("/utils/actions/kycPhase3/", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Failed to submit the video. Try again.");
          setCapturing(false);
          return;
        }

      // Cookies.set("kyc_progress", "kycPhase3-completed", { path: "/" });
      router.push("/kyc/success"); // Navigate to the KYC completion page
      
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setCapturing(false);
    }
  }
  };

  return (
    <IsMobile>
      <div className="video-capture-container">

      <fieldset>
          <legend>video recording</legend>
          <ul>
            <li>center your face within the circle</li>
            <li>Start Recording and say the words below:</li>
            <li>Hi, i am (your full name). | i am ommicang</li>
            <li>preview video and do not close preview || submit and continue</li>
          </ul>
        </fieldset>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="webcam-wrapper">
        <div className="video-wrapper">
          {showCountdown > 0 && <div className="countdown">{showCountdown}</div>}
          <div className="circle-overlay"></div> {/* Add the circle overlay */}
          <video ref={videoRef} className="video-feed" />
        </div>
        </div>

        {isRecording ? (
          <div>
            <p className="recording-timer">Recording... {timer}/10s</p>

            <span className="buttonContainer">

            <button onClick={stopRecording} disabled={timer >= 10}>
              Stop Recording
            </button>

            </span>
          </div>
        ) : (          
          <button onClick={startRecording}>Start Recording</button>
        )}



        {videoBlob && !isRecording && (
          <>
            <button onClick={previewVideo}>Preview Video</button>
            {isPreviewing && (
              <button onClick={submitVideo} disabled={capturing}>
                {capturing ? "Processing..." : "Submit Video"}
              </button>

            )}
          </>
        )}

      </div>
    </IsMobile>
  );
};

export default VideoCapture;
