
import React, { useState, useRef, useEffect } from 'react';

interface FloatingCaptionProps {
  title: string;
  fontSizeMultiplier?: number;
}

export const FloatingCaption: React.FC<FloatingCaptionProps> = ({ title, fontSizeMultiplier = 0.6 }) => {
  const [position, setPosition] = useState({ x: 50, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      
      // Keep within bounds
      const safeX = Math.max(0, Math.min(newX, window.innerWidth - 300));
      const safeY = Math.max(0, Math.min(newY, window.innerHeight - 100));
      
      setPosition({ x: safeX, y: safeY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Base font size for desktop is roughly 72px (7xl). We scale it.
  const dynamicFontSize = 72 * fontSizeMultiplier;
  const mobileFontSize = 48 * fontSizeMultiplier;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed',
        zIndex: 45,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className="select-none pointer-events-auto transition-transform active:scale-105"
    >
      <div className="bg-black/20 backdrop-blur-sm p-6 rounded-3xl border-4 border-yellow-500/50 shadow-2xl">
        <h2 
          style={{ fontSize: window.innerWidth < 1024 ? `${mobileFontSize}px` : `${dynamicFontSize}px` }}
          className="text-yellow-400 font-black tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] uppercase whitespace-nowrap"
        >
          {title}
        </h2>
        <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🎁</div>
        <div className="absolute -bottom-4 -left-4 text-4xl animate-pulse delay-100">🎄</div>
      </div>
    </div>
  );
};
