
import React from 'react';
import { Participant, Winner, RoundConfig } from '../types';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const ModalOverlay: React.FC<ModalProps> = ({ onClose, children }) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// --- Quota Warning Modal ---

interface QuotaWarningModalProps {
  onContinue: () => void;
  onBack: () => void;
  currentCount: number;
  targetCount: number;
}

export const QuotaWarningModal: React.FC<QuotaWarningModalProps> = ({ onContinue, onBack, currentCount, targetCount }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border-4 border-orange-400 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />
        
        <div className="text-6xl mb-6 animate-bounce">⚠️</div>
        
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-4">
          名額已滿！
        </h2>
        
        <p className="text-gray-600 mb-8 font-medium leading-relaxed">
          目前已抽中 <span className="text-orange-600 font-black">{currentCount}</span> 位，<br/>
          已達到本回合預設名額 (<span className="font-bold">{targetCount}</span>)。<br/>
          請問要繼續抽獎嗎？
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onContinue} 
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white text-xl font-black rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            繼續抽獎 (額外名額)
          </button>
          <button 
            onClick={onBack} 
            className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-bold rounded-2xl transition-all"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Winner Banner ---

interface WinnerBannerProps {
  winner: Participant;
  onKeep: () => void;
  onRemove: () => void;
}

export const WinnerBanner: React.FC<WinnerBannerProps> = ({ winner, onKeep, onRemove }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-gradient-to-br from-[#ff6b6b] via-[#ffd700] to-[#4ecdc4] p-10 md:p-16 rounded-[3rem] text-center shadow-2xl border-8 border-white relative overflow-hidden max-w-2xl w-full">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-md tracking-widest uppercase">🎊 得獎者 🎊</h2>
        
        <div className="text-6xl md:text-8xl font-black text-white drop-shadow-lg mb-4 tracking-wider">
          {winner.name}
        </div>
        
        {winner.className && (
          <div className="inline-block bg-black/20 text-white text-2xl md:text-3xl font-bold px-8 py-2 rounded-full mb-8 backdrop-blur-sm">
            {winner.className}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8 relative z-10">
          <button onClick={onKeep} className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">
            保留並繼續
          </button>
          <button onClick={onRemove} className="px-8 py-3 bg-[#8B4513] hover:bg-[#654321] text-white text-xl font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">
            從輪盤移除
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Summary Modal ---

interface SummaryModalProps {
  rounds: RoundConfig[];
  winners: Winner[];
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ rounds, winners, onClose }) => {
  const exportCSV = () => {
    let csv = "回合,班級,姓名\n";
    rounds.forEach(round => {
      const roundWinners = winners.filter(w => w.roundId === round.id);
      roundWinners.forEach(w => {
        csv += `${round.title.split(':')[0]},${w.className},${w.name}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '聖誕抽獎名單.csv';
    link.click();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">📋 綜合名單</h2>
          <button onClick={onClose} className="text-white bg-white/20 hover:bg-white/40 px-4 py-1 rounded-full font-bold transition">✕ 關閉</button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 bg-gray-50">
          {rounds.map(round => {
            const roundWinners = winners.filter(w => w.roundId === round.id);
            if (roundWinners.length === 0) return null;
            
            return (
              <div key={round.id} className="mb-8 border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{round.title.split(':')[0]}</h3>
                  <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-black">{roundWinners.length} 位</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {roundWinners.map((w, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-200 p-4 rounded-xl shadow-sm hover:border-yellow-400 transition-colors">
                      <div className="text-[10px] text-gray-500 font-black mb-1">得獎順序 #{idx + 1}</div>
                      <div className="text-2xl font-black text-gray-900 leading-tight mb-1">{w.name}</div>
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">{w.className}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {winners.length === 0 && <div className="text-center text-gray-500 py-10 font-bold text-lg italic">尚無得獎者產生</div>}
        </div>

        <div className="p-6 bg-gray-100 border-t flex justify-center gap-4">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-transform hover:-translate-y-1">🖨️ 列印名單</button>
          <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-transform hover:-translate-y-1">💾 匯出 CSV</button>
        </div>
      </div>
    </ModalOverlay>
  );
};
