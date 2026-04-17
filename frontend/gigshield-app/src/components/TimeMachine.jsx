import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, AlertOctagon, Info, CloudRain, Sun } from 'lucide-react';

export default function TimeMachine() {
  const [hoursFuture, setHoursFuture] = useState(0);

  const getRiskLevel = (hrs) => {
    if (hrs === 0) return { type: 'safe', label: 'Current Timeline - 0 hrs', desc: "Standard ML Risk: Low. Skies are clear.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]", icon: <Sun className="text-yellow-400" /> };
    if (hrs <= 3) return { type: 'warning', label: `Predicted Timeline: +${hrs} hours`, desc: "Barometric drop detected. 65% chance of severe waterlogging in your grid.", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]", icon: <Info className="text-yellow-400" /> };
    if (hrs <= 6) return { type: 'danger', label: `Predicted Timeline: +${hrs} hours`, desc: "CRITICAL: Level 4 Cyclone trajectory confirmed. Expected loss ratio spikes. AI strongly advises micro-coverage top-up.", color: "text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]", icon: <AlertTriangle className="text-red-400" /> };
    return { type: 'disaster', label: `Predicted Timeline: +${hrs} hours`, desc: "SYSTEM OFFLINE: Severe flooding in progress. Payouts automatically scaling.", color: "text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]", icon: <AlertOctagon className="text-purple-400" /> };
  };

  const currentRisk = getRiskLevel(hoursFuture);

  const handleChange = (e) => {
    setHoursFuture(parseInt(e.target.value));
    
    // Dispatch a global event so other components (like Weather/Forecast) can listen and visually "storm up"
    window.dispatchEvent(new CustomEvent('time-machine-update', { detail: { hours: parseInt(e.target.value) } }));
  };

  return (
    <motion.div 
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       className={`glass-panel p-6 rounded-[2rem] border transition-all duration-700 ${currentRisk.color} relative overflow-hidden`}
    >
      {/* Background intensity based on future slide */}
      <div 
         className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/60 pointer-events-none transition-opacity duration-700 z-0"
         style={{ opacity: hoursFuture / 12 }} 
      />
      {hoursFuture > 3 && (
         <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] mix-blend-overlay z-0 animate-pulse"></div>
      )}

      <div className="relative z-10 flex justify-between items-start mb-6">
         <div>
            <h3 className="text-xl font-bold font-mono tracking-tight flex items-center">
              <Clock size={20} className="mr-2" /> 
              Temporal Risk Engine
            </h3>
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mt-1">AI Predictive Forecast Model</div>
         </div>
         <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 font-bold backdrop-blur-md flex items-center">
           {currentRisk.icon} <span className="ml-2">{hoursFuture === 0 ? 'LIVE' : `+${hoursFuture}h`}</span>
         </div>
      </div>

      <div className="relative z-10 mb-8 mt-2 px-2">
        <input 
          type="range" 
          min="0" max="12" step="1" 
          value={hoursFuture} 
          onChange={handleChange}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-current" 
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2 font-mono">
           <span>NOW</span>
           <span>+3h</span>
           <span>+6h</span>
           <span>+9h</span>
           <span>+12h</span>
        </div>
      </div>

      <div className="relative z-10 bg-black/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm min-h-[100px] flex flex-col justify-center">
         <h4 className="font-bold text-sm mb-1">{currentRisk.label}</h4>
         <p className="text-sm opacity-90 leading-snug font-medium">
           {currentRisk.desc}
         </p>
         
         {hoursFuture > 3 && (
            <motion.button 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="mt-4 text-xs font-bold uppercase tracking-widest bg-current text-slate-900 border-none px-4 py-2 rounded-xl"
            >
               Purchase Micro-Topup (₹3)
            </motion.button>
         )}
      </div>

    </motion.div>
  );
}
