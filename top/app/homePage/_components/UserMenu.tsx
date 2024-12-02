import React, { useState } from "react";

import styles from "../../styles/UserMenu.module.css"; // Import CSS module for styling

const UserMenu: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        <div className={styles.sidebarContent}>

          {/* Add your sidebar content here */}

          <div className={styles.vanishPoint}></div>
          <div>Sidebar Content</div>
        </div>
      </div>
    </>
  );
};

export default UserMenu;
