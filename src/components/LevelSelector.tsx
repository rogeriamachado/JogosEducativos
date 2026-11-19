import React from 'react';
import { Star, Lock, Play, Sparkles, CheckCircle2, Wand2, Award, BookOpen } from 'lucide-react';
import { UserProgress, LevelCategory } from '../game/types.ts';
import { LEVELS, CATEGORY_INFO } from '../game/literacyData.ts';
import { isLevelUnlocked } from '../game/logic.ts';
import { playPopSound, speakPortuguese } from '../utils/audio.ts';

interface LevelSelectorProps {
  progress: UserProgress;
  onSelectLevel: (levelId: number) => void;
  onOpenDiploma: () => void;
  onOpenLab: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  progress,
  onSelectLevel,
  onOpenDiploma,
  onOpenLab,
}) => {
  const categories: LevelCategory[] = [
    'letters_sounds',
    'simple_syllables',
    'complex_syllables',
    'simple_words',
    'complex_words',
    'short_sentences',
  ];

  const handleStartPlay = () => {
    playPopSound();
    // Start at current unlocked level (or 1)
    const nextLvl = Math.min(progress.unlockedLevel, 20);
    onSelectLevel(nextLvl);
  };

  const handlePlayVoice = (text: string) => {
    if (progress.soundEnabled) {
      speakPortuguese(text);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-8 sm:space-y-12">
      {/* Welcoming Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-100 via-rose-100 to-indigo-100 p-6 sm:p-8 border-2 border-amber-200/60 shadow-sm">
        {/* Decorative background shapes */}
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full bg-rose-200/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-indigo-200/40 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Jornada Educativa para 5 a 7 anos</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight font-['Fredoka']">
              Bem-vindo à Alfabetização Mágica!
            </h1>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-['Nunito']">
              Descubra os segredos das letras, o som mágico de cada sílaba e aprenda a ler palavras e formar frases com muita alegria e cores suaves!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                data-start="true"
                onClick={handleStartPlay}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-base sm:text-lg font-['Fredoka']"
                aria-label="Continuar ou começar jogo"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>
                  {progress.unlockedLevel > 1
                    ? `Continuar na Fase ${Math.min(progress.unlockedLevel, 20)}`
                    : 'Começar a Aventura Mágica!'}
                </span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  onOpenLab();
                }}
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white border-2 border-purple-200 text-purple-800 font-semibold px-4 py-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer text-sm sm:text-base font-['Fredoka']"
              >
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span>Laboratório de Letras</span>
              </button>
            </div>
          </div>

          {/* Cheerful Mascot Illustration */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group cursor-pointer" onClick={() => handlePlayVoice('Olá, amiguinho! Eu sou a Estrelinha Mágica. Vamos aprender a ler juntos?')}>
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-yellow-200 via-amber-200 to-rose-200 flex items-center justify-center shadow-md border-4 border-white animate-bounce duration-1000">
                <span className="text-5xl sm:text-6xl select-none" role="img" aria-label="Mascote Estrelinha">⭐</span>
              </div>
              <div className="absolute -bottom-2 bg-white text-amber-900 border border-amber-200 px-3 py-0.5 rounded-full text-xs font-bold shadow-xs whitespace-nowrap">
                Estrelinha Zizi 💬
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 20 Levels Map by Categories */}
      <div className="space-y-10">
        {categories.map((categoryKey) => {
          const categoryInfo = CATEGORY_INFO[categoryKey];
          const categoryLevels = LEVELS.filter((l) => l.category === categoryKey);

          return (
            <section
              key={categoryKey}
              className="bg-white/70 rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs transition-all hover:bg-white"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {categoryInfo.badge}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-['Fredoka']">
                      {categoryInfo.title}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-['Nunito']">
                    {categoryInfo.description}
                  </p>
                </div>
              </div>

              {/* Grid of Level Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                {categoryLevels.map((level) => {
                  const unlocked = isLevelUnlocked(level.id, progress);
                  const completion = progress.completedLevels[level.id];
                  const starsEarned = completion?.stars || 0;

                  return (
                    <button
                      key={level.id}
                      onClick={() => {
                        if (unlocked) {
                          playPopSound();
                          onSelectLevel(level.id);
                        }
                      }}
                      disabled={!unlocked}
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        unlocked
                          ? `${level.pastelTheme.card} ${level.pastelTheme.border} hover:shadow-md hover:-translate-y-1 cursor-pointer active:scale-98`
                          : 'bg-slate-50/70 border-slate-200/70 opacity-60 cursor-not-allowed'
                      }`}
                      aria-label={`Fase ${level.id}: ${level.title}. ${unlocked ? 'Desbloqueada' : 'Bloqueada'}`}
                    >
                      {/* Top badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            unlocked ? `${level.pastelTheme.badgeBg} ${level.pastelTheme.badgeText}` : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          Fase {level.id}
                        </span>

                        {unlocked ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starIdx <= starsEarned
                                    ? 'text-amber-500 fill-amber-400'
                                    : 'text-slate-300 fill-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 my-1">
                        <h3 className={`font-bold text-sm sm:text-base leading-tight font-['Fredoka'] ${unlocked ? level.pastelTheme.text : 'text-slate-600'}`}>
                          {level.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 font-['Nunito']">
                          {level.subtitle}
                        </p>
                      </div>

                      {/* Bottom action indicator */}
                      <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                        {unlocked ? (
                          <span className="font-semibold text-amber-900/80 inline-flex items-center gap-1">
                            {starsEarned > 0 ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Concluída! Jogar</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                                <span>Jogar agora</span>
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-500">Conclua a fase anterior</span>
                        )}
                        <span className="text-slate-400 text-[10px] font-mono">
                          {level.items.length} desafios
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Graduation Banner & Diploma Access */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200 p-6 sm:p-8 text-center space-y-3 border-2 border-white shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center shadow-inner">
          <Award className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-['Fredoka']">
          Diploma Mágico de Alfabetização
        </h3>
        <p className="text-sm text-slate-700 max-w-lg mx-auto font-['Nunito']">
          Ao completar as 20 fases, você recebe o Grande Diploma Mágico com seu nome para imprimir e guardar com orgulho!
        </p>
        <button
          onClick={() => {
            playPopSound();
            onOpenDiploma();
          }}
          className="inline-flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-900 font-bold px-6 py-2.5 rounded-2xl shadow-xs border border-amber-200 hover:shadow-md transition-all cursor-pointer font-['Fredoka']"
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Ver Meu Diploma &amp; Conquistas</span>
        </button>
      </div>
    </div>
  );
};
