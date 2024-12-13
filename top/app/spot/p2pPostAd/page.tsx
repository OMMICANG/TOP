import React from "react";
import BackIcon from "../_components/BackIcon";
import styles from "../styles/P2pPostAd.module.css";

const P2pPostAd: React.FC = () => {
  return (
    <div className={styles.bodyContainer}>
      <div className={styles.upperIndex}>
        <div className={styles.topHeaderContainer}>
          <div className={styles.backIcon}>
            <BackIcon />
          </div>
        </div>
      </div>


      <button className={styles.postAdButton}>Post Ad</button>
    </div>
  );
};

export default P2pPostAd;
