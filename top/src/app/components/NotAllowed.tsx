// src/NotAllowed.tsx
import React from 'react';

const NotAllowed: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Not Allowed</h1>
            <p>This app is only accessible on mobile devices.</p>
        </div>
    );
};

export default NotAllowed;
