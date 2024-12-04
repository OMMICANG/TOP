// src/Preloader.js
// Special Thanks to Mr. Alien on codepen for the preloader, Slight Mods by My Darling ChatGPT.

"use client";

import React, {useRef, useState} from 'react';
import Cookies from "js-cookie";
// import BackgroundMusic from '../components/BackgroundMusic'; // Import the reusable component
import '../../styles/Preloader.css' // Make sure to create this CSS file for styling

Cookies.set("kyc_progress", { path: "/" });

const Preloader = () => {

        const audioRef = useRef<HTMLAudioElement | null>(null);
        const [musicPlaying, setMusicPlaying] = useState(false); // To track if the music is playing
    
         // Function to handle music play
        const handlePlayMusic = () => {
            if (audioRef.current) {
                audioRef.current.play();
                setMusicPlaying(true); // Change state to indicate music is playing
            }
        };
    return (

        <div className="preloader">
            <div className="body">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <div className="base">
                    <span></span>
                    <div className="face"></div>
                </div>
            </div>
            <div className="longfazers">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <h1  id='h1'>BY OMMICANG | FOR HUMANITY</h1>

             {/* Show button only if music isn't playing yet */}
            {!musicPlaying && (
                <button onClick={handlePlayMusic} className="play-music-button">
                    Enable Background Music
                </button>
            )}

            {/* Audio element with looping background music */}
            <audio ref={audioRef} >
                <source src="/music/Preloader_HD 720p_MEDIUM_FR30.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>

        </div>
    );
};

export default Preloader;
