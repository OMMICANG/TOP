"use client";

import React, { useRef, useState, useEffect } from "react";
// import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import {kycPhase3} from "../../../utils/actions/kycPhase3/route.ts"
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

    if (!kycUUID) {
      setError("Session expired or invalid. Please restart the KYC process.");
      setCapturing(false);
      return;
    }

    if (videoBlob) {
      // // Upload the video to Supabase storage
      // const { data, error: uploadError } = await supabase.storage
      //   .from("kyc_videos")
      //   .upload(`videos/${Date.now()}_video.webm`, videoBlob);

      // if (uploadError) {
      //   setError("Failed to upload video. Please try again.");
      //   setCapturing(false);
      //   return;
      // }

      // // Get the public URL of the uploaded video
      // const publicURL = supabase.storage
      //   .from("kyc_videos")
      //   .getPublicUrl(data?.path)
      //   .data.publicUrl;

      // if (!publicURL) {
      //   setError("Failed to retrieve the public URL of the video.");
      //   setCapturing(false);
      //   return;
      // }

      // // Update Supabase with the video URL in the new kyc_videos table
      // const { error: dbError } = await supabase.from("kyc_videos").insert([
      //   {
      //     uuid: kycUUID,
      //     video_url: publicURL,
      //   },
      // ]);

      // if (dbError) {
      //   setError("Failed to submit the video. Please try again.");
      //   setCapturing(false);
      //   return;
      // }
      const response = await kycPhase3(kycUUID, videoBlob);

      if (response.error) {
        setError(response.error);
        setCapturing(false);
        return;
      }
  
        
      router.push("/kyc/success"); // Navigate to the KYC completion page
      
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
            <li>hi, i am (your full name). | i am ommicang</li>
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

        {/* {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )} */}

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
