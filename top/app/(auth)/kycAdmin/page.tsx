"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PendingCounter from "./_components/PendingCounter";
import DeclinedUsers from "./_components/DeclinedUsers";
import ApprovedUsers from "./_components/ApprovedUsers";
import { FaRegCheckSquare } from "react-icons/fa";
import { PiKeyReturnLight } from "react-icons/pi";
import { MdOutlineCancelPresentation } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";
import IsMobile from "../../components/IsMobile";
import "../../styles/KycAdmin.css";

interface KYCUser {
  uuid: string;
  email: string;
  identity_card_number: string;
  identity_card_url: string;
  face_image_url: string | null;
  video_url: string | null;
}

type ExpandedContent = 
  | { type: "text"; content: string }
  | { type: "image"; url: string }
  | { type: "video"; url: string };
  
export default function KYCAdminPage() {
  const [kycUsers, setKycUsers] = useState<KYCUser[]>([]);
  const [expandedContent, setExpandedContent] = useState<ExpandedContent | null>(null);

  // Function to refresh queue with latest 3 records
  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from("kyc_users")
      .select("uuid, email, identity_card_number, identity_card_url")
      .order("created_at", { ascending: true })
      .limit(3); // Limit to top 3

    if (!error && data) {
      setKycUsers(
        data.map((record) => ({
          uuid: record.uuid,
          email: record.email,
          identity_card_number: record.identity_card_number,
          identity_card_url: record.identity_card_url,
          face_image_url: null, //Placeholder
          video_url: null, //Placeholder
        }))
      );
    }
  };

  useEffect(() => {
    fetchQueue();

    // Subscription for real-time KYC users
    const kycUsersSubscription = supabase
      .channel("realtime_kyc_users")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "kyc_users" }, fetchQueue)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "kyc_users" }, fetchQueue)
      .subscribe();

    return () => {
      supabase.removeChannel(kycUsersSubscription);
    };
  }, []);

  // Function to delete a row based on UUID
  const handleDelete = async (uuid: string) => {
    const { error } = await supabase.from("kyc_users").delete().eq("uuid", uuid);
    if (!error) fetchQueue(); // Refresh queue after delete
  };

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
              face_image_url: imageRecord ? imageRecord.face_image_url : null,
            };
          })
        );
      }
    };

    fetchFaceImages();

  // Fetch face images Data in real-time
    const faceImagesSubscription = supabase
      .channel("realtime_kyc_face_images")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "kyc_face_images" }, (payload) => {
        setKycUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.uuid === payload.new.uuid ? { ...user, face_image_url: payload.new.face_image_url } : user
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(faceImagesSubscription);
    };
  }, []);


  // Fetch video URLs and map them to the respective user by KYCuuid

   useEffect(() => {
    const fetchVideoUrls = async () => {
      const { data, error } = await supabase
        .from("kyc_videos")
        .select("uuid, video_url");

      if (error) {
        console.error("Error fetching video URLs:", error);
      } else if (data) {
        setKycUsers((prevUsers) =>
          prevUsers.map((user) => {
            const videoRecord = data.find((video) => video.uuid === user.uuid);
            return {
              ...user,
              video_url: videoRecord ? videoRecord.video_url : null,
            };
          })
        );
      }
    };

    fetchVideoUrls();
  // Fetch videos in real-time
  // useEffect(() => {
    const videosSubscription = supabase
      .channel("realtime_kyc_videos")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "kyc_videos" }, (payload) => {
        setKycUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.uuid === payload.new.uuid ? { ...user, video_url: payload.new.video_url } : user
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(videosSubscription);
    };
  }, []);

  return (
    <IsMobile>
      <div className="overlay">
        <div className="kyc_admin_page">
          <div className="fixed">
            <h1 className="topHeader">KYC Admin</h1>
            <fieldset>
              <legend>Note To Admins</legend>
              <ul>
                <li>center your face within the circle | No Facial Accessories</li>
                <li>smile for the camera</li>
                <li>capture</li>
                <li>preview || submit and continue</li>
              </ul>
            </fieldset>
            <span className="counter">
              <PendingCounter />
            </span>
          </div>
          <div className="face-image-grid">
            {kycUsers.length > 0 ? (
              kycUsers.map((user, index) => (
                <div key={index} className="face-image-card">
                  <button className="emailButton">{user.email}</button>
                  <button onClick={() => setExpandedContent({ type: "text", content: user.identity_card_number })}>
                    ID: {user.identity_card_number.slice(0, 2)}**** <IoMdArrowDropdown />
                  </button>
                  <button
                    className="identity-card-button"
                    // onClick={() => setExpandedContent({ type: "image", url: user.identity_card_url })}
                    onClick={() => {if (user.identity_card_url) {
                      setExpandedContent({ type: "image", url: user.identity_card_url });
                    } else {
                      console.error("Face image URL is null.");
                    }
                  }
                }
                  >
                    ID CARD<IoMdArrowDropdown />
                  </button>
                  <button
                    className="identity-card-button"
                    onClick={() => {if (user.face_image_url) {
                      setExpandedContent({ type: "image", url: user.face_image_url });
                    } else {
                      console.error("Face image URL is null.");
                    }
                  }
                }
                  >
                    PHOTO<IoMdArrowDropdown />
                  </button>
                  <button
                    className="video-button"
                    // onClick={() => setExpandedContent({ type: "video", url: user.video_url })}
                    onClick={() => {if (user.video_url) {
                      setExpandedContent({ type: "video", url: user.video_url });
                    } else {
                      console.error("Video URL is null.");
                    }
                  }
                }
                  >
                    VIDEO<IoMdArrowDropdown />
                  </button>
                  <div className="submit">
                    <span className="decline" onClick={() => DeclinedUsers(user.uuid)}>
                      <PiKeyReturnLight />
                    </span>
                    <span className="delete" onClick={() => handleDelete(user.uuid)}>
                      <MdOutlineCancelPresentation />
                    </span>
                    <span className="approve" onClick={() => ApprovedUsers(user.uuid)}>
                      <FaRegCheckSquare />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>No KYC data found.</p>
            )}
          </div>

          {/* Overlay for expanded content */}
          {expandedContent && (
            <div className="expandOverlay" onClick={() => setExpandedContent(null)}>
              <div className="overlay-content">
                <button className="close-button" onClick={() => setExpandedContent(null)}>
                  Close
                </button>
                {expandedContent.type === "text" ? (
                  <span className="idExpand">{expandedContent.content}</span>
                ) : expandedContent.type === "image" ? (
                  <img src={expandedContent.url} alt="Expanded Identity Card" className="expanded-image" />
                ) : (
                  <video controls src={expandedContent.url} className="expanded-video">
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </IsMobile>
  );
}

// import { useEffect, useState } from "react";
// import { supabase } from "../../lib/supabaseClient.ts";
// import PendingCounter from "../../(auth)/kycAdmin/_components/PendingCounter";
// import DeclinedUsers from "../../(auth)/kycAdmin/_components/DeclinedUsers";
// import ApprovedUsers from "../../(auth)/kycAdmin/_components/ApprovedUsers";
// import { FaRegCheckSquare } from "react-icons/fa";
// import { PiKeyReturnLight } from "react-icons/pi";
// import { MdOutlineCancelPresentation } from "react-icons/md";
// import { IoMdArrowDropdown } from "react-icons/io";
// import IsMobile from "../../components/IsMobile";
// import "../../styles/KycAdmin.css";

// interface KYCUser {
//   uuid: string;
//   email: string;
//   identity_card_number: string;
//   identity_card_url: string;
//   face_image_url: string | null;
//   video_url: string | null;
// }

// export default function KYCAdminPage() {
//   const [kycUsers, setKycUsers] = useState<KYCUser[]>([]);
//   const [expandedContent, setExpandedContent] = useState<ExpandedContent | null>(null);

//   // Function to refresh queue with latest 3 records

//   const fetchQueue = async () => {
//     const { data, error } = await supabase
//       .from("kyc_users")
//       .select("uuid, email, identity_card_number, identity_card_url")
//       .order("created_at", { ascending: true })
//       .limit(3); // Limit to top 3

//     if (!error && data) {
//       setKycUsers(
//         data.map((record) => ({
//           uuid: record.uuid,
//           email: record.email,
//           identity_card_number: record.identity_card_number,
//           identity_card_url: record.identity_card_url,
//           face_image_url: null, //Placeholder
//           video_url: null, //Placeholder
//         }))
//       );
//     }
//   };

//   useEffect(() => {
//     fetchQueue();


//     // Subscription for real-time KYC users

//     const kycUsersSubscription = supabase
//       .channel("realtime_kyc_users")
//       .on("postgres_changes", { event: "INSERT", schema: "public", table: "kyc_users" }, fetchQueue)
//       .on("postgres_changes", { event: "DELETE", schema: "public", table: "kyc_users" }, fetchQueue)
//       .subscribe();

//     return () => {
//       supabase.removeChannel(kycUsersSubscription);
//     };
//   }, []);

//   // Function to delete a row based on UUID
  
//   const handleDelete = async (uuid: string) => {
//     const { error } = await supabase.from("kyc_users").delete().eq("uuid", uuid);
//     if (!error) fetchQueue(); // Refresh queue after delete
//   };

//   // Fetch face images and map them to the respective user by KYCuuid

//   useEffect(() => {
//     const fetchFaceImages = async () => {
//       const { data, error } = await supabase
//         .from("kyc_face_images")
//         .select("uuid, face_image_url");

//       if (error) {
//         console.error("Error fetching face images:", error);
//       } else if (data) {
//         // Map face images to users by matching uuid
//         setKycUsers((prevUsers) =>
//           prevUsers.map((user) => {
//             const imageRecord = data.find((img) => img.uuid === user.uuid);
//             return {
//               ...user,
//               face_image_url: imageRecord ? imageRecord.face_image_url : null,
//             };
//           })
//         );
//       }
//     };

//     fetchFaceImages();

//   // Fetch face images Data in real-time

//     const faceImagesSubscription = supabase
//       .channel("realtime_kyc_face_images")
//       .on("postgres_changes", { event: "INSERT", schema: "public", table: "kyc_face_images" }, (payload) => {
//         setKycUsers((prevUsers) =>
//           prevUsers.map((user) =>
//             user.uuid === payload.new.uuid ? { ...user, face_image_url: payload.new.face_image_url } : user
//           )
//         );
//       })
//       .subscribe();

//     return () => {
//       supabase.removeChannel(faceImagesSubscription);
//     };
//   }, []);


//   // Fetch video URLs and map them to the respective user by KYCuuid

//    useEffect(() => {
//     const fetchVideoUrls = async () => {
//       const { data, error } = await supabase
//         .from("kyc_videos")
//         .select("uuid, video_url");

//       if (error) {
//         console.error("Error fetching video URLs:", error);
//       } else if (data) {
//         setKycUsers((prevUsers) =>
//           prevUsers.map((user) => {
//             const videoRecord = data.find((video) => video.uuid === user.uuid);
//             return {
//               ...user,
//               video_url: videoRecord ? videoRecord.video_url : null,
//             };
//           })
//         );
//       }
//     };
  
//     fetchVideoUrls();

//   // // Fetch videos in real-time

//   const videosSubscription = supabase
//       .channel("realtime_kyc_videos")
//       .on("postgres_changes", { event: "INSERT", schema: "public", table: "kyc_videos" }, (payload) => {
//         setKycUsers((prevUsers) =>
//           prevUsers.map((user) =>
//             user.uuid === payload.new.uuid ? { ...user, video_url: payload.new.video_url } : user
//           )
//         );
//       })
//       .subscribe();

//     return () => {
//       supabase.removeChannel(videosSubscription);
//     };
//   }, []);

//   return (
//     <IsMobile>
//       <div className="overlay">
//         <div className="kyc_admin_page">
//           <div className="fixed">
//             <h1 className="topHeader">KYC Admin</h1>
//             <fieldset>
//               <legend>Note To Admins</legend>
//               <ul>
//                 <li>center your face within the circle | No Facial Accessories</li>
//                 <li>smile for the camera</li>
//                 <li>capture</li>
//                 <li>preview || submit and continue</li>
//               </ul>
//             </fieldset>
//             <span className="counter">
//               <PendingCounter />
//             </span>
//           </div>
//           <div className="face-image-grid">
//             {kycUsers.length > 0 ? (
//               kycUsers.map((user, index) => (
//                 <div key={index} className="face-image-card">
//                   <button className="emailButton">{user.email}</button>
//                   <button onClick={() => setExpandedContent({ type: "text", content: user.identity_card_number })}>
//                     ID: {user.identity_card_number.slice(0, 2)}**** <IoMdArrowDropdown />
//                   </button>
//                   <button
//                     className="identity-card-button"
//                     onClick={() => setExpandedContent({ type: "image", url: user.identity_card_url })}
//                   >
//                     ID CARD<IoMdArrowDropdown />
//                   </button>
//                   <button
//                     className="identity-card-button"
//                     onClick={() => setExpandedContent({ type: "image", url: user.face_image_url })}
//                   >
//                     PHOTO<IoMdArrowDropdown />
//                   </button>
//                   <button
//                     className="video-button"
//                     onClick={() => setExpandedContent({ type: "video", url: user.video_url })}
//                   >
//                     VIDEO<IoMdArrowDropdown />
//                   </button>
//                   <div className="submit">
//                     <span className="decline" onClick={() => DeclinedUsers(user.uuid)}>
//                       <PiKeyReturnLight />
//                     </span>
//                     <span className="delete" onClick={() => handleDelete(user.uuid)}>
//                       <MdOutlineCancelPresentation />
//                     </span>
//                     <span className="approve" onClick={() => ApprovedUsers(user.uuid)}>
//                       <FaRegCheckSquare />
//                     </span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p>No KYC data found.</p>
//             )}
//           </div>

//           {/* Overlay for expanded content */}
//           {expandedContent && (
//             <div className="expandOverlay" onClick={() => setExpandedContent(null)}>
//               <div className="overlay-content">
//                 <button className="close-button" onClick={() => setExpandedContent(null)}>
//                   Close
//                 </button>
//                 {expandedContent.type === "text" ? (
//                   <span className="idExpand">{expandedContent.content}</span>
//                 ) : expandedContent.type === "image" ? (
//                   <img src={expandedContent.url} alt="Expanded Identity Card" className="expanded-image" />
//                 ) : (
//                   <video controls src={expandedContent.url} className="expanded-video">
//                     Your browser does not support the video tag.
//                   </video>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </IsMobile>
//   );
// }
