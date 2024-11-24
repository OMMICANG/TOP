"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; // Use Next.js's useRouter for navigation
import { PiHandSwipeLeftBold } from "react-icons/pi";
import { PiHandSwipeRightBold } from "react-icons/pi";
// import { useAudio } from '../../components/BackgroundMusic'
import "../../styles/LandingPage.css"; // Ensure you have this file for custom styles

const LandingPage: React.FC = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const router = useRouter(); // Use router instead of navigate
    const [showOverlay, setShowOverlay] = useState(false); // State for overlay
    const overlayRef = useRef<HTMLDivElement | null>(null); // Reference to overlay
    const audio = useAudio();

    useEffect(() => {
        if (audio) {
          audio.play().catch(console.error); // Ensure play resumes if enabled in preloader
        }
      }, [audio]);

    const handleSwipe = (direction: string) => {
        setShowOverlay(true); // Show overlay on swipe
        setTimeout(() => {
            if (direction === "left") {
                router.push("/kyc");
            } else if (direction === "right") {
                router.push("/login");
            }
        }, 500); // Delay to allow overlay effect before routing 
    };

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
        const p2Element = document.querySelector(".animated-block2") as HTMLElement;

        animateText(h1Element);
        animateText(blockElement);
        animateText(p2Element);

        return () => {
            clearInterval(animateText as unknown as number); // This line clears the interval
        };
    }, []);

    useEffect(() => {
        // Preload KYC and Login pages for smooth navigation
        router.prefetch("/kyc");
        router.prefetch("/login");
    }, [router]);

    // Swipe gesture handling
    useEffect(() => {
        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            touchEndX = e.changedTouches[0].screenX;
            const direction = touchStartX > touchEndX ? "left" : "right";
            handleSwipe(direction); // Call swipe function
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    return (
        <div className="landing-page">
            <h1 className="animated-text" data-value="An App Built For Humanity">An App Built For Humanity</h1>
            <hr className="horizontal-line" />
            <p className="animated-block" data-value={`
Ommicang Unite As One.
Ommicang Together Strong.
The Very Notion Of Light
Spawns From The Existence Of 
Darkness.
I was Birth From The Dark.
I Become The Light.`}>
                Ommicang Unite As One.
                Ommicang Together Strong.
                The Very Notion Of Light Spawns From The Existence Of
                Darkness
                I was Birth From The Dark
                I Become The Light
            </p>

            <p className="animated-block2" data-value="I Am OMMICANG!!!">I Am OMMICANG!!!</p>

            <div className="cta-wrapper">
                    <span className="cta-button">I&apos;m OMMICANG</span>
                    <span className="cta-button button2">Be OMMICANG</span>
            </div>

            <div className="swiper-container">
                <span className="PiHandSwipeLeftBold"><PiHandSwipeLeftBold/></span>
                <span className="PiHandSwipeRightBold"><PiHandSwipeRightBold/></span>
            </div>

            {/* Swipe Transition Overlay */}
            {showOverlay && (
                <div ref={overlayRef} className="swipe-overlay">
                    {/* Optionally add some transition visuals, like spinning logo */}
                </div>
            )}
            
        </div>
    );
};

export default LandingPage;
