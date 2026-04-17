import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Hexagon, Verify, MapIcon } from 'lucide-react';

export default function HolographicPassport({ worker }) {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to the element (0 to 1)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Convert to degrees (-10 to 10 for a subtle 3D tilt)
    const rotateY = (x - 0.5) * 25; 
    const rotateX = (0.5 - y) * 25;

    setRotation({ x: rotateX, y: rotateY });
    
    // Glare position follows mouse
    setGlare({ x: x * 100, y: y * 100, opacity: 0.8 });
  };

  const handleMouseLeave = () => {
    // Snap back to 0
    setRotation({ x: 0, y: 0 });
    setGlare({ ...glare, opacity: 0 });
  };

  // Determine styling based on trust tier
  let themeColor = 'from-brand-500 to-indigo-600';
  let badgeLabel = 'Standard Rider';
  let strokeColor = 'stroke-indigo-400';
  
  if (worker.trust_tier === 'PLATINUM') {
    themeColor = 'from-purple-500 via-fuchsia-400 to-indigo-500';
    badgeLabel = 'Elite Veteran';
    strokeColor = 'stroke-purple-300';
  } else if (worker.trust_tier === 'GOLD') {
    themeColor = 'from-yellow-400 via-amber-500 to-orange-500';
    badgeLabel = 'Verified Pro';
    strokeColor = 'stroke-yellow-200';
  } else if (worker.trust_tier === 'SILVER') {
    themeColor = 'from-slate-300 via-slate-400 to-slate-500';
    badgeLabel = 'Trusted Driver';
    strokeColor = 'stroke-slate-200';
  }

  return (
    <div className="w-full flex justify-center perspective-[1200px]">
      <motion.div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
          transition: { type: 'spring', stiffness: 200, damping: 20, mass: 0.5 }
        }}
        className={`relative w-full max-w-4xl h-64 md:h-52 rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br ${themeColor} group preserve-3d cursor-crosshair`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Holographic Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-30 z-0"></div>
        
        {/* Dynamic Glare */}
        <div 
          className="absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 mix-blend-soft-light"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
            opacity: glare.opacity
          }}
        />

        {/* Card Content - elevated for 3D depth */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row h-full justify-between translate-z-12 items-center" style={{ transform: 'translateZ(40px)' }}>
          
          <div className="flex items-center space-x-6 w-full md:w-auto">
             {/* Profile Avatar with Trust Arc */}
             <div className="relative w-24 h-24 shrink-0 drop-shadow-2xl">
               <div className="absolute inset-0 bg-white/10 rounded-2xl blur-lg animate-pulse" />
               <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-[1.15]" style={{ transform: 'translateZ(20px)' }}>
                  <circle cx="48" cy="48" r="42" fill="none" strokeWidth="8" className="stroke-black/20" />
                  <circle cx="48" cy="48" r="42" fill="none" strokeWidth="6" strokeDasharray="264" strokeDashoffset={264 - (264 * (worker.trust_score / 100))} className={`${strokeColor} drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]`} strokeLinecap="round" />
               </svg>
               <img src={`https://ui-avatars.com/api/?name=${worker.name}&background=random&size=128&rounded=false`} alt="avatar" className="w-full h-full object-cover rounded-2xl border-2 border-white/50" />
             </div>

             <div className="flex flex-col text-white transform-gpu" style={{ transform: 'translateZ(30px)' }}>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md flex items-center">
                  {worker.name}
                  {(worker.trust_tier === 'PLATINUM' || worker.trust_tier === 'GOLD') && (
                     <span className="ml-2 bg-white/20 p-1 rounded-full backdrop-blur-md border border-white/40"><ShieldAlert size={20} className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,1)]" /></span>
                  )}
                </h1>
                <div className="flex items-center space-x-3 mt-1.5 opacity-90 font-medium tracking-wide">
                   <span className="font-mono bg-black/30 px-2.5 py-0.5 rounded-lg border border-white/10 uppercase drop-shadow-xl text-sm">#{worker.token}</span>
                   <span className="capitalize text-sm bg-white/10 backdrop-blur-sm px-2.5 py-0.5 rounded-lg border border-white/20 shadow-inner">{worker.platform} Partner</span>
                </div>
                <div className="flex items-center mt-3 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full shadow-lg border border-white/10">
                   <MapIcon size={14} className="mr-1.5" /> Operations: {worker.zone}
                </div>
             </div>
          </div>

          <div className="hidden md:flex flex-col items-end transform-gpu" style={{ transform: 'translateZ(50px)' }}>
             <div className="w-16 h-16 opacity-30 mb-2">
                <Hexagon size={64} className="text-white drop-shadow-lg" />
             </div>
             <p className="text-white/80 font-mono text-xs uppercase tracking-[0.2em] font-bold">RahatPay Digital Identity</p>
             <div className="bg-white text-slate-900 font-black px-4 py-1.5 rounded-full text-xs mt-2 uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                Status: Insured
             </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
