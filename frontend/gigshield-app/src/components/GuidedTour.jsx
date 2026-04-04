import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const STEPS = [
  {
    target: 'Trust Score',
    title: 'Gamified Trust Arc',
    desc: 'Your trust score determines your tier. Higher scores unlock lower premiums and priority payouts.',
    position: 'bottom',
  },
  {
    target: 'Weather Widget',
    title: 'Live Weather Intelligence',
    desc: 'Real-time weather data for your pincode powers our parametric triggers. No claim filing needed!',
    position: 'bottom',
  },
  {
    target: 'Claims History',
    title: 'Instant Claims',
    desc: 'All your claims are auto-processed by our 7-Layer FraudShield AI in under 30 seconds.',
    position: 'top',
  },
  {
    target: 'SOS Button',
    title: 'SOS Satellite Protocol',
    desc: 'In an emergency, hit the SOS button to file a priority claim with GPS-verified location data.',
    position: 'left',
  },
  {
    target: 'Notification Bell',
    title: 'Real-Time Notifications',
    desc: 'Stay updated on claim approvals, payouts, and system alerts through your personal comm center.',
    position: 'bottom',
  },
];

export default function GuidedTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    setVisible(false);
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9998]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={handleClose} />
      
      {/* Tour Card */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4">
        <div className="glass-super rounded-3xl border border-brand-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)] p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-emerald-500">
            <div 
              className="h-full bg-brand-400 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-brand-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                Step {step + 1} of {STEPS.length}
              </span>
            </div>
            <button onClick={handleClose} className="text-slate-500 hover:text-white transition p-1">
              <X size={14} />
            </button>
          </div>

          <div className="mb-1 text-xs text-brand-400 font-bold uppercase tracking-wider">{current.target}</div>
          <h3 className="text-xl font-bold text-white mb-2">{current.title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">{current.desc}</p>

          <div className="flex justify-between items-center">
            <button
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              className={`flex items-center space-x-1 text-sm font-bold px-4 py-2 rounded-xl transition ${
                step === 0 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ChevronLeft size={16} /> <span>Back</span>
            </button>
            
            <button
              onClick={() => isLast ? handleClose() : setStep(step + 1)}
              className="flex items-center space-x-1 text-sm font-bold px-5 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition shadow-lg shadow-brand-500/25"
            >
              <span>{isLast ? 'Start Using RahatPay' : 'Next'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
