
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Participant, Winner } from './types';
import { ROUNDS, STAGE_GROUPS } from './constants';
import { Snowfall } from './components/Snowfall';
import { SnowyGround } from './components/SnowyGround';
import { FloatingGifts } from './components/FloatingGifts';
import { LuckyWheel } from './components/LuckyWheel';
import { WinnerBanner, SummaryModal, QuotaWarningModal } from './components/Modals';
import { ParticipantPanel } from './components/ParticipantPanel';
import { FloatingCaption } from './components/FloatingCaption';
import { FairnessDashboard } from './components/FairnessDashboard';
import { createConfetti } from './utils/colorUtils';
import { playClick, playWin, startBackgroundMusic, stopBackgroundMusic } from './utils/soundUtils';

// Safe sound player helper
const safeSound = (fn: () => void) => {
  try {
    fn();
  } catch (e) {
    console.error("Sound play error", e);
  }
};

const App: React.FC = () => {
  // State
  const [currentRoundId, setCurrentRoundId] = useState(1);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<Participant | null>(null);
  const [nameFontSizeMultiplier, setNameFontSizeMultiplier] = useState(0.8);
  const [captionFontSizeMultiplier, setCaptionFontSizeMultiplier] = useState(0.6);
  const [snowfallIntensity, setSnowfallIntensity] = useState(50);
  
  // Persistence state
  const isLoaded = useRef(false);

  // UI State
  const [showRoundSelector, setShowRoundSelector] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false); 
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [quotaWarningOpen, setQuotaWarningOpen] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);

  // Derived
  const currentRound = ROUNDS.find(r => r.id === currentRoundId) || ROUNDS[0];
  
  // To ensure "Total Fairness", we calculate quotas based on the TOTAL population of the round
  // (Those who haven't won yet + those who have already won)
  const allRoundMembers = useMemo(() => {
    const p = participants.filter(p => Number(p.roundId) === Number(currentRoundId));
    const w = winners.filter(w => Number(w.roundId) === Number(currentRoundId));
    return [...p, ...w];
  }, [participants, winners, currentRoundId]);

  const currentParticipants = useMemo(() => 
    participants.filter(p => Number(p.roundId) === Number(currentRoundId)), 
    [participants, currentRoundId]
  );
  
  const currentWinners = useMemo(() => 
    winners.filter(w => Number(w.roundId) === Number(currentRoundId)), 
    [winners, currentRoundId]
  );

  const roundCompleted = currentWinners.length >= currentRound.winnerCount;

  /**
   * Total Fairness Distribution Logic (Hamilton Method / Largest Remainder)
   */
  const targetDistribution = useMemo(() => {
    if (allRoundMembers.length === 0) return {};
    
    const classCounts: Record<string, number> = {};
    allRoundMembers.forEach(p => {
      const c = p.className || 'Unknown';
      classCounts[c] = (classCounts[c] || 0) + 1;
    });

    const totalPopulation = allRoundMembers.length;
    const totalWinnersToPick = currentRound.winnerCount;
    
    const distribution: Record<string, number> = {};
    const classNames = Object.keys(classCounts);
    
    let allocated = 0;
    const remainders: { className: string; val: number }[] = [];

    classNames.forEach(c => {
      const share = (classCounts[c] / totalPopulation) * totalWinnersToPick;
      distribution[c] = Math.floor(share);
      allocated += distribution[c];
      remainders.push({ className: c, val: share - Math.floor(share) });
    });

    // Distribute remaining slots to classes with highest fractional parts
    remainders.sort((a, b) => b.val - a.val);
    let i = 0;
    while (allocated < totalWinnersToPick && i < remainders.length) {
      distribution[remainders[i].className]++;
      allocated++;
      i++;
    }

    return distribution;
  }, [allRoundMembers, currentRound.winnerCount]);

  // Initial Load from Persistence
  useEffect(() => {
    try {
      const savedP = localStorage.getItem('participants');
      const savedW = localStorage.getItem('winners');
      const savedSize = localStorage.getItem('nameFontSizeMultiplier');
      const savedCapSize = localStorage.getItem('captionFontSizeMultiplier');
      const savedSnow = localStorage.getItem('snowfallIntensity');
      
      if (savedP) setParticipants(JSON.parse(savedP));
      if (savedW) setWinners(JSON.parse(savedW));
      if (savedSize) setNameFontSizeMultiplier(parseFloat(savedSize));
      if (savedCapSize) setCaptionFontSizeMultiplier(parseFloat(savedCapSize));
      if (savedSnow) setSnowfallIntensity(parseInt(savedSnow));
      
      isLoaded.current = true;
    } catch (e) {
      console.error("Failed to load state", e);
      isLoaded.current = true;
    }
  }, []);

  // Save to Persistence
  useEffect(() => {
    if (!isLoaded.current) return;
    
    localStorage.setItem('participants', JSON.stringify(participants));
    localStorage.setItem('winners', JSON.stringify(winners));
    localStorage.setItem('nameFontSizeMultiplier', nameFontSizeMultiplier.toString());
    localStorage.setItem('captionFontSizeMultiplier', captionFontSizeMultiplier.toString());
    localStorage.setItem('snowfallIntensity', snowfallIntensity.toString());
  }, [participants, winners, nameFontSizeMultiplier, captionFontSizeMultiplier, snowfallIntensity]);

  useEffect(() => {
    if (isMusicEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [isMusicEnabled]);

  // Handlers
  const handleBulkAdd = (input: string) => {
    safeSound(playClick);
    const lines = input.trim().split('\n');
    const newParticipants: Participant[] = [];
    
    let activeRoundId = currentRoundId;
    let activeClassName = ROUNDS.find(r => r.id === activeRoundId)?.className || '';

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      const normalizedLine = trimmedLine.replace(/\s+/g, '');
      const matchedRound = ROUNDS.find(r => 
        r.className.replace(/\s+/g, '') === normalizedLine
      );

      if (matchedRound) {
        activeRoundId = matchedRound.id;
        activeClassName = matchedRound.className;
      } else {
        newParticipants.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random()}`,
          name: trimmedLine,
          className: activeClassName,
          roundId: activeRoundId
        });
      }
    });

    if (newParticipants.length > 0) {
      setParticipants(prev => [...prev, ...newParticipants]);
    }
  };

  const handleRemoveParticipant = (id: string) => {
    safeSound(playClick);
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleClearRound = () => {
    safeSound(playClick);
    const count = currentParticipants.length;
    if (count === 0) return;
    if (window.confirm(`確定要清空本回合 (${currentRound.className}) 的所有 ${count} 位參加者嗎？`)) {
      setParticipants(prev => prev.filter(p => Number(p.roundId) !== Number(currentRoundId)));
    }
  };

  const handleClearGlobal = () => {
    safeSound(playClick);
    const count = participants.length;
    if (count === 0) return;
    if (window.confirm(`⚠️ 警告：確定要清空「所有 17 個回合」的全部 ${count} 位參加者嗎？`)) {
      setParticipants([]);
    }
  };

  const handleTryStartSpin = () => {
    if (currentWinners.length >= currentRound.winnerCount) {
      setQuotaWarningOpen(true);
    } else {
      startSpinning();
    }
  };

  const startSpinning = () => {
    safeSound(playClick);
    setIsSpinning(true);
    setQuotaWarningOpen(false);
  };

  const handleSpinEnd = (winner: Participant) => {
    safeSound(playWin);
    setPendingWinner(winner);
    setWinnerModalOpen(true);
    createConfetti();
  };

  const confirmWinner = (removeFromWheel: boolean) => {
    safeSound(playClick);
    if (pendingWinner) {
      const newWinner: Winner = { ...pendingWinner, wonAt: new Date().toISOString() };
      setWinners(prev => [...prev, newWinner]);
      if (removeFromWheel) {
        setParticipants(prev => prev.filter(p => p.id !== pendingWinner.id));
      }
    }
    setWinnerModalOpen(false);
    setPendingWinner(null);
  };

  const removeWinner = (winnerId: string, restore: boolean) => {
    safeSound(playClick);
    const winner = winners.find(w => w.id === winnerId);
    if (!winner) return;
    setWinners(prev => prev.filter(w => w.id !== winnerId));
    if (restore) {
      const participant: Participant = { id: winner.id, name: winner.name, className: winner.className, roundId: winner.roundId };
      setParticipants(prev => [...prev, participant]);
    }
  };

  const switchRound = (rId: number) => {
    safeSound(playClick);
    setCurrentRoundId(rId);
  };

  const toggleMusic = () => {
    safeSound(playClick);
    setIsMusicEnabled(!isMusicEnabled);
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row transition-colors duration-700 ease-in-out relative font-sans"
      style={{ background: currentRound.background }}
    >
      <Snowfall intensity={snowfallIntensity} />
      <SnowyGround />
      <FloatingGifts />

      <FloatingCaption title={currentRound.title} fontSizeMultiplier={captionFontSizeMultiplier} />

      {/* LEFT PANEL: WINNERS & FAIRNESS */}
      <div className="order-2 lg:order-1 w-full lg:w-80 h-1/4 lg:h-full bg-black/20 backdrop-blur-md border-t lg:border-t-0 lg:border-r border-white/10 flex flex-col z-30 relative shadow-2xl shrink-0">
        <div className="p-4 bg-black/30 sticky top-0 backdrop-blur-md z-10 border-b border-white/10 shrink-0">
           <h3 className="text-white font-bold text-lg flex justify-between items-center">
             <span>🏆 得獎名單</span>
             <span className="text-xs bg-yellow-500 text-black px-3 py-1 rounded-full font-black">
                {currentWinners.length}/{currentRound.winnerCount}
             </span>
           </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
           {currentWinners.map((w, idx) => (
              <div key={w.id} className="relative bg-gradient-to-r from-yellow-100 to-white p-4 rounded-xl shadow-md border-l-8 border-yellow-500 group animate-in slide-in-from-left">
                <div className="flex items-center gap-4">
                  <span className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 shadow-sm">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 text-xl lg:text-2xl truncate tracking-tight">
                      {w.className ? (
                        <span className="flex flex-col">
                          <span className="text-[10px] uppercase text-gray-500 font-bold leading-none mb-1">{w.className}</span>
                          <span className="truncate">{w.name}</span>
                        </span>
                      ) : w.name}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeWinner(w.id, true)}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-red-800 hover:bg-red-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs transition-opacity shadow-md"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {currentWinners.length === 0 && (
              <div className="text-white/30 text-center py-8 text-sm italic border-2 border-dashed border-white/10 rounded-2xl">
                尚未抽出得獎者
              </div>
            )}
            
            {/* New Fairness Visualization Dashboard */}
            <FairnessDashboard 
              allMembers={allRoundMembers}
              currentWinners={currentWinners}
              targetDistribution={targetDistribution}
            />
            
            {roundCompleted && (
               <div className="mt-4 p-5 bg-green-500/20 border-2 border-green-400 rounded-2xl text-center backdrop-blur-sm shadow-xl">
                  <div className="text-green-300 font-black mb-3 text-xl">🎉 回合完成！</div>
                  {currentRoundId < 17 && (
                    <button 
                      onClick={() => switchRound(currentRoundId + 1)}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-black text-lg transition-all w-full shadow-lg hover:scale-105 active:scale-95"
                    >
                      下一回合 ➜
                    </button>
                  )}
               </div>
            )}
        </div>
      </div>

      {/* RIGHT PANEL: WHEEL */}
      <div className="order-1 lg:order-2 flex-1 h-3/4 lg:h-full flex flex-col relative z-20">
         <div className={`w-full p-2 bg-black/10 backdrop-blur-sm flex flex-wrap justify-center gap-1 lg:gap-4 z-50 transition-transform duration-300 ${showRoundSelector ? 'translate-y-0' : '-translate-y-full absolute'}`}>
            {STAGE_GROUPS.map((group, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-0.5 lg:px-3 lg:py-1">
                <span className="text-white font-bold text-[10px] lg:text-sm mr-1">{group.label}</span>
                {group.rounds.map((rId, i) => {
                  const isCompleted = winners.filter(w => Number(w.roundId) === Number(rId)).length >= (ROUNDS.find(r => r.id === rId)?.winnerCount || 0);
                  const isActive = rId === currentRoundId;
                  return (
                    <button
                      key={rId}
                      onClick={() => !isSpinning && switchRound(rId)}
                      disabled={isSpinning}
                      className={`
                        w-5 h-5 lg:w-8 lg:h-8 rounded-full text-[10px] lg:text-xs font-bold transition-all border relative
                        ${isActive 
                          ? 'bg-yellow-400 border-yellow-600 text-yellow-900 scale-110 shadow-lg' 
                          : isCompleted 
                            ? 'bg-gray-400/50 border-gray-400 text-white/50' 
                            : 'bg-white/20 border-white/40 text-white hover:bg-white/40'}
                      `}
                    >
                      {group.letters[i]}
                      {isCompleted && (
                        <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[8px] lg:text-[10px] w-3 h-3 lg:w-4 lg:h-4 rounded-full flex items-center justify-center shadow-md font-black border border-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
         </div>

         <div className="flex-1 flex flex-col items-center justify-center p-2 lg:p-4 min-h-0">
             <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
               <LuckyWheel 
                 className="h-[85vh] w-[85vh] max-h-[75vw] max-w-[90vw]"
                 entries={currentParticipants}
                 onSpinEnd={handleSpinEnd}
                 onTryStart={handleTryStartSpin}
                 isSpinning={isSpinning}
                 setIsSpinning={setIsSpinning}
                 targetDistribution={targetDistribution}
                 currentWinners={currentWinners}
                 fontSizeMultiplier={nameFontSizeMultiplier}
               />
             </div>
         </div>
      </div>

      <div className="fixed top-20 lg:top-24 right-4 z-40 flex flex-col gap-2 pointer-events-none items-end">
         <button 
          onClick={toggleMusic}
          className={`${isMusicEnabled ? 'bg-green-500' : 'bg-red-500'} text-white w-10 h-10 lg:w-12 lg:h-12 rounded-full shadow-lg transition flex items-center justify-center pointer-events-auto group`}
        >
          <span className={`text-xl lg:text-2xl ${isMusicEnabled ? 'animate-pulse' : ''}`}>{isMusicEnabled ? '🎵' : '🔇'}</span>
        </button>

         <button 
          onClick={() => { safeSound(playClick); setShowParticipants(!showParticipants); }}
          className="bg-indigo-600 text-white px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-bold shadow-lg hover:bg-indigo-700 transition pointer-events-auto"
        >
          {showParticipants ? '隱藏名單' : '管理參加者'}
        </button>
         <button 
          onClick={() => { safeSound(playClick); setShowRoundSelector(!showRoundSelector); }}
          className="bg-indigo-600 text-white px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-bold shadow-lg hover:bg-indigo-700 transition pointer-events-auto"
        >
          {showRoundSelector ? '隱藏選單' : '顯示選單'}
        </button>
      </div>

      {showParticipants && (
        <ParticipantPanel 
          title={currentRound.className}
          participants={currentParticipants}
          onAdd={handleBulkAdd}
          onRemove={handleRemoveParticipant}
          onClear={handleClearRound}
          onClearGlobal={handleClearGlobal}
          onShowSummary={() => { safeSound(playClick); setShowSummary(true); }}
          onClose={() => { safeSound(playClick); setShowParticipants(false); }}
          fontSizeMultiplier={nameFontSizeMultiplier}
          onFontSizeChange={setNameFontSizeMultiplier}
          captionFontSizeMultiplier={captionFontSizeMultiplier}
          onCaptionFontSizeChange={setCaptionFontSizeMultiplier}
          snowfallIntensity={snowfallIntensity}
          onSnowfallIntensityChange={setSnowfallIntensity}
        />
      )}

      {winnerModalOpen && pendingWinner && (
        <WinnerBanner 
          winner={pendingWinner} 
          onKeep={() => confirmWinner(false)}
          onRemove={() => confirmWinner(true)}
        />
      )}

      {quotaWarningOpen && (
        <QuotaWarningModal 
          currentCount={currentWinners.length}
          targetCount={currentRound.winnerCount}
          onContinue={startSpinning}
          onBack={() => setQuotaWarningOpen(false)}
        />
      )}

      {showSummary && (
        <SummaryModal 
          rounds={ROUNDS} 
          winners={winners} 
          onClose={() => setShowSummary(false)} 
        />
      )}
    </div>
  );
};

export default App;
