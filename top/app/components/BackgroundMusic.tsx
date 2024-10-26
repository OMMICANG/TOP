// AudioContext.tsx
import React, { createContext, useContext, useRef } from 'react';

const AudioContext = createContext<HTMLAudioElement | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio('/music/TOP_HD 720p_MEDIUM_FR30.mp3'));
  audioRef.current.loop = true;

  return (
    <AudioContext.Provider value={audioRef.current}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
