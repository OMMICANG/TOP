"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import HoldButton from "../components/HoldButton"; // Import HoldButton
import '../styles/Homepage.css'

const HomePage = () => {

  interface userData {
    name: string;
    email: string;
    country: string;
    uuid: string;
  }

  const [userData, setUserData] = useState<userData | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Retrieve cookie data
    const cookieData = Cookies.get("circleUser");
    if (cookieData) {
      setUserData(JSON.parse(cookieData));
      console.log(JSON.parse(cookieData))
    }else {
      console.error("User cookie not found!");
    }
  }, []);

  const handleLogOut = () => {
    setUploading(true);
    try {
      Cookies.remove("circleUser", { path: "/" });
      setUserData(null); // Clear user data from state
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Welcome to OMMICANG</h1>
      {userData ? (
        <div>
          <p>
            <strong>Name:</strong> {userData.name}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Country:</strong> {userData.country}
          </p>
          <p>
            <strong>UUID:</strong> {userData.uuid}
          </p>
        </div>
      ) : (
        <p>No user data found. Please log in.</p>
      )}

<span className="buttonContainer">
<HoldButton 
  onComplete={handleLogOut} 
  disabled={uploading}
  label={uploading ? "Logging  Out..." : "Log Out"}
/>
</span>
    </div>
  );
};

export default HomePage;
