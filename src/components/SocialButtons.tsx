import React from 'react';

interface SocialButtonsProps {
  onSocialClick?: (name: string) => void;
}

export const SocialButtons: React.FC<SocialButtonsProps> = ({ onSocialClick }) => {
  const handleFacebookClick = () => {
    if (onSocialClick) {
      onSocialClick('Facebook: Iveel Ankhbayar');
    }
    window.open('https://www.facebook.com/search/top?q=Iveel%20Ankhbayar', '_blank');
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-3">
      {/* Facebook Badge Button */}
      <button
        type="button"
        onClick={handleFacebookClick}
        aria-label="Facebook: Iveel Ankhbayar"
        className="h-12 px-5 bg-white flex items-center gap-3 text-black hover:bg-opacity-90 transition-all btn-cut-sm cursor-pointer shadow-lg group"
      >
        <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span className="text-xs font-bold font-mono tracking-tight uppercase group-hover:underline">
          FB: Iveel Ankhbayar
        </span>
      </button>
    </div>
  );
};
