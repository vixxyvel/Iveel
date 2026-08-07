import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, RefreshCw, User, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';
import effyPortrait from '../assets/images/effy_stonem_portrait_1785727832397.jpg';

interface IdolChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_GREETING = `Би бол зүгээр л... би. Хүмүүс намайг Effy гэдэг.
Харин чи хэн бэ? Энд юу хайж яваа юм?`;

const SUGGESTED_PROMPTS = [
  'Эффэй, амьдрал дээр юу хамгийн чухал вэ?',
  'Ивээлийн тухай чи юу гэж боддог вэ?',
  'Хөгжим ба урлаг чамд ямар мэдрэмж өгдөг вэ?',
  'Сэтгэл санаа хүнд үед яаж өөрийгөө олох вэ?'
];

export const IdolChatModal: React.FC<IdolChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: INITIAL_GREETING,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);
    setError(null);

    // Prepare history for API
    const history = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botType: 'idol',
          history,
          message: query
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Хариулт авахад алдаа гарлаа.');
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI холбогдоход алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: INITIAL_GREETING,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl anim-fade">
      <div className="relative w-full max-w-3xl h-[85vh] max-h-[750px] bg-black/90 border border-white/20 p-4 sm:p-6 flex flex-col overflow-hidden shadow-2xl btn-cut glass-panel">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/40 shrink-0">
              <img
                src={effyPortrait}
                alt="Effy Stonem"
                className="w-full h-full object-cover filter contrast-110"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">
                  IDOL COACH // EFFY STONEM
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white border border-white/20 btn-cut-sm font-mono">
                  Skins Persona
                </span>
              </div>
              <h2 className="text-lg md:text-xl text-white font-light tracking-tight flex items-center gap-2">
                <span>🤖 My Idol (Effy Coach)</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Яриаг шинэчлэх"
              className="p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white btn-cut-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-white text-black hover:bg-white/80 transition-all cursor-pointer btn-cut-sm shrink-0 font-bold"
              aria-label="Хаах"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar pb-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              } anim-fade`}
            >
              {/* Avatar */}
              {msg.sender === 'bot' ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 shrink-0 mt-1">
                  <img src={effyPortrait} alt="Effy" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-white text-black btn-cut-sm flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] sm:max-w-[75%] p-4 btn-cut text-sm md:text-base leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-white text-black font-medium'
                    : 'bg-white/10 text-white/90 border border-white/15 backdrop-blur-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[10px] font-mono mt-2 block ${
                    msg.sender === 'user' ? 'text-black/60 text-right' : 'text-white/40'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 anim-fade">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 shrink-0">
                <img src={effyPortrait} alt="Effy" className="w-full h-full object-cover opacity-80 animate-pulse" />
              </div>
              <div className="bg-white/10 border border-white/15 px-4 py-3 btn-cut text-white/70 text-xs font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-white/80" />
                <span>Effy бодож байна...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-950/80 border border-red-500/40 p-3 btn-cut text-red-200 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="py-2 overflow-x-auto flex items-center gap-2 no-scrollbar border-t border-white/10">
          <span className="text-[10px] font-mono uppercase text-white/40 shrink-0">
            ЗӨВЛӨМЖ:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="px-3 py-1 bg-white/5 hover:bg-white/15 border border-white/15 text-white/80 text-xs whitespace-nowrap btn-cut-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-2 flex items-center gap-2 border-t border-white/15 pt-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Effy-тэй харилцах асуултаа бичнэ үү..."
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/20 px-4 py-3 text-white text-sm focus:outline-none focus:border-white btn-cut placeholder:text-white/30 font-light"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            <span>Илгээх</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
