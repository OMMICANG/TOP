"use client";

import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import IsMobile from "../../components/IsMobile";
import "../../styles/VideoCapture.css"; // Custom styling

const VideoCapture: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [timer, setTimer] = useState(0); // Timer for recording session
  const [showCountdown, setShowCountdown] = useState(3); // Countdown for recording start
  const [hasPreviewed, setHasPreviewed] = useState(false); // Track if user has previewed
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const router = useRouter();

  // Countdown effect before starting the recording
  useEffect(() => {
    if (showCountdown > 0 && isRecording) {
      const countdownInterval = setInterval(() => {
        setShowCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [showCountdown, isRecording]);

  // Timer effect for 10-second recording
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

  // Function to start video recording
  const startRecording = () => {
    setError(null);
    setShowCountdown(3); // Set 3-second countdown
    setTimer(0); // Reset timer
    setHasPreviewed(false); // Reset preview status

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Video recording is not supported in this browser.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
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
      })
      .catch(() => {
        setError("Failed to access the camera. Please try again.");
      });
  };

  // Function to stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Function to handle video preview
  const handlePreview = () => {
    if (videoBlob) {
      setHasPreviewed(true); // Mark the video as previewed
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.src = URL.createObjectURL(videoBlob);
        videoElement.controls = true;
        videoElement.play();
      }
    }
  };

  // Function to upload the video
  const submitVideo = async () => {
    if (!hasPreviewed) {
      setError("Please preview the video before submitting.");
      return;
    }

    setError(null);
    setCapturing(true);

    // Retrieve the UUID from localStorage
    const kycUUID = localStorage.getItem("kycUUID");

    if (!kycUUID) {
      setError("Session expired or invalid. Please restart the KYC process.");
      setCapturing(false);
      return;
    }

    if (videoBlob) {
      // Upload the video to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from("kyc_videos")
        .upload(`videos/${Date.now()}_video.webm`, videoBlob);

      if (uploadError) {
        setError("Failed to upload video. Please try again.");
        setCapturing(false);
        return;
      }

      // Get the public URL of the uploaded video
      const publicURL = supabase.storage
        .from("kyc_videos")
        .getPublicUrl(data?.path)
        .data.publicUrl;

      if (!publicURL) {
        setError("Failed to retrieve the public URL of the video.");
        setCapturing(false);
        return;
      }

      // Update Supabase with the video URL in the new kyc_videos table
      const { error: dbError } = await supabase.from("kyc_videos").insert([
        {
          uuid: kycUUID,
          video_url: publicURL,
        },
      ]);

      if (dbError) {
        setError("Failed to submit the video. Please try again.");
        setCapturing(false);
        return;
      }

      setCapturing(false);
      router.push("/kyc/complete"); // Navigate to the KYC completion page
    }
  };

  return (
    <IsMobile>
      <div className="video-capture-container">
        <h1>Video Capture</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="video-wrapper">
          <video ref={videoRef} className="video-feed" />
        </div>

        {showCountdown > 0 && isRecording && (
          <p className="countdown-timer">
            Recording starts in {showCountdown}...
          </p>
        )}

        {isRecording ? (
          <div>
            <p className="recording-timer">Recording... {timer}/10s</p>
            <button onClick={stopRecording} disabled={timer >= 10}>
              Stop Recording
            </button>
          </div>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}

        {videoBlob && !isRecording && (
          <>
            <button onClick={handlePreview}>Preview Video</button>
            <button onClick={submitVideo} disabled={capturing}>
              {capturing ? "Processing..." : "Submit Video"}
            </button>
          </>
        )}
      </div>
    </IsMobile>
  );
};

export default VideoCapture;



// *****************************************************************************************************
// "use client";

// import React, { useRef, useState } from "react";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from "next/navigation";
// import IsMobile from "../../components/IsMobile";
// import "../../styles/VideoCapture.css"; // Add this for custom styling

// const VideoCapture: React.FC = () => {
//   const [error, setError] = useState<string | null>(null);
//   const [capturing, setCapturing] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const router = useRouter();

//   // Function to start video recording
//   const startRecording = () => {
//     setError(null);
//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       setError("Video recording is not supported in this browser.");
//       return;
//     }

//     navigator.mediaDevices
//       .getUserMedia({ video: true })
//       .then((stream) => {
//         const videoElement = videoRef.current;
//         if (videoElement) {
//           videoElement.srcObject = stream;
//           videoElement.play();
//         }

//         mediaRecorderRef.current = new MediaRecorder(stream);
//         const chunks: Blob[] = [];

//         mediaRecorderRef.current.ondataavailable = (event) => {
//           chunks.push(event.data);
//         };

//         mediaRecorderRef.current.onstop = () => {
//           const videoBlob = new Blob(chunks, { type: "video/webm" });
//           setVideoBlob(videoBlob);
//           stream.getTracks().forEach((track) => track.stop()); // Stop the camera
//         };

//         mediaRecorderRef.current.start();
//         setIsRecording(true);
//       })
//       .catch(() => {
//         setError("Failed to access the camera. Please try again.");
//       });
//   };

//   // Function to stop video recording
//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   // Function to upload the video
//   const submitVideo = async () => {
//     setError(null);
//     setCapturing(true);

//     // Retrieve the UUID from localStorage
//     const kycUUID = localStorage.getItem("kycUUID");

//     if (!kycUUID) {
//       setError("Session expired or invalid. Please restart the KYC process.");
//       setCapturing(false);
//       return;
//     }

//     if (videoBlob) {
//       // Upload the video to Supabase storage
//       const { data, error: uploadError } = await supabase.storage
//         .from("kyc_videos")
//         .upload(`videos/${Date.now()}_video.webm`, videoBlob);

//       if (uploadError) {
//         setError("Failed to upload video. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Get the public URL of the uploaded video
//       const publicURL = supabase.storage
//         .from("kyc_videos")
//         .getPublicUrl(data?.path)
//         .data.publicUrl;

//       if (!publicURL) {
//         setError("Failed to retrieve the public URL of the video.");
//         setCapturing(false);
//         return;
//       }

//       // Update Supabase with the video URL in the new kyc_videos table
//       const { error: dbError } = await supabase.from("kyc_videos").insert([
//         {
//           uuid: kycUUID,
//           video_url: publicURL,
//         },
//       ]);

//       if (dbError) {
//         setError("Failed to submit the video. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       setCapturing(false);
//       router.push("/kyc/complete"); // Navigate to the KYC completion page
//     }
//   };

//   return (
//     <IsMobile>
//     <div className="video-capture-container">
//       <h1>Video Capture</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       <div className="video-wrapper">
//         <video ref={videoRef} className="video-feed" />
//       </div>

//       {isRecording ? (
//         <button onClick={stopRecording}>Stop Recording</button>
//       ) : (
//         <button onClick={startRecording}>Start Recording</button>
//       )}

//       {videoBlob && !isRecording && (
//         <button onClick={submitVideo} disabled={capturing}>
//           {capturing ? "Processing..." : "Submit Video"}
//         </button>
//       )}
//     </div>
//     </IsMobile>
//   );
// };

// export default VideoCapture;
