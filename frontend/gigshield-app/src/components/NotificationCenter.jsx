import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';
import { getWorkerNotifications, getAdminNotifications, markNotificationRead } from '../services/api';

export default function NotificationCenter({ recipientType, workerId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      let res;
      if (recipientType === 'worker') {
        if (!workerId) return;
        res = await getWorkerNotifications(workerId);
      } else {
        res = await getAdminNotifications();
      }
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [recipientType, workerId]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={16} className="text-emerald-400" />;
      case 'error': return <ShieldAlert size={16} className="text-red-400" />;
      case 'warning': return <AlertTriangle size={16} className="text-orange-400" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className="relative z-50">
      {/* Bell Icon Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel p-3.5 rounded-xl hover:bg-white/10 transition-all shadow-sm relative group border border-white/5"
      >
        <Bell size={20} className="text-slate-300 group-hover:text-white transition" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-bounce font-mono">
            {unreadCount}
          </div>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 sm:w-96 glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[600px] origin-top-right animate-[fadeIn_0.2s_ease-out]">
          <div className="p-4 bg-slate-900/60 border-b border-white/5 flex justify-between items-center backdrop-blur-xl">
            <h3 className="font-bold text-white tracking-wide uppercase text-sm flex items-center">
              <span className="bg-brand-500/20 text-brand-300 w-6 h-6 flex justify-center items-center rounded-lg mr-2">🔔</span> 
              Comm Center
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition bg-slate-800 p-1.5 rounded-full"><X size={14}/></button>
          </div>
          
          <div className="overflow-y-auto p-4 space-y-3 bg-slate-950/40 backdrop-blur-md flex-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No transmissions received.</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 rounded-2xl border transition relative overflow-hidden group ${
                    notif.status === 'unread' 
                      ? 'bg-slate-800/80 border-brand-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'bg-slate-900/40 border-white/5 opacity-70'
                  }`}
                >
                  {notif.status === 'unread' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>}
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center font-bold text-sm text-slate-200">
                      <span className="mr-2 bg-slate-900 p-1 rounded-lg border border-slate-700 shadow-inner">{getTypeIcon(notif.type)}</span>
                      {notif.title}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{notif.created_at.split('T')[1].substring(0, 5)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{notif.message}</p>
                  
                  {notif.status === 'unread' && (
                    <button 
                      onClick={() => handleMarkRead(notif.id)}
                      className="mt-3 text-[10px] text-brand-400 font-bold uppercase tracking-widest hover:text-brand-300 transition"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
