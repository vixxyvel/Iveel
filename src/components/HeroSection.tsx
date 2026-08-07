import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SocialButtons } from './SocialButtons';
import { ModalType } from '../types';

interface HeroSectionProps {
  onOpenModal: (type: ModalType) => void;
  onSocialClick: (name: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenModal, onSocialClick }) => {
  return (
    <div className="relative z-10 flex-1 flex flex-col justify-between px-6 md:px-10 pb-8 md:pb-10">
      {/* Top Section */}
      <div className="flex-1 flex items-center relative">
        {/* Left Column (hidden on mobile/tablet below lg) */}
        <div 
          className="anim-stagger hidden lg:flex flex-col gap-6 absolute left-0 top-[22%]"
          style={{ animationDelay: '0.4s' }}
        >
          <p className="text-white/80 text-lg leading-relaxed max-w-[240px] font-light">
            Төгөлдөр хуур<br />
            дуу хөгжим<br />
            орчлон
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full border border-white/80 bg-white" />
              <div className="w-2 h-2 rounded-full border border-white/30" />
            </div>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-white/70 text-[10px] leading-tight uppercase tracking-widest">
                ИВЭЭЛ 15 НАСТАЙ<br />
                WISP • NUHT (THE TOURISTS)
              </span>
              <span className="text-white/40 text-xs font-mono">01</span>
            </div>
          </div>
        </div>

        {/* Center Heading */}
        <div 
          className="anim-stagger w-full text-center"
          style={{ animationDelay: '0.5s' }}
        >
          <h1 
            className="text-white text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-light leading-[1.05] tracking-[-0.05em]"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          >
            Намайг Ивээл гэдэг<br />
            <span className="font-black">15 Настай // Piano & Music</span><br />
            <span className="opacity-80">Wisp • Nuht (The Tourists) • Skins & AIB</span>
          </h1>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 items-end mt-4">
        {/* Col 1 */}
        <div 
          className="anim-stagger flex flex-col justify-end items-center md:items-start"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-white/80 text-sm leading-relaxed max-w-[280px] font-light text-center md:text-left md:ml-0">
            Хобби: Төгөлдөр хуур тоглох, дуу сонсох. Дуртай тоглоом: Roblox & MLBB. Дуртай өнгө: Хар, Цэнхэр.
          </p>
        </div>

        {/* Col 2 */}
        <div 
          className="anim-stagger flex flex-col items-center gap-6"
          style={{ animationDelay: '0.85s' }}
        >
          <span className="text-white text-xl md:text-2xl font-light tracking-wide text-center">
            Wisp (Singer) — Nuht (The Tourists)
          </span>

          <button
            type="button"
            onClick={() => onOpenModal('discover')}
            className="btn-cut w-full max-w-[280px] py-4 bg-white flex items-center justify-center gap-3 text-black hover:bg-opacity-90 transition-all group cursor-pointer"
          >
            <span className="text-sm font-bold uppercase tracking-widest">Мэдээлэл Харах</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Col 3 */}
        <div 
          className="anim-stagger flex items-center justify-center md:justify-end gap-4"
          style={{ animationDelay: '1s' }}
        >
          <SocialButtons onSocialClick={onSocialClick} />
        </div>
      </div>
    </div>
  );
};

