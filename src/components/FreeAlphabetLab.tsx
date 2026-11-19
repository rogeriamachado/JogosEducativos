import React, { useState } from 'react';
import { Volume2, Sparkles, Wand2, ArrowLeft, RefreshCw } from 'lucide-react';
import { UserProgress } from '../game/types.ts';
import { transformText } from '../game/logic.ts';
import { speakPortuguese, playPopSound, playSparkleSound } from '../utils/audio.ts';

interface FreeAlphabetLabProps {
  progress: UserProgress;
  onBackToMap: () => void;
}

const ALPHABET_ITEMS = [
  { letter: 'A', name: 'Á', sound: '/a/', word: 'Abelha', emoji: '🐝' },
  { letter: 'B', name: 'Bê', sound: '/b/', word: 'Bola', emoji: '⚽' },
  { letter: 'C', name: 'Cê', sound: '/k/', word: 'Casa', emoji: '🏠' },
  { letter: 'D', name: 'Dê', sound: '/d/', word: 'Dado', emoji: '🎲' },
  { letter: 'E', name: 'É', sound: '/e/', word: 'Elefante', emoji: '🐘' },
  { letter: 'F', name: 'Éfe', sound: '/f/', word: 'Fada', emoji: '🧚‍♀️' },
  { letter: 'G', name: 'Gê', sound: '/g/', word: 'Gato', emoji: '🐱' },
  { letter: 'H', name: 'Agá', sound: 'Mudo / Mágico', word: 'Hambúrguer', emoji: '🍔' },
  { letter: 'I', name: 'I', sound: '/i/', word: 'Iguana', emoji: '🦎' },
  { letter: 'J', name: 'Jota', sound: '/ʒ/', word: 'Jacaré', emoji: '🐊' },
  { letter: 'K', name: 'Cá', sound: '/k/', word: 'Kiwi', emoji: '🥝' },
  { letter: 'L', name: 'Éle', sound: '/l/', word: 'Lua', emoji: '🌙' },
  { letter: 'M', name: 'Ême', sound: '/m/', word: 'Macaco', emoji: '🐒' },
  { letter: 'N', name: 'Êne', sound: '/n/', word: 'Navio', emoji: '🚢' },
  { letter: 'O', name: 'Ó', sound: '/o/', word: 'Ovelha', emoji: '🐑' },
  { letter: 'P', name: 'Pê', sound: '/p/', word: 'Pato', emoji: '🦆' },
  { letter: 'Q', name: 'Quê', sound: '/k/', word: 'Queijo', emoji: '🧀' },
  { letter: 'R', name: 'Érre', sound: '/ʁ/', word: 'Rato', emoji: '🐭' },
  { letter: 'S', name: 'Ésse', sound: '/s/', word: 'Sol', emoji: '☀️' },
  { letter: 'T', name: 'Tê', sound: '/t/', word: 'Tatu', emoji: '🦔' },
  { letter: 'U', name: 'U', sound: '/u/', word: 'Urso', emoji: '🐻' },
  { letter: 'V', name: 'Vê', sound: '/v/', word: 'Vaca', emoji: '🐮' },
  { letter: 'W', name: 'Dáblio', sound: '/w/ ou /v/', word: 'Waffle', emoji: '🧇' },
  { letter: 'X', name: 'Xis', sound: '/ʃ/', word: 'Xícara', emoji: '☕' },
  { letter: 'Y', name: 'Ípsilon', sound: '/i/', word: 'Iogurte', emoji: '🥛' },
  { letter: 'Z', name: 'Zê', sound: '/z/', word: 'Zebra', emoji: '🦓' },
];

const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'J', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'Z', 'CH', 'NH', 'LH', 'BR', 'TR', 'FL'];
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

export const FreeAlphabetLab: React.FC<FreeAlphabetLabProps> = ({
  progress,
  onBackToMap,
}) => {
  const [activeTab, setActiveTab] = useState<'alphabet' | 'syllableLab'>('alphabet');
  const [selectedLetter, setSelectedLetter] = useState(ALPHABET_ITEMS[0]);

  // Syllable lab states
  const [chosenC, setChosenC] = useState('B');
  const [chosenV, setChosenV] = useState('A');

  const blendedSyllable = `${chosenC}${chosenV}`;

  const handleLetterClick = (item: typeof ALPHABET_ITEMS[0]) => {
    playPopSound();
    setSelectedLetter(item);
    speakPortuguese(
      `Letra ${item.name}. Som ${item.sound}. ${item.letter} de ${item.word}!`,
      { rate: progress.slowSpeech ? 0.82 : 0.95 }
    );
  };

  const handleBlend = () => {
    playSparkleSound();
    speakPortuguese(
      `${chosenC} com ${chosenV} faz... ${blendedSyllable}! ${blendedSyllable}!`,
      { rate: progress.slowSpeech ? 0.82 : 0.95 }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 p-4 rounded-3xl border border-purple-200 shadow-2xs">
        <button
          onClick={() => {
            playPopSound();
            onBackToMap();
          }}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer font-['Fredoka']"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Mapa</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold font-['Fredoka']">
            <Wand2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Laboratório Encantado</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-['Fredoka']">
            Explore Letras &amp; Sílabas Livres
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => {
              playPopSound();
              setActiveTab('alphabet');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer font-['Fredoka'] ${
              activeTab === 'alphabet'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alfabeto Falante
          </button>
          <button
            onClick={() => {
              playPopSound();
              setActiveTab('syllableLab');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer font-['Fredoka'] ${
              activeTab === 'syllableLab'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fábrica de Sílabas
          </button>
        </div>
      </div>

      {/* Tab 1: Alfabeto Falante */}
      {activeTab === 'alphabet' && (
        <div className="space-y-6">
          {/* Active Letter Spotlight Card */}
          <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-indigo-50 border-2 border-purple-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-3 border-purple-300 flex items-center justify-center shadow-md">
                <span className="text-5xl sm:text-6xl font-black text-purple-900 font-['Fredoka']">
                  {transformText(selectedLetter.letter, progress.textCase)}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-2xl font-bold text-slate-800 font-['Fredoka']">
                    Letra {selectedLetter.name}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">
                    som {selectedLetter.sound}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-['Nunito']">
                  {selectedLetter.letter} de <strong>{selectedLetter.word}</strong>
                </p>
                <div className="text-3xl sm:text-4xl">{selectedLetter.emoji}</div>
              </div>
            </div>

            <button
              onClick={() => handleLetterClick(selectedLetter)}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer font-['Fredoka'] text-sm sm:text-base"
            >
              <Volume2 className="w-5 h-5" />
              <span>Ouvir Som &amp; Pronúncia</span>
            </button>
          </div>

          {/* Letter Grid A to Z */}
          <div className="bg-white/80 border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 font-['Fredoka']">
              Toque em qualquer letra para escutar:
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 sm:gap-3">
              {ALPHABET_ITEMS.map((item) => {
                const isSelected = selectedLetter.letter === item.letter;
                return (
                  <button
                    key={item.letter}
                    onClick={() => handleLetterClick(item)}
                    className={`p-3 sm:p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-purple-100 border-purple-400 scale-105 shadow-xs'
                        : 'bg-white hover:bg-amber-50 border-slate-200 hover:border-amber-300'
                    }`}
                    aria-label={`Letra ${item.letter}`}
                  >
                    <span className="text-2xl sm:text-3xl font-black text-slate-800 font-['Fredoka']">
                      {transformText(item.letter, progress.textCase)}
                    </span>
                    <span className="text-base sm:text-lg mt-0.5">{item.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Fábrica de Sílabas */}
      {activeTab === 'syllableLab' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-teal-200 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-['Fredoka']">
              Junte uma Consoante com uma Vogal!
            </h3>
            <p className="text-sm text-slate-600 font-['Nunito'] max-w-lg mx-auto">
              Escolha a primeira letrinha e a vogal mágica para ver qual som de sílaba vai nascer!
            </p>
          </div>

          {/* Stage where syllables blend */}
          <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border-2 border-teal-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 shadow-inner">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-3 border-teal-300 flex items-center justify-center shadow-xs">
              <span className="text-3xl sm:text-4xl font-black text-teal-900 font-['Fredoka']">
                {transformText(chosenC, progress.textCase)}
              </span>
            </div>

            <span className="text-3xl font-black text-slate-400">+</span>

            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-3 border-amber-300 flex items-center justify-center shadow-xs">
              <span className="text-3xl sm:text-4xl font-black text-amber-900 font-['Fredoka']">
                {transformText(chosenV, progress.textCase)}
              </span>
            </div>

            <span className="text-3xl font-black text-slate-400">=</span>

            <div className="w-28 h-24 sm:w-36 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-300 to-orange-400 border-4 border-white flex flex-col items-center justify-center shadow-md animate-pulse">
              <span className="text-4xl sm:text-5xl font-black text-white font-['Fredoka']">
                {transformText(blendedSyllable, progress.textCase)}
              </span>
            </div>
          </div>

          {/* Action button to hear blend */}
          <div className="flex justify-center">
            <button
              onClick={handleBlend}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer font-['Fredoka'] text-base sm:text-lg transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>Ouvir a Sílaba Formada!</span>
            </button>
          </div>

          {/* Pickers for Consonants & Vowels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* 1. Pick Consonant / Digraph */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-['Fredoka']">
                1. Escolha a Consoante ou Dígrafo:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {CONSONANTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      playPopSound();
                      setChosenC(c);
                    }}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-sm sm:text-base border transition-all cursor-pointer font-['Fredoka'] ${
                      chosenC === c
                        ? 'bg-teal-500 text-white border-teal-600 shadow-xs scale-105'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {transformText(c, progress.textCase)}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pick Vowel */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-['Fredoka']">
                2. Escolha a Vogal Mágica:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {VOWELS.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      playPopSound();
                      setChosenV(v);
                    }}
                    className={`py-3 px-2 rounded-2xl text-center font-black text-xl sm:text-2xl border-2 transition-all cursor-pointer font-['Fredoka'] ${
                      chosenV === v
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs scale-105'
                        : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                    }`}
                  >
                    {transformText(v, progress.textCase)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
