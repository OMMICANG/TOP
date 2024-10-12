"use client";

import { useState, useEffect } from 'react';
// import Preloader from './preloader/page';
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
      }, 5000); // Adjust the delay as needed
    };

    const checkTelegramSDK = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        handleTelegramInit();
      } else {
        // Retry checking after a slight delay if the SDK isn't ready yet
        setTimeout(checkTelegramSDK, 100); // Retry after 100ms
      }
    };

    // Start checking for the SDK on component mount
    checkTelegramSDK();

    return () => {
      document.removeEventListener('TelegramWebAppReady', handleTelegramInit);
    };
  }, []);

  return (
    <IsMobile>
      <div>
        {loading ? <LandingPage /> : <LandingPage />}

      </div>
    </IsMobile>
  );
};

export default Home;






// **********************************************************************************************
// "use client";

// import { useState, useEffect } from 'react';
// import Preloader from './preloader/page';
// import LandingPage from './landingPage/page';
// import IsMobile from './components/IsMobile';

// // Define the type for the window object with Telegram
// interface TelegramWindow extends Window {
//   Telegram: {
//     WebApp: {
//       ready: () => void;
//       expand: () => void;
//     };
//   };
// }

// // Create a type assertion for window
// declare const window: TelegramWindow;

// const Home = () => {
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const handleTelegramInit = () => {
//       const webapp = window.Telegram.WebApp;

//       webapp.ready(); // Initialize The Web App

//       webapp.expand(); // Expand The Web App To Full Height

//       // Simulate a loading delay for demonstration purposes
//       setTimeout(() => {
//         setLoading(false);
//       }, 2000); // Adjust the delay as needed
//     };

//     // Ensure the Telegram Web App SDK is loaded before trying to initialize
//     if (window.Telegram) {
//       handleTelegramInit();
//     } else {
//       document.addEventListener('TelegramWebAppReady', handleTelegramInit);
//     }

//     return () => {
//       document.removeEventListener('TelegramWebAppReady', handleTelegramInit);
//     };
//   }, []);

//   return (
//     <IsMobile>
//       <div>
//         {loading ? <Preloader /> : <LandingPage />}
//       </div>
//     </IsMobile>
//   );
  
// };

// export default Home;
