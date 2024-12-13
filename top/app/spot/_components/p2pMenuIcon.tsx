import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation to Selected Item
// import { FaCircleUser } from "react-icons/fa6";
import styles from "../styles/P2pMenuIcon.module.css"; // Import CSS module for styling

const P2pMenuIcon: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0); // Tracks the focused item
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // Initialize router

  const items = [ 
    " ", 
    "Profile", 
    "My Ads", 
    "p2p Help", 
    "p2p How-to", 
    "Report Scam", 
    " ",
  ]; // sidebar items

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

  const handleItemClick = (item: string) => {
    if (item === "My Ads") {
      router.push("/spot/p2pPostAd"); // Navigate to the desired route
    }
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

              onClick={() => handleItemClick(item)}
            >
              {item}
            </div>
          ))}

        </div>
      </div>
    </>
  );
};

export default P2pMenuIcon;