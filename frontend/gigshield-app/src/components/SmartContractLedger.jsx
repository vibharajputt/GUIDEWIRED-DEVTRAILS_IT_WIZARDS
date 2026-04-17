import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Lock, Cpu, Server } from 'lucide-react';

export default function SmartContractLedger({ claims = [] }) {
  const [blocks, setBlocks] = useState([]);

  // Mock generative SHA-256 style hashes
  const generateHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 40; i++) hash += chars[Math.floor(Math.random() * chars.length)];
    return hash;
  };

  useEffect(() => {
    // Convert existing claims into "minted blocks"
    const parsedBlocks = claims.slice(0, 10).map((c, i) => ({
      id: c.id,
      hash: generateHash(),
      gas: (Math.random() * 0.05 + 0.001).toFixed(4),
      amount: c.claim_amount || c.payout_amount || 0,
      status: c.status,
      timestamp: new Date().getTime() - i * 50000,
    }));
    setBlocks(parsedBlocks);
  }, []);

  useEffect(() => {
    // If incoming claims prop changes, mint a new block to showcase dynamic updates.
    if (claims.length > 0 && blocks.length > 0) {
      const topClaim = claims[0];
      if (blocks[0] && topClaim.id !== blocks[0].id) {
         const newBlock = {
           id: topClaim.id,
           hash: generateHash(),
           gas: (Math.random() * 0.05 + 0.001).toFixed(4),
           amount: topClaim.claim_amount || topClaim.payout_amount || 0,
           status: topClaim.status,
           timestamp: new Date().getTime(),
         };
         setBlocks(prev => [newBlock, ...prev].slice(0, 10));
      }
    }
  }, [claims]);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden h-[360px] flex flex-col">
      {/* Background Matrix/Web3 Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 opacity-[0.03]">
        <Hexagon size={250} />
      </div>

      <div className="flex justify-between items-center mb-4 relative z-10">
         <h3 className="text-xl font-bold text-white flex items-center font-mono">
           <Cpu className="text-emerald-400 mr-2" size={20} /> Smart Contract Payout Ledger
         </h3>
         <div className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" /> Live Node
         </div>
      </div>
      
      <div className="grid grid-cols-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono border-b border-white/10 pb-2 mb-2 relative z-10">
         <span>Tx Hash</span>
         <span>Contract Size</span>
         <span>Gas Fee</span>
         <span className="text-right">Execution</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 relative z-10 custom-scrollbar">
         <AnimatePresence>
            {blocks.map((block) => (
              <motion.div 
                key={block.id}
                initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-4 items-center text-xs font-mono p-3 rounded-xl border border-white/5 hover:bg-white/5 transition group"
              >
                 <div className="col-span-1 flex items-center overflow-hidden">
                    <Lock size={12} className="text-slate-500 mr-2 flex-shrink-0 group-hover:text-emerald-400 transition" />
                    <span className="text-slate-400 truncate w-32 cursor-help" title={block.hash}>
                      {block.hash.substring(0, 12)}...
                    </span>
                 </div>
                 <div className="text-white font-bold">
                    ₹{block.amount}.00
                 </div>
                 <div className="text-slate-500">
                    <span className="text-emerald-500/50">ETH</span> {block.gas}
                 </div>
                 <div className="text-right">
                    <span className="bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold border border-emerald-500/30">
                       EXECUTED
                    </span>
                 </div>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] text-slate-500 font-mono relative z-10 uppercase tracking-widest">
         <div className="flex items-center"><Server size={12} className="mr-1" /> Node: Polygon PoS</div>
         <div>Latency: 42ms</div>
      </div>
    </div>
  );
}
