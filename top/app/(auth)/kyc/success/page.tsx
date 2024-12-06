"use client";

import React, { useEffect } from "react";
import Cookies from "js-cookie";

import "../../../styles/Success.css"; // Ensure you have this file for custom styles

const Success: React.FC = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const kyc_progress = Cookies.get("kyc_progress");
    console.log(kyc_progress);


    useEffect(() => {
        const animateText = (element: HTMLElement | null) => {
            if (!element) return;
            let iteration = 0;
            const interval = setInterval(() => {
                element.innerText = element.dataset.value
                    ?.split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return element.dataset.value![index];
                        }
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("") || "";

                if (iteration >= element.dataset.value!.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3;
            }, 30);
        };

        const h1Element = document.querySelector(".animated-text") as HTMLElement;
        const blockElement = document.querySelector(".animated-block") as HTMLElement;
        // const p2Element = document.querySelector(".animated-block2") as HTMLElement;

        animateText(h1Element);
        animateText(blockElement);
        // animateText(p2Element);

        return () => {
            clearInterval(animateText as unknown as number); // This line clears the interval
        };
    }, []);


    return (
        <div className="success-page">
            <h1 className="animated-text" data-value="KYC verification complete">KYC verification Complete</h1>
            <hr className="horizontal-line" />

            <div className="animatedBlockContainer">
            <div className="overlay">
            <p className="animated-block" data-value={` 
Hey Stranger!.
Thank You for registering an interest to be ommicang.
A copy of your response has been sent to your email.
we will notify you of your kyc acceptance | Decline via your email.
I am OMMICANG`}>
                
                Hey Stranger!.
                Thank You for registering an interest to be ommicang.
                A copy of your response has been sent to your email.
                we will notify you of your kyc acceptance | Decline via your email
                I am OMMICANG
            </p>

        </div>
        </div>
            
        </div>
    );
};

export default Success;