import React, { useState } from 'react';
import { Sparkles, Heart, Volume2, HelpCircle } from 'lucide-react';
import { playPopSound, playSparkleSound, playGentleBoop, speakPortuguese } from '../utils/audio.ts';

interface MagicBalloonsHangmanProps {
  secretWord: string;
  clue: string;
  emoji?: string;
  onSuccess: (word: string) => void;
  soundEnabled: boolean;
  slowSpeech: boolean;
  textCase: 'UPPER' | 'lower';
}

const BALLOON_COLORS = [
  'bg-rose-400 border-rose-500 shadow-rose-200',
  'bg-amber-400 border-amber-500 shadow-amber-200',
  'bg-emerald-400 border-emerald-500 shadow-emerald-200',
  'bg-sky-400 border-sky-500 shadow-sky-200',
  'bg-purple-400 border-purple-500 shadow-purple-200',
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const MagicBalloonsHangman: React.FC<MagicBalloonsHangmanProps> = ({
  secretWord,
  clue,
  emoji,
  onSuccess,
  soundEnabled,
  slowSpeech,
  textCase,
}) => {
  const cleanSecret = secretWord.toUpperCase().trim();
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [remainingBalloons, setRemainingBalloons] = useState(5);
  const [finished, setFinished] = useState(false);

  // Check which letters are guessed
  const secretLetters = cleanSecret.split('');
  const isWordRevealed = secretLetters.every((char) => char === ' ' || guessedLetters.has(char));

  const handleGuess = (char: string) => {
    if (finished || guessedLetters.has(char)) return;
    playPopSound();

    const newSet = new Set(guessedLetters);
    newSet.add(char);
    setGuessedLetters(newSet);

    if (cleanSecret.includes(char)) {
      playSparkleSound();
      if (soundEnabled) {
        speakPortuguese(`Muito bem! Tem a letra ${char}!`, { rate: slowSpeech ? 0.82 : 0.95 });
      }

      // Check if this guess completed the word
      const completedNow = secretLetters.every((c) => c === ' ' || newSet.has(c));
      if (completedNow && !finished) {
        setFinished(true);
        setTimeout(() => {
          onSuccess(cleanSecret);
        }, 1200);
      }
    } else {
      playGentleBoop();
      const newBalloons = remainingBalloons - 1;
      setRemainingBalloons(newBalloons);

      if (soundEnabled) {
        speakPortuguese(`Não tem a letra ${char}. Tente outra letrinha!`, { rate: slowSpeech ? 0.82 : 0.95 });
      }

      if (newBalloons <= 0 && !finished) {
        // Soft fallback: reveal the remaining letters so child learns without frustration!
        setFinished(true);
        if (soundEnabled) {
          speakPortuguese(`A palavra mágica era ${cleanSecret}!`, { rate: slowSpeech ? 0.82 : 0.95 });
        }
        setTimeout(() => {
          onSuccess(cleanSecret);
        }, 1500);
      }
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Top Clue & Balloons Stage */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-sky-50 via-indigo-50 to-amber-50 p-6 rounded-3xl border-2 border-indigo-200 shadow-sm">
        {/* Clue and Prompt */}
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-900 text-xs font-bold font-['Fredoka']">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Jogo da Descoberta com Balões Mágicos!</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-800 font-['Fredoka']">
            {clue}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-3xl">{emoji || '🎁'}</span>
            <span className="text-xs text-slate-500 font-semibold font-['Nunito']">
              Descubra as letras antes dos 5 balões estourarem!
            </span>
          </div>
        </div>

        {/* Floating Mascot with Balloons */}
        <div className="flex flex-col items-center">
          {/* Balloons Row */}
          <div className="flex items-center gap-1.5 mb-2">
            {BALLOON_COLORS.map((balloonClass, idx) => {
              const active = idx < remainingBalloons;
              return (
                <div
                  key={idx}
                  className={`w-7 h-9 rounded-full border-2 transition-all duration-300 transform ${
                    active
                      ? `${balloonClass} scale-100 shadow-sm animate-pulse`
                      : 'bg-slate-200 border-slate-300 scale-75 opacity-30'
                  }`}
                  style={{
                    borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                  }}
                  title={active ? 'Balão Encantado' : 'Balão estourado'}
                />
              );
            })}
          </div>

          {/* Mascot in Basket */}
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-indigo-300 flex items-center justify-center shadow-md animate-bounce duration-1000">
            <span className="text-3xl" role="img" aria-label="Mascote">
              {remainingBalloons > 1 ? '⭐' : '🌟'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-indigo-900 mt-1 font-['Fredoka']">
            {remainingBalloons} {remainingBalloons === 1 ? 'balão restante' : 'balões restantes'}
          </span>
        </div>
      </div>

      {/* Secret Word Slots */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4">
        {secretLetters.map((char, idx) => {
          if (char === ' ') {
            return <div key={idx} className="w-6" />;
          }
          const revealed = guessedLetters.has(char) || finished;
          return (
            <div
              key={idx}
              className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-4xl font-black font-['Fredoka'] transition-all shadow-xs ${
                revealed
                  ? 'bg-amber-100 border-amber-400 text-amber-950 scale-105 animate-scaleIn'
                  : 'bg-white border-dashed border-slate-300 text-transparent'
              }`}
            >
              {revealed ? (textCase === 'UPPER' ? char : char.toLowerCase()) : '_'}
            </div>
          );
        })}
      </div>

      {/* Keyboard Grid of Letters */}
      <div className="bg-white/90 p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-1.5 sm:gap-2">
          {ALPHABET.map((letter) => {
            const used = guessedLetters.has(letter);
            const isCorrect = cleanSecret.includes(letter);
            const displayLetter = textCase === 'UPPER' ? letter : letter.toLowerCase();

            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={used || finished}
                className={`py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-lg border transition-all cursor-pointer font-['Fredoka'] ${
                  used
                    ? isCorrect
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-60 cursor-not-allowed'
                      : 'bg-slate-100 border-slate-200 text-slate-400 opacity-40 cursor-not-allowed'
                    : 'bg-white hover:bg-amber-50 active:scale-95 border-slate-200 hover:border-amber-300 text-slate-800 shadow-2xs'
                }`}
                aria-label={`Letra ${letter}`}
              >
                {displayLetter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
