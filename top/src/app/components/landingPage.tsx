import { useEffect } from 'react';
import { useRouter } from 'next/router'; // Use Next.js's useRouter for navigation
import '../styles/LandingPage.css'; // Ensure you have this file for custom styles

const LandingPage: React.FC = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const router = useRouter(); // Use router instead of navigate

    const handleClick = () => {
        router.push('/auth'); // Next.js way to navigate to another page
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
            }, 10);
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

    return (
        <div className="landing-page">
            <h1 className="animated-text" data-value="An App Built For Humanity">An App Built For Humanity</h1>
            <hr className="horizontal-line" />
            <div className="animated-block-container">
                <p className="animated-block" data-value={`Ommicang Unite As One.
      Ommicang Together Strong.
      The Very Notion Of Light
      Spawns From The Existence Of
      Darkness.
      I was Birth From The Dark.
      I Become The Light.`}>
                    Ommicang Unite As One.
                    Ommicang Together Strong.
                    The Very Notion Of Light 
                    Spawns From The Existence Of 
                    Darkness. 
                    I was Birth From The Dark. 
                    I Become The Light.
                </p>
                <p className="animated-block2" data-value="I Am OMMICANG!!!">I Am OMMICANG!!!</p>
                <button className="cta-button" onClick={handleClick}>Be OMMICANG</button>
            </div>
        </div>
    );
};

export default LandingPage;
