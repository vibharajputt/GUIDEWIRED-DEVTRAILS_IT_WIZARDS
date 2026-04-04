import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, ShieldAlert, Zap, Activity, Coins, Users, CreditCard, CloudLightning, Map as MapIcon, Database, LayoutDashboard } from 'lucide-react';
import { getAdminDashboard } from '../services/api';

function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getAdminDashboard();
      setStats(res.data);
    } catch (err) {
      console.error('Stats unavailable');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen text-slate-100"
    >
      {/* ===== HERO SECTION ===== */}
      <div className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/30 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center space-x-2 glass-panel px-4 py-1.5 rounded-full text-sm font-medium text-brand-300 mb-8 border border-brand-500/30"
          >
            <span className="animate-pulse">🏆</span>
            <span>Guidewire DEVTrails 2026 Hackathon</span>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-brand-400 mb-6 tracking-tight leading-none"
          >
           RahatPay<span className="text-brand-500">.</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl text-slate-300 font-medium mb-6 max-w-3xl mx-auto"
          >
            Your Earnings, Protected Every Week.
          </motion.p>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            India's first <strong>AI-powered parametric micro-insurance</strong> platform 
            that automatically protects gig delivery workers against income loss from 
            weather, pollution, curfews, and app outages.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Link
              to="/onboarding"
              className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-[0_0_20px_rgba(79,70,229,0.4)] transform hover:scale-105 transition flex items-center justify-center space-x-2 group"
            >
              <span>Get Protected Now</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="glass-panel text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-medium border border-white/20 hover:border-white/40 shadow-lg transform hover:scale-105 transition flex items-center justify-center space-x-2"
            >
              <LayoutDashboard size={20} />
              <span>Worker Dashboard</span>
            </Link>
          </motion.div>

          {/* Live Stats */}
          {stats && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
               <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-brand-500/30 transition">
                <div className="flex justify-center mb-2"><Users className="text-blue-400" /></div>
                <div className="text-3xl font-bold text-white">{stats.overview.total_workers}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Protected</div>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-green-500/30 transition">
                <div className="flex justify-center mb-2"><ShieldCheck className="text-green-400" /></div>
                <div className="text-3xl font-bold text-white">{stats.overview.active_policies}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Active Polices</div>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-orange-500/30 transition">
                <div className="flex justify-center mb-2"><Activity className="text-orange-400" /></div>
                <div className="text-3xl font-bold text-white">{stats.overview.total_claims}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Claims Settled</div>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition">
                <div className="flex justify-center mb-2"><Coins className="text-purple-400" /></div>
                <div className="text-3xl font-bold text-white">₹{stats.financials.total_payouts}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Total Payouts</div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== PROBLEM SECTION ===== */}
      <div className="relative py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              The Reality for <span className="text-red-400">7.7M Workers</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              India's gig delivery workers lose <strong>20-30% of their monthly income</strong>
              to uncontrollable external disruptions with zero compensation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🌧️', title: 'Weather Disruptions', desc: 'Heavy rain in Mumbai = ₹600 daily loss. Workers bear 100% of the financial impact.', color: 'from-blue-500/20 to-blue-900/20', border: 'border-blue-500/30' },
              { icon: '🚫', title: 'Social Disruptions', desc: 'Curfews and bandhs cause 1-7 days of zero income. Nobody covers this lost time.', color: 'from-orange-500/20 to-orange-900/20', border: 'border-orange-500/30' },
              { icon: '📱', title: 'Technical Outages', desc: 'App crashes & internet shutdowns mean workers earn nothing but still pay equated expenses.', color: 'from-purple-500/20 to-purple-900/20', border: 'border-purple-500/30' }
            ].map((problem, i) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={i} 
                className={`glass-panel p-8 rounded-3xl bg-gradient-to-b ${problem.color} border ${problem.border}`}
              >
                <div className="text-5xl mb-6">{problem.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
                <p className="text-slate-300 leading-relaxed">{problem.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div className="py-24 bg-slate-950 relative border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-brand-900/20 blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How RahatPay Works
            </h2>
            <p className="text-slate-400 text-xl max-w-xl mx-auto">
              Fully automated. Zero paperwork. Payouts in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Register Token', desc: 'Secure Aadhaar + UPI verification. Instant onboarding.', delay: 0 },
              { step: '2', title: 'Pick a Plan', desc: 'Micro-premiums starting at ₹25/week based on zone risk.', delay: 0.1 },
              { step: '3', title: 'Auto-Detect', desc: 'AI monitors weather, AQI, and network APIs 24/7.', delay: 0.2 },
              { step: '4', title: 'Instant Payout', desc: 'Smart contracts trigger immediate UPI transfers.', delay: 0.3 }
            ].map((item) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay }}
                key={item.step}
                className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 text-7xl font-bold text-white/5 group-hover:text-brand-500/10 transition-colors">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold mb-6 border border-brand-500/30">
                  {item.step}
                </div>
                <h3 className="font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== COVERAGE GRID ===== */}
      <div className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
           <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16">
            Parametric <span className="text-brand-400">Coverage</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-green-500/20 bg-green-900/10">
              <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center"><ShieldCheck className="mr-3" /> Covered Instantly</h3>
              <ul className="space-y-4">
                {[
                  'Heavy Rainfall / Waterlogging',
                  'Extreme Heat (above 45°C)',
                  'Severe Pollution (AQI > 400)',
                  'Curfew / Section 144 / Strikes',
                  'App Server Outages / Glitches',
                  'Govt. Internet Shutdowns'
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-red-500/20 bg-red-900/10">
              <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center"><ShieldAlert className="mr-3" /> Not Covered</h3>
              <ul className="space-y-4">
                {[
                  'Personal Health or Medical Bills',
                  'Vehicle Damage or Wear & Tear',
                  'Accidental Insurance / Life Checks',
                  'Traffic Delays or Account Bans',
                  'Voluntary Leave or Vacations'
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-red-400/50" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PLANS SECTION ===== */}
      <div className="py-24 bg-slate-950 border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Transparent <span className="text-brand-400">Weekly Pricing</span>
            </h2>
            <p className="text-slate-400 text-xl">Auto-adjusted based on zone risk. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {[
              { name: 'Basic', price: '₹25', desc: 'Perfect for part-time riders.', coverage: '70%', daily: '₹300', weekly: '₹1,500' },
              { name: 'Standard', price: '₹35', desc: 'The sweet spot for full-timers.', coverage: '80%', daily: '₹450', weekly: '₹2,250', reco: true },
              { name: 'Pro', price: '₹48', desc: 'Maximum protection for power users.', coverage: '90%', daily: '₹600', weekly: '₹3,000' }
            ].map((plan) => (
              <motion.div
                whileHover={{ y: -10 }}
                key={plan.name}
                className={`glass-panel rounded-3xl p-8 border ${plan.reco ? 'border-brand-500 bg-brand-900/20 shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'border-white/10'} relative`}
              >
                {plan.reco && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-600 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">/week</span>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Income Covered</span>
                    <span className="text-white font-bold">{plan.coverage}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Daily Max</span>
                    <span className="text-white font-bold">{plan.daily}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Weekly Max</span>
                    <span className="text-white font-bold">{plan.weekly}</span>
                  </div>
                </div>
                <Link
                  to="/onboarding"
                  className={`block w-full py-4 rounded-xl text-center font-bold transition-all ${
                    plan.reco 
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ACTION CTA ===== */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-slate-900 z-0"/>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 glass-super p-16 rounded-[3rem] border border-white/10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Experience RahatPay.</h2>
          <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto">
            Try the live simulation. Register a mock worker, monitor dynamic metrics, and trigger an instant UPI payout.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/onboarding" className="bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-200 transition">
              Create Worker Profile
            </Link>
            <Link to="/admin" className="glass-panel text-white border border-white/20 hover:bg-white/10 px-8 py-4 rounded-full text-lg font-bold transition flex items-center justify-center">
              <Activity className="mr-2"/> View Admin
            </Link>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 py-12 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <ShieldCheck size={20} className="text-brand-500" />
            <span className="font-bold text-white text-lg tracking-tight">RahatPay.</span>
          </div>
          <p>Built for Guidewire DEVTrails 2026 by Team IT Wizards.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {['React', 'FastAPI', 'Framer', 'Tailwind', 'XGBoost'].map(tech => (
              <span key={tech} className="bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

export default Home;
