import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="sticky bottom-0 bg-gradient-to-r from-black to-zinc-900 backdrop-blur-lg border-t border-zinc-800 px-4 py-2 flex justify-between items-center text-white z-50">
            <div className="text-sm font-medium">
                Built by finqt
            </div>
            <div className="text-sm font-semibold">
                v1.0
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Live</span>
                <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse"></div>
            </div>
        </footer>
    );
};

export default Footer;
