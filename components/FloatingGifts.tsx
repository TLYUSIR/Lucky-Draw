import React from 'react';

export const FloatingGifts: React.FC = () => {
  const gifts = ['🎁', '🎀', '🎄', '⛄', '🔔', '🌟', '✨', '⭐'];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-0 z-[1] pointer-events-none">
      <style>{`
        @keyframes festiveBob {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
        @keyframes festiveShimmer {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 10px 15px rgba(0,0,0,0.3));
            opacity: 0.9;
          }
          50% { 
            filter: brightness(1.3) drop-shadow(0 0 25px rgba(255, 215, 0, 0.7));
            opacity: 1;
          }
        }
      `}</style>
      {gifts.map((emoji, i) => (
        <div
          key={i}
          className="absolute bottom-[8%] text-6xl select-none"
          style={{
            left: `${10 + i * 11}%`,
            animation: `
              festiveBob ${3 + Math.random() * 2}s ease-in-out infinite, 
              festiveShimmer ${2 + Math.random() * 2}s ease-in-out infinite
            `,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};
