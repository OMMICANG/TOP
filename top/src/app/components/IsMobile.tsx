// src/IsMobile.tsx
import React, { useEffect, useState, PropsWithChildren } from 'react';
import NotAllowed from './NotAllowed';

const IsMobile: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobileView = window.innerWidth <= 850; // Adjust the width as needed
            setIsMobile(mobileView);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    if (!isMobile) {
        return <NotAllowed />;
    }

    return <>{children}</>;
};
export default IsMobile;
