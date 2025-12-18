
import React, { useRef, useState, useEffect } from 'react';
import { Participant } from '../types';
import { playClick } from '../utils/soundUtils';

interface ParticipantPanelProps {
  title: string;
  participants: Participant[];
  onAdd: (input: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClearGlobal: () => void;
  onShowSummary: () => void;
  onClose: () => void;
  fontSizeMultiplier: number;
  onFontSizeChange: (val: number) => void;
  captionFontSizeMultiplier: number;
  onCaptionFontSizeChange: (val: number) => void;
  snowfallIntensity: number;
  onSnowfallIntensityChange: (val: number) => void;
}

export const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  title,
  participants,
  onAdd,
  onRemove,
  onClear,
  onClearGlobal,
  onShowSummary,
  onClose,
  fontSizeMultiplier,
  onFontSizeChange,
  captionFontSizeMultiplier,
  onCaptionFontSizeChange,
  snowfallIntensity,
  onSnowfallIntensityChange
}) => {
  const [bulkInput, setBulkInput] = useState('');
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // CRITICAL: Ignore drag if clicking on interaction elements
    if (target.closest('button') || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.classList.contains('resize-handle')) return;
    
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    isDragging.current = true;
    
    if (!position) {
      setPosition({ x: rect.left, y: rect.top });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        const maxX = window.innerWidth - 50;
        const maxY = window.innerHeight - 50;
        
        setPosition({
          x: Math.min(Math.max(0, newX), maxX),
          y: Math.min(Math.max(0, newY), maxY)
        });
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleAddClick = () => {
    if (bulkInput.trim()) {
      onAdd(bulkInput);
      setBulkInput('');
    }
  };

  const startRemovalAnimation = (id: string) => {
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      onRemove(id);
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const stopProp = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div 
      ref={panelRef}
      onMouseDown={handleMouseDown}
      style={{
        ...(position ? { left: position.x, top: position.y } : { right: '20px', top: '100px' }),
        position: 'fixed',
        resize: 'vertical',
        overflow: 'hidden',
        minHeight: '400px',
        maxHeight: '85vh',
        height: '750px' 
      }}
      className="w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 flex flex-col z-50 transition-shadow hover:shadow-orange-500/20"
    >
       <style>{`
         @keyframes itemExit {
           from { opacity: 1; transform: translateX(0); }
           to { opacity: 0; transform: translateX(40px); }
         }
         .participant-exit {
           animation: itemExit 0.3s ease-in forwards;
           pointer-events: none;
         }
       `}</style>

       {/* Header */}
       <div 
         className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center cursor-move select-none shrink-0"
       >
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm lg:text-base">
              📝 管理參加者
            </h3>
            <span className="text-[10px] lg:text-xs text-indigo-600 font-bold">{title} ({participants.length})</span>
          </div>
          <div className="flex gap-1" onMouseDown={e => e.stopPropagation()}>
            <button 
              onClick={stopProp(onShowSummary)}
              className="text-blue-600 hover:bg-blue-100 p-1.5 lg:p-2 rounded transition"
              title="綜合名單"
            >
              📋
            </button>
            <button 
              onClick={stopProp(onClose)}
              className="text-gray-400 hover:text-gray-600 p-1.5 lg:p-2 rounded transition"
              title="隱藏"
            >
              ✕
            </button>
          </div>
       </div>
       
       {/* Content */}
       <div className="p-4 flex-1 overflow-hidden flex flex-col gap-3 min-h-0">
           
           {/* Festive Settings */}
           <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex flex-col gap-3 shrink-0">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">輪盤文字大小</span>
                   <span className="text-[10px] font-black text-indigo-800 bg-white px-1.5 py-0.5 rounded shadow-sm">{fontSizeMultiplier.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={fontSizeMultiplier}
                  onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5 border-t border-indigo-200/50 pt-2">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">標題文字大小</span>
                   <span className="text-[10px] font-black text-indigo-800 bg-white px-1.5 py-0.5 rounded shadow-sm">{captionFontSizeMultiplier.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.3" 
                  max="2.5" 
                  step="0.1" 
                  value={captionFontSizeMultiplier}
                  onChange={(e) => onCaptionFontSizeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                />
              </div>

              <div className="space-y-1.5 border-t border-indigo-200/50 pt-2">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">降雪強度</span>
                   <span className="text-[10px] font-black text-indigo-800 bg-white px-1.5 py-0.5 rounded shadow-sm">{snowfallIntensity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={snowfallIntensity}
                  onChange={(e) => onSnowfallIntensityChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
           </div>

           {/* Input Section */}
           <div className="bg-white p-3 rounded-xl shadow-inner border border-gray-200 flex flex-col gap-2 shrink-0" onMouseDown={e => e.stopPropagation()}>
             <div className="text-[10px] text-indigo-500 font-bold">💡 格式：班別標題 + 名字列表</div>
             <textarea
               value={bulkInput}
               onChange={(e) => setBulkInput(e.target.value)}
               placeholder={`格式範例：\n初小 A\n陳大文\n李小明\n高小 B\n張三`}
               className="w-full text-xs outline-none resize-none h-20 bg-transparent p-1 border rounded border-gray-100"
             />
             <div className="flex gap-2">
                <button 
                  onClick={stopProp(handleAddClick)}
                  disabled={!bulkInput.trim()}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-bold py-1.5 rounded-lg transition text-xs shadow-sm"
                >
                  智能匯入
                </button>
             </div>
           </div>

           {/* Global Management Buttons */}
           <div className="grid grid-cols-2 gap-2 shrink-0" onMouseDown={e => e.stopPropagation()}>
              <button 
                onClick={stopProp(onClear)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] lg:text-xs font-bold py-2 rounded-lg transition shadow-sm flex items-center justify-center gap-1"
                title="清除目前顯示回合的所有參加者"
              >
                🗑️ 清空本回合
              </button>
              <button 
                onClick={stopProp(onClearGlobal)}
                className="bg-red-600 hover:bg-red-700 text-white text-[10px] lg:text-xs font-bold py-2 rounded-lg transition shadow-sm flex items-center justify-center gap-1"
                title="清空所有 17 個回合的所有參加者"
              >
                🔥 清空全 17 回合
              </button>
           </div>

           {/* List Section */}
           <div className="flex-1 flex flex-col gap-2 min-h-0" onMouseDown={e => e.stopPropagation()}>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">參加者名單: {title}</div>
              
              <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 scrollbar-thin">
                {participants.length === 0 && (
                   <div className="text-center text-gray-400 text-xs py-6 italic flex flex-col items-center gap-1">
                     <span>📭</span>
                     <span>此回合暫無參加者</span>
                   </div>
                )}
                
                {participants.map(p => (
                  <div 
                    key={p.id} 
                    className={`flex justify-between items-center bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm text-xs group hover:border-indigo-300 transition ${removingIds.has(p.id) ? 'participant-exit' : ''}`}
                  >
                     <div className="flex items-center gap-2 overflow-hidden">
                       <span className="truncate font-medium text-gray-700">{p.name}</span>
                     </div>
                     <button 
                       onClick={stopProp(() => startRemovalAnimation(p.id))}
                       className="text-gray-300 hover:text-red-500 hover:bg-red-50 w-5 h-5 rounded flex items-center justify-center font-bold transition"
                       title="移除"
                     >
                       ×
                     </button>
                  </div>
                ))}
              </div>
           </div>
       </div>

       {/* Resize Handle Indicator */}
       <div className="h-1.5 w-full bg-gray-100 flex justify-center items-center pointer-events-none shrink-0 border-t border-gray-200">
         <div className="w-8 h-1 bg-gray-300 rounded-full" />
       </div>
    </div>
  );
};
