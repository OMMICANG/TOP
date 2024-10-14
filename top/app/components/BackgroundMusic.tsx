import React, { useEffect, useRef } from 'react';

interface BackgroundMusicProps {
    musicSrc: string; // The path to the music file
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ musicSrc }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Show a confirm dialog asking the user if they want to enable background music
        const allowMusic = window.confirm("Do you want to enable background music?");
        
        if (allowMusic && audioRef.current) {
            audioRef.current.play()
                .then(() => {
                    console.log("Audio playback started after user interaction.");
                })
                .catch((error) => {
                    console.error("Error playing audio:", error);
                });
        }
    }, []);

    return (
        <audio ref={audioRef} loop>
            <source src={musicSrc} type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
};

export default BackgroundMusic;
