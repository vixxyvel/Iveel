import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, RefreshCw, User, Minimize2 } from 'lucide-react';
import { ChatMessage } from '../types';

const INITIAL_WELCOME = `Сайн байна уу! Намайг Iveel-ийн AI туслах гэдэг. Тавтай морил! 😊
Би бол Iveel Ankhbayar-ийн portfolio сайтын найрсаг туслах байна. Миний зорилго бол танд Iveel-ийн хийж буй бүтээлч төслүүд, сонирхдог зүйлс болон түүний зорилгын талаар илүү дэлгэрэнгүй танилцуулах юм.
Товчхондоо бол Iveel бол технологи, урлаг хоёрыг хослуулах дуртай, шинэ зүйл сурах эрмэлзэлтэй нэгэн. Тэрээр хөгжим (төгөлдөр хуур, цахилгаан гитар) тоглох, хөгжим зохиох, Герман хэл сурах гээд л олон зүйлд сонирхолтой.
Та Iveel-ийн хийсэн ажлууд, түүний сонирхол эсвэл ирээдүйн зорилгынх нь талаар яг юуг сонирхож байна вэ? Хүссэн зүйлээ асуугаарай, би дуртайяа тайлбарлаж өгөх болно!`;

const SUGGESTED_QUESTIONS = [
  'Ивээл ямар хөгжим тоглодог вэ?',
  'Герман хэл сурах болон ирээдүйн зорилго',
  'Дуртай дуучин Wisp ба дуртай дуу',
  'Дуртай цуврал Skins ба AIB'
];

export const AssistantChatPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: INITIAL_WELCOME,
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

    const history = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botType: 'assistant',
          history,
          message: query
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Хариулт авч чадсангүй.');
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
        text: INITIAL_WELCOME,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* POPUP CHAT BOX */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[520px] max-h-[82vh] bg-black/95 border border-white/20 rounded-2xl p-4 flex flex-col shadow-2xl backdrop-blur-2xl mb-3 anim-fade btn-cut glass-panel">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white text-black btn-cut-sm flex items-center justify-center font-bold shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                  <span>Me-AI туслах</span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </h3>
                <span className="text-[10px] text-white/50 font-mono block">
                  Iveel's Portfolio Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                title="Шинэчлэх"
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white btn-cut-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white text-black hover:bg-white/80 btn-cut-sm transition-all cursor-pointer font-bold"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                } anim-fade`}
              >
                {msg.sender === 'bot' ? (
                  <div className="w-6 h-6 bg-white/20 text-white btn-cut-sm flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-white text-black btn-cut-sm flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 btn-cut leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-white text-black font-medium'
                      : 'bg-white/10 text-white/90 border border-white/10'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`text-[9px] font-mono mt-1 block ${
                      msg.sender === 'user' ? 'text-black/60 text-right' : 'text-white/40'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 anim-fade">
                <div className="w-6 h-6 bg-white/20 text-white btn-cut-sm flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="bg-white/10 border border-white/15 px-3 py-2 btn-cut text-white/70 text-[11px] font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Хариулж байна...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-950/80 border border-red-500/40 p-2.5 btn-cut text-red-200 text-[11px] font-mono">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar border-t border-white/10 mt-1">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/15 border border-white/15 text-white/80 text-[11px] whitespace-nowrap btn-cut-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-white/15 pt-2 mt-1"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Асуултаа энд бичнэ үү..."
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-white btn-cut placeholder:text-white/30 font-light"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-white text-black font-bold btn-cut hover:bg-white/90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Илгээх"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING MESSENGER-STYLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center p-3.5 bg-white text-black font-bold btn-cut shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40"
        aria-label="Me-AI Туслахтай чатлах"
      >
        <MessageCircle className="w-6 h-6 text-black fill-black/10 group-hover:rotate-12 transition-transform" />
        
        {/* Pulse dot badge */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />

        {/* Hover Label */}
        <span className="absolute right-full mr-3 bg-black/90 text-white text-xs px-3 py-1.5 btn-cut border border-white/20 font-mono tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
          Me-AI туслах
        </span>
      </button>
    </div>
  );
};
