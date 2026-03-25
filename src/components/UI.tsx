import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store';
import { Trophy, Timer, Target, Zap, RotateCcw, Play } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function UI() {
  const { 
    status, currentWord, typedChars, handleInput, 
    wpm, accuracy, timeLeft, streak, maxStreak,
    startGame, resetGame 
  } = useGameStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'racing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  const handleContainerClick = () => {
    if (status === 'racing' && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isError = !currentWord.startsWith(typedChars);

  const startRace = () => {
    startGame();
    // Focus the input immediately on user click to trigger keyboard
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none flex flex-col items-center p-6 z-10"
      onClick={handleContainerClick}
    >
      {/* Hidden Input Hack - Always in DOM for reliable mobile keyboard trigger */}
      <input
        ref={inputRef}
        type="text"
        value={typedChars}
        onChange={(e) => handleInput(e.target.value)}
        className="fixed top-0 left-0 opacity-0 pointer-events-none"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        style={{ fontSize: '16px' }} // Prevents mobile zoom
      />

      {/* Top Bar: Stats */}
      <div className="w-full max-w-2xl flex justify-between items-start pointer-events-auto mb-auto">
        <div className="flex gap-4">
          <StatBox icon={<Zap size={18} />} label="WPM" value={wpm} color="text-yellow-400" />
          <StatBox icon={<Target size={18} />} label="ACC" value={`${accuracy}%`} color="text-green-400" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatBox icon={<Timer size={18} />} label="TIME" value={Math.ceil(timeLeft)} color="text-blue-400" />
          <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Streak</span>
            <span className="text-sm font-mono font-bold text-orange-400">{streak}</span>
          </div>
        </div>
      </div>

      {/* Center/Bottom: Typing Area or Menu */}
      <div className={cn(
        "w-full flex flex-col items-center justify-center flex-1",
        status === 'racing' ? "justify-end pb-12" : "justify-center"
      )}>
        <AnimatePresence mode="wait">
          {status === 'racing' && (
            <motion.div 
              key="racing"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xl bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto relative overflow-hidden"
            >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-200" style={{ width: `${(typedChars.length / currentWord.length) * 100}%` }} />
            
            <div className="flex flex-col items-center gap-6">
              <div className="text-4xl font-mono tracking-widest flex flex-wrap justify-center">
                {currentWord.split('').map((char, i) => {
                  let color = "text-white/30";
                  if (i < typedChars.length) {
                    color = typedChars[i] === char ? "text-blue-400" : "text-red-500";
                  }
                  return (
                    <span key={i} className={cn(color, "transition-colors duration-100")}>
                      {char}
                    </span>
                  );
                })}
              </div>

              <div className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">
                {isError ? "Correct the error to continue" : "Type the word above"}
              </div>
            </div>

            {/* Hidden Input Hack moved to top level */}
          </motion.div>
        )}

        {status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/80 backdrop-blur-2xl p-12 rounded-[40px] border border-white/10 shadow-2xl pointer-events-auto flex flex-col items-center gap-8 text-center max-w-md"
          >
            <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)]">
              <Play size={40} className="text-white fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">TYPING RACER</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                Race against the ghost car by typing words as fast as you can. 
                Accuracy matters—errors will slow you down!
              </p>
            </div>
            <button 
              onClick={startRace}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-400 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              START RACE
              <Zap size={18} className="group-hover:fill-current" />
            </button>
          </motion.div>
        )}

        {status === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/80 backdrop-blur-2xl p-10 rounded-[40px] border border-white/10 shadow-2xl pointer-events-auto flex flex-col items-center gap-8 text-center max-w-md w-full"
          >
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)]">
              <Trophy size={32} className="text-white" />
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4">
              <ResultCard label="Final WPM" value={wpm} color="text-yellow-400" />
              <ResultCard label="Accuracy" value={`${accuracy}%`} color="text-green-400" />
              <ResultCard label="Max Streak" value={maxStreak} color="text-orange-400" />
              <ResultCard label="Correct Chars" value={useGameStore.getState().correctCharsCount} color="text-blue-400" />
            </div>

            <button 
              onClick={startRace}
              className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              RACE AGAIN
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={resetGame}
              className="text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Back to Menu
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Bottom Bar: Instructions */}
      <div className="w-full flex justify-center pb-4">
        <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
          Powered by React Three Fiber & Zustand
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
      <div className={cn("p-1.5 rounded-lg bg-white/5", color)}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{label}</span>
        <span className={cn("text-lg font-mono font-bold leading-none", color)}>{value}</span>
      </div>
    </div>
  );
}

function ResultCard({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{label}</span>
      <span className={cn("text-2xl font-mono font-black", color)}>{value}</span>
    </div>
  );
}
