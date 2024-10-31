"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "../styles/KycAdmin.css";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

// Define a KYC user type for improved type safety
interface KYCUser {
    kycUUID: string;
    identity_number: string;
    identity_card: string;
    kyc_video: string;
    identityCardUrl?: string;
    videoUrl?: string;
  }

const KYCAdminPage: React.FC = () => {
  const [kycData, setKycData] = useState<KYCUser[]>([]);

  useEffect(() => {
    const fetchKYCData = async () => {
      // Fetch user data along with identity card image and video
      const { data, error } = await supabase
        .from("kyc_users")
        .select("kycUUID, identity_number, identity_card, kyc_video");

      if (error) {
        console.error("Error fetching KYC data:", error);
        return;
      }

      if (data) {
        // Fetch images and videos from storage
        const dataWithMedia = await Promise.all(
          data.map(async (user) => {
            const identityCardUrl = supabase.storage.from("identity_cards").getPublicUrl(user.identity_card).data.publicUrl;
            const videoUrl = supabase.storage.from("kyc_videos").getPublicUrl(user.kyc_video).data.publicUrl;

            return { ...user, identityCardUrl, videoUrl };
          })
        );

        setKycData(dataWithMedia);
      }
    };

    fetchKYCData();
  }, []);

  return (
    <div className="kyc-admin-page">
      <h1>KYC Admin Dashboard</h1>
      <div className="kyc-user-list">
        {kycData.map((user) => (
          <div key={user.kycUUID} className="kyc-user-card">
            <p>Identity Number: {user.identity_number}</p>
            <img src={user.identityCardUrl} alt="Identity Card" />
            <video src={user.videoUrl} controls />
          </div>
        ))}
      </div>
    </div>
  );
};

export default KYCAdminPage;





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
