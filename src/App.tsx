import React, { useState, useEffect } from 'react';
import { UserProgress } from './game/types.ts';
import { getInitialProgress, getLevel } from './game/logic.ts';
import { HeaderNav } from './components/HeaderNav.tsx';
import { LevelSelector } from './components/LevelSelector.tsx';
import { LevelGame } from './components/LevelGame.tsx';
import { DiplomaModal } from './components/DiplomaModal.tsx';
import { FreeAlphabetLab } from './components/FreeAlphabetLab.tsx';

const STORAGE_KEY = 'alfabetizacao_magica_progress_v1';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // ignore
      }
    }
    return getInitialProgress();
  });

  const [currentScreen, setCurrentScreen] = useState<'map' | 'game' | 'diploma' | 'lab'>('map');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [showDiploma, setShowDiploma] = useState(false);

  // Sync state to body dataset state for ultra-mode and accessibility
  useEffect(() => {
    if (currentScreen === 'game') {
      document.body.dataset.state = 'playing';
    } else {
      document.body.dataset.state = 'title';
    }
  }, [currentScreen]);

  // Support ?autostart=1 query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1' || urlParams.get('autostart') === 'true') {
        const targetLvl = Number(urlParams.get('level')) || 1;
        setActiveLevelId(Math.min(Math.max(1, targetLvl), 20));
        setCurrentScreen('game');
        document.body.dataset.state = 'playing';
      }
    }
  }, []);

  // Save progress changes to localStorage
  const saveProgress = (newProg: UserProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg));
    } catch {
      // ignore
    }
  };

  const handleSelectLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setCurrentScreen('game');
  };

  const handleCompleteLevel = (levelId: number, stars: number) => {
    const existing = progress.completedLevels[levelId];
    const prevStars = existing?.stars || 0;
    const bestStars = Math.max(prevStars, stars);

    const newCompleted = {
      ...progress.completedLevels,
      [levelId]: {
        stars: bestStars,
        highStreak: (existing?.highStreak || 0) + 1,
      },
    };

    const nextUnlock = Math.min(20, Math.max(progress.unlockedLevel, levelId + 1));

    const updated: UserProgress = {
      ...progress,
      unlockedLevel: nextUnlock,
      completedLevels: newCompleted,
    };

    saveProgress(updated);
  };

  const handleNextLevel = () => {
    if (activeLevelId < 20) {
      setActiveLevelId((prev) => prev + 1);
      setCurrentScreen('game');
    } else {
      setShowDiploma(true);
      setCurrentScreen('map');
    }
  };

  const handleToggleSound = () => {
    saveProgress({
      ...progress,
      soundEnabled: !progress.soundEnabled,
    });
  };

  const handleToggleCase = () => {
    saveProgress({
      ...progress,
      textCase: progress.textCase === 'UPPER' ? 'lower' : 'UPPER',
    });
  };

  const handleUpdatePlayerName = (name: string) => {
    saveProgress({
      ...progress,
      playerName: name,
    });
  };

  const activeLevel = getLevel(activeLevelId);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col font-['Fredoka',sans-serif]">
      {/* Navigation Header */}
      <HeaderNav
        progress={progress}
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          if (screen === 'diploma') {
            setShowDiploma(true);
          } else {
            setCurrentScreen(screen);
          }
        }}
        onToggleSound={handleToggleSound}
        onToggleCase={handleToggleCase}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {currentScreen === 'map' && (
          <LevelSelector
            progress={progress}
            onSelectLevel={handleSelectLevel}
            onOpenDiploma={() => setShowDiploma(true)}
            onOpenLab={() => setCurrentScreen('lab')}
          />
        )}

        {currentScreen === 'game' && activeLevel && (
          <LevelGame
            level={activeLevel}
            progress={progress}
            onCompleteLevel={handleCompleteLevel}
            onBackToMap={() => setCurrentScreen('map')}
            onNextLevel={handleNextLevel}
          />
        )}

        {currentScreen === 'lab' && (
          <FreeAlphabetLab
            progress={progress}
            onBackToMap={() => setCurrentScreen('map')}
          />
        )}
      </main>

      {/* Diploma Modal */}
      {showDiploma && (
        <DiplomaModal
          progress={progress}
          onUpdatePlayerName={handleUpdatePlayerName}
          onClose={() => setShowDiploma(false)}
        />
      )}

      {/* Soft Footer */}
      <footer className="border-t border-amber-100 bg-white/60 py-4 text-center text-xs text-slate-500 font-['Nunito']">
        <p>
          🪄 <strong>Alfabetização Mágica</strong> · Desenvolvido para crianças de 5 a 7 anos · Método Fônico e Silábico da Língua Portuguesa
        </p>
      </footer>
    </div>
  );
}
