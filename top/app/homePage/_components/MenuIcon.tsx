import React, { useState } from "react";

import styles from "../../styles/MenuIcon.module.css"; // Import CSS module for styling

const MenuIcon: React.FC = () => {
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

export default MenuIcon;






















// import React, { useState } from "react";

// import styles from "../../styles/MenuIcon.module.css"; // Import CSS module for styling

// const MenuIcon: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleMenu = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div
//       className={`${styles.menu} ${isOpen ? styles.openMenu : ""}`}
//       onClick={toggleMenu}
//     >
//       <div>
//         <span className={styles.line1}></span>
//         <span className={styles.line2}></span>
//         <span className={styles.line3}></span>
//       </div>
//     </div>
//   );
// };

// export default MenuIcon;
