
import React, { useEffect, useState, useMemo } from 'react';

interface SnowflakeProps {
  intensity: number;
}

// Fixed: Explicitly typed as React.FC to allow standard React props like 'key' in JSX
const Snowflake: React.FC<SnowflakeProps> = ({ intensity }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const delay = Math.random() * 5;
    // Base duration is 10-20s. 
    // Higher intensity (up to 100) makes it fall faster.
    const speedFactor = Math.max(0.2, (100 - intensity) / 50 + 0.5);
    const duration = (Math.random() * 10 + 10) * speedFactor;
    const left = Math.random() * 100;
    const size = Math.random() * 1.5 + 0.5;
    
    setStyle({
      left: `${left}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      fontSize: `${size}em`,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }, [intensity]);

  return (
    <div 
      className="fixed -top-10 text-white select-none pointer-events-none z-0 animate-[fall_linear_infinite]"
      style={style}
    >
      {['❄', '❅', '❆'][Math.floor(Math.random() * 3)]}
    </div>
  );
};

export const Snowfall: React.FC<{ intensity: number }> = ({ intensity }) => {
  // Number of snowflakes scales with intensity. 0 -> 0, 50 -> 40, 100 -> 100
  const count = Math.floor(intensity * 1.5);
  
  const snowflakes = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => (
      <Snowflake key={i} intensity={intensity} />
    ));
  }, [count, intensity]);

  return (
    <>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(110vh) translateX(20px) rotate(360deg); opacity: 0.2; }
        }
      `}</style>
      {snowflakes}
    </>
  );
};
