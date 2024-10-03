"use client";

import { useState, useEffect } from 'react';
import Preloader from './preloader/page';
import LandingPage from './landingPage/page';
import IsMobile from './components/IsMobile';

interface TelegramWindow extends Window {
  Telegram: {
    WebApp: {
      ready: () => void;
      expand: () => void;
    };
  };
}

declare const window: TelegramWindow;

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect triggered');
    
    const handleTelegramInit = () => {
      console.log('Telegram WebApp initialization started');

      if (window.Telegram && window.Telegram.WebApp) {
        const webapp = window.Telegram.WebApp;
        webapp.ready(); 
        webapp.expand(); 

        // Simulate a loading delay
        setTimeout(() => {
          console.log('Preloader finished, showing LandingPage');
          setLoading(false);
        }, 2000);
      } else {
        console.log('Telegram WebApp not found');
      }
    };

    if (window.Telegram) {
      handleTelegramInit();
    } else {
      console.log('Listening for TelegramWebAppReady event');
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
