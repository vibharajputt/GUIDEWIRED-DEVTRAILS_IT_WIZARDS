import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Shield, Map, Users, FileText, Zap, BarChart3 } from 'lucide-react';

const COMMANDS = [
  { id: 'dashboard', label: 'Worker Dashboard', desc: 'View worker metrics and claims', icon: <BarChart3 size={16} />, path: '/dashboard' },
  { id: 'admin', label: 'Admin Terminal', desc: 'Insurance operations & monitoring', icon: <Shield size={16} />, path: '/admin' },
  { id: 'riskmap', label: 'Risk Map', desc: 'National hazard visualization', icon: <Map size={16} />, path: '/risk-map' },
  { id: 'home', label: 'Home', desc: 'Landing page', icon: <FileText size={16} />, path: '/' },
  { id: 'claims', label: 'View Claims', desc: 'All processed insurance claims', icon: <Zap size={16} />, action: 'claims' },
  { id: 'workers', label: 'Worker Directory', desc: 'All registered gig workers', icon: <Users size={16} />, action: 'workers' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
    setQuery('');
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd) => {
    if (cmd.path) navigate(cmd.path);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]" onClick={() => setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div 
        className="relative w-full max-w-lg mx-4 glass-super rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-5 py-4 border-b border-white/5">
          <Search size={18} className="text-brand-400 mr-3 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, pages, actions..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
          />
          <kbd className="hidden sm:flex items-center text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No results found for "{query}"</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => handleSelect(cmd)}
                className="w-full flex items-center px-4 py-3 rounded-2xl hover:bg-white/5 transition group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mr-3 group-hover:bg-brand-500/20 transition">
                  {cmd.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white group-hover:text-brand-300 transition">{cmd.label}</div>
                  <div className="text-xs text-slate-500 truncate">{cmd.desc}</div>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-brand-400 transition flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">RahatPay Command Protocol</span>
          <div className="flex space-x-1">
            <kbd className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono">↑↓</kbd>
            <kbd className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono">↵</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
