import React from 'react';
import { Sparkles, Star, Volume2, VolumeX, Type, Award, Map, Wand2 } from 'lucide-react';
import { UserProgress } from '../game/types.ts';
import { calculateTotalStars } from '../game/logic.ts';
import { playPopSound } from '../utils/audio.ts';

interface HeaderNavProps {
  progress: UserProgress;
  currentScreen: 'map' | 'game' | 'diploma' | 'lab';
  onNavigate: (screen: 'map' | 'game' | 'diploma' | 'lab') => void;
  onToggleSound: () => void;
  onToggleCase: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  progress,
  currentScreen,
  onNavigate,
  onToggleSound,
  onToggleCase,
}) => {
  const totalStars = calculateTotalStars(progress);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF7]/90 backdrop-blur-md border-b-2 border-amber-100/80 px-3 sm:px-6 py-2.5 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and title */}
        <button
          onClick={() => {
            playPopSound();
            onNavigate('map');
          }}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none rounded-2xl p-1"
          aria-label="Ir para o mapa de fases"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-200 via-rose-200 to-indigo-200 flex items-center justify-center shadow-inner border border-white group-hover:scale-105 transition-transform">
            <span className="text-xl sm:text-2xl" role="img" aria-label="Varinha mágica">🪄</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight font-['Fredoka']">
                Alfabetização Mágica
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse hidden sm:inline" />
            </div>
            <p className="text-[11px] sm:text-xs text-amber-800/80 font-medium">
              Aprenda letras, sílabas e frases brincando!
            </p>
          </div>
        </button>

        {/* Action badges & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Total Stars Counter */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 bg-amber-50 border border-amber-200/80 rounded-full px-2.5 sm:px-3 py-1 shadow-xs"
            title="Total de Estrelas Mágicas conquistadas"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-sm sm:text-base font-bold text-amber-900 font-['Fredoka'] tabular-nums">
              {totalStars}
            </span>
          </div>

          {/* Text Case Toggle (CAIXA ALTA / minúscula) */}
          <button
            onClick={() => {
              playPopSound();
              onToggleCase();
            }}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
              progress.textCase === 'UPPER'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
            title={`Modo de Letras: ${progress.textCase === 'UPPER' ? 'MAIÚSCULAS' : 'minúsculas'}`}
            aria-label="Alternar entre maiúsculas e minúsculas"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="font-['Fredoka']">{progress.textCase === 'UPPER' ? 'ABC' : 'abc'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              playPopSound();
              onToggleSound();
            }}
            className={`p-1.5 sm:p-2 rounded-full border transition-all ${
              progress.soundEnabled
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
            }`}
            title={progress.soundEnabled ? 'Som ativado' : 'Som desativado'}
            aria-label={progress.soundEnabled ? 'Desativar som' : 'Ativar som'}
          >
            {progress.soundEnabled ? <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
          </button>

          {/* Navigation to Lab */}
          <button
            onClick={() => {
              playPopSound();
              onNavigate(currentScreen === 'lab' ? 'map' : 'lab');
            }}
            className={`p-1.5 sm:p-2 rounded-full border transition-all ${
              currentScreen === 'lab'
                ? 'bg-purple-200 border-purple-300 text-purple-900 shadow-inner'
                : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
            }`}
            title="Laboratório Mágico das Letras e Sílabas"
            aria-label="Abrir laboratório de letras livres"
          >
            <Wand2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Navigation to Diploma */}
          <button
            onClick={() => {
              playPopSound();
              onNavigate(currentScreen === 'diploma' ? 'map' : 'diploma');
            }}
            className={`p-1.5 sm:p-2 rounded-full border transition-all ${
              currentScreen === 'diploma'
                ? 'bg-amber-200 border-amber-300 text-amber-900 shadow-inner'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
            title="Ver Diploma e Conquistas Mágicas"
            aria-label="Abrir diploma e conquistas"
          >
            <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Map button if in game */}
          {currentScreen !== 'map' && (
            <button
              onClick={() => {
                playPopSound();
                onNavigate('map');
              }}
              className="flex items-center gap-1 bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-800 text-xs sm:text-sm font-semibold rounded-full px-2.5 sm:px-3 py-1 transition-all"
              aria-label="Voltar para o mapa de fases"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mapa</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
