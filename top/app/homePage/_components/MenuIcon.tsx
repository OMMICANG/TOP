import React, { useState, useRef, useEffect } from "react";
import styles from "../../styles/MenuIcon.module.css"; // Import CSS module for styling

const MenuIcon: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0); // Tracks the focused item
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const items = [ " ", "onboard", "Principles", "RoadMap", "Notifications", "Help", " "]; // Example sidebar items

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const center = container.offsetHeight / 1;
    const items = Array.from(container.children) as HTMLElement[];
    const closestIndex = items.reduce((closest, item, index) => {
      const itemCenter =
        item.offsetTop + item.offsetHeight / 2 - container.scrollTop;
      const distance = Math.abs(itemCenter - center);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: -1, distance: Infinity });

    setFocusIndex(closestIndex.index);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <>
      <div
        className={`${styles.menu} ${isSidebarOpen ? styles.openMenu : ""}`}
        onClick={toggleSidebar}
      >
        <div>
          <span className={styles.line1}></span>
          <span className={styles.line2}></span>
          <span className={styles.line3}></span>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.sidebarContent}
        ref={scrollContainerRef}
        >

        {items.map((item, index) => (
            <div
              key={index}
              className={`${styles.item} ${
                index === focusIndex ? styles.focused : ""
              }`}
              style={{
                transform: `scale(${index === focusIndex ? 1.2 : 1})`,
                opacity: index === focusIndex ? 1 : 0.5,
              }}
            >
              {item}
            </div>
          ))}

        </div>
      </div>
    </>
  );
};

export default MenuIcon;