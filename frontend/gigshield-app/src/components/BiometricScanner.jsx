import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanFace, Activity, ShieldCheck } from 'lucide-react';

export default function BiometricScanner({ onScanComplete }) {
  const videoRef = useRef(null);
  const [scanStatus, setScanStatus] = useState('requesting'); // requesting, scanning, processing, success
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setScanStatus('scanning');
      } catch (err) {
        console.error("Camera access denied", err);
        // Fallback or bypass instantly for lack of hardware during hackathon demo
        setScanStatus('processing');
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (scanStatus === 'scanning') {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setScanStatus('processing');
            return 100;
          }
          return p + 2.5; // Approx 4 seconds scan
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [scanStatus]);

  useEffect(() => {
    if (scanStatus === 'processing') {
      setTimeout(() => {
        setScanStatus('success');
      }, 1500);
    }
  }, [scanStatus]);

  if (scanStatus === 'success') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center border border-emerald-500/30">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
           <ShieldCheck size={48} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Verified</h2>
        <div className="mt-4 flex space-x-6 text-center">
            <div>
               <div className="text-xs text-slate-400 font-mono">Heart Rate</div>
               <div className="text-xl text-emerald-400 font-bold font-mono">72 BPM</div>
            </div>
            <div>
               <div className="text-xs text-slate-400 font-mono">Stress Index</div>
               <div className="text-xl text-emerald-400 font-bold font-mono">0.14</div>
            </div>
        </div>
        <p className="mt-6 text-sm text-slate-300 font-medium bg-white/5 px-4 py-2 rounded-lg">
           Fatigue map optimized. Safe riding!
        </p>
        <button 
           onClick={onScanComplete}
           className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-10 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] transition"
        >
           Start Shift
        </button>
      </motion.div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black rounded-3xl z-40 overflow-hidden flex flex-col">
       {/* Camera Feed */}
       <video 
         ref={videoRef} 
         autoPlay 
         playsInline 
         muted 
         className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[30%] contrast-125"
       />
       
       {/* Grid Overlay */}
       <div className="absolute inset-0 border-[6px] border-black pointer-events-none rounded-3xl z-10" />
       <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 128, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 128, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }} />

       {/* Scanner Reticle */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-brand-500/50 rounded-lg pointer-events-none z-20 flex items-center justify-center">
          <div className="w-4 h-4 border-t-2 border-l-2 border-brand-400 absolute top-0 left-0" />
          <div className="w-4 h-4 border-t-2 border-r-2 border-brand-400 absolute top-0 right-0" />
          <div className="w-4 h-4 border-b-2 border-l-2 border-brand-400 absolute bottom-0 left-0" />
          <div className="w-4 h-4 border-b-2 border-r-2 border-brand-400 absolute bottom-0 right-0" />
          <ScanFace size={64} className={`text-brand-500/30 ${scanStatus === 'scanning' ? 'animate-pulse' : ''}`} />
       </div>

       {/* Scanning Laser Line */}
       <motion.div 
         className="absolute left-0 right-0 h-0.5 bg-brand-400 shadow-[0_0_10px_#818cf8,0_0_20px_#818cf8] z-30 pointer-events-none"
         animate={{ top: ['10%', '90%', '10%'] }}
         transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
       />

       {/* HUD UI Elements */}
       <div className="relative z-30 p-6 flex justify-between tracking-widest">
         <div className="text-brand-400 font-mono text-xs font-bold bg-black/50 px-2 py-1 rounded">SYS.VITAL.SCAN</div>
         <div className="text-brand-400 font-mono text-xs font-bold bg-black/50 px-2 py-1 rounded animate-pulse w-24 text-right">
            {scanStatus === 'requesting' ? 'INIT' : scanStatus === 'scanning' ? 'REC' : 'PRC' }
         </div>
       </div>

       {/* Bottom Progress UI */}
       <div className="absolute bottom-6 left-6 right-6 z-30">
         <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
               <h3 className="text-white text-sm font-bold flex items-center font-mono">
                 <Activity size={16} className="text-brand-400 mr-2" />
                 {scanStatus === 'processing' ? 'Computing Fatigue Matrix...' : 'Analyzing PPG Vitals...'}
               </h3>
            </div>
            <div className="text-brand-400 font-mono font-bold text-xl">{Math.round(progress)}%</div>
         </div>
       </div>
    </div>
  );
}
