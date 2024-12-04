"use client";

import { useEffect, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
// import { useRouter } from "next/navigation"; // For navigation to the next phase
import Cookies from "js-cookie";
import { FaCircleUser } from "react-icons/fa6";
import UserMenu from "./_components/UserMenu"
import { getGreeting } from "./_components/Greeting";
import AnimatedText from "./_components/AnimatedText";
import StreakButton from "./_components/StreakButton"; // Import HoldButton
import { PiCallBellDuotone } from "react-icons/pi";
import { RiRotateLockFill } from "react-icons/ri";
import MenuIcon from "./_components/MenuIcon"
import BottomNavMenu from "./_components/BottomNavMenu";
import '../styles/Homepage.css'

const HomePage = () => {

  interface userData {
    name: string;
    disabled?: boolean;
    email: string;
    country: string;
    uuid: string;
  }

  const [userData, setUserData] = useState<userData | null>(null);
  // const [uploading, setUploading] = useState(false);
  // const router = useRouter(); // Use Next.js router for navigation


  useEffect(() => {
    // Retrieve cookie data
    const cookieData = Cookies.get("circleUser");
    if (cookieData) {
      setUserData(JSON.parse(cookieData));
    }else {
      console.error("User cookie not found!");
    }
  }, []);

  const handleStreakUpdate = async () => {
    try {
      const response = await fetch("/pages/api/homepageStreakButton/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          uuid: userData?.uuid,
          country: userData?.country, // Ensure `country` is included
         }),
      });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Streak updated successfully:", data);
  } catch (error) {
    console.error("Error updating streak:", error);
  }
  };
  

  // const handleLogOut = () => {
  //   setUploading(true);
  //   try {
  //     Cookies.remove("circleUser", { path: "/" });
  //     setUserData(null); // Clear user data from state
  //     router.push("/login");
  //   } catch (error) {
  //     console.error("Error logging out:", error);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  return (
    <div className="bodyContainer">

      <div className="upperIndex">
        <div className="topHeaderContainer">

          <div className="userProfile">
          <span className="circleUserAvatar"><FaCircleUser /></span>
        <div className="userMenu vt323-regular"><UserMenu /></div>


            <CountdownCircleTimer

              isPlaying
              duration={60} // Timer duration in seconds
              size={20}
              strokeWidth={1.5}
              trailColor= "#ffc400"
              colors="#000"
              onComplete={() => ({ shouldRepeat: true, delay: 1 })} // Loop with a 1-second delay
            >
            </CountdownCircleTimer>

          </div>
            {userData ? (      
          <div className="userWelcome vt323-regular"> <AnimatedText  className="animatedGreeting" text={`${getGreeting()} ${userData.name.split(' ')[0]}!`} /></div> 
            ) : (
            <p>No user data found.</p>
            )}

        <div className="icons"><PiCallBellDuotone /></div>
        <div className="menuIcon vt323-regular"><MenuIcon /></div>

      </div>
      
      {/* <div className="newsEventsContainer">news and events!!</div> */}

      <div className="streaksAndBalanceContainer vt323-regular">

        <div className="streaksContainer">

          <h5 className="streakText">streak</h5>

          {/* <div className="lowerStreakCon"> */}
            <div className="buttonContainer">
              <StreakButton 
              onComplete={handleStreakUpdate}
              disabled={false} // Handle dynamic logic to enable/disable
              label="HOLD"
              />
            {/* </div> */}

            {/* <div className="streakCount">300</div> */}
          </div>
          
          
        </div>

        <div className="rankBalCon">

          <div className="rank neon">veteran</div>
          <div className="bal">10</div>

        </div>

      </div>

      <div className="inAppFeaturesContainer">
        
        <div className="academy">
          <RiRotateLockFill className="rotateLock" />
          <h6 className="bottomText">----</h6>
        </div>
        <div className="habits">
          <RiRotateLockFill className="rotateLock" />
          <h6 className="bottomText">----</h6>
        </div>
        <div className="spotTrade">
          <RiRotateLockFill className="rotateLock" />
          <h6 className="bottomText">----</h6>
        </div>
        <div className="marketPlace">
          <RiRotateLockFill className="rotateLock" />
          <h6 className="bottomText">----</h6>
        </div>
        <div className="volunteer">
          <RiRotateLockFill className="rotateLock" />
          <h6 className="bottomText">----</h6>
        </div>

      </div>

      <div className="filtersAndSelectionsContainer">

        <div className="filters">
        <RiRotateLockFill className="rotateLockFilters" />
          <select 
          className="filtersSelect" 
          name="filtersSelect" 
          id="filters"
          disabled={true}
          >
            <option value="">Filters</option>
          </select>
        </div>

        <div className="selections">
          <div className="item">
          <RiRotateLockFill className="rotateLockSelections" />
          <h6 className="bottomText">----</h6>
          </div>
          
          <div className="item">
          <RiRotateLockFill className="rotateLockSelections" />
          <h6 className="bottomText">----</h6>
          </div>
          
          <div className="item">
          <RiRotateLockFill className="rotateLockSelections" />
          <h6 className="bottomText">----</h6>
          </div>

          <div className="item">
          <RiRotateLockFill className="rotateLockSelections" />
          <h6 className="bottomText">----</h6>
          </div>
          
          <div className="item">
          <RiRotateLockFill className="rotateLockSelections" />
          <h6 className="bottomText">----</h6>
          </div>
        </div>
      </div>

      </div>

      <div className="donateHomePage">

        <div className="item1">
        <RiRotateLockFill className="rotateLock" />
        </div>

        <div className="item2">
        <RiRotateLockFill className="rotateLock" />
        </div>
        
        <div className="item3">
        <RiRotateLockFill className="rotateLock" />
        </div>

        <div className="item4">
        <RiRotateLockFill className="rotateLock" />
        </div>

        <div className="item5">
        <RiRotateLockFill className="rotateLock" />
        </div>

        <div className="item6">
        <RiRotateLockFill className="rotateLock" />
        </div>

      </div>

      <footer className="bottomMenuContainer">

      <BottomNavMenu />

        {/* <div className="item1">
        <RiRotateLockFill className="rotateLock" />
        <h6 className="bottomText">----</h6>
        </div>

        <div className="item2">
        <RiRotateLockFill className="rotateLock" />
        <h6 className="bottomText">----</h6>
        </div>

        <div className="item3">
        <RiRotateLockFill className="rotateLock" />
        <h6 className="bottomText">----</h6>
        </div>

        <div className="item4">
        <RiRotateLockFill className="rotateLock" />
        <h6 className="bottomText">----</h6>
        </div>
        
        <div className="item5">
        <RiRotateLockFill className="rotateLock" />
        <h6 className="bottomText">----</h6>
        </div> */}

      </footer>


      {/* <span className="buttonContainer">
        <HoldButton 
          onComplete={handleLogOut} 
          disabled={uploading}
          label={uploading ? "Logging  Out..." : "Log Out"}/>
      </span> */}

    </div>
  );
};

export default HomePage;
