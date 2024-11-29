// components/Greeting.tsx


// const Greeting = () => {

    export const getGreeting = () => {
      const currentHour = new Date().getHours(); // Get the current hour (0-23)
      if (currentHour >= 0 && currentHour < 12) {
        return "Good Morning"; // Add Custom Emoji's Later
      } else if (currentHour >= 12 && currentHour < 17) {
        return "Good Afternoon";
      } else if (currentHour >= 17 && currentHour < 23) {
        return "Good Evening"; 
      } else {
        return "Hello";
      }
    };
  
  //   return <>{getGreeting()}</>;
  // };
  
  // export default Greeting;
  