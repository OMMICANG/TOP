// src/Preloader.js
// Special Thanks to Mr. Alien on codepen for the preloader, Slight Mods by My Darling ChatGPT.

import React from 'react';
import '../styles/LandingPage.css' // Make sure to create this CSS file for styling

const Preloader = () => {
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
        </div>
    );
};

export default Preloader;
