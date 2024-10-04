"use client";

import { useState, useEffect } from 'react';
import Preloader from './preloader/page';
import LandingPage from './landingPage/page';
import IsMobile from './components/IsMobile';

// Define the type for the window object with Telegram
interface TelegramWindow extends Window {
  Telegram: {
    WebApp: {
      ready: () => void;
      expand: () => void;
    };
  };
}

// Create a type assertion for window
declare const window: TelegramWindow;

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleTelegramInit = () => {
      const webapp = window.Telegram.WebApp;

      webapp.ready(); // Initialize The Web App

      webapp.expand(); // Expand The Web App To Full Height

      // Simulate a loading delay for demonstration purposes
      setTimeout(() => {
        setLoading(false);
      }, 2000); // Adjust the delay as needed
    };

    // Ensure the Telegram Web App SDK is loaded before trying to initialize
    if (window.Telegram) {
      handleTelegramInit();
    } else {
      document.addEventListener('TelegramWebAppReady', handleTelegramInit);
    }

    return () => {
      document.removeEventListener('TelegramWebAppReady', handleTelegramInit);
    };
  }, []);


  return (
    <IsMobile>
      <div>
        {loading ? <Preloader /> : <LandingPage />}
      </div>
    </IsMobile>
  );
};

export default Home;
