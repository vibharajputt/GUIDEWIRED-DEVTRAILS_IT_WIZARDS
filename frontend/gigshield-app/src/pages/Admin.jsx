import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  getAdminDashboard, getAllClaims, getAllTriggers,
  approveClaim, rejectClaim, getAllWorkers, scanAllZones
} from '../services/api';
import NotificationCenter from '../components/NotificationCenter';
import AnimatedCounter from '../components/AnimatedCounter';
import SkeletonLoader from '../components/SkeletonLoader';
import ActivityTicker from '../components/ActivityTicker';
import ThemeToggle from '../components/ThemeToggle';
import SmartContractLedger from '../components/SmartContractLedger';
import { LanguageToggle } from '../components/I18nProvider';
import { motion } from 'framer-motion';
import { ShieldAlert, ChevronRight, Lock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import confetti from 'canvas-confetti';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1'];
const BAR_COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

function LiveTelematics() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const int = setInterval(() => {
      setData(prev => {
        const newData = [...prev, {
          id: Math.random().toString(36).substr(2, 5).toUpperCase(),
          worker: `GS-${Math.floor(Math.random() * 9000)+1000}`,
          ax: (Math.random() * 20 - 10).toFixed(2),
          ay: (Math.random() * 20 - 10).toFixed(2),
          az: (Math.random() * 10 + 5).toFixed(2),
          status: Math.random() > 0.85 ? 'ANOMALY' : 'NORMAL'
        }];
        return newData.slice(-6);
      });
    }, 700);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl bg-black/40 relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 p-6">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>
      <h3 className="text-emerald-400 font-mono font-bold mb-4 flex items-center tracking-widest text-sm">
        <span className="mr-2">📡</span> LIVE TELEMATICS MATRIX (FRAUD SHIELD)
      </h3>
      <div className="font-mono text-xs space-y-2">
        <div className="grid grid-cols-5 text-slate-500 border-b border-white/10 pb-2 font-bold tracking-wider">
          <span>PACKET_ID</span><span>WORKER_HASH</span><span>ACCEL_X</span><span>ACCEL_Y / ACCEL_Z</span><span>SYSTEM_STATUS</span>
        </div>
        {data.map((d, i) => (
          <div key={d.id} className={`grid grid-cols-5 py-0.5 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards] ${d.status === 'ANOMALY' ? 'text-red-400 bg-red-900/20 font-bold' : 'text-emerald-300'}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <span>{d.id}</span>
            <span>{d.worker}</span>
            <span>{d.ax}g</span>
            <span>{d.ay}g / {d.az}g</span>
            <span className={d.status === 'ANOMALY' ? 'animate-pulse' : ''}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalWeatherRadar() {
  const [liveWeather, setLiveWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scanAllZones().then(res => {
      setLiveWeather(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="glass-panel p-6 mb-6 rounded-3xl animate-[pulse_1.5s_ease-in-out_infinite] text-brand-300 font-mono text-sm border border-brand-500/30">🌍 Linking to Global Weather Satellites...</div>;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl bg-slate-900/40 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500"></div>
      <h3 className="text-white font-black mb-4 flex items-center tracking-widest text-sm uppercase">
        <span className="mr-2 text-lg">🌍</span> Global Worker Weather Matrix
        <span className="ml-auto text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700 font-medium tracking-normal normal-case text-slate-300">
          Scanned: {liveWeather?.scanned_at || 'Just now'}
        </span>
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {liveWeather?.results?.map((zone, i) => {
           const hasAlert = zone.total_triggers > 0;
           return (
             <div key={i} className={`p-3 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
               hasAlert ? 'bg-red-900/20 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-emerald-900/10 border-emerald-500/20 hover:border-emerald-500/40'
             }`}>
               <div className="flex justify-between items-start mb-2">
                 <div className="text-xs uppercase tracking-widest text-slate-400 font-bold leading-tight">{zone.city}<br/><span className={hasAlert ? 'text-red-400' : 'text-emerald-400'}>{zone.zone}</span></div>
                 {hasAlert && <span className="animate-ping absolute right-4 top-4 h-2 w-2 rounded-full bg-red-500"></span>}
               </div>
               <div className="text-2xl font-black text-white tracking-tighter mb-1">
                 {zone.temperature !== null ? Math.round(zone.temperature) : '--'}° <span className="text-sm font-medium text-slate-400 opacity-60 ml-1">{zone.condition || 'N/A'}</span>
               </div>
               <div className="flex space-x-2 text-[10px] uppercase font-bold tracking-wider">
                 <span className="bg-white/5 px-2 py-1 rounded">AQI: {zone.aqi_value || '--'}</span>
                 <span className="bg-white/5 px-2 py-1 rounded">PIN: {zone.pincode}</span>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('admin');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin') {
      onLogin();
    } else {
      setError('Invalid root clearance protocols.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-super p-10 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 max-w-md w-full relative z-10">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-6 border border-brand-500/50">
          <Lock className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-white text-center">Admin Node</h2>
        <p className="text-slate-400 mb-8 text-center text-sm px-4">Enter Level-4 Root Credentials to access the global grid.</p>
        
        <form onSubmit={submit} className="flex flex-col space-y-4">
          <input
            type="text"
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="Username"
            className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none text-white shadow-inner"
          />
          <input
            type="text"
            style={{ WebkitTextSecurity: 'disc' }}
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Password"
            className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none text-white shadow-inner"
          />
          {error && <div className="text-red-400 text-sm font-bold bg-red-900/20 py-2 text-center rounded border border-red-500/20">{error}</div>}
          <button type="submit" className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition mt-2 flex justify-center items-center">
            INITIALIZE UPLINK <ChevronRight className="ml-2" size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [claims, setClaims] = useState(null);
  const [triggers, setTriggers] = useState(null);
  const [workers, setWorkers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, claimsRes, trigRes, workersRes] = await Promise.allSettled([
        getAdminDashboard(),
        getAllClaims(),
        getAllTriggers(),
        getAllWorkers(),
      ]);
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data);
      if (claimsRes.status === 'fulfilled') setClaims(claimsRes.value.data);
      if (trigRes.status === 'fulfilled') setTriggers(trigRes.value.data);
      if (workersRes.status === 'fulfilled') setWorkers(workersRes.value.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  const handleApprove = async (claimId) => {
    try {
      await approveClaim(claimId);
      // Confetti burst!
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#22c55e', '#3b82f6', '#a855f7', '#eab308'] });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error approving claim');
    }
  };

  const handleReject = async (claimId) => {
    if (!window.confirm('Are you sure you want to reject this claim?')) return;
    try {
      await rejectClaim(claimId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error rejecting claim');
    }
  };

  const exportPDFReport = () => {
    if (!dashboard) return;
    
    // UI Feedback
    const btn = document.getElementById('export-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Generating PDF...';
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(34, 197, 94); // Emerald 500
      doc.text("RahatPay Framework Setup - Admin Terminal Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated exactly at: ${new Date().toLocaleString()}`, 14, 28);
      doc.text("SECURITY LEVEL: HIGHEST - RESTRICTED ACCESS", 14, 33);
      
      // 1. Executive Summary
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text("1. Executive Summary", 14, 45);
      
      doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Premium Collected', `Rs ${dashboard.financials.weekly_premium_collection}`],
          ['Total Disbursements', `Rs ${dashboard.financials.total_payouts}`],
          ['Active Network Nodes (Workers)', `${workers?.workers?.length || 0}`],
          ['Total Processed Claims', `${claims?.claims?.length || 0}`],
          ['Live Anomaly Triggers', `${triggers?.triggers?.length || 0}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] }
      });
      
      // 2. Fraud & Automation Stats
      doc.text("2. Fraud Shield Operations", 14, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['System Action', 'Volume']],
        body: [
          ['Claims Auto-Approved by AI', `${dashboard.fraud_stats.auto_approved}`],
          ['Claims Flagged for Human Review', `${dashboard.fraud_stats.manual_review}`],
          ['Claims Rejected (Fraudulent)', `${dashboard.fraud_stats.rejected}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // 3. Recent Disbursed Claims
      if (claims?.claims && claims.claims.length > 0) {
        doc.addPage();
        doc.text("3. Recent Claims Ledger (Top 20)", 14, 20);
        
        const recentClaims = claims.claims.slice(0, 20).map(c => [
          `#${c.id}`,
          `GS-${c.worker_token.substring(0,6)}`,
          `Rs ${c.claim_amount}`,
          c.status.toUpperCase(),
          c.trigger_type.replace('_', ' ')
        ]);
        
        doc.autoTable({
          startY: 25,
          head: [['Claim ID', 'Worker Hash', 'Amount', 'Status', 'Root Cause']],
          body: recentClaims,
          theme: 'striped',
          headStyles: { fillColor: [40, 40, 40] }
        });
      }
      
      // Save the PDF
      doc.save(`RahatPay_Admin_Report_${new Date().getTime()}.pdf`);
      
      btn.innerHTML = '✅ Report Exported';
      setTimeout(() => btn.innerHTML = originalText, 2500);
    } catch(err) {
      console.error(err);
      btn.innerHTML = '❌ Export Failed';
      setTimeout(() => btn.innerHTML = originalText, 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="stats" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonLoader type="chart" />
            <SkeletonLoader type="chart" />
          </div>
          <SkeletonLoader type="table" rows={6} />
        </div>
      </div>
    );
  }

  // ========== CHART DATA ==========
  const fraudPieData = dashboard
    ? [
        { name: 'Auto Approved', value: dashboard.fraud_stats.auto_approved },
        { name: 'Manual Review', value: dashboard.fraud_stats.manual_review },
        { name: 'Rejected', value: dashboard.fraud_stats.rejected },
      ].filter((d) => d.value > 0)
    : [];

  const revenueBarData = dashboard
    ? [
        { name: 'Premium', amount: dashboard.financials.weekly_premium_collection },
        { name: 'Payouts', amount: dashboard.financials.total_payouts },
        {
          name: 'Profit',
          amount: Math.max(
            0,
            dashboard.financials.weekly_premium_collection -
              dashboard.financials.total_payouts
          ),
        },
      ]
    : [];

  const triggerBarData = triggers?.triggers
    ? Object.values(
        triggers.triggers.reduce((acc, t) => {
          acc[t.type] = acc[t.type] || { type: t.type, count: 0 };
          acc[t.type].count++;
          return acc;
        }, {})
      ).sort((a, b) => b.count - a.count)
    : [];

  // Platform distribution
  const platformData = workers?.workers
    ? Object.values(
        workers.workers.reduce((acc, w) => {
          const p = w.platform || 'unknown';
          acc[p] = acc[p] || { name: p, count: 0 };
          acc[p].count++;
          return acc;
        }, {})
      ).sort((a, b) => b.count - a.count)
    : [];

  // Trust tier distribution
  const trustData = workers?.workers
    ? Object.values(
        workers.workers.reduce((acc, w) => {
          const tier = w.trust_tier || 'SILVER';
          acc[tier] = acc[tier] || { name: tier, count: 0 };
          acc[tier].count++;
          return acc;
        }, {})
      )
    : [];

  const trustColors = {
    PLATINUM: '#a855f7',
    GOLD: '#eab308',
    SILVER: '#9ca3af',
    BRONZE: '#f97316',
    SUSPENDED: '#ef4444',
  };

  // ========== TABS ==========
  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'claims', label: '📋 Claims' },
    { id: 'triggers', label: '⚡ Triggers' },
    { id: 'workers', label: '👥 Workers' },
    { id: 'fraud', label: '🔍 Fraud' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200">
      {/* Header */}
      <div className="glass-panel shadow-sm border-b border-white/5 border-white/5 px-4 py-4 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              🛡️ RahatPay Admin Portal
            </h1>
            <p className="text-slate-400 text-sm">
              Insurance Operations Dashboard
            </p>
          </div>
          <div className="flex space-x-3 items-center">
            <LanguageToggle />
            <ThemeToggle />
            <NotificationCenter recipientType="admin" />
            <button
              onClick={exportPDFReport}
              id="export-btn"
              className="bg-brand-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] border border-brand-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-500 transition w-40 text-center"
            >
              📄 Export Report
            </button>
            <button
              onClick={loadData}
              className="bg-brand-500/20 text-brand-300 border border-brand-500/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-500/40 transition flex items-center space-x-2"
            >
              <span>🔄</span> <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex space-x-1 glass-super border border-white/5 p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] border-b border-white/5rand-500 border'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && dashboard && (
          <>
            {/* KPI Cards Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-brand-500/20 transition-all shadow-lg text-center">
                <div className="text-3xl mb-1">👥</div>
                <div className="text-2xl font-bold text-brand-300">
                  <AnimatedCounter end={dashboard.overview.total_workers} />
                </div>
                <div className="text-sm text-slate-400">Total Workers</div>
                <div className="text-xs text-emerald-400 mt-1">
                  <AnimatedCounter end={dashboard.overview.active_workers} /> active
                </div>
              </div>
              <div className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-brand-500/20 transition-all shadow-lg text-center">
                <div className="text-3xl mb-1">📋</div>
                <div className="text-2xl font-bold text-emerald-400">
                  <AnimatedCounter end={dashboard.overview.active_policies} />
                </div>
                <div className="text-sm text-slate-400">Active Policies</div>
                <div className="text-xs text-slate-500 mt-1">
                  of <AnimatedCounter end={dashboard.overview.total_policies} /> total
                </div>
              </div>
              <div className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-brand-500/20 transition-all shadow-lg text-center">
                <div className="text-3xl mb-1">📝</div>
                <div className="text-2xl font-bold text-orange-400">
                  <AnimatedCounter end={dashboard.overview.total_claims} />
                </div>
                <div className="text-sm text-slate-400">Total Claims</div>
                <div className="text-xs text-orange-400 mt-1">
                  <AnimatedCounter end={dashboard.overview.total_triggers} /> triggers
                </div>
              </div>
              <div className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-brand-500/20 transition-all shadow-lg text-center">
                <div className="text-3xl mb-1">⏳</div>
                <div className={`text-2xl font-bold ${
                  dashboard.overview.pending_review > 0 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  <AnimatedCounter end={dashboard.overview.pending_review} />
                </div>
                <div className="text-sm text-slate-400">Pending Review</div>
                <div className="text-xs text-slate-500 mt-1">
                  {dashboard.overview.pending_review > 0 ? '⚠️ Needs attention' : '✅ All clear'}
                </div>
              </div>
            </div>

            {/* Live Activity Ticker */}
            <div className="mb-6">
              <ActivityTicker />
            </div>

            <GlobalWeatherRadar />
            
            <LiveTelematics />

            {/* Financial Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="glass-panel border-2 border-emerald-500/30 bg-emerald-900/20 p-5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-emerald-400 font-medium">
                      Weekly Premium Revenue
                    </div>
                    <div className="text-3xl font-bold text-emerald-300 mt-1">
                      ₹{dashboard.financials.weekly_premium_collection}
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>
              <div className="glass-panel border-2 border-red-500/30 bg-red-900/20 p-5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-red-400 font-medium">
                      Total Claim Payouts
                    </div>
                    <div className="text-3xl font-bold text-red-300 mt-1">
                      ₹{dashboard.financials.total_payouts}
                    </div>
                  </div>
                  <span className="text-3xl">💸</span>
                </div>
              </div>
              <div className="glass-panel border-2 border-blue-500/30 bg-blue-900/20 p-5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-brand-400 font-medium">Loss Ratio</div>
                    <div className="text-3xl font-bold text-brand-300 mt-1">
                      {dashboard.financials.loss_ratio}
                    </div>
                    <div
                      className={`text-xs mt-1 font-bold ${
                        dashboard.financials.loss_ratio_status === 'Healthy'
                          ? 'text-emerald-400'
                          : dashboard.financials.loss_ratio_status === 'Warning'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {dashboard.financials.loss_ratio_status === 'Healthy'
                        ? '✅ Healthy (below 70%)'
                        : dashboard.financials.loss_ratio_status === 'Warning'
                        ? '⚠️ Warning (70-85%)'
                        : '🔴 Critical (above 85%)'}
                    </div>
                  </div>
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>

            {/* Smart Contract Web3 Ledger */}
            <div className="mb-6">
              <SmartContractLedger claims={claims?.claims || []} />
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Revenue vs Payouts Bar Chart */}
              <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">💰 Revenue vs Payouts</h3>
                {revenueBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revenueBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`₹${value}`, 'Amount']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                        }}
                      />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
                        {revenueBarData.map((entry, index) => (
                          <Cell key={index} fill={BAR_COLORS[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-slate-500">
                    No financial data yet
                  </div>
                )}
              </div>

              {/* Fraud Distribution Pie Chart */}
              <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">🔍 Claim Decisions</h3>
                {fraudPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={fraudPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {fraudPieData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-slate-500">
                    No claims data yet
                  </div>
                )}
              </div>
            </div>

            {/* Trigger Type Distribution */}
            {triggerBarData.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5 mb-6">
                <h3 className="text-lg font-bold mb-4">⚡ Triggers by Type</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={triggerBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="type"
                      type="category"
                      width={130}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Platform + Trust Distribution */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Platform Distribution */}
              {platformData.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
                  <h3 className="text-lg font-bold mb-4">📱 Workers by Platform</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="count"
                        label={({ name, count }) => `${name}: ${count}`}
                      >
                        {platformData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'][
                                index % 6
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Trust Tier Distribution */}
              {trustData.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
                  <h3 className="text-lg font-bold mb-4">⭐ Trust Tier Distribution</h3>
                  <div className="space-y-3 mt-2">
                    {trustData.map((tier) => {
                      const total = workers?.total_workers || 1;
                      const pct = Math.round((tier.count / total) * 100);
                      return (
                        <div key={tier.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{tier.name}</span>
                            <span className="text-slate-400">
                              {tier.count} workers ({pct}%)
                            </span>
                          </div>
                          <div className="w-full glass-super border border-white/5 rounded-full h-4">
                            <div
                              className="h-4 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                              style={{
                                width: `${Math.max(pct, 8)}%`,
                                backgroundColor:
                                  trustColors[tier.name] || '#9ca3af',
                              }}
                            >
                              {pct}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Triggers */}
            {dashboard.recent_triggers && dashboard.recent_triggers.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">🕒 Recent Triggers</h3>
                <div className="space-y-2">
                  {dashboard.recent_triggers.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200 p-3 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            t.severity === 'critical'
                              ? 'bg-red-500/20 text-red-300'
                              : t.severity === 'high'
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {t.severity?.toUpperCase()}
                        </span>
                        <span className="font-medium">{t.type}</span>
                        <span className="text-slate-400 text-sm">in {t.zone}</span>
                      </div>
                      <span className="text-slate-500 text-sm">{t.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== CLAIMS TAB ==================== */}
        {activeTab === 'claims' && claims && (
          <div className="space-y-4">
            {/* Claims Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-md text-center">
                <div className="text-xl font-bold text-slate-200">
                  {claims.total_claims}
                </div>
                <div className="text-xs text-slate-400">Total Claims</div>
              </div>
              <div className="glass-panel border border-emerald-500/20 bg-emerald-900/20 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-emerald-300">
                  {claims.claims?.filter((c) =>
                    ['auto_approved', 'approved'].includes(c.status)
                  ).length || 0}
                </div>
                <div className="text-xs text-emerald-400">Approved</div>
              </div>
              <div className="glass-panel border border-yellow-500/20 bg-yellow-900/20 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-yellow-300">
                  {claims.pending_review}
                </div>
                <div className="text-xs text-yellow-400">Pending Review</div>
              </div>
              <div className="glass-panel border border-b border-white/5lue-500/20 bg-blue-900/20 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-brand-300">
                  ₹{claims.total_payout}
                </div>
                <div className="text-xs text-brand-400">Total Payout</div>
              </div>
            </div>

            {/* Pending Review Queue */}
            {claims.claims &&
              claims.claims.filter((c) => ['manual_review', 'zone_pending', 'under_appeal'].includes(c.status)).length > 0 && (
                <div className="glass-panel border-2 border-yellow-500/30 bg-yellow-900/20 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-yellow-200 mb-4">
                    ⏳ Pending Review Queue (
                    {claims.claims.filter((c) => ['manual_review', 'zone_pending', 'under_appeal'].includes(c.status)).length})
                  </h3>
                  <div className="space-y-3">
                    {claims.claims
                      .filter((c) => ['manual_review', 'zone_pending', 'under_appeal'].includes(c.status))
                      .map((c) => (
                        <div
                          key={c.id}
                          className="glass-panel border-white/5 border p-4 rounded-xl flex justify-between items-center shadow-sm"
                        >
                          <div>
                            <div className="font-medium text-white">
                              {c.worker_name}
                              <span className="text-slate-500 text-sm ml-2">
                                ({c.worker_token})
                              </span>
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                              {c.trigger_type} | {c.disruption_hours}h | Fraud:{' '}
                              <span
                                className={`font-bold ${
                                  c.fraud_score <= 30
                                    ? 'text-emerald-400'
                                    : c.fraud_score <= 70
                                    ? 'text-yellow-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {c.fraud_score}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-emerald-400 text-lg">
                              ₹{c.payout_amount}
                            </span>
                            <button
                              onClick={() => handleApprove(c.id)}
                              className="bg-emerald-900/20 border border-emerald-500/200 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleReject(c.id)}
                              className="bg-red-900/20 border border-red-500/200 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* All Claims Table */}
            <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
              <h3 className="text-lg font-bold mb-4">📋 All Claims</h3>
              {claims.claims && claims.claims.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800/80">
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Worker</th>
                        <th className="p-3 text-left">Trigger</th>
                        <th className="p-3 text-left">Hours</th>
                        <th className="p-3 text-left">Payout</th>
                        <th className="p-3 text-left">Fraud</th>
                        <th className="p-3 text-left">Priority</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.claims.map((c) => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200">
                          <td className="p-3 font-mono text-slate-400">#{c.id}</td>
                          <td className="p-3">
                            <div className="font-medium">{c.worker_name}</div>
                            <div className="text-xs text-slate-500">
                              {c.worker_token}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="bg-brand-500/20 text-brand-300 border border-b border-white/5rand-500/30 px-2 py-1 rounded text-xs font-medium">
                              {c.trigger_type}
                            </span>
                          </td>
                          <td className="p-3">{c.disruption_hours}h</td>
                          <td className="p-3 font-bold text-emerald-400">
                            ₹{c.payout_amount}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                c.fraud_score <= 30
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : c.fraud_score <= 70
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {c.fraud_score}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs font-medium ${
                                c.priority_rank === 'critical'
                                  ? 'text-red-400'
                                  : c.priority_rank === 'high'
                                  ? 'text-orange-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {c.priority_rank?.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                ['auto_approved', 'approved'].includes(c.status)
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : c.status === 'manual_review'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : c.status === 'under_appeal'
                                  ? 'bg-brand-500/20 text-brand-300 border border-b border-white/5rand-500/30'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-xs">{new Date(c.created_at).toLocaleString()}</td>
                          <td className="p-3">
                            {(['manual_review', 'under_appeal', 'zone_pending'].includes(c.status)) && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleApprove(c.id)}
                                  className="bg-emerald-900/20 border border-emerald-500/200 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  onClick={() => handleReject(c.id)}
                                  className="bg-red-900/20 border border-red-500/200 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No claims yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== TRIGGERS TAB ==================== */}
        {activeTab === 'triggers' && triggers && (
          <div className="space-y-4">
            {/* Trigger Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-md text-center">
                <div className="text-xl font-bold text-slate-200">
                  {triggers.total_triggers}
                </div>
                <div className="text-xs text-slate-400">Total Triggers</div>
              </div>
              <div className="glass-panel border border-red-500/20 bg-red-900/20 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-red-300">
                  {triggers.triggers?.filter((t) =>
                    ['critical', 'high'].includes(t.severity)
                  ).length || 0}
                </div>
                <div className="text-xs text-red-400">High/Critical</div>
              </div>
              <div className="glass-panel border border-b border-white/5lue-500/20 bg-blue-900/20 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-brand-300">
                  {triggers.triggers?.reduce(
                    (sum, t) => sum + (t.claims_generated || 0),
                    0
                  ) || 0}
                </div>
                <div className="text-xs text-brand-400">Claims Generated</div>
              </div>
            </div>

            {/* Trigger Chart */}
            {triggerBarData.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">⚡ Trigger Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={triggerBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="type"
                      type="category"
                      width={130}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#6366f1"
                      radius={[0, 8, 8, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Triggers Table */}
            <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
              <h3 className="text-lg font-bold mb-4">
                ⚡ All Triggers ({triggers.total_triggers})
              </h3>
              {triggers.triggers && triggers.triggers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800/80">
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Severity</th>
                        <th className="p-3 text-left">Value</th>
                        <th className="p-3 text-left">Zone</th>
                        <th className="p-3 text-left">Duration</th>
                        <th className="p-3 text-left">Source</th>
                        <th className="p-3 text-left">Claims</th>
                        <th className="p-3 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {triggers.triggers.map((t) => (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200">
                          <td className="p-3 font-mono text-slate-400">#{t.id}</td>
                          <td className="p-3 font-medium">{t.type}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                t.severity === 'critical'
                                  ? 'bg-red-500/20 text-red-300'
                                  : t.severity === 'high'
                                  ? 'bg-orange-500/20 text-orange-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}
                            >
                              {t.severity}
                            </span>
                          </td>
                          <td className="p-3">
                            {t.value} {t.unit}
                          </td>
                          <td className="p-3">
                            {t.zone}
                            <div className="text-xs text-slate-500">{t.pincode}</div>
                          </td>
                          <td className="p-3">{t.duration_hours}h</td>
                          <td className="p-3 text-slate-400 text-xs">{t.source}</td>
                          <td className="p-3 font-bold">{t.claims_generated}</td>
                          <td className="p-3 text-slate-500 text-xs">{t.started_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No triggers yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== WORKERS TAB ==================== */}
        {activeTab === 'workers' && workers && (
          <div className="space-y-4">
            {/* Worker Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-md text-center">
                <div className="text-xl font-bold text-brand-300">
                  {workers.total_workers}
                </div>
                <div className="text-xs text-slate-400">Total Workers</div>
              </div>
              {platformData.slice(0, 3).map((p, i) => (
                <div key={i} className="glass-panel p-4 rounded-3xl border border-white/5 shadow-md text-center">
                  <div className="text-xl font-bold text-slate-200">{p.count}</div>
                  <div className="text-xs text-slate-400 capitalize">{p.name}</div>
                </div>
              ))}
            </div>

            {/* Workers Table */}
            <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
              <h3 className="text-lg font-bold mb-4">
                👥 All Workers ({workers.total_workers})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Token</th>
                      <th className="p-3 text-left">Platform</th>
                      <th className="p-3 text-left">Zone</th>
                      <th className="p-3 text-left">Earning</th>
                      <th className="p-3 text-left">Risk</th>
                      <th className="p-3 text-left">Trust</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.workers &&
                      workers.workers.map((w) => (
                        <tr key={w.id} className="border-b border-white/5 hover:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200">
                          <td className="p-3 text-slate-400">#{w.id}</td>
                          <td className="p-3 font-medium">{w.name}</td>
                          <td className="p-3 font-mono text-xs text-brand-400">
                            {w.token_id}
                          </td>
                          <td className="p-3 capitalize">{w.platform}</td>
                          <td className="p-3">
                            {w.zone}
                            <div className="text-xs text-slate-500">{w.pincode}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">₹{w.monthly_earning}/mo</div>
                            <div className="text-xs text-slate-500">
                              ₹{w.hourly_rate}/hr
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <div className="w-12 glass-super border border-white/5 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${w.risk_score * 100}%`,
                                    backgroundColor:
                                      w.risk_score > 0.6
                                        ? '#ef4444'
                                        : w.risk_score > 0.3
                                        ? '#f97316'
                                        : '#22c55e',
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold">{w.risk_score}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                w.trust_tier === 'PLATINUM'
                                  ? 'bg-purple-100 text-purple-700'
                                  : w.trust_tier === 'GOLD'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : w.trust_tier === 'SILVER'
                                  ? 'bg-slate-800/80 text-slate-200'
                                  : w.trust_tier === 'BRONZE'
                                  ? 'bg-orange-500/20 text-orange-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {w.trust_tier} ({w.trust_score})
                            </span>
                          </td>
                          <td className="p-3">
                            {w.is_active ? (
                              <span className="text-emerald-400 text-xs font-bold">
                                ✅ Active
                              </span>
                            ) : (
                              <span className="text-red-400 text-xs font-bold">
                                ❌ Inactive
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== FRAUD TAB ==================== */}
        {activeTab === 'fraud' && dashboard && (
          <>
            {/* Fraud Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-900/20 border border-emerald-500/20 border border-green-200 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-emerald-300">
                  {dashboard.fraud_stats.auto_approved}
                </div>
                <div className="text-sm text-emerald-400 font-medium">Auto Approved</div>
                <div className="text-xs text-emerald-400 mt-1">Score 0-30</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/20 border border-yellow-200 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-yellow-300">
                  {dashboard.fraud_stats.manual_review}
                </div>
                <div className="text-sm text-yellow-400 font-medium">Manual Review</div>
                <div className="text-xs text-yellow-500 mt-1">Score 31-70</div>
              </div>
              <div className="bg-red-900/20 border border-red-500/20 border border-red-200 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-red-300">
                  {dashboard.fraud_stats.rejected}
                </div>
                <div className="text-sm text-red-400 font-medium">Rejected</div>
                <div className="text-xs text-red-500 mt-1">Score 71-100</div>
              </div>
              <div className="bg-blue-900/20 border border-b border-white/5lue-500/20 border border-b border-white/5lue-200 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-brand-300">
                  {dashboard.fraud_stats.avg_fraud_score}
                </div>
                <div className="text-sm text-brand-400 font-medium">Avg Fraud Score</div>
                <div className="text-xs text-blue-500 mt-1">Lower is better</div>
              </div>
            </div>

            {/* Fraud Pie Chart */}
            {fraudPieData.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5 mb-6">
                <h3 className="text-lg font-bold mb-4">
                  🔍 Fraud Decision Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fraudPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {fraudPieData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 7-Layer Fraud System Info */}
            <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5 mb-6">
              <h3 className="text-lg font-bold mb-4">🛡️ 7-Layer Fraud Detection System</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  {
                    layer: 1,
                    name: 'GPS Coordinates',
                    desc: 'Is worker GPS in disrupted zone?',
                    weight: '10%',
                  },
                  {
                    layer: 2,
                    name: 'GPS Trajectory',
                    desc: 'Natural movement trail to zone?',
                    weight: '20%',
                  },
                  {
                    layer: 3,
                    name: 'Motion Sensors',
                    desc: 'Accelerometer shows bike movement?',
                    weight: '20%',
                  },
                  {
                    layer: 4,
                    name: 'Cell Tower',
                    desc: 'Cell tower matches GPS location?',
                    weight: '20%',
                  },
                  {
                    layer: 5,
                    name: 'Environmental',
                    desc: 'Barometer matches storm conditions?',
                    weight: '10%',
                  },
                  {
                    layer: 6,
                    name: 'Behavioral',
                    desc: 'Claim matches worker patterns?',
                    weight: '15%',
                  },
                  {
                    layer: 7,
                    name: 'Crowd Intelligence',
                    desc: 'Network graph detects syndicates',
                    weight: '5%',
                  },
                ].map((l) => (
                  <div
                    key={l.layer}
                    className="flex items-start space-x-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200 p-3 rounded-xl"
                  >
                    <div className="bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {l.layer}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {l.name}{' '}
                        <span className="text-brand-400 text-xs">({l.weight})</span>
                      </div>
                      <div className="text-xs text-slate-400">{l.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Review Queue */}
            {claims && claims.claims && (
              <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">
                  ⏳ Fraud Review Queue (
                  {claims.claims.filter((c) => ['manual_review', 'zone_pending', 'under_appeal'].includes(c.status)).length})
                </h3>
                {claims.claims.filter((c) => ['manual_review', 'zone_pending', 'under_appeal'].includes(c.status)).length >
                0 ? (
                  <div className="space-y-3">
                    {claims.claims
                      .filter((c) => ['manual_review', 'zone_pending', 'under_appeal'].includes(c.status))
                      .map((c) => (
                        <div
                          key={c.id}
                          className="bg-yellow-900/20 border border-yellow-500/20 border border-yellow-200 p-4 rounded-xl flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{c.worker_name}</div>
                            <div className="text-sm text-slate-400">
                              {c.trigger_type} | {c.disruption_hours}h | Fraud:{' '}
                              {c.fraud_score}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-emerald-400">
                              ₹{c.payout_amount}
                            </span>
                            <button
                              onClick={() => handleApprove(c.id)}
                              className="bg-emerald-900/20 border border-emerald-500/200 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleReject(c.id)}
                              className="bg-red-900/20 border border-red-500/200 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 text-center py-4">
                    ✅ No pending reviews. All clear!
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
