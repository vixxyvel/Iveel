import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProfileModal } from './components/ProfileModal';
import { IdolChatModal } from './components/IdolChatModal';
import { AssistantChatPopup } from './components/AssistantChatPopup';
import { GamesModal } from './components/GamesModal';
import { ModalType } from './types';

export default function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [audioMuted, setAudioMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenModal = (type: ModalType) => {
    setActiveModal(type);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSocialClick = (name: string) => {
    setToastMessage(`VORTX // ${name} profile connection initialized`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="h-screen w-full bg-black p-3 md:p-4 font-inter">
      {/* Liquid Glass Container */}
      <div className="w-full h-full rounded-[2rem] flex flex-col overflow-hidden relative bg-black shadow-2xl">
        {/* Background Video */}
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260717_120352_eb988725-1351-43b3-8095-16e4a1005e3d.mp4"
          autoPlay
          loop
          muted={audioMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover anim-fade"
          style={{ animationDelay: '0.2s' }}
        />

        {/* Video Dark Overlay to guarantee readability & atmosphere */}
        <div className="absolute inset-0 bg-black/40 z-[5] pointer-events-none" />

        {/* Navbar */}
        <Navbar
          onOpenModal={handleOpenModal}
          audioMuted={audioMuted}
          onToggleAudio={() => setAudioMuted(!audioMuted)}
        />

        {/* Hero Main Content */}
        <HeroSection
          onOpenModal={handleOpenModal}
          onSocialClick={handleSocialClick}
        />

        {/* Glassmorphic Profile Modal */}
        <ProfileModal
          type={activeModal}
          onClose={handleCloseModal}
          onOpenGames={() => handleOpenModal('games')}
        />

        {/* Idol Coach Chat Modal */}
        <IdolChatModal
          isOpen={activeModal === 'idol'}
          onClose={handleCloseModal}
        />

        {/* Games Modal - Anime Guesser */}
        <GamesModal
          isOpen={activeModal === 'games'}
          onClose={handleCloseModal}
        />

        {/* Floating Messenger Assistant Popup */}
        <AssistantChatPopup />

        {/* Notification Toast */}
        {toastMessage && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white text-black px-4 py-2 text-xs font-mono uppercase tracking-wider btn-cut shadow-xl anim-fade">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
