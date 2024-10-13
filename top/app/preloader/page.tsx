// src/Preloader.js
// Special Thanks to Mr. Alien on codepen for the preloader, Slight Mods by My Darling ChatGPT.

"use client";

import React, {useEffect} from 'react';
import '../styles/Preloader.css' // Make sure to create this CSS file for styling

const Preloader = () => {

    useEffect(() => {
        const audio = document.getElementById("background-music") as HTMLAudioElement;

        if(audio){
            console.log("background Music Is On Baby!")
        }
        
    }, );
    return (
       
        <div className="preloader">

             {/* Background music */}
        <audio id="background-music" autoPlay loop>
        <source src="music/Skott_-_Overcome__Official_Lyric_Video_256k-1.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
    </audio>
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
        </div>
    );
};

export default Preloader;
