// Import necessary libraries
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/KycAdmin.css";

interface KYCUser {
  uuid: string;
  email: string;
  identity_card_number: string;
  identity_card_url: string; // Add identity card URL field
  face_image_url: string | NULL; // Null initially, until we fetch from the second query
}

export default function KYCAdminPage() {
  const [kycUsers, setKycUsers] = useState<KYCUser[]>([]);

   // Fetch user email, identity card number, and KYCuuid from kyc_users
  useEffect(() => {
    const fetchKYCUsers = async () => {
      const { data, error } = await supabase
        .from("kyc_users")
        .select("uuid, email, identity_card_number, identity_card_url");

      if (error) {
        console.error("Error fetching KYC users:", error);
      } else if (data) {
        // Initialize users with emails and empty image URLs
        setKycUsers(data.map((record) => ({
          uuid: record.uuid,
          email: record.email,
          identity_card_number: record.identity_card_number,
          identity_card_url: record.identity_card_url, // Placeholder for identity card image
          face_image_url: null, // Placeholder
        })));
      }
    };

    fetchKYCUsers();
  }, []);


  // Fetch face images and map them to the respective user by KYCuuid
  useEffect(() => {
    const fetchFaceImages = async () => {
      const { data, error } = await supabase
        .from("kyc_face_images")
        .select("uuid, face_image_url");

      if (error) {
        console.error("Error fetching face images:", error);
      } else if (data) {
        // Map face images to users by matching uuid
        setKycUsers((prevUsers) =>
          prevUsers.map((user) => {
            const imageRecord = data.find((img) => img.uuid === user.uuid);
            return {
              ...user,
              faceImageUrl: imageRecord ? imageRecord.face_image_url : null,
            };
          })
        );
      }
    };

    fetchFaceImages();
  }, []);

  return (
    <div className="kyc-admin-page">
      <h1>KYC Admin Dashboard</h1>
      <div className="face-images-grid">
        {kycUsers.length > 0 ? (
          kycUsers.map((user, index) => (
            <div key={index} className="face-image-card">
              <p>{user.email}</p>
              <p>Identity Number: {user.identity_card_number}</p>

              {user.identity_card_url ? (
                <img src={user.identity_card_url} alt={`Identity Card ${index + 1}`} className="face-image" />
              ) : (
                <p>No identity card available</p>
              )}

              {user.faceImageUrl ? (
                <img src={user.faceImageUrl} alt={`Face Capture ${index + 1}`} className="face-image" />
              ) : (
                <p>No face image available</p>
              )}
            </div>
          ))
        ) : (
          <p>No KYC data found.</p>
        )}
      </div>
    </div>
  );
}





// ********************************************************************************************
// // Import necessary libraries
// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient";
// import "../styles/KycAdmin.css";

// export default function KYCAdminPage() {
//   const [faceImages, setFaceImages] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchFaceImages = async () => {
//       const { data: kyc_face_images, error } = await supabase
//         .from("kyc_face_images")
//         .select("face_image_url");

//       if (error) {
//         console.error("Error fetching face images:", error);
//       } else if (kyc_face_images) {
//         setFaceImages(kyc_face_images.map((record) => record.face_image_url));
//       }
//     };

//     fetchFaceImages();
//   }, []);

//   return (
//     <div className="kyc-admin-page">
//       <h1>KYC Admin Dashboard</h1>
//       <div className="face-images-grid">
//         {faceImages.length > 0 ? (
//           faceImages.map((url, index) => (
//             <div key={index} className="face-image-card">
//               <img src={url} alt={`Face Capture ${index + 1}`} className="face-image" />
//             </div>
//           ))
//         ) : (
//           <p>No face images found.</p>
//         )}
//       </div>
//     </div>
//   );
// }






// *************************************************************
// // Import necessary libraries
// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient";
// import "../styles/KycAdmin.css";

// export default function KYCAdmin() {
//   const [faceImages, setFaceImages] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchFaceImages = async () => {
//       const { data: kyc_face_images, error } = await supabase
//         .from("kyc_face_images")
//         .select("face_image_url");

//       if (error) {
//         console.error("Error fetching face images:", error);
//       } else if (kyc_face_images) {
//         setFaceImages(kyc_face_images.map((record) => record.face_image_url));
//       }
//     };

//     fetchFaceImages();
//   }, []);

//   return (
//     <div className="kyc-admin-page">
//       <h1>KYC Admin Dashboard</h1>
//       <div className="face-images-grid">
//         {faceImages.length > 0 ? (
//           faceImages.map((url, index) => (
//             <div key={index} className="face-image-card">
//               <img src={url} alt={`Face Capture ${index + 1}`} className="face-image" />
//             </div>
//           ))
//         ) : (
//           <p>No face images found.</p>
//         )}
//       </div>
//     </div>
//   );
// }




// *************************************************************************
// // Import necessary libraries
// "use client";

// // import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient.ts"; 
// // import Image from "next/image"; 
// import "../styles/KycAdmin.css"; 


// export default async function KYCAdminPage() {

//     const{ data: kyc_users} = await supabase.from("kyc_users").select();

//     return <pre>{JSON.stringify(kyc_users,null, 0)}</pre>
// }



// *********************************************
// const KycAdmin = () => {
//   const [faceImages, setFaceImages] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchFaceImages = async () => {
//       const { data, error } = await supabase
//         .storage
//         .from("kyc_face_images")
//         .list("faces", { limit: 10, offset: 0 });

//       if (error) {
//         console.error("Error fetching images:", error);
//         return;
//       }

//       // Generate public URLs for images
//       const urls = data.map((file) => {
//         const { publicUrl } = supabase
//           .storage
//           .from("kyc_face_images")
//           .getPublicUrl(`faces/${file.name}`)
//           .data;
//           console.log("Image URL:", publicUrl); // Log each URL
//         return publicUrl || "";
//       });

//       setFaceImages(urls);
//     };

//     fetchFaceImages();
//   }, []);

//   return (
//     <div className="kyc-admin-container">
//       <h1>KYC Admin Dashboard</h1>
//       <div className="face-images-grid">
//         {faceImages.map((url, index) => (
//           <div key={index} className="face-card">
//             <Image
//               src={url}
//               alt={`User Face ${index + 1}`}
//               width={200}
//               height={200}
//               priority
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default KycAdmin;






// ***************************************************************************
// "use client";

// import React, { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
// import "../styles/KycAdmin.css";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl!, supabaseKey!);

// // Define a KYC user type for improved type safety
// interface KYCUser {
//     kycUUID: string;
//     identity_number: string;
//     identity_card: string;
//     kyc_video: string;
//     identityCardUrl?: string;
//     videoUrl?: string;
//   }

// const KYCAdminPage: React.FC = () => {
//   const [kycData, setKycData] = useState<KYCUser[]>([]);

//   useEffect(() => {
//     const fetchKYCData = async () => {
//       // Fetch user data along with identity card image and video
//       const { data, error } = await supabase
//         .from("kyc_users")
//         .select("kycUUID, identity_number, identity_card, kyc_video");

//       if (error) {
//         console.error("Error fetching KYC data:", error);
//         return;
//       }

//       if (data) {
//         // Fetch images and videos from storage
//         const dataWithMedia = await Promise.all(
//           data.map(async (user) => {
//             const identityCardUrl = supabase.storage.from("identity_cards").getPublicUrl(user.identity_card).data.publicUrl;
//             const videoUrl = supabase.storage.from("kyc_videos").getPublicUrl(user.kyc_video).data.publicUrl;

//             return { ...user, identityCardUrl, videoUrl };
//           })
//         );

//         setKycData(dataWithMedia);
//       }
//     };

//     fetchKYCData();
//   }, []);

//   return (
//     <div className="kyc-admin-page">
//       <h1>KYC Admin Dashboard</h1>
//       <div className="kyc-user-list">
//         {kycData.map((user) => (
//           <div key={user.kycUUID} className="kyc-user-card">
//             <p>Identity Number: {user.identity_number}</p>
//             <img src={user.identityCardUrl} alt="Identity Card" />
//             <video src={user.videoUrl} controls />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default KYCAdminPage;





// ***********************************************************************************************************************
// "use client";

// import React from "react";
// import { FaCheckCircle } from "react-icons/fa";
// import { MdCancel } from "react-icons/md";
// import "../styles/KycAdmin.css"; // Link to a stylesheet for any custom styles if needed

// const KYCAdminPage: React.FC = () => {
//   return (
//         <div className="kyc_admin_page">
//             <h1 className="topHeader" >KYC Admin</h1>
//             <fieldset>
//                 <legend>Note To Admins</legend>
//                 <ul>
//                     <li>center your face within the circle | No Facial Accessories</li>
//                     <li>smile for the camera</li>
//                     <li>capture</li>
//                     <li>previe || submit and continue</li>
//                 </ul>
//             </fieldset>

//       {/* This will be the main area for the dashboard content */}

//             <div className="userDataBlock">

//                 <div className="entries">
//                     <span className="entry1">Identity Card</span>
//                     <span className="entry2">Face Image</span>
//                     <span className="entry3">ID Number</span>
//                 </div>

//                 <div className="buttons">
//                     <span className="approve"><FaCheckCircle /></span>
//                     <span className="decline"><MdCancel /></span>
//                 </div>

//             </div>
//         </div>
//   );
// };

// export default KYCAdminPage;
