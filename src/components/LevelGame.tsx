import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Star,
  Play,
  Heart,
  Wand2,
} from 'lucide-react';
import { LevelDef, UserProgress, ChallengeItem } from '../game/types.ts';
import { checkAnswer, calculateStars, transformText } from '../game/logic.ts';
import {
  speakPortuguese,
  playPopSound,
  playSuccessSound,
  playSparkleSound,
  playGentleBoop,
  playFanfare,
} from '../utils/audio.ts';
import { LetterTraceCanvas } from './LetterTraceCanvas.tsx';
import { MagicBalloonsHangman } from './MagicBalloonsHangman.tsx';
import { MiniCrosswordGame } from './MiniCrosswordGame.tsx';

interface LevelGameProps {
  level: LevelDef;
  progress: UserProgress;
  onCompleteLevel: (levelId: number, stars: number) => void;
  onBackToMap: () => void;
  onNextLevel: () => void;
}

export const LevelGame: React.FC<LevelGameProps> = ({
  level,
  progress,
  onCompleteLevel,
  onBackToMap,
  onNextLevel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [levelFinished, setLevelFinished] = useState(false);
  const [levelStars, setLevelStars] = useState(3);
  const [accumulatedStars, setAccumulatedStars] = useState<number[]>([]);

  // State for Word & Sentence builders (ordered tokens)
  const [placedTokens, setPlacedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  const currentItem: ChallengeItem | undefined = level.items[currentIndex];
  const activeItemType = currentItem?.type || level.challengeType;

  // Initialize or reset tokens when moving to next item
  useEffect(() => {
    if (!currentItem) return;
    setAttempts(0);
    setHintsUsed(0);
    setShowHint(false);
    setFeedback('idle');

    const itemType = currentItem.type || level.challengeType;
    if (
      itemType === 'word_build_simple' ||
      itemType === 'word_build_complex' ||
      itemType === 'sentence_build'
    ) {
      const initial = [...currentItem.options];
      setAvailableTokens(initial);
      setPlacedTokens([]);
    } else {
      setAvailableTokens([]);
      setPlacedTokens([]);
    }

    // Auto-speak the prompt if sound enabled
    if (progress.soundEnabled) {
      speakPortuguese(currentItem.spokenPrompt, {
        rate: progress.slowSpeech ? 0.82 : 0.95,
      });
    }
  }, [currentIndex, currentItem, level.challengeType, progress.soundEnabled, progress.slowSpeech]);

  const speakPrompt = useCallback(() => {
    if (!currentItem) return;
    speakPortuguese(currentItem.spokenPrompt, {
      rate: progress.slowSpeech ? 0.82 : 0.95,
    });
  }, [currentItem, progress.slowSpeech]);

  const speakCustom = (text: string) => {
    speakPortuguese(text, { rate: progress.slowSpeech ? 0.82 : 0.95 });
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FBBF24', '#F472B6', '#60A5FA', '#34D399', '#A78BFA'],
      });
    } catch {
      // ignore
    }
  };

  // Handle direct option pick (for letter_identify, letter_trace_match, syllable_blend, syllable_identify, missing_letter, missing_syllable)
  const handlePickOption = (chosen: string) => {
    if (!currentItem || feedback === 'correct') return;
    playPopSound();

    const isCorrect = checkAnswer(currentItem.targetAnswer, chosen);
    if (isCorrect) {
      handleSuccess(chosen);
    } else {
      handleWrong();
    }
  };

  // Handle token selection for words & sentences
  const handleSelectToken = (token: string, tokenIndex: number) => {
    playPopSound();
    const newPlaced = [...placedTokens, token];
    const newAvailable = [...availableTokens];
    newAvailable.splice(tokenIndex, 1);

    setPlacedTokens(newPlaced);
    setAvailableTokens(newAvailable);

    // Speak the single chosen token aloud
    speakCustom(token);

    // Check if all tokens placed
    if (newAvailable.length === 0 && currentItem) {
      const assembled =
        activeItemType === 'sentence_build'
          ? newPlaced.join(' ')
          : newPlaced.join('');

      const isCorrect = checkAnswer(currentItem.targetAnswer, assembled);
      if (isCorrect) {
        handleSuccess(assembled);
      } else {
        handleWrong();
      }
    }
  };

  // Return placed token back to available
  const handleRemoveToken = (token: string, tokenIndex: number) => {
    playPopSound();
    const newPlaced = [...placedTokens];
    newPlaced.splice(tokenIndex, 1);
    setPlacedTokens(newPlaced);
    setAvailableTokens([...availableTokens, token]);
  };

  const handleWrong = () => {
    setAttempts((prev) => prev + 1);
    setFeedback('wrong');
    playGentleBoop();
    setTimeout(() => {
      setFeedback('idle');
    }, 1200);
  };

  const handleSuccess = (completedText: string) => {
    setFeedback('correct');
    playSuccessSound();
    triggerConfetti();

    // Compute stars for this question
    const itemStars = calculateStars(attempts + 1, hintsUsed);
    const newAcc = [...accumulatedStars, itemStars];
    setAccumulatedStars(newAcc);

    // Voice announcement of completed item
    setTimeout(() => {
      if (currentItem?.audioWord) {
        speakCustom(`Muito bem! ${currentItem.audioWord}`);
      } else {
        speakCustom(`Excelente! ${completedText}`);
      }
    }, 350);

    // Delay and go to next question or complete level
    setTimeout(() => {
      if (currentIndex + 1 < level.items.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Level complete!
        const avgStars = Math.max(
          1,
          Math.round(newAcc.reduce((a, b) => a + b, 0) / newAcc.length)
        );
        setLevelStars(avgStars);
        setLevelFinished(true);
        playFanfare();
        onCompleteLevel(level.id, avgStars);
      }
    }, 1700);
  };

  const handleShowHint = () => {
    playPopSound();
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
    if (currentItem?.helperHint) {
      speakCustom(`Dica mágica: ${currentItem.helperHint}`);
    }
  };

  // If level finished, show victory celebration card
  if (levelFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-amber-200 shadow-xl space-y-6 animate-scaleIn">
          {/* Confetti & Stars */}
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-200 via-rose-200 to-indigo-200 flex items-center justify-center shadow-md border-4 border-white">
              <Sparkles className="w-12 h-12 text-amber-600 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-['Fredoka']">
              Parabéns, Pequeno Mago!
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-['Nunito']">
              Você concluiu a <strong className="text-amber-800">Fase {level.id}: {level.title}</strong> com grande sabedoria!
            </p>
          </div>

          {/* Stars Earned */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  starIdx <= levelStars
                    ? 'bg-amber-100 border-amber-300 scale-110 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-40'
                }`}
              >
                <Star
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${
                    starIdx <= levelStars
                      ? 'text-amber-500 fill-amber-400 animate-bounce'
                      : 'text-slate-400'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-['Nunito']">
            <span>✨ Você ganhou <strong>{levelStars} Estrelas Mágicas</strong> e completou todas as atividades da fase!</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                playPopSound();
                setCurrentIndex(0);
                setLevelFinished(false);
                setAccumulatedStars([]);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl transition-all cursor-pointer font-['Fredoka']"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </button>

            <button
              onClick={() => {
                playPopSound();
                onBackToMap();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold px-5 py-3 rounded-2xl transition-all cursor-pointer font-['Fredoka']"
            >
              <span>Ver Mapa de Fases</span>
            </button>

            {level.id < 20 && (
              <button
                data-start="true"
                onClick={() => {
                  playPopSound();
                  onNextLevel();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer font-['Fredoka']"
              >
                <span>Próxima Fase ({level.id + 1})</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Top Header in Game: Back button, Phase title, Progress Bar */}
      <div className="flex items-center justify-between gap-3 bg-white/80 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => {
            playPopSound();
            onBackToMap();
          }}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer font-['Fredoka']"
          aria-label="Voltar para o mapa"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Fases</span>
        </button>

        {/* Phase title & counter */}
        <div className="text-center">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-['Fredoka']">
            Fase {level.id} de 20
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 font-['Fredoka'] truncate max-w-xs sm:max-w-md">
            {level.title}
          </h2>
        </div>

        {/* Step indicator */}
        <div className="text-xs sm:text-sm font-bold text-slate-600 font-['Fredoka'] tabular-nums bg-slate-100 px-3 py-1.5 rounded-xl">
          {currentIndex + 1} / {level.items.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
        <div
          className="bg-gradient-to-r from-amber-400 to-rose-400 h-full rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / level.items.length) * 100}%`,
          }}
        />
      </div>

      {/* Main Challenge Card */}
      <div
        className={`relative rounded-3xl p-6 sm:p-10 border-3 shadow-md transition-all ${level.pastelTheme.card} ${level.pastelTheme.border}`}
      >
        {/* Mascot & Prompt bubble */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
          {/* Audio Speaker + Mascot */}
          <button
            onClick={() => {
              playPopSound();
              speakPrompt();
            }}
            className="group relative cursor-pointer p-1 focus:outline-none"
            title="Ouvir a pergunta com voz mágica"
            aria-label="Ouvir pergunta"
          >
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-white border-2 border-amber-300 flex flex-col items-center justify-center shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
              <span className="text-3xl sm:text-4xl" role="img" aria-label="Mascote">
                {currentItem.imageEmoji || '⭐'}
              </span>
              <span className="text-[10px] font-bold text-amber-800 mt-0.5 flex items-center gap-0.5 font-['Fredoka']">
                <Volume2 className="w-3 h-3 text-amber-600" /> Ouvir
              </span>
            </div>
          </button>

          {/* Speech Bubble */}
          <div className="flex-1 bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 shadow-xs relative">
            <p className="text-base sm:text-xl font-bold text-slate-800 leading-snug font-['Fredoka']">
              {currentItem.prompt}
            </p>
            {currentItem.phonemeSound && (
              <p className="text-xs sm:text-sm text-amber-700 font-semibold mt-1 font-['Nunito']">
                Som: {currentItem.phonemeSound}
              </p>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SPECIFIC GAME MODE 1: Trace Letter (Cobrir a letra) */}
        {/* ======================================================== */}
        {activeItemType === 'trace_letter' && (
          <LetterTraceCanvas
            letter={currentItem.letterToTrace || currentItem.targetAnswer}
            wordClue={currentItem.audioWord}
            emoji={currentItem.imageEmoji}
            onSuccess={() => handleSuccess(currentItem.targetAnswer)}
            soundEnabled={progress.soundEnabled}
            slowSpeech={progress.slowSpeech}
          />
        )}

        {/* ======================================================== */}
        {/* SPECIFIC GAME MODE 2: Hangman / Balões Mágicos */}
        {/* ======================================================== */}
        {activeItemType === 'hangman_magic' && (
          <MagicBalloonsHangman
            secretWord={currentItem.secretWord || currentItem.targetAnswer}
            clue={currentItem.prompt}
            emoji={currentItem.imageEmoji}
            onSuccess={(word) => handleSuccess(word)}
            soundEnabled={progress.soundEnabled}
            slowSpeech={progress.slowSpeech}
            textCase={progress.textCase}
          />
        )}

        {/* ======================================================== */}
        {/* SPECIFIC GAME MODE 3: Mini Crossword (Cruzadinha) */}
        {/* ======================================================== */}
        {activeItemType === 'mini_crossword' && currentItem.crosswordData && (
          <MiniCrosswordGame
            data={currentItem.crosswordData}
            options={currentItem.options}
            onSuccess={(char) => handleSuccess(char)}
            soundEnabled={progress.soundEnabled}
            slowSpeech={progress.slowSpeech}
            textCase={progress.textCase}
          />
        )}

        {/* ======================================================== */}
        {/* SPECIFIC GAME MODE 4: Missing Letter / Missing Syllable */}
        {/* ======================================================== */}
        {(activeItemType === 'missing_letter' || activeItemType === 'missing_syllable') && (
          <div className="space-y-6 pt-2">
            {/* Visual Word with Gap Display */}
            <div className="bg-white/95 border-2 border-dashed border-amber-300 rounded-3xl p-5 sm:p-7 flex items-center justify-center gap-3 shadow-inner">
              <span className="text-3xl sm:text-5xl font-black text-amber-950 font-['Fredoka'] tracking-widest">
                {transformText(currentItem.wordDisplay || currentItem.targetAnswer, progress.textCase)}
              </span>
            </div>

            {/* Options grid */}
            <div className="space-y-2">
              <p className="text-center text-xs font-bold text-slate-600 uppercase tracking-wider font-['Fredoka']">
                Toque na opção certa para completar:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {currentItem.options.map((opt, idx) => {
                  const transformed = transformText(opt, progress.textCase);
                  return (
                    <button
                      key={`${opt}-${idx}`}
                      onClick={() => handlePickOption(opt)}
                      className="group relative bg-white hover:bg-amber-50 active:scale-95 border-3 border-slate-200 hover:border-amber-400 p-5 sm:p-7 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none"
                      aria-label={`Opção ${transformed}`}
                    >
                      <span className="text-3xl sm:text-5xl font-black text-slate-800 group-hover:text-amber-800 transition-colors font-['Fredoka']">
                        {transformed}
                      </span>
                      <span className="p-1 rounded-full text-slate-400 group-hover:text-amber-600 transition-all inline-flex items-center gap-1 text-[11px] font-bold">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="font-['Fredoka']">som</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SPECIFIC GAME MODE 5: Direct Option Pick (Letter / Syllable identify & Blend) */}
        {/* ======================================================== */}
        {(activeItemType === 'letter_identify' ||
          activeItemType === 'letter_trace_match' ||
          activeItemType === 'syllable_blend' ||
          activeItemType === 'syllable_identify' ||
          activeItemType === 'complex_blend') && (
          <div className="space-y-4">
            {/* If it's syllable blending, show the blend formula first (e.g., B + A = ?) */}
            {currentItem.phonemeSound?.includes('+') && (
              <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
                <div className="bg-white/90 border-2 border-indigo-200 px-4 py-2 rounded-2xl text-xl sm:text-2xl font-black text-indigo-900 font-['Fredoka'] shadow-xs">
                  {currentItem.phonemeSound.split('=')[0]?.trim()}
                </div>
                <Wand2 className="w-6 h-6 text-amber-500 animate-pulse" />
                <div className="bg-amber-100 border-2 border-amber-300 px-4 py-2 rounded-2xl text-xl sm:text-2xl font-black text-amber-900 font-['Fredoka'] shadow-xs">
                  ?
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              {currentItem.options.map((opt, idx) => {
                const transformed = transformText(opt, progress.textCase);
                return (
                  <button
                    key={`${opt}-${idx}`}
                    onClick={() => handlePickOption(opt)}
                    className="group relative bg-white hover:bg-amber-50 active:scale-95 border-3 border-slate-200 hover:border-amber-400 p-5 sm:p-7 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none"
                    aria-label={`Opção ${transformed}`}
                  >
                    <span className="text-3xl sm:text-5xl font-black text-slate-800 group-hover:text-amber-800 transition-colors font-['Fredoka']">
                      {transformed}
                    </span>
                    <span className="p-1 rounded-full text-slate-400 group-hover:text-amber-600 transition-all inline-flex items-center gap-1 text-[11px] font-bold">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="font-['Fredoka']">som</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SPECIFIC GAME MODE 6: Word & Sentence Builder */}
        {/* ======================================================== */}
        {(activeItemType === 'word_build_simple' ||
          activeItemType === 'word_build_complex' ||
          activeItemType === 'sentence_build') && (
          <div className="space-y-6 pt-2">
            {/* Visual Word / Sentence Target Display Area */}
            <div className="bg-white/90 border-2 border-dashed border-amber-300 rounded-3xl p-4 sm:p-6 min-h-[90px] flex flex-wrap items-center justify-center gap-2 sm:gap-3 shadow-inner">
              {placedTokens.length === 0 ? (
                <div className="text-slate-400 font-semibold text-sm sm:text-base flex items-center gap-2 font-['Nunito']">
                  <span>Toque nas partes abaixo na ordem certa!</span>
                </div>
              ) : (
                placedTokens.map((tok, idx) => (
                  <button
                    key={`${tok}-${idx}`}
                    onClick={() => handleRemoveToken(tok, idx)}
                    className="bg-amber-100 hover:bg-rose-100 border-2 border-amber-300 text-amber-950 font-black px-4 py-2 sm:px-5 sm:py-3 rounded-2xl text-lg sm:text-2xl shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer font-['Fredoka'] animate-scaleIn flex items-center gap-1"
                    title="Toque para remover"
                  >
                    <span>{transformText(tok, progress.textCase)}</span>
                    <span className="text-xs text-amber-700/60 ml-1">✕</span>
                  </button>
                ))
              )}
            </div>

            {/* Read Assembled button if tokens are placed */}
            {placedTokens.length > 0 && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const textToRead =
                      activeItemType === 'sentence_build'
                        ? placedTokens.join(' ')
                        : placedTokens.join('');
                    speakCustom(textToRead);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-white border border-amber-300 text-amber-900 px-3 py-1 rounded-full shadow-2xs hover:bg-amber-50 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ouvir o que você montou</span>
                </button>
              </div>
            )}

            {/* Available Parts / Chips to Pick */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2">
              {availableTokens.map((tok, idx) => (
                <button
                  key={`${tok}-${idx}`}
                  onClick={() => handleSelectToken(tok, idx)}
                  className="bg-white hover:bg-amber-50 active:scale-95 border-3 border-amber-300 hover:border-amber-400 text-slate-800 font-black px-5 py-3 sm:px-6 sm:py-4 rounded-3xl text-xl sm:text-3xl shadow-sm hover:shadow-md transition-all cursor-pointer font-['Fredoka']"
                  aria-label={`Escolher ${tok}`}
                >
                  {transformText(tok, progress.textCase)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Alert Overlay */}
        {feedback === 'correct' && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-bold flex items-center justify-center gap-2 animate-bounce font-['Fredoka']">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Muito bem! Você acertou! ✨</span>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-100 border-2 border-rose-300 text-rose-900 font-bold flex items-center justify-center gap-2 font-['Fredoka']">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-300" />
            <span>Quase lá! Ouça o som com carinho e tente de novo!</span>
          </div>
        )}

        {/* Hint Box (if activated) */}
        {showHint && currentItem.helperHint && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-['Nunito'] animate-fadeIn">
            <strong>Dica Mágica:</strong> {currentItem.helperHint}
          </div>
        )}

        {/* Footer controls: Hint button & Audio replay */}
        <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
          <button
            onClick={handleShowHint}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-800 hover:text-amber-900 bg-white/80 hover:bg-white border border-amber-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer font-['Fredoka']"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Dica Mágica</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              speakPrompt();
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer font-['Fredoka']"
          >
            <Play className="w-3.5 h-3.5 fill-slate-700" />
            <span>Repetir Áudio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
