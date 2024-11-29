import { useEffect } from "react";

const AnimatedText = ({ className, text }: { className: string; text: string }) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  useEffect(() => {
    const animateText = (element: HTMLElement | null) => {
      if (!element) return;
      let iteration = 0;
      const interval = setInterval(() => {
        element.innerText = text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join("");

        if (iteration >= text.length) {
          clearInterval(interval);
        }

        iteration += 1 / 3;
      }, 50);
    };

    const targetElement = document.querySelector(`.${className}`) as HTMLElement;
    animateText(targetElement);

    return () => {
      clearInterval(animateText as unknown as number);
    };
  }, [className, text]);

  return <span className={className} data-value={text}></span>;
};

export default AnimatedText;
