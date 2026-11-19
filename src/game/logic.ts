import { LEVELS, CATEGORY_INFO } from './literacyData.ts';
import type { LevelDef, UserProgress, LevelCategory, ChallengeItem } from './types.ts';

export const TOTAL_LEVELS = 20;

export function getLevel(id: number): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getAllLevels(): LevelDef[] {
  return LEVELS;
}

export function normalizeText(text: string): string {
  return text
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export function checkAnswer(expected: string, given: string): boolean {
  if (!expected || !given) return false;
  // Compare trimmed uppercase
  const cleanExp = expected.trim().toUpperCase();
  const cleanGiven = given.trim().toUpperCase();
  return cleanExp === cleanGiven;
}

export function calculateStars(attempts: number, hintsUsed: number): number {
  if (attempts <= 1 && hintsUsed === 0) return 3;
  if (attempts <= 2 && hintsUsed <= 1) return 2;
  return 1;
}

export function transformText(text: string, textCase: 'UPPER' | 'lower'): string {
  if (!text) return '';
  return textCase === 'UPPER' ? text.toUpperCase() : text.toLowerCase();
}

export function isLevelUnlocked(levelId: number, progress: UserProgress): boolean {
  if (levelId === 1) return true;
  return levelId <= progress.unlockedLevel;
}

export function getCategoryLevels(category: LevelCategory): LevelDef[] {
  return LEVELS.filter((l) => l.category === category);
}

export function getInitialProgress(): UserProgress {
  return {
    unlockedLevel: 1,
    completedLevels: {},
    stickers: ['estrela_iniciante'],
    playerName: 'Pequeno Aprendiz',
    soundEnabled: true,
    slowSpeech: true,
    textCase: 'UPPER',
  };
}

export function calculateTotalStars(progress: UserProgress): number {
  let total = 0;
  for (const lvlId in progress.completedLevels) {
    total += progress.completedLevels[lvlId]?.stars || 0;
  }
  return total;
}

export function getCategoryBadge(category: LevelCategory): {
  title: string;
  badge: string;
  description: string;
  color: string;
  icon: string;
} {
  return CATEGORY_INFO[category];
}
