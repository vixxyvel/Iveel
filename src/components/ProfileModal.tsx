import React, { useState } from 'react';
import { X, Play, Music, Film, Gamepad2, User, Sparkles } from 'lucide-react';
import { ModalType } from '../types';
import { IVEEL_PROFILE } from '../data/profileData';

interface ProfileModalProps {
  type: ModalType;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ type, onClose }) => {
  const [activeTab, setActiveTab] = useState<'bio' | 'music' | 'shows' | 'games'>(
    type === 'synergy' ? 'music' : type === 'synthesis' ? 'shows' : 'bio'
  );

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl anim-fade">
      {/* Outer Modal Container with octagonal cut corners & glass effect */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-black/90 border border-white/20 p-5 sm:p-6 md:p-8 flex flex-col overflow-hidden shadow-2xl btn-cut glass-panel">
        
        {/* Decorative Top Accent Bar */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-white animate-pulse rounded-full" />
            <div>
              <span className="text-[10px] text-white/50 tracking-[0.3em] font-mono uppercase block">
                V O R T X // DATA STREAM
              </span>
              <h2 className="text-lg md:text-2xl text-white font-light tracking-tight">
                {type === 'synergy' && 'Neural Synergy • Төгөлдөр Хуур & Дуу Хөгжим'}
                {type === 'synthesis' && 'Cyber Synthesis • Кино & Тоглоом'}
                {type === 'discover' && 'Ивээлийн Дэлгэрэнгүй Профайл'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-white/80 transition-all cursor-pointer btn-cut-sm shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-white/10 no-scrollbar">
          <button
            onClick={() => setActiveTab('bio')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm transition-all btn-cut cursor-pointer font-medium ${
              activeTab === 'bio' ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Facts</span>
          </button>
          
          <button
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm transition-all btn-cut cursor-pointer font-medium ${
              activeTab === 'music' ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Wisp / Nuht</span>
          </button>

          <button
            onClick={() => setActiveTab('shows')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm transition-all btn-cut cursor-pointer font-medium ${
              activeTab === 'shows' ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Skins & AIB</span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm transition-all btn-cut cursor-pointer font-medium ${
              activeTab === 'games' ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Roblox & MLBB</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* TAB 1: BIO & FACTS */}
          {activeTab === 'bio' && (
            <div className="space-y-6 anim-fade">
              <div className="bg-white/5 border border-white/10 p-6 btn-cut relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-light text-white tracking-wide flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    Танилцуулга (About Iveel)
                  </h3>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest border border-white/20 px-2 py-0.5 btn-cut-sm">
                    15 YEARS OLD
                  </span>
                </div>
                <p className="text-white/80 text-sm md:text-base leading-relaxed font-light">
                  Намайг Ивээл гэдэг. Би 15 настай. Төгөлдөр хуур тоглох, дуу сонсох сонирхолтой. VORTX стилийн дижитал дизайн, агаар мандал болон орчин үеийн футуристик веб технологиудад дуртай.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 btn-cut">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mb-1">Нас / Age</span>
                  <p className="text-2xl text-white font-light tracking-tight">15 настай</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 btn-cut">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mb-1">Сонирхол / Hobbies</span>
                  <p className="text-base text-white font-normal">Төгөлдөр хуур тоглох, Дуу сонсох</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 btn-cut">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mb-2">Дуртай өнгө / Favorite Colors</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-black border border-white/30 px-3 py-1.5 text-xs text-white btn-cut-sm">
                      <span className="w-3 h-3 bg-black border border-white inline-block" />
                      <span className="font-mono">Хар (Black)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-950/80 border border-blue-400/50 px-3 py-1.5 text-xs text-blue-200 btn-cut-sm">
                      <span className="w-3 h-3 bg-blue-500 inline-block" />
                      <span className="font-mono">Цэнхэр (Blue)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 btn-cut">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mb-1">Дуртай дуучин / Singer</span>
                  <p className="text-base text-white font-semibold">Wisp</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-5 btn-cut col-span-1 md:col-span-2">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mb-1">Дуртай дуу / Song</span>
                  <p className="text-base text-white font-semibold">Nuht — The Tourists</p>
                </div>
              </div>

              {/* Social Accounts Card */}
              <div className="bg-white/5 border border-white/10 p-6 btn-cut">
                <h4 className="text-xs font-mono text-white/60 uppercase tracking-[0.2em] mb-4">
                  СОШИАЛ ХАЯГУУД (SOCIAL ACCOUNTS)
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="https://www.facebook.com/search/top?q=Iveel%20Ankhbayar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white text-black px-5 py-3 font-bold text-xs uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer shadow-lg"
                  >
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook: Iveel Ankhbayar</span>
                  </a>
                </div>
              </div>

              {/* Facts List */}
              <div className="bg-white/5 border border-white/10 p-6 btn-cut">
                <h4 className="text-xs font-mono text-white/60 uppercase tracking-[0.2em] mb-4">
                  СОНИРХОЛТОЙ ФАКТ-УУД (FUN FACTS)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {IVEEL_PROFILE.funFacts.map((fact, index) => (
                    <div key={index} className="flex items-start gap-3 bg-black/40 border border-white/10 p-3 btn-cut-sm">
                      <span className="text-white/40 font-mono text-xs mt-0.5">0{index + 1}</span>
                      <span className="text-sm text-white/90 font-light">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MUSIC (The Tourists & YouTube Nuht Player) */}
          {activeTab === 'music' && (
            <div className="space-y-6 anim-fade">
              <div className="bg-white/5 border border-white/10 p-6 btn-cut flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 relative bg-black border border-white/30 btn-cut-sm overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop"
                    alt="The Tourists Nuht"
                    className="w-full h-full object-cover opacity-80 filter contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>

                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs text-white/50 font-mono uppercase tracking-[0.2em]">
                    FEATURED TRACK // WISP & THE TOURISTS
                  </span>
                  <h3 className="text-2xl md:text-3xl font-light text-white">Nuht — The Tourists</h3>
                  <p className="text-white/70 text-sm max-w-lg leading-relaxed font-light">
                    Ивээлийн хамгийн дуртай дуучин: <strong className="text-white font-medium">Wisp</strong>. Дуртай дуу: <strong className="text-white font-medium">Nuht (The Tourists)</strong>.
                  </p>
                </div>
              </div>

              {/* YouTube Embed Player */}
              <div className="bg-black border border-white/20 p-2 btn-cut">
                <div className="relative w-full aspect-video overflow-hidden btn-cut-sm">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${IVEEL_PROFILE.youtubeVideoId}?autoplay=0&rel=0`}
                    title="The Tourists - Nuht (Official Video)"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHOWS & MOVIES */}
          {activeTab === 'shows' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 anim-fade">
              <div className="bg-white/5 border border-white/10 p-5 btn-cut space-y-4">
                <div className="h-64 overflow-hidden relative btn-cut-sm border border-white/10">
                  <img
                    src={IVEEL_PROFILE.favoriteShows[0].image}
                    alt="Effy Stonem - Skins"
                    className="w-full h-full object-cover object-top filter contrast-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black border border-white/40 px-3 py-1 text-[10px] text-white font-mono uppercase btn-cut-sm">
                    Effy Stonem // Skins (UK)
                  </div>
                </div>
                <h4 className="text-xl font-light text-white">Skins — Effy Stonem</h4>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  Дуртай дүр: Effy Stonem. Ивээлийн хамгийн дуртай Британийн залуучуудын драма цуврал болон түүний дахин тутагдашгүй дүр төрх.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 btn-cut space-y-4">
                <div className="h-64 overflow-hidden relative btn-cut-sm border border-white/10">
                  <img
                    src={IVEEL_PROFILE.favoriteShows[1].image}
                    alt="Alice in Borderland"
                    className="w-full h-full object-cover filter contrast-125 brightness-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black border border-white/40 px-3 py-1 text-[10px] text-white font-mono uppercase btn-cut-sm">
                    AIB // Poster
                  </div>
                </div>
                <h4 className="text-xl font-light text-white">Alice in Borderland (AIB)</h4>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  Адал явдалт, амьд үлдэх тэмцэл бүхий триллер цуврал. Футуристик Токиогийн нууцлаг ертөнц.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: GAMES */}
          {activeTab === 'games' && (
            <div className="space-y-4 anim-fade">
              <div className="bg-white/5 border border-white/10 p-6 btn-cut flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">METAVERSE & GAMING</span>
                  <h4 className="text-xl font-light text-white">Roblox</h4>
                  <p className="text-xs text-white/60 mt-1 font-light">Virtual Creation & Gaming Universe</p>
                </div>
                <span className="px-4 py-1.5 bg-white text-black text-xs font-bold btn-cut-sm">
                  Active Player
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 btn-cut flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">MOBA ESPORTS</span>
                  <h4 className="text-xl font-light text-white">Mobile Legends: Bang Bang (MLBB)</h4>
                  <p className="text-xs text-white/60 mt-1 font-light">Multiplayer Online Battle Arena</p>
                </div>
                <span className="px-4 py-1.5 bg-white text-black text-xs font-bold btn-cut-sm">
                  MOBA Enthusiast
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/50 font-mono">
          <span className="tracking-widest uppercase">VORTX MATRIX // IVEEL 2026</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer"
          >
            Хаах (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
