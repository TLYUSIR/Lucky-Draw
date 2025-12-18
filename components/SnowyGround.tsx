
import React from 'react';

export const SnowyGround: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[25vh] pointer-events-none z-[1] overflow-hidden">
      {/* Background Hill */}
      <svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full h-[80%] opacity-80"
        preserveAspectRatio="none"
      >
        <path
          fill="#f1f5f9"
          d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,224C1120,224,1280,192,1360,176L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        ></path>
      </svg>
      
      {/* Foreground Hill */}
      <svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full h-[60%]"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffffff"
          d="M0,256L60,245.3C120,235,240,213,360,218.7C480,224,600,256,720,266.7C840,277,960,267,1080,245.3C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        ></path>
      </svg>
      
      {/* Subtle Mist/Bloom on the snow */}
      <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-white/40 via-transparent to-transparent" />
    </div>
  );
};
