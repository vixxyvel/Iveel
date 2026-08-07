import React from 'react';

interface VortxLogoProps {
  className?: string;
}

export const VortxLogo: React.FC<VortxLogoProps> = ({ className = "w-14 h-14" }) => {
  return (
    <div className="flex flex-col items-center select-none cursor-pointer">
      <svg
        viewBox="0 0 256 256"
        fill="white"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M128,10 A118,118 0 0,1 246,128 L128,128 Z" opacity="0.9" />
        <path d="M246,128 A118,118 0 0,1 128,246 L128,128 Z" opacity="0.7" />
        <path d="M128,246 A118,118 0 0,1 10,128 L128,128 Z" opacity="0.5" />
        <path d="M10,128 A118,118 0 0,1 128,10 L128,128 Z" opacity="1" />
      </svg>
      <span className="text-white text-[10px] tracking-[0.5em] mt-2 font-light uppercase">
        V O R T X
      </span>
    </div>
  );
};
