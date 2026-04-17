import React, { useState, useEffect } from 'react';
import { WifiOff, Radio, Smartphone, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MeshRadar({ isOfflineMode=false }) {
  const [offline, setOffline] = useState(isOfflineMode);
  const [stage, setStage] = useState('idle'); // idle, scanning, connected, sent
  
  const triggerOfflineSOS = () => {
    setOffline(true);
    setStage('scanning');

    setTimeout(() => {
      setStage('connected');
      setTimeout(() => {
        setStage('sent');
        setTimeout(() => {
          setOffline(false);
          setStage('idle');
        }, 3000);
      }, 2000);
    }, 3000);
  };

  return (
    <div className={`glass-panel p-6 rounded-[2rem] border overflow-hidden relative shadow-lg transition-all duration-500 min-h-[280px] ${
       offline ? 'bg-slate-900 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-white/5 bg-slate-900/40'
    }`}>
      
      {/* Background Radar Rings when scanning */}
      {stage === 'scanning' && (
         <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none z-0">
            {[1, 2, 3].map((i) => (
               <motion.div 
                 key={i}
                 initial={{ scale: 0, opacity: 0.8 }}
                 animate={{ scale: 3, opacity: 0 }}
                 transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.8 }}
                 className="absolute w-32 h-32 rounded-full border-2 border-blue-500"
               />
            ))}
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-[spin_3s_linear_infinite]" />
         </div>
      )}

      {/* Background Mesh Grid */}
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

      <div className="relative z-10">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center text-white">
              <Radio size={20} className={`mr-2 ${offline ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
              Mesh Relay SOS
            </h3>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border ${
              offline ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              Bluetooth / P2P
            </span>
         </div>

         <p className="text-sm text-slate-400 mb-6 max-w-[280px]">
           If cellular drops (e.g. floods/curfews), lodge claims securely via nearby rider's device bridges. 
         </p>

         <AnimatePresence mode="wait">
            {stage === 'idle' && (
               <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <button 
                    onClick={triggerOfflineSOS}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl border border-slate-600 transition flex items-center justify-center shadow-md"
                 >
                    <WifiOff size={18} className="mr-2" /> SIMULATE OFFLINE SOS
                 </button>
               </motion.div>
            )}

            {stage === 'scanning' && (
               <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-4">
                 <Smartphone size={32} className="text-blue-400 animate-bounce mb-3" />
                 <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Cellular Dead. Scanning Mesh...</p>
                 <p className="text-[10px] font-mono text-slate-400">Pinging nearby peers over BLE...</p>
               </motion.div>
            )}

            {stage === 'connected' && (
               <motion.div key="connect" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-xl">
                 <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-white">Node: Zomato_12XA</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Encrypted Link ✓</span>
                 </div>
                 <div className="h-1 bg-slate-800 w-full rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-blue-500" />
                 </div>
                 <p className="text-[10px] text-center mt-2 text-slate-400">Bridging Claim Payload through Peer...</p>
               </motion.div>
            )}

            {stage === 'sent' && (
               <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-4">
                 <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-3">
                    <CheckCircle size={24} className="text-emerald-400" />
                 </div>
                 <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-1">Payload Sent Successfully</p>
                 <p className="text-[10px] font-mono text-slate-400">Relayed via 3 peers to RahatPay Central</p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
}
