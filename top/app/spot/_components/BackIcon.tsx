import React from "react";
import { useRouter } from "next/navigation";
import { TiArrowBack } from "react-icons/ti";

const BackIcon: React.FC = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back(); // Navigate to the previous page
  };

  return (
    <div 
      onClick={handleBackClick} 

      title="Go Back"
    >
      <TiArrowBack/>
    </div>
  );
};

export default BackIcon;
