"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // For navigation to the next phase
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
  const router = useRouter(); // Use Next.js router for navigation


  useEffect(() => {
    // Retrieve cookie data
    const cookieData = Cookies.get("circleUser");
    if (cookieData) {
      setUserData(JSON.parse(cookieData));
    }else {
      console.error("User cookie not found!");
    }
  }, []);

  const handleLogOut = () => {
    setUploading(true);
    try {
      Cookies.remove("circleUser", { path: "/" });
      setUserData(null); // Clear user data from state
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bodyContainer">

      <div className="upperIndex">
      <div className="topHeaderContainer">

        <div className="userProfile"></div>
        {userData ? (      
          <div className="userWelcome"> Hi {userData.name.split(' ')[0]}</div> 
        ) : (
        <p>No user data found.</p>
        )}

        <div className="icons"></div>

      </div>
      
      <div className="newsEventsContainer">news and events!!</div>

      <div className="streaksAndBalanceContainer">

        <div className="dailyStreaks"></div>
        <div className="rank"></div>
        <div className="balance"></div>

      </div>

      <div className="inAppFeaturesContainer">
        
        <div className="academy"></div>
        <div className="habits"></div>
        <div className="spotTrade"></div>
        <div className="marketPlace"></div>
        <div className="volunteer"></div>

      </div>

      <div className="filtersAndSelectionsContainer">

        <div className="filters"></div>
        
        <div className="selections">
          <div className="item"></div>
          <div className="item"></div>
          <div className="item"></div>
          <div className="item"></div>
          <div className="item"></div>
        </div>
      </div>

      </div>

      <div className="donateHomePage">

        <div className="item1"></div>
        <div className="item2"></div>
        <div className="item3"></div>
        <div className="item4"></div>
        <div className="item5"></div>
        <div className="item6"></div>

      </div>

      <footer className="bottomMenuContainer">

        <div className="item1"></div>
        <div className="item2"></div>
        <div className="item3"></div>
        <div className="item4"></div>
        <div className="item5"></div>

      </footer>


      <span className="buttonContainer">
        <HoldButton 
          onComplete={handleLogOut} 
          disabled={uploading}
          label={uploading ? "Logging  Out..." : "Log Out"}/>
      </span>
    </div>
  );
};

export default HomePage;
