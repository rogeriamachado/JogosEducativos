import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, RotateCcw, CheckCircle2, Volume2 } from 'lucide-react';
import { playPopSound, playSparkleSound, speakPortuguese } from '../utils/audio.ts';

interface LetterTraceCanvasProps {
  letter: string;
  wordClue?: string;
  emoji?: string;
  onSuccess: () => void;
  soundEnabled: boolean;
  slowSpeech: boolean;
}

export const LetterTraceCanvas: React.FC<LetterTraceCanvasProps> = ({
  letter,
  wordClue,
  emoji,
  onSuccess,
  soundEnabled,
  slowSpeech,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pointsCovered, setPointsCovered] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Guide checkpoints defined for each letter in a 300x300 canvas
  const getLetterCheckpoints = (char: string): { x: number; y: number }[] => {
    const c = char.toUpperCase();
    if (c === 'A') {
      return [
        { x: 150, y: 55 },
        { x: 130, y: 110 },
        { x: 100, y: 180 },
        { x: 70, y: 250 },
        { x: 170, y: 110 },
        { x: 200, y: 180 },
        { x: 230, y: 250 },
        { x: 110, y: 170 },
        { x: 150, y: 170 },
        { x: 190, y: 170 },
      ];
    }
    if (c === 'E') {
      return [
        { x: 80, y: 60 },
        { x: 80, y: 120 },
        { x: 80, y: 180 },
        { x: 80, y: 240 },
        { x: 140, y: 60 },
        { x: 200, y: 60 },
        { x: 140, y: 150 },
        { x: 180, y: 150 },
        { x: 140, y: 240 },
        { x: 200, y: 240 },
      ];
    }
    if (c === 'I') {
      return [
        { x: 150, y: 60 },
        { x: 150, y: 110 },
        { x: 150, y: 160 },
        { x: 150, y: 210 },
        { x: 150, y: 250 },
      ];
    }
    if (c === 'O') {
      return [
        { x: 150, y: 60 },
        { x: 90, y: 100 },
        { x: 75, y: 150 },
        { x: 90, y: 210 },
        { x: 150, y: 245 },
        { x: 210, y: 210 },
        { x: 225, y: 150 },
        { x: 210, y: 100 },
      ];
    }
    if (c === 'U') {
      return [
        { x: 90, y: 60 },
        { x: 90, y: 140 },
        { x: 95, y: 200 },
        { x: 150, y: 245 },
        { x: 205, y: 200 },
        { x: 210, y: 140 },
        { x: 210, y: 60 },
      ];
    }
    if (c === 'B') {
      return [
        { x: 80, y: 60 },
        { x: 80, y: 150 },
        { x: 80, y: 240 },
        { x: 140, y: 60 },
        { x: 180, y: 105 },
        { x: 140, y: 150 },
        { x: 190, y: 195 },
        { x: 140, y: 240 },
      ];
    }
    // Default circular checkpoints for any letter
    return [
      { x: 150, y: 70 },
      { x: 100, y: 150 },
      { x: 200, y: 150 },
      { x: 150, y: 230 },
      { x: 150, y: 150 },
    ];
  };

  const [activeCheckpoints, setActiveCheckpoints] = useState<
    { x: number; y: number; hit: boolean }[]
  >([]);

  // Redraw letter background & guide dots
  const drawGuide = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 300, 300);

    // Draw large transparent dotted letter in background
    ctx.font = 'bold 180px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(253, 230, 138, 0.45)';
    ctx.fillText(letter.toUpperCase(), 150, 155);

    // Dotted stroke outline
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#F59E0B';
    ctx.strokeText(letter.toUpperCase(), 150, 155);
    ctx.setLineDash([]); // reset

    // Draw checkpoints
    activeCheckpoints.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.hit ? 9 : 7, 0, Math.PI * 2);
      ctx.fillStyle = pt.hit ? '#10B981' : '#FBBF24';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    });
  };

  useEffect(() => {
    const pts = getLetterCheckpoints(letter).map((p) => ({ ...p, hit: false }));
    setActiveCheckpoints(pts);
    setPointsCovered(0);
    setCompleted(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGuide(ctx);
      }
    }
  }, [letter]);

  // Handle pointer movements
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || completed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw magic glowing stroke
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(129, 140, 248, 0.45)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#6366F1';
    ctx.fill();

    // Check hit with any checkpoints
    let hitSomething = false;
    const updated = activeCheckpoints.map((pt) => {
      if (!pt.hit) {
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist < 26) {
          hitSomething = true;
          return { ...pt, hit: true };
        }
      }
      return pt;
    });

    if (hitSomething) {
      playSparkleSound();
      setActiveCheckpoints(updated);
      const totalHit = updated.filter((p) => p.hit).length;
      setPointsCovered(totalHit);

      // Check if threshold reached (> 65% of checkpoints covered)
      if (totalHit >= Math.ceil(updated.length * 0.65) && !completed) {
        setCompleted(true);
        if (soundEnabled) {
          speakPortuguese(`Maravilha! Você cobriu a letrinha ${letter}!`, {
            rate: slowSpeech ? 0.82 : 0.95,
          });
        }
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleReset = () => {
    playPopSound();
    const pts = getLetterCheckpoints(letter).map((p) => ({ ...p, hit: false }));
    setActiveCheckpoints(pts);
    setPointsCovered(0);
    setCompleted(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGuide(ctx);
      }
    }
  };

  const handleSkipOrDone = () => {
    playPopSound();
    onSuccess();
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-['Fredoka']">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Cubra o traçado pontilhado com o dedo ou mouse!</span>
        </div>
        {wordClue && (
          <p className="text-sm font-semibold text-slate-700 font-['Nunito']">
            {emoji && <span className="mr-1 text-lg">{emoji}</span>}
            Letra <strong>{letter}</strong> de <strong>{wordClue}</strong>
          </p>
        )}
      </div>

      {/* Canvas Box */}
      <div className="relative touch-none select-none rounded-3xl bg-white border-4 border-amber-300 shadow-md p-2">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded-2xl cursor-crosshair bg-[#FFFDF7]"
          style={{ width: 280, height: 280 }}
        />

        {/* Success badge overlay */}
        {completed && (
          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-2xs rounded-3xl flex flex-col items-center justify-center animate-scaleIn">
            <div className="bg-white px-5 py-3 rounded-2xl shadow-lg border-2 border-emerald-400 flex items-center gap-2 text-emerald-800 font-bold font-['Fredoka']">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-bounce" />
              <span>Traçado Concluído! ✨</span>
            </div>
          </div>
        )}
      </div>

      {/* Control buttons below canvas */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer font-['Fredoka']"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar e Repetir</span>
        </button>

        <button
          onClick={handleSkipOrDone}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer font-['Fredoka']"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Terminei o Traçado!</span>
        </button>
      </div>
    </div>
  );
};
