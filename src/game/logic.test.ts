import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TOTAL_LEVELS,
  getLevel,
  getAllLevels,
  checkAnswer,
  calculateStars,
  transformText,
  isLevelUnlocked,
  getCategoryLevels,
  getInitialProgress,
  calculateTotalStars,
} from './logic.ts';

test('Level verification: exactly 20 levels exist with specified breakdown', () => {
  const levels = getAllLevels();
  assert.equal(levels.length, TOTAL_LEVELS, 'Must have exactly 20 levels');

  // Breakdown checks:
  // 4 fases para reconhecimento de letras e sons
  const lettersLevels = getCategoryLevels('letters_sounds');
  assert.equal(lettersLevels.length, 4, 'Must have 4 letter/sound levels (1 to 4)');
  assert.deepEqual(lettersLevels.map((l) => l.id), [1, 2, 3, 4]);

  // 4 fases para formação de sílabas simples
  const simpleSyllablesLevels = getCategoryLevels('simple_syllables');
  assert.equal(simpleSyllablesLevels.length, 4, 'Must have 4 simple syllable levels (5 to 8)');
  assert.deepEqual(simpleSyllablesLevels.map((l) => l.id), [5, 6, 7, 8]);

  // 3 fases para formação de sílabas complexas
  const complexSyllablesLevels = getCategoryLevels('complex_syllables');
  assert.equal(complexSyllablesLevels.length, 3, 'Must have 3 complex syllable levels (9 to 11)');
  assert.deepEqual(complexSyllablesLevels.map((l) => l.id), [9, 10, 11]);

  // 4 fases para formação de palavras com sílabas simples
  const simpleWordsLevels = getCategoryLevels('simple_words');
  assert.equal(simpleWordsLevels.length, 4, 'Must have 4 simple word levels (12 to 15)');
  assert.deepEqual(simpleWordsLevels.map((l) => l.id), [12, 13, 14, 15]);

  // 3 fases para formação de palavras com sílaba complexa
  const complexWordsLevels = getCategoryLevels('complex_words');
  assert.equal(complexWordsLevels.length, 3, 'Must have 3 complex word levels (16 to 18)');
  assert.deepEqual(complexWordsLevels.map((l) => l.id), [16, 17, 18]);

  // 2 fases para formação de frases curtas
  const sentenceLevels = getCategoryLevels('short_sentences');
  assert.equal(sentenceLevels.length, 2, 'Must have 2 sentence levels (19 to 20)');
  assert.deepEqual(sentenceLevels.map((l) => l.id), [19, 20]);
});

test('Every level has valid items, options, spoken prompts, and pastel themes', () => {
  for (let i = 1; i <= 20; i++) {
    const lvl = getLevel(i);
    assert.ok(lvl, `Level ${i} should be defined`);
    assert.ok(lvl.items.length >= 5, `Level ${i} should have increased activities (at least 5 items)`);
    assert.ok(lvl.pastelTheme.bg.startsWith('bg-'), `Level ${i} theme bg should be Tailwind class`);
    for (const item of lvl.items) {
      assert.ok(item.prompt, `Prompt required for item ${item.id}`);
      assert.ok(item.spokenPrompt, `Spoken prompt required for item ${item.id}`);
      assert.ok(item.targetAnswer, `Target answer required for item ${item.id}`);
      if (item.type !== 'trace_letter') {
        assert.ok(item.options.length >= 2, `Options required for item ${item.id}`);
      }
    }
  }
});

test('New mechanics are present: trace_letter, hangman_magic, mini_crossword, missing_letter, missing_syllable', () => {
  const allLevels = getAllLevels();
  const allItems = allLevels.flatMap((l) => l.items);
  
  const hasTrace = allItems.some((it) => it.type === 'trace_letter');
  assert.equal(hasTrace, true, 'trace_letter must be present');

  const hasHangman = allItems.some((it) => it.type === 'hangman_magic');
  assert.equal(hasHangman, true, 'hangman_magic must be present');

  const hasCrossword = allItems.some((it) => it.type === 'mini_crossword');
  assert.equal(hasCrossword, true, 'mini_crossword must be present');

  const hasMissingLetter = allItems.some((it) => it.type === 'missing_letter');
  assert.equal(hasMissingLetter, true, 'missing_letter must be present');

  const hasMissingSyllable = allItems.some((it) => it.type === 'missing_syllable');
  assert.equal(hasMissingSyllable, true, 'missing_syllable must be present');
});

test('checkAnswer validates strings case-insensitively and trimmed', () => {
  assert.equal(checkAnswer('A', 'a'), true);
  assert.equal(checkAnswer('BOLA', 'bola'), true);
  assert.equal(checkAnswer('O GATO BEBE LEITE', 'o gato bebe leite'), true);
  assert.equal(checkAnswer('BOLA', ' CASA '), false);
  assert.equal(checkAnswer('', 'A'), false);
});

test('calculateStars awards 3, 2, or 1 star based on attempts and hints', () => {
  assert.equal(calculateStars(1, 0), 3);
  assert.equal(calculateStars(2, 0), 2);
  assert.equal(calculateStars(2, 1), 2);
  assert.equal(calculateStars(3, 0), 1);
  assert.equal(calculateStars(1, 2), 1);
});

test('transformText handles uppercase and lowercase mode correctly', () => {
  assert.equal(transformText('Abelha', 'UPPER'), 'ABELHA');
  assert.equal(transformText('ABELHA', 'lower'), 'abelha');
  assert.equal(transformText('', 'UPPER'), '');
});

test('isLevelUnlocked and initial progress state', () => {
  const init = getInitialProgress();
  assert.equal(init.unlockedLevel, 1);
  assert.equal(isLevelUnlocked(1, init), true);
  assert.equal(isLevelUnlocked(2, init), false);

  const advanced = {
    ...init,
    unlockedLevel: 5,
    completedLevels: {
      1: { stars: 3, highStreak: 5 },
      2: { stars: 2, highStreak: 4 },
    },
  };
  assert.equal(isLevelUnlocked(4, advanced), true);
  assert.equal(isLevelUnlocked(5, advanced), true);
  assert.equal(isLevelUnlocked(6, advanced), false);
  assert.equal(calculateTotalStars(advanced), 5);
});
