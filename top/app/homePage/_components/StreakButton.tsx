import React, { useState, useEffect, useRef } from "react";

interface HoldButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  label: string;
}

const HoldButton: React.FC<HoldButtonProps> = ({ onComplete, disabled, label }) => {
  const [holdTime, setHoldTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    if (disabled) return;
    intervalRef.current = setInterval(() => setHoldTime((time) => time + 100), 100);
  };

  const handleTouchEnd = () => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setHoldTime(0);
  };

  useEffect(() => {
    if (holdTime >= 3000) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      onComplete();
      setHoldTime(0);
    }
  }, [holdTime, onComplete]);

  return (
    <button
      type="button"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      disabled={disabled}
      style={{
        background: `linear-gradient(to right, goldenrod ${holdTime / 50}%, transparent 0%)`,
      }}
    >
      {label}
    </button>
  );
};

export default HoldButton;
