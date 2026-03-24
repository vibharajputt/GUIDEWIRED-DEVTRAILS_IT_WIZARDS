import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* ===== HERO SECTION ===== */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          🏆 Guidewire DEVTrails 2026 Hackathon
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
          🛡️ GigShield
        </h1>

        <p className="text-2xl md:text-3xl text-blue-700 font-semibold mb-4">
          Your Earnings, Protected Every Week
        </p>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          India's first <strong>AI-powered parametric micro-insurance</strong> platform
          that automatically protects gig delivery workers against income loss from
          weather, pollution, curfews, and app outages.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link
            to="/onboarding"
            className="bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-800 shadow-lg transform hover:scale-105 transition inline-flex items-center justify-center space-x-2"
          >
            <span>Get Protected Now</span>
            <span>→</span>
          </Link>
          <Link
            to="/dashboard"
            className="bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-blue-700 hover:bg-blue-50 shadow-lg transform hover:scale-105 transition inline-flex items-center justify-center space-x-2"
          >
            <span>Worker Dashboard</span>
          </Link>
          <Link
            to="/risk-map"
            className="bg-white text-green-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-green-600 hover:bg-green-50 shadow-lg transform hover:scale-105 transition inline-flex items-center justify-center space-x-2"
          >
            <span>🗺️ Risk Map</span>
          </Link>
        </div>

        {/* Live Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-xl shadow-md border">
              <div className="text-2xl font-bold text-blue-700">{stats.overview.total_workers}</div>
              <div className="text-sm text-gray-500">Workers Protected</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border">
              <div className="text-2xl font-bold text-green-600">{stats.overview.active_policies}</div>
              <div className="text-sm text-gray-500">Active Policies</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border">
              <div className="text-2xl font-bold text-orange-600">{stats.overview.total_claims}</div>
              <div className="text-sm text-gray-500">Claims Processed</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border">
              <div className="text-2xl font-bold text-purple-600">₹{stats.financials.total_payouts}</div>
              <div className="text-sm text-gray-500">Total Payouts</div>
            </div>
          </div>
        )}
      </div>

      {/* ===== PROBLEM SECTION ===== */}
      <div className="bg-red-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            😰 The Problem We're Solving
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            India's 7.7 million gig delivery workers lose <strong>20-30% of monthly income</strong>
            to uncontrollable external disruptions with <strong>zero compensation</strong>.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-400">
              <div className="text-3xl mb-3">🌧️</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Weather Disruptions</h3>
              <p className="text-gray-600 text-sm">
                Heavy rain in Mumbai = ₹400-600 daily loss. Extreme heat in Delhi = full day wasted. Workers bear 100% of the financial impact.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-400">
              <div className="text-3xl mb-3">🚫</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Social Disruptions</h3>
              <p className="text-gray-600 text-sm">
                Curfews, bandhs, strikes — 1-7 days of zero income. No insurance product exists to cover lost wages from these events.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-400">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Technical Outages</h3>
              <p className="text-gray-600 text-sm">
                App crashes, internet shutdowns, payment failures — when the platform goes down, workers earn nothing but still have expenses.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto text-center">
            <p className="text-lg text-gray-700">
              A quick-commerce delivery partner earning <strong>₹18,000/month</strong> can lose
              <span className="text-red-600 font-bold text-xl"> ₹3,000 — ₹6,000/month</span> to
              these events. That's their <strong>rent money</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          ⚡ How GigShield Works
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
          Fully automated. Zero paperwork. Payout in minutes.
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              icon: '📱',
              title: 'Register',
              desc: 'Verify Aadhaar, choose platform & zone. Get your unique GigShield token in 2 minutes.',
              color: 'blue',
            },
            {
              step: '2',
              icon: '💰',
              title: 'Choose Plan',
              desc: 'Pick Basic (₹25/wk), Standard (₹35/wk), or Pro (₹48/wk). AI calculates your personalized premium.',
              color: 'green',
            },
            {
              step: '3',
              icon: '🌧️',
              title: 'Auto-Detect',
              desc: 'System monitors 26 disruption triggers 24/7 — weather, AQI, curfews, app outages. Zero manual filing.',
              color: 'orange',
            },
            {
              step: '4',
              icon: '⚡',
              title: 'Instant Payout',
              desc: 'Claim auto-created, 7-layer fraud check by AI, payout sent to UPI within 5-30 minutes.',
              color: 'purple',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-xl transition relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-${item.color}-500`}></div>
              <div className={`inline-flex items-center justify-center w-8 h-8 bg-${item.color}-100 text-${item.color}-700 rounded-full text-sm font-bold mb-3`}>
                {item.step}
              </div>
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Arrows between steps (desktop) */}
        <div className="hidden md:flex justify-center items-center mt-4 space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-gray-300 text-2xl">→ → →</div>
          ))}
        </div>
      </div>

      {/* ===== KEY NUMBERS ===== */}
      <div className="bg-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">📊 GigShield By Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold">₹25</div>
              <div className="text-blue-200 mt-2 text-sm">Starting Premium/Week</div>
            </div>
            <div>
              <div className="text-5xl font-bold">15<span className="text-2xl">min</span></div>
              <div className="text-blue-200 mt-2 text-sm">Average Payout Time</div>
            </div>
            <div>
              <div className="text-5xl font-bold">26</div>
              <div className="text-blue-200 mt-2 text-sm">Disruption Triggers</div>
            </div>
            <div>
              <div className="text-5xl font-bold">7</div>
              <div className="text-blue-200 mt-2 text-sm">Layer Fraud Detection</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== COVERAGE ===== */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          🛡️ What We Cover vs Don't Cover
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-green-700 mb-4">✅ Covered (Income Loss)</h3>
            <ul className="space-y-2 text-gray-700">
              {[
                '🌧️ Heavy Rainfall / Flooding / Waterlogging',
                '🌡️ Extreme Heat (above 45°C)',
                '🏭 Severe Air Pollution (AQI above 400)',
                '🌪️ Cyclone / Earthquake / Landslide',
                '🚫 Curfew / Bandh / Strike / Section 144',
                '📱 App Server Down / Platform Outage',
                '🌐 Government Internet Shutdown',
                '🌫️ Dense Fog / Dust Storm / High Wind',
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-red-700 mb-4">❌ Not Covered</h3>
            <ul className="space-y-2 text-gray-700">
              {[
                '🏥 Health or Medical bills',
                '💀 Life Insurance',
                '🤕 Accident coverage',
                '🛵 Vehicle repair or damage',
                '😴 Personal reasons for absence',
                '📱 Phone damage or loss',
                '🚗 Normal traffic delays',
                '🚫 Platform account bans',
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ===== PLANS ===== */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            💰 Simple Weekly Plans
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Matched to gig workers' weekly payout cycle. Pause or cancel anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Basic',
                emoji: '🥉',
                price: '25-35',
                coverage: '70%',
                hourly: '₹40',
                daily: '₹300',
                weekly: '₹1,500',
                best: 'Part-time workers',
                color: 'gray',
              },
              {
                name: 'Standard',
                emoji: '🥈',
                price: '35-48',
                coverage: '80%',
                hourly: '₹55',
                daily: '₹450',
                weekly: '₹2,250',
                best: 'Regular workers',
                color: 'blue',
                recommended: true,
              },
              {
                name: 'Pro',
                emoji: '🥇',
                price: '48-60',
                coverage: '90%',
                hourly: '₹75',
                daily: '₹600',
                weekly: '₹3,000',
                best: 'Full-time workers',
                color: 'purple',
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white p-6 rounded-2xl shadow-lg border-2 relative ${
                  plan.recommended ? 'border-blue-500 scale-105' : 'border-gray-200'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs px-4 py-1 rounded-full font-bold">
                    ⭐ RECOMMENDED
                  </div>
                )}
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">{plan.emoji}</div>
                  <h3 className="text-xl font-bold capitalize">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-700 mt-2">
                    ₹{plan.price}
                  </div>
                  <div className="text-gray-500 text-sm">/week</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Coverage</span>
                    <span className="font-bold">{plan.coverage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Per Hour</span>
                    <span className="font-bold">{plan.hourly}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Max</span>
                    <span className="font-bold">{plan.daily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weekly Max</span>
                    <span className="font-bold">{plan.weekly}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Best For</span>
                    <span className="font-bold text-xs">{plan.best}</span>
                  </div>
                </div>
                <Link
                  to="/onboarding"
                  className={`block mt-4 py-2.5 rounded-lg text-center font-semibold text-sm transition ${
                    plan.recommended
                      ? 'bg-blue-700 text-white hover:bg-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Choose {plan.name} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TECH HIGHLIGHTS ===== */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          🧠 Built With Cutting-Edge Tech
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🤖',
              title: 'ML Risk Model',
              desc: 'XGBoost-based zone risk scoring using 29+ features including weather history, geography, social patterns, and infrastructure data.',
            },
            {
              icon: '🔍',
              title: '7-Layer Fraud Detection',
              desc: 'Goes beyond GPS — uses cell tower triangulation, motion sensors, barometer, behavioral analysis, and network graph for syndicate detection.',
            },
            {
              icon: '⚡',
              title: 'Parametric Auto-Triggers',
              desc: '26 trigger types across 4 categories monitored every 15 minutes. Zero-touch claim creation when thresholds are breached.',
            },
            {
              icon: '🔐',
              title: 'Aadhaar Token System',
              desc: 'One worker = one Aadhaar = one token. SHA-256 hashing ensures privacy. Raw Aadhaar never stored.',
            },
            {
              icon: '📊',
              title: 'Predictive Forecasting',
              desc: 'Next-week disruption predictions help workers plan and insurers set reserves. Zone-level probability forecasts.',
            },
            {
              icon: '💸',
              title: 'Instant UPI Payouts',
              desc: 'Auto-approved claims paid in 5-15 minutes. Yellow-lane claims get 60% advance while under review.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DEMO CTA ===== */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">🚀 Try the Live Demo</h2>
          <p className="text-blue-200 mb-8 text-lg">
            Experience the full GigShield platform — register a worker, buy a policy,
            simulate a disruption, and watch the instant payout!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/onboarding"
              className="bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition"
            >
              📱 Register as Worker
            </Link>
            <Link
              to="/dashboard?worker_id=1"
              className="bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-400 transition border border-blue-400"
            >
              📊 View Demo Dashboard
            </Link>
            <Link
              to="/admin"
              className="bg-blue-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-800 transition border border-blue-700"
            >
              🛡️ Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* ===== TEAM ===== */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">👥 Team IT Wizards</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {[
            { name: 'Mayank Singhal', role: 'Full Stack Lead' },
            { name: 'Sumit Kumar', role: 'ML & AI Engineer' },
            { name: 'Vibha Rajput', role: 'Frontend Developer' },
            { name: 'Sakshi Singh', role: 'Product & Data' },
            { name: 'Bhumika Gupta', role: 'Product & Data' },
          ].map((member, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-md text-center hover:shadow-lg transition">
              <div className="text-3xl mb-2">
                {['🧑‍💻', '🤖', '🎨', '📊', '📋'][i]}
              </div>
              <h4 className="font-bold text-sm">{member.name}</h4>
              <p className="text-gray-500 text-xs mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3">🛡️ GigShield</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-Powered Parametric Micro-Insurance for India's Gig Economy.
                Protecting delivery workers from income loss due to external disruptions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to="/onboarding" className="text-gray-400 hover:text-white block">→ Register</Link>
                <Link to="/dashboard" className="text-gray-400 hover:text-white block">→ Worker Dashboard</Link>
                <Link to="/risk-map" className="text-gray-400 hover:text-white block">→ Risk Heatmap</Link>
                <Link to="/admin" className="text-gray-400 hover:text-white block">→ Admin Portal</Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'FastAPI', 'PostgreSQL', 'XGBoost', 'Leaflet', 'Recharts', 'Tailwind', 'UPI'].map(
                  (tech) => (
                    <span key={tech} className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs">
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              Built for <strong>Guidewire DEVTrails 2026</strong> by Team IT Wizards
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Because every delivery partner deserves a safety net. 🧡
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;