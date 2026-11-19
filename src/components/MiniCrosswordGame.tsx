import React, { useState } from 'react';
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { CrosswordData } from '../game/types.ts';
import { playPopSound, playSparkleSound, playGentleBoop, speakPortuguese } from '../utils/audio.ts';

interface MiniCrosswordGameProps {
  data: CrosswordData;
  options: string[];
  onSuccess: (char: string) => void;
  soundEnabled: boolean;
  slowSpeech: boolean;
  textCase: 'UPPER' | 'lower';
}

export const MiniCrosswordGame: React.FC<MiniCrosswordGameProps> = ({
  data,
  options,
  onSuccess,
  soundEnabled,
  slowSpeech,
  textCase,
}) => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const shared = data.sharedChar.toUpperCase();

  const handlePick = (char: string) => {
    playPopSound();
    const isCorrect = char.toUpperCase() === shared;

    if (isCorrect) {
      setSelectedChar(char);
      setIsSuccess(true);
      playSparkleSound();
      if (soundEnabled) {
        speakPortuguese(
          `Excelente! A letra ${char} completa ${data.horizontal.word} e ${data.vertical.word}!`,
          { rate: slowSpeech ? 0.82 : 0.95 }
        );
      }
      setTimeout(() => {
        onSuccess(char);
      }, 1500);
    } else {
      playGentleBoop();
      if (soundEnabled) {
        speakPortuguese(`Tente outra letrinha para encaixar nas duas palavras!`, {
          rate: slowSpeech ? 0.82 : 0.95,
        });
      }
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Clues presentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Horizontal Clue */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{data.horizontal.emoji}</span>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider font-['Fredoka']">
                1. Horizontal ➡️
              </span>
              <p className="text-sm font-bold text-slate-800 font-['Fredoka']">
                {data.horizontal.hint}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              speakPortuguese(
                `Dica horizontal: ${data.horizontal.hint}. Palavra: ${data.horizontal.word}`,
                { rate: slowSpeech ? 0.82 : 0.95 }
              )
            }
            className="p-2 rounded-full bg-white hover:bg-amber-100 text-amber-800 shadow-2xs transition-all"
            title="Ouvir dica horizontal"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Vertical Clue */}
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{data.vertical.emoji}</span>
            <div>
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider font-['Fredoka']">
                2. Vertical ⬇️
              </span>
              <p className="text-sm font-bold text-slate-800 font-['Fredoka']">
                {data.vertical.hint}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              speakPortuguese(
                `Dica vertical: ${data.vertical.hint}. Palavra: ${data.vertical.word}`,
                { rate: slowSpeech ? 0.82 : 0.95 }
              )
            }
            className="p-2 rounded-full bg-white hover:bg-sky-100 text-sky-800 shadow-2xs transition-all"
            title="Ouvir dica vertical"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Crossword Grid Stage */}
      <div className="bg-gradient-to-tr from-amber-50 via-rose-50 to-indigo-50 border-2 border-amber-200 rounded-3xl p-6 flex flex-col items-center justify-center shadow-inner">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-900 text-xs font-bold font-['Fredoka'] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Qual letra mágica completa as duas palavras?</span>
        </div>

        {/* Crossword Visual Display */}
        <div className="relative p-4 bg-white/95 rounded-2xl border-2 border-amber-300 shadow-md flex flex-col items-center">
          {/* Vertical word letters before intersection */}
          <div className="flex flex-col items-center gap-1.5">
            {data.vertical.word
              .toUpperCase()
              .slice(0, data.vertical.missingIndex)
              .split('')
              .map((c, i) => (
                <div
                  key={`vert-pre-${i}`}
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-xl sm:text-2xl font-black text-sky-950 font-['Fredoka']"
                >
                  {textCase === 'UPPER' ? c : c.toLowerCase()}
                </div>
              ))}

            {/* Horizontal Row with shared letter */}
            <div className="flex items-center gap-1.5 py-1">
              {data.horizontal.word
                .toUpperCase()
                .split('')
                .map((c, i) => {
                  const isIntersection = i === data.horizontal.missingIndex;
                  if (isIntersection) {
                    return (
                      <div
                        key="intersection"
                        className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-3xl font-black font-['Fredoka'] shadow-md transition-all ${
                          isSuccess
                            ? 'bg-emerald-200 border-emerald-500 text-emerald-950 animate-bounce'
                            : 'bg-amber-200 border-amber-400 text-amber-900 animate-pulse'
                        }`}
                      >
                        {selectedChar
                          ? textCase === 'UPPER'
                            ? selectedChar
                            : selectedChar.toLowerCase()
                          : '?'}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`horiz-${i}`}
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-xl sm:text-2xl font-black text-amber-950 font-['Fredoka']"
                    >
                      {textCase === 'UPPER' ? c : c.toLowerCase()}
                    </div>
                  );
                })}
            </div>

            {/* Vertical word letters after intersection */}
            {data.vertical.word
              .toUpperCase()
              .slice(data.vertical.missingIndex + 1)
              .split('')
              .map((c, i) => (
                <div
                  key={`vert-post-${i}`}
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-xl sm:text-2xl font-black text-sky-950 font-['Fredoka']"
                >
                  {textCase === 'UPPER' ? c : c.toLowerCase()}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Choice Options for the child */}
      <div className="space-y-2">
        <p className="text-center text-xs font-bold text-slate-600 uppercase tracking-wider font-['Fredoka']">
          Toque na letra que encaixa no meio:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handlePick(opt)}
              disabled={isSuccess}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white hover:bg-amber-50 active:scale-95 border-3 border-amber-300 hover:border-amber-400 text-slate-800 font-black text-2xl sm:text-4xl shadow-sm hover:shadow-md transition-all cursor-pointer font-['Fredoka'] flex items-center justify-center"
            >
              {textCase === 'UPPER' ? opt : opt.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
