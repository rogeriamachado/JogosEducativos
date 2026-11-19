import React, { useState } from 'react';
import { Award, Star, Printer, X, Sparkles, CheckCircle, Edit3 } from 'lucide-react';
import { UserProgress } from '../game/types.ts';
import { calculateTotalStars } from '../game/logic.ts';
import { playPopSound, playFanfare } from '../utils/audio.ts';

interface DiplomaModalProps {
  progress: UserProgress;
  onUpdatePlayerName: (name: string) => void;
  onClose: () => void;
}

export const DiplomaModal: React.FC<DiplomaModalProps> = ({
  progress,
  onUpdatePlayerName,
  onClose,
}) => {
  const [name, setName] = useState(progress.playerName || 'Pequeno Aprendiz');
  const [isEditing, setIsEditing] = useState(false);
  const totalStars = calculateTotalStars(progress);
  const isMaster = progress.unlockedLevel >= 20;

  const badges = [
    { id: 1, name: 'Letras e Sons', icon: '🐝', unlocked: progress.unlockedLevel >= 5 },
    { id: 2, name: 'Sílabas Simples', icon: '🧁', unlocked: progress.unlockedLevel >= 9 },
    { id: 3, name: 'Sílabas Complexas', icon: '🔑', unlocked: progress.unlockedLevel >= 12 },
    { id: 4, name: 'Palavras Simples', icon: '⚽', unlocked: progress.unlockedLevel >= 16 },
    { id: 5, name: 'Palavras Ricas', icon: '🌧️', unlocked: progress.unlockedLevel >= 19 },
    { id: 6, name: 'Leitor de Frases', icon: '👑', unlocked: progress.unlockedLevel >= 20 },
  ];

  const handlePrint = () => {
    playPopSound();
    window.print();
  };

  const handleCelebration = () => {
    playFanfare();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full border-4 border-amber-200 shadow-2xl p-6 sm:p-10 space-y-6 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={() => {
            playPopSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          aria-label="Fechar diploma"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Printable Certificate Box */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#FFFDF7] to-[#FFF9EB] border-4 border-amber-300 p-6 sm:p-8 text-center space-y-4 shadow-inner">
          {/* Ornate corner seals */}
          <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
            <span className="text-2xl" role="img" aria-label="Estrela">⭐</span>
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-sm sm:text-base uppercase tracking-widest font-['Fredoka']">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Reino da Alfabetização Mágica</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl" role="img" aria-label="Estrela">⭐</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-amber-900 tracking-tight font-['Fredoka']">
            DIPLOMA DE MESTRE DA LEITURA
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-['Nunito'] max-w-lg mx-auto">
            Certificamos com imensa alegria e encantamento que
          </p>

          {/* Child Name (Editable) */}
          <div className="py-2 flex items-center justify-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xl sm:text-2xl font-black text-amber-950 border-b-2 border-amber-500 text-center px-3 py-1 focus:outline-none bg-white rounded-lg shadow-xs font-['Fredoka']"
                  maxLength={30}
                  autoFocus
                />
                <button
                  onClick={() => {
                    onUpdatePlayerName(name);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded-xl text-xs font-bold font-['Fredoka']"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 border-b-2 border-amber-400 pb-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-950 font-['Fredoka']">
                  {name}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-amber-600 hover:text-amber-800 p-1"
                  title="Editar nome"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 font-['Nunito'] max-w-xl mx-auto leading-relaxed">
            concluiu os estudos mágicos com dedicação, reconheceu as letras, descobriu seus sons, uniu sílabas simples e complexas, formou palavras e leu lindas frases!
          </p>

          {/* Badges Grid */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 font-['Fredoka']">
              Medalhas Mágicas Conquistadas
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                    b.unlocked
                      ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-40 text-slate-400'
                  }`}
                >
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-[10px] font-bold text-center leading-tight font-['Fredoka']">
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer of the Diploma: Stars & Signatures */}
          <div className="pt-4 border-t-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold font-['Fredoka']">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{totalStars} Estrelas Mágicas</span>
            </div>

            <div className="flex items-center gap-6 text-slate-600 font-['Nunito']">
              <div className="text-center">
                <div className="font-['Fredoka'] font-bold text-amber-900">Mago Alfabeto 🧙‍♂️</div>
                <div className="text-[10px] text-slate-500">Mestre da Leitura</div>
              </div>
              <div className="text-center">
                <div className="font-['Fredoka'] font-bold text-amber-900">Estrelinha Zizi ⭐</div>
                <div className="text-[10px] text-slate-500">Guia Encantada</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCelebration}
            className="inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer font-['Fredoka']"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Tocar Fanfarra Mágica 🎺</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer font-['Fredoka']"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Diploma</span>
            </button>

            <button
              onClick={() => {
                playPopSound();
                onClose();
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer font-['Fredoka']"
            >
              Voltar ao Jogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
