// src/Preloader.js
// Special Thanks to Mr. Alien on codepen for the preloader, Slight Mods by My Darling ChatGPT.

"use client";

import React, {useRef, useState} from 'react';
// import BackgroundMusic from '../components/BackgroundMusic'; // Import the reusable component
import '../styles/Preloader.css' // Make sure to create this CSS file for styling



const Preloader = () => {

        const audioRef = useRef<HTMLAudioElement | null>(null);
        const [musicPlaying, setMusicPlaying] = useState(false);
    
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

            {!musicPlaying && (
                <button onClick={handlePlayMusic} className="play-music-button">
                    Enable Background Music
                </button>
            )}

            <audio ref={audioRef} loop>
                <source src="/music/Skott_-_Overcome__Official_Lyric_Video_256k-1.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>

        </div>
    );
};

export default Preloader;
