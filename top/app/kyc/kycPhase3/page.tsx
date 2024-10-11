"use client";

import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import IsMobile from "../../components/IsMobile";
import "../../styles/VideoCapture.css"; // Add this for custom styling
import ffmpeg from '@ffmpeg/ffmpeg'; // Import ffmpeg.js

const VideoCapture: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const router = useRouter();
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // Load ffmpeg
  useEffect(() => {
    const loadFfmpeg = async () => {
      await ffmpeg.load();
      setFfmpegLoaded(true);
    };
    loadFfmpeg();
  }, []);

  // Function to start video recording with 7-second limit
  const startRecording = () => {
    setError(null);
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

        // Automatically stop recording after 7 seconds
        setTimeout(() => {
          if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
          }
        }, 7000);

        setIsRecording(true);
      })
      .catch(() => {
        setError("Failed to access the camera. Please try again.");
      });
  };

  // Function to compress the video using ffmpeg
  const compressVideo = async (videoBlob: Blob) => {
    if (!ffmpegLoaded) {
      setError("Video compression is not available at the moment.");
      return videoBlob;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(videoBlob);
    return new Promise<Blob>((resolve, reject) => {
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        ffmpeg.FS("writeFile", "input.webm", new Uint8Array(arrayBuffer));

        await ffmpeg.run("-i", "input.webm", "-c:v", "libx264", "-crf", "28", "-preset", "fast", "output.mp4");
        const data = ffmpeg.FS("readFile", "output.mp4");

        const compressedBlob = new Blob([data.buffer], { type: "video/mp4" });
        resolve(compressedBlob);
      };
      reader.onerror = reject;
    });
  };

  // Function to stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Function to upload the video
  const submitVideo = async () => {
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
      // Check if video size is larger than 5MB
      let processedVideoBlob = videoBlob;
      if (videoBlob.size > 5 * 1024 * 1024) {
        // Compress video if it's larger than 5MB
        processedVideoBlob = await compressVideo(videoBlob);
      }

      // Check again if compressed video size is still larger than 5MB
      if (processedVideoBlob.size > 5 * 1024 * 1024) {
        setError("The video is too large, even after compression. Please try recording again.");
        setCapturing(false);
        return;
      }

      // Upload the video to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from("kyc_videos")
        .upload(`videos/${Date.now()}_video.mp4`, processedVideoBlob);

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

        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}

        {videoBlob && !isRecording && (
          <button onClick={submitVideo} disabled={capturing}>
            {capturing ? "Processing..." : "Submit Video"}
          </button>
        )}
      </div>
    </IsMobile>
  );
};

export default VideoCapture;



// **************************************************************************************************
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
