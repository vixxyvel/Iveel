import React from 'react';
import { VortxLogo } from './VortxLogo';
import { ModalType } from '../types';

interface NavbarProps {
  onOpenModal: (type: ModalType) => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal, audioMuted, onToggleAudio }) => {
  return (
    <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
      {/* Logo block */}
      <div 
        className="anim-stagger cursor-pointer" 
        style={{ animationDelay: '0.1s' }}
        onClick={() => onOpenModal('discover')}
      >
        <VortxLogo />
      </div>

      {/* Nav buttons */}
      <div 
        className="anim-stagger flex items-center gap-4" 
        style={{ animationDelay: '0.2s' }}
      >
        <button
          type="button"
          onClick={() => onOpenModal('idol')}
          className="btn-cut px-5 py-3 bg-white/15 hover:bg-white/30 text-white border border-white/30 text-sm font-semibold transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>🤖 My Idol</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal('synergy')}
          className="hidden md:block btn-cut-border px-8 py-3 text-white text-sm font-medium transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Төгөлдөр Хуур & Хөгжим</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModal('synthesis')}
          className="hidden md:block btn-cut px-8 py-3 bg-white text-black text-sm font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          Кино & Тоглоом
        </button>

        {/* Mobile quick action menu button */}
        <button
          type="button"
          onClick={() => onOpenModal('discover')}
          className="md:hidden px-4 py-2 bg-white/20 backdrop-blur-md text-white text-xs btn-cut cursor-pointer border border-white/30"
        >
          Ивээл Bio
        </button>
      </div>
    </nav>
  );
};
