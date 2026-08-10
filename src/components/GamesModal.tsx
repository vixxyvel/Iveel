import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Trophy, Timer, RotateCcw, HelpCircle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { AnimeQuestion } from '../types';
import fallbackQuestions from '../data/data.json';

interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GamesModal: React.FC<GamesModalProps> = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState<AnimeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(2);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('anime_guesser_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gainedPoints, setGainedPoints] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'game_over' | 'completed'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to parse options array safely if pipe separated string or array
  const getParsedOptions = (q: AnimeQuestion): string[] => {
    if (Array.isArray(q.options)) {
      return q.options;
    }
    if (typeof q.options === 'string') {
      return (q.options as string).split('|').map((opt) => opt.trim());
    }
    return [q.answer, 'Option 2', 'Option 3', 'Option 4'];
  };

  // Fisher-Yates shuffle
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Fetch or load questions from data.json
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch('/data.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuestions(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch /data.json, using fallback data:', err);
      }
      setQuestions(fallbackQuestions as AnimeQuestion[]);
    };

    if (isOpen) {
      loadQuestions();
      resetGame();
    }
  }, [isOpen]);

  // Shuffle options whenever current question changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const rawOpts = getParsedOptions(questions[currentIndex]);
      setShuffledOptions(shuffleArray(rawOpts));
    }
  }, [currentIndex, questions]);

  // Handle countdown timer
  useEffect(() => {
    if (!isOpen || gameState !== 'playing' || isAnswered || questions.length === 0) {
      return;
    }

    if (timeLeft <= 0) {
      // Time run out! Count as wrong answer
      handleTimeout();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isAnswered, gameState, isOpen, questions]);

  // Reset image error status when question changes
  useEffect(() => {
    setImageFailed(false);
  }, [currentIndex]);

  const handleTimeout = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    setSelectedOption(null);

    const newLives = lives - 1;
    setLives(newLives);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered || gameState !== 'playing') return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const correct = option.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      // Award points +10, +20, +30 based on speed
      let points = 10;
      if (timeLeft >= 15) {
        points = 30;
      } else if (timeLeft >= 8) {
        points = 20;
      } else {
        points = 10;
      }

      setGainedPoints(points);
      const newScore = score + points;
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('anime_guesser_highscore', newScore.toString());
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
    }
  };

  const advanceToNextQuestion = (currentLives: number) => {
    if (currentLives <= 0) {
      setGameState('game_over');
      return;
    }

    if (currentIndex + 1 >= questions.length) {
      setGameState('completed');
    } else {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(20);
      setIsAnswered(false);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowHint(false);
      setImageFailed(false);
    }
  };

  const resetGame = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setCurrentIndex(0);
    setLives(2);
    setScore(0);
    setTimeLeft(20);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setGameState('playing');
    setShowHint(false);
    setImageFailed(false);
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const options = shuffledOptions.length > 0 ? shuffledOptions : (currentQ ? getParsedOptions(currentQ) : []);
  const hasImage = Boolean(currentQ?.image && currentQ.image.trim() !== '' && !imageFailed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl anim-fade">
      {/* Outer Container */}
      <div className="relative w-full max-w-2xl bg-black/90 border border-white/20 p-5 sm:p-6 md:p-8 flex flex-col overflow-hidden shadow-2xl btn-cut glass-panel max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-400 animate-pulse rounded-full" />
            <div>
              <span className="text-[10px] text-white/50 tracking-[0.3em] font-mono uppercase block">
                🎮 IVEEL PORTFOLIO // GAMES
              </span>
              <h2 className="text-lg md:text-xl text-white font-bold tracking-tight flex items-center gap-2">
                Movie Guesser <span className="text-xs bg-white/20 text-white px-2 py-0.5 btn-cut-sm font-normal">Emoji Таавар</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-white text-black hover:bg-white/80 transition-all cursor-pointer btn-cut-sm shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar: Score, Lives, Timer - ALWAYS VISIBLE */}
        <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/15 p-3 btn-cut mb-5 shrink-0 text-center">
          {/* Score */}
          <div className="flex flex-col items-center justify-center border-r border-white/10 pr-2">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" /> Оноо
            </span>
            <span className="text-xl md:text-2xl font-black text-yellow-300 font-mono tracking-tight">
              {score}
            </span>
          </div>

          {/* Lives */}
          <div className="flex flex-col items-center justify-center border-r border-white/10 px-2">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500 fill-red-500" /> Амь
            </span>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 2 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-all ${
                    i < lives ? 'text-red-500 fill-red-500 scale-110' : 'text-white/20 fill-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center justify-center pl-2">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1">
              <Timer className={`w-3 h-3 ${timeLeft <= 5 ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`} /> Хугацаа
            </span>
            <span className={`text-xl md:text-2xl font-black font-mono tracking-tight ${
              timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-300'
            }`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Scrollable Game Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          
          {/* PLAYING STATE */}
          {gameState === 'playing' && currentQ && (
            <div className="space-y-4 anim-fade">
              {/* Question Card */}
              <div className="bg-white/5 border border-white/15 p-6 btn-cut text-center relative overflow-hidden">
                
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeLeft <= 5 ? 'bg-red-500' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${(timeLeft / 20) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-white/50 font-mono mb-2">
                  <span>АСУУЛТ {currentIndex + 1} / {questions.length}</span>
                  {currentQ.hint && (
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-1 text-yellow-300 hover:text-yellow-200 transition-colors cursor-pointer underline underline-offset-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {showHint ? 'Зөвлөмж нуух' : 'Зөвлөмж харах'}
                    </button>
                  )}
                </div>

                {/* Hint Message Box */}
                {showHint && currentQ.hint && (
                  <div className="mb-3 p-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs rounded btn-cut-sm anim-fade">
                    {currentQ.hint}
                  </div>
                )}

                {/* Main Emoji Display */}
                <div className="my-4 py-4 bg-black/50 border border-white/10 btn-cut">
                  <span className="text-4xl sm:text-5xl md:text-6xl tracking-widest select-none filter drop-shadow-md">
                    {currentQ.emojis}
                  </span>
                </div>

                {/* Image Display after answer if image URL is available */}
                {isAnswered && hasImage && (
                  <div className="my-3 flex flex-col items-center justify-center anim-fade">
                    <div className="p-2 bg-black/80 border border-white/20 btn-cut max-w-full overflow-hidden">
                      <img
                        src={currentQ.image}
                        alt={currentQ.answer}
                        referrerPolicy="no-referrer"
                        onError={() => setImageFailed(true)}
                        className="max-h-[200px] w-auto object-contain mx-auto rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Feedback Message */}
                {isAnswered && (
                  <div className="mt-3 anim-fade">
                    {isCorrect ? (
                      <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-300 font-bold text-sm btn-cut-sm flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-400" />
                        <span>ЗӨВ ХАРИУЛЛАА! +{gainedPoints} ОНОО</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-300 font-bold text-sm btn-cut-sm flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span>
                          {selectedOption === null
                            ? `⏰ ХУГАЦАА ДУУСЛАА! ЗӨВ ХАРИУЛТ: ${currentQ.answer}`
                            : `❌ БУРУУ! ЗӨВ ХАРИУЛТ: ${currentQ.answer}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4 Choices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt, idx) => {
                  const isThisSelected = selectedOption === opt;
                  const isThisCorrect = opt.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();

                  let btnStyle = "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40";

                  if (isAnswered) {
                    if (isThisCorrect) {
                      btnStyle = "bg-green-600 border-green-400 text-white font-bold ring-2 ring-green-400";
                    } else if (isThisSelected && !isThisCorrect) {
                      btnStyle = "bg-red-600 border-red-400 text-white line-through opacity-80";
                    } else {
                      btnStyle = "bg-white/5 border-white/10 text-white/40 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(opt)}
                      className={`p-4 text-sm font-semibold transition-all btn-cut cursor-pointer border flex items-center justify-between text-left ${btnStyle}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-black/40 border border-white/30 flex items-center justify-center text-xs font-mono shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {isAnswered && isThisCorrect && (
                        <span className="text-xs bg-black/50 px-2 py-0.5 rounded text-green-300 font-mono">Зөв</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Manual Next button if answered */}
              {isAnswered && (
                <button
                  type="button"
                  onClick={() => advanceToNextQuestion(lives)}
                  className="w-full py-3 bg-white text-black font-bold text-sm uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>{lives <= 0 ? 'Үр Дүн Харах' : 'Дараагийн Асуулт'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* GAME OVER STATE */}
          {gameState === 'game_over' && (
            <div className="space-y-6 text-center py-6 anim-fade">
              <div className="bg-red-950/40 border border-red-500/40 p-6 btn-cut space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center text-red-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-red-400 tracking-wider">
                  ТОГЛООМ ДУУССАН!
                </h3>
                <p className="text-white/70 text-sm max-w-md mx-auto">
                  Таны амь дууслаа. Гэхдээ бууж өгөлгүй дахин туршаад үзээрэй!
                </p>

                <div className="py-4 bg-black/60 border border-white/10 btn-cut space-y-1">
                  <span className="text-xs text-white/50 uppercase font-mono tracking-widest block">
                    Нийт Авсан Оноо
                  </span>
                  <span className="text-4xl font-black text-yellow-300 font-mono">
                    {score}
                  </span>
                  {highScore > 0 && (
                    <span className="text-xs text-white/40 block font-mono">
                      Дээд рекорд: {highScore}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={resetGame}
                  className="w-full py-4 bg-white text-black font-bold text-sm uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Дахин Тоглох</span>
                </button>
              </div>
            </div>
          )}

          {/* COMPLETED / WON STATE */}
          {gameState === 'completed' && (
            <div className="space-y-6 text-center py-6 anim-fade">
              <div className="bg-yellow-950/30 border border-yellow-500/40 p-6 btn-cut space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-500/20 border border-yellow-500/50 rounded-full flex items-center justify-center text-yellow-300">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-yellow-300 tracking-wider">
                  БАЯР ХҮРГЭЕ!
                </h3>
                <p className="text-white/80 text-sm max-w-md mx-auto">
                  Та бүх анимийн тааврыг амжилттай тааж дуусгалаа!
                </p>

                <div className="py-4 bg-black/60 border border-white/10 btn-cut space-y-1">
                  <span className="text-xs text-white/50 uppercase font-mono tracking-widest block">
                    Төгсгөлийн Оноо
                  </span>
                  <span className="text-4xl font-black text-yellow-300 font-mono">
                    {score}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={resetGame}
                  className="w-full py-4 bg-white text-black font-bold text-sm uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Дахин Тоглох</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Footer Note */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-white/40 font-mono shrink-0">
          <span>🎮 Movie Guesser v1.0</span>
          <span>Зургийн эх сурвалж: Wikipedia</span>
        </div>
      </div>
    </div>
  );
};
