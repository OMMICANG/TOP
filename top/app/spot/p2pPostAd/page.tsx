import React from "react";
import styles from "../styles/P2pPostAd.module.css";

const P2pPostAd: React.FC = () => {
  return (
    <div className={styles.container}>
      <button className={styles.postAdButton}>Post Ad</button>
    </div>
  );
};

export default P2pPostAd;
