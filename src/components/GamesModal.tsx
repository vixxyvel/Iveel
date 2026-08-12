import React, { useState, useEffect, useRef } from 'react';
import {
  X, Heart, Trophy, Timer, RotateCcw, HelpCircle, ArrowRight,
  Sparkles, AlertCircle, UserCheck, Play, Layers,
  CheckCircle2, Send, Award, RefreshCw, Eye, ChevronDown, ChevronUp, User
} from 'lucide-react';
import { AnimeQuestion } from '../types';
import fallbackQuestions from '../data/data.json';
import { savePlayerScore, fetchTopScores, ScoreEntry, AnswerRecord } from '../lib/firebase';

interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GamesModal: React.FC<GamesModalProps> = ({ isOpen, onClose }) => {
  const [allQuestions, setAllQuestions] = useState<AnimeQuestion[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<AnimeQuestion[]>([]);
  const [selectedMode, setSelectedMode] = useState<'menu' | 'movie' | 'anime' | 'all'>('menu');

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

  // Answer tracking for Firestore
  const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isScoreSaved, setIsScoreSaved] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Leaderboard state
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard'>('game');
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to parse options array safely
  const getParsedOptions = (q: AnimeQuestion): string[] => {
    let opts: string[] = [];
    if (Array.isArray(q.options)) {
      opts = [...q.options];
    } else if (typeof q.options === 'string') {
      opts = (q.options as string).split('|').map((opt) => opt.trim());
    } else {
      opts = [q.answer];
    }

    if (!opts.some(o => o.trim().toLowerCase() === q.answer.trim().toLowerCase())) {
      opts.unshift(q.answer);
    }

    return opts;
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

  // Fetch questions from data.json
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch('/data.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllQuestions(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch /data.json, using fallback data:', err);
      }
      setAllQuestions(fallbackQuestions as AnimeQuestion[]);
    };

    if (isOpen) {
      loadQuestions();
      setSelectedMode('menu');
      setActiveTab('game');
      resetGame();
    }
  }, [isOpen]);

  // Load Leaderboard data
  const loadLeaderboardData = async () => {
    setIsLoadingScores(true);
    try {
      const scores = await fetchTopScores();
      setTopScores(scores);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setIsLoadingScores(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard' && isOpen) {
      loadLeaderboardData();
    }
  }, [activeTab, isOpen]);

  // Start game mode
  const handleStartMode = (mode: 'movie' | 'anime' | 'all' = 'all') => {
    setSelectedMode(mode);
    setActiveTab('game');

    let filtered = allQuestions;
    if (mode === 'movie') {
      filtered = allQuestions.filter(q => q.category === 'movie');
    } else if (mode === 'anime') {
      filtered = allQuestions.filter(q => q.category === 'anime' || q.category === 'emoji' || !q.category);
    }

    const shuffledQuestions = shuffleArray(filtered.length > 0 ? filtered : allQuestions);
    setActiveQuestions(shuffledQuestions);

    resetGame();
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
    setUserAnswers([]);
    setIsScoreSaved(false);
    setSaveSuccessMsg('');
  };

  // Shuffle options whenever current question changes
  useEffect(() => {
    if (activeQuestions.length > 0 && activeQuestions[currentIndex]) {
      const rawOpts = getParsedOptions(activeQuestions[currentIndex]);
      setShuffledOptions(shuffleArray(rawOpts));
    }
  }, [currentIndex, activeQuestions]);

  // Handle countdown timer
  useEffect(() => {
    if (!isOpen || activeTab !== 'game' || selectedMode === 'menu' || gameState !== 'playing' || isAnswered || activeQuestions.length === 0) {
      return;
    }

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isAnswered, gameState, isOpen, selectedMode, activeQuestions, activeTab]);

  // Reset image error status when question changes
  useEffect(() => {
    setImageFailed(false);
  }, [currentIndex]);

  const handleTimeout = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    setSelectedOption(null);

    const currentQ = activeQuestions[currentIndex];
    if (currentQ) {
      setUserAnswers(prev => [
        ...prev,
        {
          questionId: currentQ.id,
          questionAnswer: currentQ.answer,
          userAnswer: null,
          isCorrect: false,
          points: 0,
        }
      ]);
    }

    const newLives = lives - 1;
    setLives(newLives);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered || gameState !== 'playing') return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = activeQuestions[currentIndex];
    const correct = option.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();
    setIsCorrect(correct);

    let pointsEarned = 0;
    if (correct) {
      const basePoint = currentQ.meta?.point || 20;
      if (timeLeft >= 15) {
        pointsEarned = basePoint + 10;
      } else if (timeLeft >= 8) {
        pointsEarned = basePoint;
      } else {
        pointsEarned = Math.max(10, basePoint - 10);
      }

      setGainedPoints(pointsEarned);
      const newScore = score + pointsEarned;
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('anime_guesser_highscore', newScore.toString());
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
    }

    setUserAnswers(prev => [
      ...prev,
      {
        questionId: currentQ.id,
        questionAnswer: currentQ.answer,
        userAnswer: option,
        isCorrect: correct,
        points: pointsEarned,
      }
    ]);
  };

  const advanceToNextQuestion = (currentLives: number) => {
    if (currentLives <= 0) {
      setGameState('game_over');
      return;
    }

    if (currentIndex + 1 >= activeQuestions.length) {
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

  // Save Score to Firestore
  const handleSaveScore = async () => {
    if (!playerName.trim() || isSavingScore || isScoreSaved) return;

    setIsSavingScore(true);
    try {
      await savePlayerScore(playerName, score, userAnswers);
      setIsScoreSaved(true);
      setSaveSuccessMsg('Оноо болон хариултууд Firestore-д амжилттай хадгалагдлаа!');
    } catch (err) {
      console.error('Failed to save score:', err);
      setSaveSuccessMsg('Хадгалахад алдаа гарлаа.');
    } finally {
      setIsSavingScore(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = activeQuestions[currentIndex];
  const options = shuffledOptions.length > 0 ? shuffledOptions : (currentQ ? getParsedOptions(currentQ) : []);
  const isHeroMode = selectedMode === 'hero' || (currentQ && currentQ.category === 'hero');
  const hasImage = Boolean(currentQ?.image && currentQ.image.trim() !== '' && !imageFailed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl anim-fade">
      {/* Outer Container */}
      <div className="relative w-full max-w-2xl bg-black/90 border border-white/20 p-5 sm:p-6 md:p-8 flex flex-col overflow-hidden shadow-2xl btn-cut glass-panel max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-purple-400 animate-pulse rounded-full" />
            <div>
              <span className="text-[10px] text-white/50 tracking-[0.3em] font-mono uppercase block">
                🎮 IVEEL PORTFOLIO // GAMES
              </span>
              <h2 className="text-lg md:text-xl text-white font-bold tracking-tight flex items-center gap-2">
                Movie & Anime Guesser <span className="text-xs bg-purple-600/80 border border-purple-400/40 text-white px-2 py-0.5 btn-cut-sm font-normal">v3.0</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab(activeTab === 'game' ? 'leaderboard' : 'game');
              }}
              className={`px-3 py-1.5 text-xs font-mono btn-cut-sm transition-all border flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-yellow-500 text-black font-bold border-yellow-400'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{activeTab === 'leaderboard' ? 'Тоглоом руу' : 'Онооны Жагсаалт'}</span>
            </button>

            {selectedMode !== 'menu' && activeTab === 'game' && (
              <button
                type="button"
                onClick={() => setSelectedMode('menu')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono btn-cut-sm transition-all border border-white/20 flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Тоглоомын цэс</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-white text-black hover:bg-white/80 transition-all cursor-pointer btn-cut-sm shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STATUS BAR (Visible during gameplay) */}
        {activeTab === 'game' && selectedMode !== 'menu' && (
          <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/15 p-3 btn-cut mb-4 shrink-0 text-center">
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
        )}

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">

          {/* LEADERBOARD VIEW */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4 py-2 anim-fade">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" /> 🏆 ТОП 10 Шилдэг Тоглогчийн Жагсаалт
                  </h3>
                  <p className="text-xs text-white/60">
                    "scores" цуглуулга дахь хамгийн өндөр оноотой ТОП 10 тоглогч
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadLeaderboardData}
                  disabled={isLoadingScores}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded btn-cut cursor-pointer flex items-center gap-1 text-xs font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingScores ? 'animate-spin' : ''}`} />
                  <span>Шинэчлэх</span>
                </button>
              </div>

              {isLoadingScores ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mx-auto" />
                  <p className="text-xs font-mono text-white/50">Firestore-оос оноонуудыг уншиж байна...</p>
                </div>
              ) : topScores.length === 0 ? (
                <div className="py-12 text-center bg-white/5 border border-white/10 btn-cut p-6 space-y-2">
                  <Award className="w-10 h-10 text-white/30 mx-auto" />
                  <p className="text-sm font-bold text-white/80">Одоогоор оноо хадгалагдаагүй байна.</p>
                  <p className="text-xs text-white/50">Та тоглож дуусаад анхны оноогоо хадгалаарай!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topScores.map((entry, idx) => {
                    const isExpanded = expandedScoreId === entry.id;
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    let rankBadge = `${idx + 1}`;
                    let bgBadge = "bg-white/10 text-white/70";
                    if (isTop1) {
                      rankBadge = "🥇 1";
                      bgBadge = "bg-yellow-500/20 border-yellow-400 text-yellow-300 font-bold";
                    } else if (isTop2) {
                      rankBadge = "🥈 2";
                      bgBadge = "bg-slate-400/20 border-slate-300 text-slate-200 font-bold";
                    } else if (isTop3) {
                      rankBadge = "🥉 3";
                      bgBadge = "bg-amber-700/20 border-amber-500 text-amber-300 font-bold";
                    }

                    return (
                      <div
                        key={entry.id || idx}
                        className="bg-white/5 border border-white/10 hover:border-white/20 btn-cut overflow-hidden transition-all"
                      >
                        <div
                          onClick={() => setExpandedScoreId(isExpanded ? null : (entry.id || null))}
                          className="p-3 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded text-xs font-mono border ${bgBadge}`}>
                              #{rankBadge}
                            </span>
                            <div>
                              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-purple-400" />
                                <span>{entry.playerName}</span>
                              </div>
                              <span className="text-[10px] text-white/40 font-mono">
                                {entry.answers?.length || 0} асуулт хариулсан
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-base font-black text-yellow-300 font-mono">
                                {entry.score} <span className="text-[10px] font-normal text-yellow-400/70">ОНОО</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="p-1 text-white/50 hover:text-white"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Detailed Answer Record Drawer */}
                        {isExpanded && (
                          <div className="bg-black/60 border-t border-white/10 p-3 text-xs space-y-2 anim-fade">
                            <span className="text-[10px] uppercase font-mono text-purple-300 block">
                              📋 Хариулсан Асуултуудын Дэлгэрэнгүй ({entry.answers?.length || 0}):
                            </span>
                            {entry.answers && entry.answers.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {entry.answers.map((ans, aIdx) => (
                                  <div
                                    key={aIdx}
                                    className={`p-2 border rounded ${
                                      ans.isCorrect
                                        ? 'bg-green-950/30 border-green-500/30 text-green-200'
                                        : 'bg-red-950/30 border-red-500/30 text-red-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-mono font-bold">
                                      <span>Асуулт #{ans.questionId}</span>
                                      <span>{ans.isCorrect ? `+${ans.points} оноо` : '0 оноо'}</span>
                                    </div>
                                    <div className="mt-1 text-[11px] space-y-0.5">
                                      <div className="opacity-90">
                                        Зөв: <span className="font-semibold text-white">{ans.questionAnswer}</span>
                                      </div>
                                      <div className="opacity-80">
                                        Өгсөн хариулт:{' '}
                                        <span className={ans.isCorrect ? 'text-green-300' : 'text-red-300'}>
                                          {ans.userAnswer || '⏰ Хугацаа дууссан'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-white/40 italic">Нарийвчилсан хариулт хадгалагдаагүй байна.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* GAMEPLAY VIEW */}
          {activeTab === 'game' && (
            <>
              {/* 1. GAME START MENU */}
              {selectedMode === 'menu' && (
                <div className="space-y-3.5 py-2 anim-fade">
                  <div className="text-center space-y-1.5 mb-3">
                    <span className="text-xs text-purple-400 font-mono uppercase tracking-widest">
                      🎯 ТОГЛООМЫН ГОРИМ СҮНГӨХ
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Кино & Аниме Эможи Таавар
                    </h3>
                    <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto">
                      Кино болон анимений эможи таавраас сонгон мэдлэгээ сориорой!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Movie Guesser Card */}
                    <div
                      onClick={() => handleStartMode('movie')}
                      className="group relative bg-gradient-to-r from-blue-950/60 via-indigo-900/40 to-black border border-blue-500/50 hover:border-blue-400 p-4 sm:p-5 btn-cut cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-900/30 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 font-mono uppercase tracking-wider btn-cut-sm">
                        КИНО АСУУЛТУУД
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-600/30 border border-blue-400/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-2xl select-none">🎬</span>
                        </div>
                        <div className="space-y-1 flex-1 pr-10">
                          <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-200">
                            Movie Guesser <span className="text-xs text-blue-300 font-normal font-mono">(Кино Таавар)</span>
                          </h4>
                          <p className="text-xs text-white/70 leading-relaxed">
                            Skins, Alice in Borderland, Kill Bill, Stranger Things, Black Swan, Girl Interrupted кино ба цувралууд
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-[10px] font-mono">
                            <span className="bg-blue-950/80 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded">
                              🇬🇧 Skins
                            </span>
                            <span className="bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded">
                              🃏 Alice in Borderland
                            </span>
                            <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded">
                              ⚔️ Kill Bill
                            </span>
                            <span className="bg-red-950/80 border border-red-500/40 text-red-300 px-2 py-0.5 rounded">
                              🧇 Stranger Things
                            </span>
                            <span className="bg-zinc-900 border border-zinc-500/40 text-zinc-300 px-2 py-0.5 rounded">
                              🖤 Black Swan
                            </span>
                            <span className="bg-pink-950/80 border border-pink-500/40 text-pink-300 px-2 py-0.5 rounded">
                              🏥 Girl Interrupted
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Anime Guesser Card */}
                    <div
                      onClick={() => handleStartMode('anime')}
                      className="group relative bg-gradient-to-r from-purple-950/60 via-pink-900/40 to-black border border-purple-500/50 hover:border-purple-400 p-4 sm:p-5 btn-cut cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-900/30 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white text-[10px] font-bold px-3 py-1 font-mono uppercase tracking-wider btn-cut-sm">
                        АНИМЕ АСУУЛТУУД
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-600/30 border border-purple-400/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-2xl select-none">🎌</span>
                        </div>
                        <div className="space-y-1 flex-1 pr-10">
                          <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-200">
                            Anime Character Guesser <span className="text-xs text-purple-300 font-normal font-mono">(Аниме Дүр Таах)</span>
                          </h4>
                          <p className="text-xs text-white/70 leading-relaxed">
                            Death Note (Light, L, Ryuk...), NANA (Osaki, Komatsu, Ren...), Kakegurui (Yumeko, Kirari...) цувралуудын дүрүүд
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-[10px] font-mono">
                            <span className="bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded">
                              📓 Death Note
                            </span>
                            <span className="bg-pink-950/80 border border-pink-500/40 text-pink-300 px-2 py-0.5 rounded">
                              🎤 NANA
                            </span>
                            <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded">
                              🃏 Kakegurui
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* All-in-One Card */}
                    <div
                      onClick={() => handleStartMode('all')}
                      className="group relative bg-gradient-to-r from-amber-950/40 via-yellow-900/30 to-black border border-amber-500/40 hover:border-amber-400 p-4 sm:p-5 btn-cut cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-600/30 border border-amber-400/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-yellow-300 fill-yellow-300 ml-0.5" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-200">
                            Бүх Горим Хосолсон <span className="text-xs text-yellow-300 font-normal font-mono">(All 40 Questions)</span>
                          </h4>
                          <p className="text-xs text-white/70 leading-relaxed">
                            Кино болон Аниме асуултуудыг бүгдийг нь хослуулан санамсаргүй байдлаар тоглож, Firestore рекорд тогтооно уу!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {highScore > 0 && (
                    <div className="p-3 bg-black/60 border border-yellow-500/30 btn-cut flex items-center justify-between text-xs text-yellow-300 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-yellow-400" /> Таны хамгийн дээд рекорд:
                      </span>
                      <span className="font-bold text-sm text-yellow-200">{highScore} ОНОО</span>
                    </div>
                  )}
                </div>
              )}

              {/* 2. GAMEPLAY STATE */}
              {selectedMode !== 'menu' && gameState === 'playing' && currentQ && (
                <div className="space-y-4 anim-fade">
                  {/* Question Box */}
                  <div className="bg-white/5 border border-white/15 p-4 sm:p-5 btn-cut text-center space-y-3 relative">
                    {/* Header bar of question card */}
                    <div className="flex items-center justify-between text-xs text-white/50 font-mono pb-2 border-b border-white/10">
                      <span>Асуулт #{currentIndex + 1} / {activeQuestions.length}</span>
                      <div className="flex items-center gap-2">
                        {currentQ.meta?.mode === 'hard' ? (
                          <span className="bg-red-950/80 border border-red-500/50 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            🔥 ХҮНД (30 ОНОО)
                          </span>
                        ) : (
                          <span className="bg-green-950/80 border border-green-500/50 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            ⚡ ХӨНГӨН (20 ОНОО)
                          </span>
                        )}

                        {currentQ.hint && (
                          <button
                            type="button"
                            onClick={() => setShowHint(!showHint)}
                            className="p-1 hover:bg-white/10 rounded text-yellow-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            title="Зөвлөмж харах"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{showHint ? 'Нуух' : 'Зөвлөмж'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Hint text if toggled */}
                    {showHint && currentQ.hint && (
                      <div className="p-2.5 bg-yellow-950/40 border border-yellow-500/30 text-yellow-200 text-xs rounded text-left anim-fade">
                        💡 <span className="font-semibold">Зөвлөмж:</span> {currentQ.hint}
                      </div>
                    )}

                    {isHeroMode || (currentQ.image && !imageFailed) ? (
                      /* HERO CHARACTER IMAGE DISPLAY */
                      <div className="my-2 py-3 bg-black/60 border border-purple-500/30 btn-cut flex flex-col items-center justify-center relative overflow-hidden min-h-[190px]">
                        {currentQ.anime && (
                          <div className="mb-2 px-3 py-1 bg-purple-950/80 border border-purple-400/40 text-purple-200 text-xs font-mono rounded-full tracking-wider uppercase">
                            Аниме: {currentQ.anime}
                          </div>
                        )}

                        {hasImage ? (
                          <div className="relative group p-1">
                            <img
                              src={currentQ.image}
                              alt="Anime Character"
                              referrerPolicy="no-referrer"
                              onError={() => setImageFailed(true)}
                              className="max-h-[220px] sm:max-h-[250px] w-auto object-contain mx-auto rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md"
                            />
                          </div>
                        ) : (
                          /* Fallback avatar card */
                          <div className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/30 border border-purple-400/30 rounded-xl text-center space-y-2 max-w-sm">
                            <div className="text-5xl my-2 select-none filter drop-shadow">
                              {currentQ.emojis || '🦸‍♂️'}
                            </div>
                            <p className="text-xs text-purple-200/80 font-mono">
                              Энэ ямар баатар вэ? Доорх 4 сонголтоос таана уу.
                            </p>
                          </div>
                        )}

                        {currentQ.emojis && (
                          <div className="mt-2 text-xl tracking-widest opacity-80">
                            {currentQ.emojis}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* EMOJI DISPLAY FOR EMOJI QUIZ MODE */
                      <div className="my-4 py-5 bg-black/50 border border-white/10 btn-cut">
                        <span className="text-4xl sm:text-5xl md:text-6xl tracking-widest select-none filter drop-shadow-md">
                          {currentQ.emojis}
                        </span>
                      </div>
                    )}

                    {/* Revealed Image After Answer */}
                    {isAnswered && hasImage && !isHeroMode && (
                      <div className="my-3 flex flex-col items-center justify-center anim-fade">
                        <div className="p-2 bg-black/80 border border-white/20 btn-cut max-w-full overflow-hidden">
                          <img
                            src={currentQ.image}
                            alt={currentQ.answer}
                            referrerPolicy="no-referrer"
                            onError={() => setImageFailed(true)}
                            className="max-h-[180px] w-auto object-contain mx-auto rounded"
                          />
                        </div>
                      </div>
                    )}

                    {/* Feedback Banner */}
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

                  {/* Options Choices Grid */}
                  <div className={`grid gap-3 ${options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {options.map((opt, idx) => {
                      const isThisSelected = selectedOption === opt;
                      const isThisCorrect = opt.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();

                      let btnStyle = "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40";

                      if (isAnswered) {
                        if (isThisCorrect) {
                          btnStyle = "bg-green-600 border-green-400 text-white font-bold ring-2 ring-green-400 shadow-lg shadow-green-900/50";
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
                          <span className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-black/50 border border-white/30 flex items-center justify-center text-xs font-mono shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-sm tracking-wide">{opt}</span>
                          </span>
                          {isAnswered && isThisCorrect && (
                            <span className="text-xs bg-black/60 px-2 py-0.5 rounded text-green-300 font-mono">Зөв</span>
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
                      className="w-full py-3.5 bg-white text-black font-bold text-sm uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-lg"
                    >
                      <span>{lives <= 0 ? 'Үр Дүн Харах' : 'Дараагийн Асуулт'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* 3. GAME OVER STATE */}
              {selectedMode !== 'menu' && gameState === 'game_over' && (
                <div className="space-y-6 text-center py-4 anim-fade">
                  <div className="bg-red-950/40 border border-red-500/40 p-6 btn-cut space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center text-red-400">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-red-400 tracking-wider">
                      ТОГЛООМ ДУУССАН!
                    </h3>
                    <p className="text-white/70 text-sm max-w-md mx-auto">
                      Таны амь дууслаа. Дахин азаа сорин тоглоод үзээрэй!
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

                    {/* Firestore Score Saving Card */}
                    <div className="bg-purple-950/40 border border-purple-500/40 p-4 btn-cut space-y-3 text-left">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                        <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                        <span>Firestore-д Оноогоо Хадгалах</span>
                      </div>
                      <p className="text-xs text-white/70">
                        Өөрийн нэрийг оруулан оноогоо Firestore "scores" цуглуулгад хадгалж, лидер самбарт бичигдээрэй!
                      </p>

                      {isScoreSaved ? (
                        <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-mono rounded flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                          <span>{saveSuccessMsg || 'Оноо амжилттай хадгалагдлаа!'}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Таны нэр (d.g. LuffyFan)"
                            maxLength={30}
                            className="flex-1 bg-black/80 border border-white/20 px-3 py-2 text-sm text-white rounded focus:outline-none focus:border-purple-400 font-mono"
                          />
                          <button
                            type="button"
                            disabled={!playerName.trim() || isSavingScore}
                            onClick={handleSaveScore}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider btn-cut flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                          >
                            {isSavingScore ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            <span>Оноо Хадгалах</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleStartMode(selectedMode as 'movie' | 'anime' | 'all')}
                        className="flex-1 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Дахин Тоглох</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('leaderboard')}
                        className="flex-1 py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-bold text-sm uppercase tracking-wider btn-cut hover:bg-yellow-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Жагсаалт Харах</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. COMPLETED STATE */}
              {selectedMode !== 'menu' && gameState === 'completed' && (
                <div className="space-y-6 text-center py-4 anim-fade">
                  <div className="bg-yellow-950/30 border border-yellow-500/40 p-6 btn-cut space-y-4">
                    <div className="w-16 h-16 mx-auto bg-yellow-500/20 border border-yellow-500/50 rounded-full flex items-center justify-center text-yellow-300">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-yellow-300 tracking-wider">
                      БАЯР ХҮРГЭЕ!
                    </h3>
                    <p className="text-white/80 text-sm max-w-md mx-auto">
                      Та анимийн таавруудыг амжилттай тааж дуусгалаа!
                    </p>

                    <div className="py-4 bg-black/60 border border-white/10 btn-cut space-y-1">
                      <span className="text-xs text-white/50 uppercase font-mono tracking-widest block">
                        Төгсгөлийн Оноо
                      </span>
                      <span className="text-4xl font-black text-yellow-300 font-mono">
                        {score}
                      </span>
                    </div>

                    {/* Firestore Score Saving Card */}
                    <div className="bg-purple-950/40 border border-purple-500/40 p-4 btn-cut space-y-3 text-left">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                        <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                        <span>Firestore-д Оноогоо Хадгалах</span>
                      </div>
                      <p className="text-xs text-white/70">
                        Өөрийн нэрийг оруулан оноогоо Firestore "scores" цуглуулгад хадгалж, лидер самбарт бичигдээрэй!
                      </p>

                      {isScoreSaved ? (
                        <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-mono rounded flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                          <span>{saveSuccessMsg || 'Оноо амжилттай хадгалагдлаа!'}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Таны нэр (d.g. LuffyFan)"
                            maxLength={30}
                            className="flex-1 bg-black/80 border border-white/20 px-3 py-2 text-sm text-white rounded focus:outline-none focus:border-purple-400 font-mono"
                          />
                          <button
                            type="button"
                            disabled={!playerName.trim() || isSavingScore}
                            onClick={handleSaveScore}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider btn-cut flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                          >
                            {isSavingScore ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            <span>Оноо Хадгалах</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleStartMode(selectedMode as 'movie' | 'anime' | 'all')}
                        className="flex-1 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider btn-cut hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Дахин Тоглох</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('leaderboard')}
                        className="flex-1 py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-bold text-sm uppercase tracking-wider btn-cut hover:bg-yellow-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Жагсаалт Харах</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-white/40 font-mono shrink-0">
          <span>🎮 Movie & Anime Guesser // Firestore Integrated</span>
          <span>Кино & Аниме Таавар</span>
        </div>
      </div>
    </div>
  );
};
