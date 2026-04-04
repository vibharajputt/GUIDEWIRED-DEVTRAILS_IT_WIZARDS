import React from 'react';

export default function SkeletonLoader({ rows = 4, type = 'card' }) {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel rounded-2xl p-6 border border-white/5 animate-pulse">
            <div className="w-10 h-10 bg-slate-700/50 rounded-xl mb-4" />
            <div className="h-8 bg-slate-700/50 rounded-lg w-16 mb-2" />
            <div className="h-3 bg-slate-800/50 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
        <div className="h-4 bg-slate-700/40 rounded w-48 mb-4 animate-pulse" />
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex space-x-4 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="h-4 bg-slate-800/50 rounded flex-1" />
            <div className="h-4 bg-slate-800/50 rounded w-20" />
            <div className="h-4 bg-slate-800/50 rounded w-16" />
            <div className="h-4 bg-slate-800/50 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/5 animate-pulse">
        <div className="h-4 bg-slate-700/40 rounded w-40 mb-6" />
        <div className="flex items-end space-x-3 h-40">
          {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-slate-800/50 rounded-t-lg" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-slate-700/50 rounded-2xl" />
        <div className="flex-1">
          <div className="h-4 bg-slate-700/40 rounded w-32 mb-2" />
          <div className="h-3 bg-slate-800/50 rounded w-48" />
        </div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-3 bg-slate-800/40 rounded" style={{ width: `${85 - i * 12}%` }} />
      ))}
    </div>
  );
}
