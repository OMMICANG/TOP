"use client";

import React, { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import IsMobile from "../../components/IsMobile";
import "../../styles/VideoCapture.css"; // Add this for custom styling
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
 // Use the alternative import syntax

const ffmpeg = FFmpeg.createFFmpeg({ log: true }); // Initialize ffmpeg instance

const VideoCapture: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const router = useRouter();

  // Function to start video recording
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

  // Compress video using ffmpeg
  const compressVideo = async (inputBlob: Blob) => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load(); // Load ffmpeg
    }

    // Convert video to a smaller size and format (e.g., MP4)
    ffmpeg.FS("writeFile", "input.webm", await FFmpeg.fetchFile(inputBlob)); // Write the file to memory

    await ffmpeg.run(
      "-i",
      "input.webm",
      "-vf",
      "scale=640:360", // Reduce the resolution
      "-c:v",
      "libx264",
      "-crf",
      "28", // Adjust quality
      "-preset",
      "slow",
      "output.mp4"
    ); // Compress the video

    const compressedData = ffmpeg.FS("readFile", "output.mp4"); // Read the output
    const compressedBlob = new Blob([compressedData.buffer], { type: "video/mp4" }); // Convert to Blob
    return compressedBlob;
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
      try {
        const compressedVideo = await compressVideo(videoBlob); // Compress the video

        // Check file size (should be less than 5MB)
        if (compressedVideo.size > 5 * 1024 * 1024) {
          setError("Video size exceeds the limit of 5MB.");
          setCapturing(false);
          return;
        }

        // Upload the video to Supabase storage
        const { data, error: uploadError } = await supabase.storage
          .from("kyc_videos")
          .upload(`videos/${Date.now()}_video.mp4`, compressedVideo);

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
      } catch (compressionError) {
        console.log(compressionError);
        setError("Error compressing the video. Please try again.");
        setCapturing(false);
      }
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
