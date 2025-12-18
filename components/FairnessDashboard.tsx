
import React from 'react';
import { Participant, Winner } from '../types';

interface FairnessDashboardProps {
  allMembers: Participant[];
  currentWinners: Winner[];
  targetDistribution: Record<string, number>;
}

export const FairnessDashboard: React.FC<FairnessDashboardProps> = ({
  allMembers,
  currentWinners,
  targetDistribution
}) => {
  if (allMembers.length === 0) return null;

  // Group all members by class to calculate population percentages
  const classStats = Object.keys(targetDistribution).map(className => {
    const population = allMembers.filter(m => (m.className || 'Unknown') === className).length;
    const wins = currentWinners.filter(w => (w.className || 'Unknown') === className).length;
    const target = targetDistribution[className];
    const percentage = ((population / allMembers.length) * 100).toFixed(1);
    
    return {
      className,
      population,
      wins,
      target,
      percentage,
      isMet: wins >= target
    };
  }).sort((a, b) => b.population - a.population);

  return (
    <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-black text-sm tracking-widest uppercase flex items-center gap-2">
          <span className="text-lg">⚖️</span> 公平分配概覽
        </h4>
        <div className="group relative">
           <span className="cursor-help text-xs text-white/50 border border-white/20 rounded-full w-4 h-4 flex items-center justify-center font-serif">i</span>
           <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black/90 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10">
             使用最大餘額法（Hamilton Method）按班別人口比例預算獲獎名額。
           </div>
        </div>
      </div>

      <div className="space-y-3">
        {classStats.map(stat => (
          <div key={stat.className} className="space-y-1">
            <div className="flex justify-between items-end text-[10px]">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{stat.className}</span>
                <span className="text-white/40 font-medium">({stat.percentage}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`${stat.isMet ? 'text-yellow-400' : 'text-green-400'} font-black`}>
                  {stat.wins} / {stat.target}
                </span>
                {stat.isMet ? (
                  <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1 rounded border border-yellow-500/30">已滿</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
            </div>
            
            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full ${stat.isMet ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-indigo-500 to-green-400'}`}
                style={{ width: `${Math.min(100, (stat.wins / stat.target) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-[9px] text-white/30 italic text-center">
        * 抽獎時將優先由未達標之班別中隨機選出。
      </div>
    </div>
  );
};
