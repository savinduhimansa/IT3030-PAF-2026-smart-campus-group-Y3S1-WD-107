import React from 'react';
import { RingLoader } from 'react-spinners';

const SpaceLoader = ({ message = "Processing...", fullScreen = false }) => {
    const loaderContent = (
        <div className="flex flex-col items-center justify-center gap-5">
            {/* Swapped to RingLoader with slightly larger size and custom speed */}
            <RingLoader color="#06b6d4" size={65} speedMultiplier={1.2} />
            <p className="text-[#06b6d4] font-bold tracking-[0.2em] text-sm uppercase animate-pulse drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                {message}
            </p>
        </div>
    );

    // If fullScreen is true, it covers the whole screen with a dark blur
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0e1a]/85 backdrop-blur-lg">
                {loaderContent}
            </div>
        );
    }

    // Otherwise, it just spins where you place it
    return (
        <div className="flex items-center justify-center p-8">
            {loaderContent}
        </div>
    );
};

export default SpaceLoader;