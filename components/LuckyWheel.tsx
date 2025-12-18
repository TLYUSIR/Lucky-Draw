
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Participant, Winner } from '../types';
import { WHEEL_COLORS } from '../constants';
import { lightenColor, darkenColor } from '../utils/colorUtils';
import { playTick, playClick } from '../utils/soundUtils';

interface LuckyWheelProps {
  entries: Participant[];
  onSpinEnd: (winner: Participant) => void;
  onTryStart?: () => void; // New callback for start validation
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  className?: string;
  targetDistribution: Record<string, number>;
  currentWinners: Winner[];
  fontSizeMultiplier: number;
}

/**
 * Total Fairness: Cryptographically Secure Random Number Generator
 * Ensures that indices are picked with high entropy and zero PRNG bias.
 */
const getSecureRandomInt = (max: number): number => {
  if (max <= 0) return 0;
  const range = 2 ** 32;
  const limit = range - (range % max);
  const array = new Uint32Array(1);
  let value;
  do {
    window.crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
};

export const LuckyWheel: React.FC<LuckyWheelProps> = ({ 
  entries, 
  onSpinEnd, 
  onTryStart,
  isSpinning,
  setIsSpinning,
  className = "",
  targetDistribution,
  currentWinners,
  fontSizeMultiplier
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [isWobbling, setIsWobbling] = useState(false);
  const spinRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const [isStopping, setIsStopping] = useState(false);
  const lastTickRef = useRef<number>(0);
  
  const draw = useCallback((currentRot: number = 0, winningIdx: number | null = null, highlightOpacity: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    if (width === 0 || height === 0) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(0, width / 2 - 15);

    ctx.clearRect(0, 0, width, height);
    if (radius <= 0) return;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((currentRot * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    if (entries.length === 0) {
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      grad.addColorStop(0, '#e9ecef');
      grad.addColorStop(1, '#ced4da');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((-currentRot * Math.PI) / 180);
      ctx.fillStyle = '#6c757d';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("新增參加者後開始...", 0, 0);
      ctx.restore();
    } else {
      const anglePerEntry = (2 * Math.PI) / entries.length;

      entries.forEach((entry, index) => {
        const startAngle = index * anglePerEntry;
        const endAngle = startAngle + anglePerEntry;
        const baseColor = WHEEL_COLORS[index % WHEEL_COLORS.length];

        ctx.save();
        const isWinningSegment = winningIdx === index;
        if (isWinningSegment && highlightOpacity > 0) {
          ctx.shadowBlur = 30 * highlightOpacity;
          ctx.shadowColor = 'white';
        }

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, lightenColor(baseColor, 20 + (isWinningSegment ? 25 * highlightOpacity : 0)));
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(1, darkenColor(baseColor, 15));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isWinningSegment && highlightOpacity > 0 
          ? `rgba(255, 255, 255, ${0.6 + 0.4 * highlightOpacity})` 
          : 'rgba(255,255,255,0.4)';
        ctx.lineWidth = isWinningSegment ? 3 + 3 * highlightOpacity : 1.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerEntry / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const textRadius = radius * 0.88;
        
        const baseFontSize = Math.min(60, (radius * 2 * Math.PI / entries.length) * 0.45);
        const fontSize = baseFontSize * fontSizeMultiplier;
        
        ctx.font = `bold ${isWinningSegment ? fontSize * (1 + 0.15 * highlightOpacity) : fontSize}px 'Microsoft JhengHei', Arial`;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(entry.name, textRadius + 2, 2);
        ctx.fillStyle = isWinningSegment && highlightOpacity > 0 ? '#fffacd' : 'white';
        ctx.fillText(entry.name, textRadius, 0);
        ctx.restore();
        
        ctx.restore();
      });
    }
    ctx.restore();
  }, [entries, fontSizeMultiplier]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        if (canvasRef.current.width !== size || canvasRef.current.height !== size) {
           canvasRef.current.width = size;
           canvasRef.current.height = size;
           draw(rotation);
        }
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [draw, rotation]);

  useEffect(() => {
    draw(rotation, highlightIdx, isStopping ? 1 : 0);
  }, [draw, rotation, highlightIdx, isStopping]);

  const animate = useCallback(() => {
    if (isSpinning && !isStopping) {
      spinRef.current += 12 + Math.random() * 8; 
    }
    if (entries.length > 0) {
      const anglePerSlice = 360 / entries.length;
      const currentTick = Math.floor(spinRef.current / anglePerSlice);
      if (currentTick !== lastTickRef.current) {
         playTick();
         lastTickRef.current = currentTick;
      }
    }
    setRotation(spinRef.current);
    draw(spinRef.current);
    if (isSpinning) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [isSpinning, isStopping, draw, entries.length]);

  useEffect(() => {
    if (isSpinning && !isStopping) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isSpinning, isStopping, animate]);

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entries.length === 0 || isSpinning) return;
    
    // If onTryStart is provided, let the parent decide whether to proceed
    if (onTryStart) {
      onTryStart();
    } else {
      // Default behavior if no listener
      playClick();
      setHighlightIdx(null);
      setIsWobbling(false);
      setIsSpinning(true);
      setIsStopping(false);
    }
  };

  /**
   * Total Fairness Picker:
   * 1. Uses Secure Crypto Randomness.
   * 2. Respects the pre-calculated target distribution per class.
   * 3. Ensures everyone in an eligible class has a perfectly identical weight.
   */
  const pickFairWinner = useCallback(() => {
    if (entries.length === 0) return null;
    
    // Count how many people from each class have ALREADY won
    const winCounts: Record<string, number> = {};
    currentWinners.forEach(w => {
      const c = w.className || 'Unknown';
      winCounts[c] = (winCounts[c] || 0) + 1;
    });

    // Determine which classes haven't met their fair quota yet
    const eligibleClasses = Object.keys(targetDistribution).filter(c => {
      return (winCounts[c] || 0) < targetDistribution[c];
    });

    let pool = entries;
    if (eligibleClasses.length > 0) {
      // Prioritize members of under-represented classes to maintain total fairness
      pool = entries.filter(e => eligibleClasses.includes(e.className || 'Unknown'));
    }

    // Pick from the filtered pool using high-entropy secure randomness
    const winnerIndexInPool = getSecureRandomInt(pool.length);
    const winner = pool[winnerIndexInPool];
    return entries.findIndex(e => e.id === winner.id);
  }, [entries, currentWinners, targetDistribution]);

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSpinning || isStopping) return;
    playClick();
    setIsStopping(true);
    
    const winnerIndex = pickFairWinner();
    if (winnerIndex === null || winnerIndex === -1) {
      setIsSpinning(false);
      setIsStopping(false);
      return;
    }
    const winner = entries[winnerIndex];
    setHighlightIdx(winnerIndex);
    
    const sliceAngle = 360 / entries.length;
    const winnerStartAngle = winnerIndex * sliceAngle;
    const winnerCenterAngle = winnerStartAngle + sliceAngle / 2;
    
    const currentRot = spinRef.current;
    const rounds = 5; 
    
    let targetRot = currentRot + (360 * rounds);
    const desiredOffset = (270 - winnerCenterAngle + 360) % 360;
    const currentOffset = targetRot % 360;
    const adjustment = (desiredOffset - currentOffset + 360) % 360;
    targetRot += adjustment;

    const startValue = currentRot;
    const change = targetRot - startValue;
    const duration = 6000; 
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateStop = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const highlightOpacity = progress > 0.8 ? (progress - 0.8) / 0.2 : 0;
      const easedProgress = easeOutCubic(progress);
      const newRot = startValue + change * easedProgress;
      spinRef.current = newRot;
      
      if (entries.length > 0) {
        const anglePerSlice = 360 / entries.length;
        const currentTick = Math.floor(newRot / anglePerSlice);
        if (currentTick !== lastTickRef.current) {
           playTick();
           lastTickRef.current = currentTick;
        }
      }

      setRotation(newRot);
      draw(newRot, winnerIndex, highlightOpacity);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animateStop);
      } else {
        setIsWobbling(true);
        startWobble(targetRot, winner, winnerIndex);
      }
    };
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestAnimationFrame(animateStop);
  };

  const startWobble = (targetRot: number, winner: Participant, winnerIndex: number) => {
    const wobbleStartTime = performance.now();
    const wobbleDuration = 1000; 
    const amplitude = 4; 

    const animateWobble = (currentTime: number) => {
      const elapsed = currentTime - wobbleStartTime;
      const t = elapsed / wobbleDuration;
      if (t < 1) {
        const wobble = amplitude * Math.exp(-4 * t) * Math.cos(25 * t);
        const finalRot = targetRot + wobble;
        spinRef.current = finalRot;
        setRotation(finalRot);
        draw(finalRot, winnerIndex, 1);
        requestRef.current = requestAnimationFrame(animateWobble);
      } else {
        spinRef.current = targetRot;
        setRotation(targetRot);
        draw(targetRot, winnerIndex, 1);
        setIsSpinning(false);
        setIsStopping(false);
        setIsWobbling(false);
        onSpinEnd(winner);
      }
    };
    requestAnimationFrame(animateWobble);
  };

  const renderBulbs = () => {
    const bulbCount = 36;
    const bulbs = [];
    const colors = [
      { base: '#ef4444', light: '#fca5a5', dark: '#991b1b' },
      { base: '#22c55e', light: '#86efac', dark: '#166534' },
      { base: '#eab308', light: '#fde047', dark: '#854d0e' },
      { base: '#3b82f6', light: '#93c5fd', dark: '#1e40af' }
    ]; 

    for (let i = 0; i < bulbCount; i++) {
      const angle = (i / bulbCount) * 2 * Math.PI;
      const r = 52.2; 
      const x = 50 + r * Math.cos(angle);
      const y = 50 + r * Math.sin(angle);
      const colorScheme = colors[i % colors.length];
      const isOdd = i % 2 !== 0;

      bulbs.push(
        <div
          key={i}
          className="absolute w-2.5 h-2.5 lg:w-5 lg:h-5 rounded-full z-10"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            backgroundImage: `radial-gradient(circle at 35% 35%, white 0%, ${colorScheme.light} 20%, ${colorScheme.base} 60%, ${colorScheme.dark} 100%)`,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 15px ${colorScheme.base}, 0 0 5px rgba(255,255,255,0.5)`,
            animation: `christmasFlash 2s infinite ease-in-out ${isOdd ? '0s' : '1s'}`,
            border: '0.5px solid rgba(0,0,0,0.1)'
          }}
        />
      );
    }
    return bulbs;
  };

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center cursor-pointer group ${className}`}>
      <style>{`
        @keyframes christmasFlash {
          0%, 100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.1); 
            filter: brightness(1.2) contrast(1.1);
            box-shadow: 0 0 25px currentColor, 0 0 10px white;
          }
          50% { 
            opacity: 0.4; 
            transform: translate(-50%, -50%) scale(0.9); 
            filter: brightness(0.8) contrast(0.9);
            box-shadow: 0 0 5px currentColor;
          }
        }
      `}</style>
      
      <div className="absolute top-0 left-0 w-full h-full rounded-full pointer-events-none">
        {renderBulbs()}
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-dashed border-white/20 pointer-events-none animate-[spin_40s_linear_infinite]" />
      
      <div className={`absolute -top-[8%] lg:-top-[10%] left-1/2 -translate-x-1/2 w-[12%] h-[12%] z-20 flex flex-col items-center justify-end pointer-events-none transition-transform duration-100 ${isWobbling ? 'scale-150' : ''}`}>
        <div className="text-3xl lg:text-5xl filter drop-shadow-xl animate-bounce">👇</div>
      </div>

      <canvas 
        ref={canvasRef}
        onClick={isSpinning ? handleStop : handleStart}
        className="rounded-full transition-all duration-300 drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
      />

      <button 
        onClick={isSpinning ? handleStop : handleStart}
        disabled={entries.length === 0}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15%] h-[15%] 
          rounded-full bg-gradient-to-br from-[#fffacd] via-[#ffd700] to-[#b8860b]
          border-2 lg:border-4 border-[#8b6914] shadow-2xl flex items-center justify-center
          transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10
          ${isSpinning && !isStopping ? 'animate-pulse' : ''}`}
      >
        <span className="text-[#5c4033] font-bold text-center text-[10px] lg:text-2xl leading-tight select-none px-1">
          {isSpinning ? (isStopping ? "..." : "停止") : "開始"}
        </span>
      </button>
    </div>
  );
};
