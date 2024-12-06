// BottomMenu Magic Navigation Menu Indicator | By Codehal YT
import React, { useState } from "react";
import { HiHomeModern } from "react-icons/hi2";
import { RiCommunityLine } from "react-icons/ri";
import { RiRotateLockFill } from "react-icons/ri";
import styles from "../../styles/BottomNavMenu.module.css";

const BottomNavMenu: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const menuItems = [
    { label: "Home", icon: <HiHomeModern />, href: "/homePage" },
    { label: "----", icon: <RiRotateLockFill/>, href: "#" },
    { label: "----", icon: <RiRotateLockFill/>, href: "#" },
    { label: "Circle", icon: <RiCommunityLine />, href: "https://t.me/+gprQPD5jFQ1iODU0" },
    { label: "----", icon: <RiRotateLockFill/>, href: "#" },
  ];

  return (
    <div className={styles.navigation}>
      <ul>
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`${styles.list} ${activeIndex === index ? styles.active : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            <a href={item.href}>
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.text}>{item.label}</span>
              <span className={styles.circle}></span>
            </a>
          </li>
        ))}
        {/* <div className={styles.indicator}></div> */}
        {/* style={{ transform: `translateX(${activeIndex * 100}%)` }} */}
      </ul>
    </div>
  );
};

export default BottomNavMenu;
