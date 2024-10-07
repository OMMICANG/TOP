"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import "../../styles/FaceCapture.css"; // Add this for custom styling

const FaceCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const router = useRouter();

  const capture = async () => {
    setError(null);

    // Retrieve the UUID from localStorage
    const kycUUID = localStorage.getItem("kycUUID");

    if (!kycUUID) {
      setError("Session expired or invalid. Please restart the KYC process.");
      return;
    }

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

      // Get the public URL of the uploaded face image
      const publicURL = supabase.storage
        .from("kyc_face_images")
        .getPublicUrl(data.path).data.publicUrl;

      if (!publicURL) {
        setError("Failed to retrieve public URL of the face image.");
        setCapturing(false);
        return;
      }

      // Update user data in Supabase with the face image URL using the UUID
      const { error: dbError } = await supabase
        .from("kyc_users")
        .update({ face_image_url: publicURL })
        .eq("uuid", kycUUID); // Ensure we update the correct user row

      if (dbError) {
        setError("Failed to update face image. Please try again.");
        setCapturing(false);
        return;
      }

      // Navigate to the next phase (video submission)
      router.push("/kyc/video");
    }
  };

  return (
    <div className="face-capture-container">
      <h1>Face Capture</h1>
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

      <button onClick={capture} disabled={capturing}>
        {capturing ? "Processing..." : "Capture and Continue"}
      </button>
    </div>
  );
};

export default FaceCapture;





// ******************************************************************************************************************
// "use client";

// import React, { useRef, useState } from "react";
// import Webcam from "react-webcam";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from "next/navigation";
// import "../../styles/FaceCapture.css"; // Add this for custom styling

// const FaceCapture: React.FC = () => {
//   const webcamRef = useRef<Webcam>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [capturing, setCapturing] = useState(false);
//   const router = useRouter();

//   const capture = async () => {
//     setError(null);

//     // Retrieve the UUID from localStorage
//     const kycUUID = localStorage.getItem("kycUUID");

//     if (!kycUUID) {
//       setError("Session expired or invalid. Please restart the KYC process.");
//       return;
//     }

//     if (webcamRef.current) {
//       const imageSrc = webcamRef.current.getScreenshot();

//       if (!imageSrc) {
//         setError("Failed to capture image. Please try again.");
//         return;
//       }

//       setCapturing(true);

//       // Convert the image from base64 to a file (Blob)
//       const base64Response = await fetch(imageSrc);
//       const blob = await base64Response.blob();

//       // Upload the image to Supabase storage
//       const { data, error: uploadError } = await supabase.storage
//         .from("kyc_face_images")
//         .upload(`faces/${Date.now()}_face.png`, blob);

//       if (uploadError) {
//         setError("Failed to upload face image. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Get the face image URL
//       const faceImageURL = data?.path || "";

//       // Update user data in Supabase with the face image URL using the UUID
//       const { error: dbError } = await supabase
//         .from("kyc_users")
//         .update({ face_image_url: faceImageURL })
//         .eq("uuid", kycUUID); // Ensure we update the correct user row

//       if (dbError) {
//         setError("Failed to update face image. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Navigate to the next phase (video submission)
//       router.push("/kyc/video");
//     }
//   };

//   return (
//     <div className="face-capture-container">
//       <h1>Face Capture</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}
      
//       <div className="webcam-wrapper">
//         <div className="circle-wrapper">
//           <Webcam
//             audio={false}
//             ref={webcamRef}
//             screenshotFormat="image/png"
//             className="webcam-feed"
//           />
//         </div>
//       </div>
      
//       <button onClick={capture} disabled={capturing}>
//         {capturing ? "Processing..." : "Capture and Continue"}
//       </button>
//     </div>
//   );
// };

// export default FaceCapture;




// *******************************************************************************************************
// "use client";

// import React, { useRef, useState } from 'react';
// import Webcam from "react-webcam";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from 'next/navigation';
// import '../../styles/FaceCapture.css'; // Add this for custom styling

// const FaceCapture: React.FC = () => {
//   const webcamRef = useRef<Webcam>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [capturing, setCapturing] = useState(false);
//   const router = useRouter();

//   const capture = async () => {
//     setError(null);
//     if (webcamRef.current) {
//       const imageSrc = webcamRef.current.getScreenshot();

//       if (!imageSrc) {
//         setError("Failed to capture image. Please try again.");
//         return;
//       }

//       setCapturing(true);

//       // Convert the image from base64 to a file (Blob)
//       const base64Response = await fetch(imageSrc);
//       const blob = await base64Response.blob();

//       // Upload the image to Supabase storage
//       const { data, error: uploadError } = await supabase.storage
//         .from("kyc_face_images")
//         .upload(`faces/${Date.now()}_face.png`, blob);

//       if (uploadError) {
//         setError("Failed to upload face image. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Update user data in Supabase with the face image URL
//       const faceImageURL = data?.path || "";
//       const { error: dbError } = await supabase.from("kyc_users").update({ 
//         face_image_url: faceImageURL,
//       });

//       if (dbError) {
//         setError("Failed to update face image. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Navigate to the next phase (video submission)
//       router.push('/kyc/video');
//     }
//   };

//   return (
//     <div className="face-capture-container">
//       <h1>Face Capture</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}
      
//       <div className="webcam-wrapper">
//         <div className="circle-wrapper">
//           <Webcam
//             audio={false}
//             ref={webcamRef}
//             screenshotFormat="image/png"
//             className="webcam-feed"
//           />
//         </div>
//       </div>
      
//       <button onClick={capture} disabled={capturing}>
//         {capturing ? "Processing..." : "Capture and Continue"}
//       </button>
//     </div>
//   );
// };

// export default FaceCapture;



// ************************************************************************

// import React, { useRef, useState, useEffect, useMemo } from 'react';
// import Webcam from "react-webcam";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from 'next/navigation';
// import cv from 'opencv.js'; // Ensure you have opencv.js installed or imported

// const FaceCapture: React.FC = () => {
//   const webcamRef = useRef<Webcam>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [capturing, setCapturing] = useState(false);
//   const router = useRouter();

//   // Use useMemo to memoize the classifier, so it's not re-created on each render
//   const classifier = useMemo(() => {
//     return new cv.CascadeClassifier();
//   }, []);

//   // Load the Haar Cascade Classifier
//   useEffect(() => {
//     // Fetch the XML file content from the public folder
//     const fetchHaarCascade = async () => {
//       const response = await fetch('/haarcascades/haarcascade_frontalface_default.xml');
//       const data = await response.text();
      
//       // Create the file in OpenCV's virtual filesystem
//       cv.FS_createDataFile('/', 'haarcascade_frontalface_default.xml', data, true, false, false);
      
//       // Load the classifier with the correct path
//       classifier.load('haarcascade_frontalface_default.xml');
//     };

//     fetchHaarCascade();
//   }, [classifier]);

//   const detectFace = (imageSrc: string) => {
//     const img = cv.imread(imageSrc); // Convert base64 image to Mat
//     const gray = new cv.Mat();
//     cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY); // Convert image to grayscale

//     // Detect faces
//     const faces = new cv.RectVector();
//     classifier.detectMultiScale(gray, faces, 1.1, 3, 0); // Detect faces

//     // Cleanup
//     img.delete();
//     gray.delete();

//     return faces.size() > 0; // Return true if faces are detected
//   };

//   const capture = async () => {
//     setError(null);
//     if (webcamRef.current) {
//       const imageSrc = webcamRef.current.getScreenshot();

//       if (!imageSrc) {
//         setError("Failed to capture image. Please try again.");
//         return;
//       }

//       // Check for face detection
//       if (!detectFace(imageSrc)) {
//         setError("No face detected. Please make sure your face is visible.");
//         return;
//       }

//       setCapturing(true);

//       // Convert the image from base64 to a file (Blob)
//       const base64Response = await fetch(imageSrc);
//       const blob = await base64Response.blob();

//       // Upload the image to Supabase storage
//       const { data, error: uploadError } = await supabase.storage
//         .from("kyc_face_images")
//         .upload(`faces/${Date.now()}_face.png`, blob);

//       if (uploadError) {
//         setError("Failed to upload face image. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Update user data in Supabase with the face image URL
//       const faceImageURL = data?.path || "";
//       const { error: dbError } = await supabase.from("kyc_users").update({
//         face_image_url: faceImageURL,
//       });

//       if (dbError) {
//         setError("Failed to update face image. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Navigate to the next phase (video submission)
//       router.push('/kyc/video');
//     }
//   };

//   return (
//     <div>
//       <h1>Face Capture</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <Webcam
//         audio={false}
//         ref={webcamRef}
//         screenshotFormat="image/png"
//       />
//       <button onClick={capture} disabled={capturing}>
//         {capturing ? "Processing..." : "Capture and Continue"}
//       </button>
//     </div>
//   );
// };

// export default FaceCapture;





// "use client";

// import React, { useRef, useState } from 'react';
// import Webcam from "react-webcam";
// import { supabase } from "../../lib/supabaseClient";
// import { useRouter } from 'next/navigation';

// const FaceCapture: React.FC = () => {
//   const webcamRef = useRef<Webcam>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [capturing, setCapturing] = useState(false);
//   const router = useRouter();

//   const capture = async () => {
//     setError(null);
//     if (webcamRef.current) {
//       const imageSrc = webcamRef.current.getScreenshot();

//       if (!imageSrc) {
//         setError("Failed to capture image. Please try again.");
//         return;
//       }

//       setCapturing(true);

//       // Convert the image from base64 to a file (Blob)
//       const base64Response = await fetch(imageSrc);
//       const blob = await base64Response.blob();

//       // Upload the image to Supabase storage
//       const { data, error: uploadError } = await supabase.storage
//         .from("kyc_face_images")
//         .upload(`faces/${Date.now()}_face.png`, blob);

//       if (uploadError) {
//         setError("Failed to upload face image. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Update user data in Supabase with the face image URL
//       const faceImageURL = data?.path || "";
//       const { error: dbError } = await supabase.from("kyc_users").update({
//         face_image_url: faceImageURL,
//       });

//       if (dbError) {
//         setError("Failed to update face image. Please try again.");
//         setCapturing(false);
//         return;
//       }

//       // Navigate to the next phase (video submission)
//       router.push('/kyc/video');
//     }
//   };

//   return (
//     <div>
//       <h1>Face Capture</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <Webcam
//         audio={false}
//         ref={webcamRef}
//         screenshotFormat="image/png"
//       />
//       <button onClick={capture} disabled={capturing}>
//         {capturing ? "Processing..." : "Capture and Continue"}
//       </button>
//     </div>
//   );
// };

// export default FaceCapture;
