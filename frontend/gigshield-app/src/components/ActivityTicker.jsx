import React, { useState, useEffect } from 'react';

const EVENTS = [
  { type: 'register', templates: ['Worker #{id} registered via {platform}', 'New node #{id} joined the RahatPay grid'] },
  { type: 'claim', templates: ['Claim #{id} filed for Rs {amount} — {trigger}', 'Auto-processing claim #{id} via AI engine'] },
  { type: 'payout', templates: ['Rs {amount} disbursed to Worker #{id} via UPI', 'Instant payout completed for claim #{id}'] },
  { type: 'trigger', templates: ['TRIGGER: {trigger} detected in {zone}', 'Weather anomaly: {trigger} — {zone} affected'] },
  { type: 'fraud', templates: ['FraudShield flagged Worker #{id} — anomaly score {score}', 'Sensor verification passed for #{id}'] },
  { type: 'system', templates: ['System health: ALL NODES OPERATIONAL', 'Database sync completed — 0 conflicts', 'Satellite uplink refreshed — latency 12ms'] },
];

const PLATFORMS = ['Swiggy', 'Zomato', 'Blinkit', 'Zepto', 'Dunzo', 'Amazon'];
const TRIGGERS = ['HEAVY_RAIN', 'EXTREME_HEAT', 'SEVERE_AQI', 'CYCLONE', 'FLOOD'];
const ZONES = ['Andheri West', 'Bandra', 'Koramangala', 'Connaught Place', 'Whitefield', 'Powai', 'Dwarka'];

function generateEvent() {
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const template = event.templates[Math.floor(Math.random() * event.templates.length)];
  
  const text = template
    .replace('{id}', Math.floor(Math.random() * 50) + 1)
    .replace('{platform}', PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)])
    .replace('{amount}', (Math.floor(Math.random() * 2000) + 200).toLocaleString())
    .replace('{trigger}', TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)])
    .replace('{zone}', ZONES[Math.floor(Math.random() * ZONES.length)])
    .replace('{score}', (Math.random() * 0.4 + 0.6).toFixed(2));

  return {
    id: Date.now() + Math.random(),
    time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    text,
    type: event.type,
  };
}

const TYPE_COLORS = {
  register: 'text-emerald-400',
  claim: 'text-blue-400',
  payout: 'text-yellow-400',
  trigger: 'text-red-400',
  fraud: 'text-orange-400',
  system: 'text-slate-500',
};

export default function ActivityTicker() {
  const [events, setEvents] = useState(() => Array.from({ length: 5 }, generateEvent));

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => [generateEvent(), ...prev].slice(0, 8));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-red-500 opacity-60" />
      <div className="px-4 py-2.5 border-b border-white/5 flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Activity Stream
        </h4>
        <span className="text-[9px] text-slate-600 font-mono">AUTO-REFRESH 2.5s</span>
      </div>
      <div className="divide-y divide-white/[0.03] max-h-52 overflow-hidden">
        {events.map((e, i) => (
          <div
            key={e.id}
            className={`px-4 py-2 text-xs font-mono flex items-start space-x-3 transition-all duration-500 ${i === 0 ? 'bg-white/[0.02]' : ''}`}
            style={{ opacity: 1 - i * 0.1 }}
          >
            <span className="text-slate-600 flex-shrink-0 w-16">[{e.time}]</span>
            <span className={`${TYPE_COLORS[e.type]} flex-1 leading-relaxed`}>{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
