"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const HomePage = () => {
  const [userData, setUserData] = useState(null);

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
    </div>
  );
};

export default HomePage;
