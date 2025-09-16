import React from 'react';

const AppLogo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 64 }) => {
  return (
    <a 
      href="https://finqt.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`hover:opacity-90 transition-opacity ${className}`}
    >
      <img
        src="/logo2beyaz.png"
        alt="Logo"
        className="h-6 sm:h-8 w-auto select-none"
        style={{ 
          objectFit: 'contain',
          filter: 'brightness(1)',
        }}
      />
    </a>
  );
};

export default AppLogo;
