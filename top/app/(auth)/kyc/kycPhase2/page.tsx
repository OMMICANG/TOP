// components/KYCPhase2.tsx
"use client";

import IsMobile from "../../../components/IsMobile";

const KYCPhase2: React.FC = () => {
  return (
    <IsMobile>
      <div>
        <h1>Face Capture - Phase 2</h1>
        <p>This is where the user will take a picture of their face.</p>
        {/* You will implement the face capture logic here in the next steps */}
      </div>
    </IsMobile>
  );
};

export default KYCPhase2;
