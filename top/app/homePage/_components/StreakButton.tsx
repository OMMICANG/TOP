import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import Cookies from "js-cookie";
import styles from "../../styles/StreakButton.module.css"

interface StreakButtonProps {
  onComplete: () => Promise<void>;
  disabled?: boolean;
  label: string;
  // uuid: string;
  // country: string;
}

interface userData {
  uuid: string;
  country: string;
}



const StreakButton: React.FC<StreakButtonProps> = ({ onComplete, disabled, label }) => {
  const [holdTime, setHoldTime] = useState(0);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [userData, setUserData] = useState<userData | null>(null);
  const [cooldown, setCooldown] = useState<boolean>(true);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  // const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
  // Retrieve cookie data
  const cookieData = Cookies.get("circleUser");
  if (cookieData) {
    setUserData(JSON.parse(cookieData));
  }else {
    console.error("User cookie not found!");
  }
}, []);



 // Fetch streak data and cooldown
 const fetchStreakData = async () => {
  try {
    const response = await fetch("/pages/api/homepageGetStreakCount/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: userData?.uuid, country: userData?.country }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch streak data");
    }

    const data = await response.json();
    setStreakCount(data.streakCount);

    if (data.lastStreak) {
      const lastStreakTime = new Date(data.lastStreak).getTime();
      const currentTime = Date.now();
      const diff = currentTime - lastStreakTime;

      if (diff < 24 * 60 * 60 * 1000) {
        const remaining = 24 * 60 * 60 * 1000 - diff;
        setRemainingTime(remaining);
        setCooldown(true);
      } else {
        setRemainingTime(null);
        setCooldown(false);
      }
    } else {
      setCooldown(false);
    }
  } catch (error) {
    console.error("Error fetching streak data:", error);
    console.log(remainingTime);
  }
};
;
useEffect(() => {
  if (userData) {
    fetchStreakData();
  }
}, [userData]);

// Decrement Streak Logic

useEffect(() => {
  const decrementStreak = async () => {
    try {
      const response = await fetch("/pages/api/decrementStreak/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: userData?.uuid, country: userData?.country }),
      });

      const data = await response.json();
      if (data.streakCount !== undefined) {
        setStreakCount(data.streakCount);
      }
    } catch (error) {
      console.error("Error decrementing streak:", error);
    }
  };

  decrementStreak();
}, [userData]);

//  Handle Button Hold
  const handleTouchStart = () => {
    if (disabled) return;
    intervalRef.current = setInterval(() => setHoldTime((time) => time + 100), 100);
  };

  const handleTouchEnd = () => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setHoldTime(0);
  };

  // const fetchStreakCount = async () => {
  //   try {
  //     const response = await fetch("/pages/api/homepageGetStreakCount/", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json",
  //        },
  //       body: JSON.stringify({ 
  //         uuid: userData?.uuid,
  //         country: userData?.country, 
  //        }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch streak count");
  //     }

  //     const data = await response.json();
  //     console.log(data);
  //     setStreakCount(data.streakCount);
  //   } catch (error) {
  //     console.error("Error fetching streak count:", error);
  //   }
  // };

  useEffect(() => {
    if (holdTime >= 3000) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      onComplete()
        .then(() => {
          fetchStreakData();
          // fetchStreakCount();
          // setIsCompleted(true);
        triggerConfetti(); // Trigger confetti effect on successful completion
    })
        .catch((err) => console.error("Error completing streak:", err));
      setHoldTime(0);
    }
  }, [holdTime, onComplete]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }, // Adjust the position of the confetti burst
    });
  };

  return (
    <button
      type="button"
      className={styles.button}
    >
      <div 
  role="button"
  className={styles.top}
  onTouchStart={!disabled && !cooldown ? handleTouchStart : undefined}
  onTouchEnd={handleTouchEnd}
  onTouchCancel={handleTouchEnd}
  style={{
    background: cooldown
      ? "hsl(0, 0%, 50%)"
      : `linear-gradient(to right, hsl(100, 100%, 40%) ${holdTime / 30}%, goldenrod 0%)`,
    cursor: disabled || cooldown ? "not-allowed" : "pointer",
  }}
      // {/* <button  // Changed From original div Elem To button Due to deployment error on Vercel | Test
      // className={styles.top}
      // onTouchStart={handleTouchStart}
      // onTouchEnd={handleTouchEnd}
      // onTouchCancel={handleTouchEnd}
      // disabled={disabled || cooldown}
      // style={{
      //   background: cooldown //streakCount !== null
      //     ? "hsl(0, 0%, 50%)"
      //     : `linear-gradient(to right, hsl(100, 100%, 40%) ${holdTime / 30}%, goldenrod 0%)`,
      //   cursor: disabled ? "not-allowed" : "pointer",
      // }} */}
      
      >{streakCount !== null ? `🔥 ${streakCount}` : label}</div>
      <div className={styles.bottom}></div>
    </button>
  );
};

export default StreakButton;
