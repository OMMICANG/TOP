import { useState, useEffect } from 'react';
import Preloader from './components/preloader'; // Assuming Preloader is in the components folder
import LandingPage from './components/landingPage'; // Assuming LandingPage is in the components folder
import IsMobile from './components/IsMobile'; // Assuming IsMobile is in the components folder

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

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleTelegramInit = () => {
      const webapp = window.Telegram.WebApp;

      webapp.ready(); // Initialize the Telegram Web App
      webapp.expand(); // Expand the Web App to full height

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
