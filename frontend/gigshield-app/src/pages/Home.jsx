import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">🛡️ GigShield</h1>
        <p className="text-2xl text-blue-700 font-semibold mb-4">Your Earnings, Protected Every Week</p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          AI-powered parametric insurance that automatically protects gig delivery
          workers against income loss from weather, pollution, curfews, and app outages.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/onboarding" className="bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-800 shadow-lg transform hover:scale-105 transition">
            Get Protected Now →
          </Link>
          <Link to="/dashboard" className="bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-blue-700 hover:bg-blue-50 shadow-lg transform hover:scale-105 transition">
            View Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How GigShield Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="font-bold text-lg mb-2">1. Register</h3>
            <p className="text-gray-600 text-sm">Verify Aadhaar, choose your platform and zone. Get your unique GigShield token.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-bold text-lg mb-2">2. Choose Plan</h3>
            <p className="text-gray-600 text-sm">Pick Basic, Standard, or Pro plan. AI calculates your personalized weekly premium.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">🌧️</div>
            <h3 className="font-bold text-lg mb-2">3. Auto-Detect</h3>
            <p className="text-gray-600 text-sm">System monitors weather, AQI, curfews 24/7. Disruptions are detected automatically.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-lg mb-2">4. Instant Payout</h3>
            <p className="text-gray-600 text-sm">Claim auto-created, fraud checked by AI, payout sent to UPI in 15 minutes.</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div><div className="text-4xl font-bold">₹25</div><div className="text-blue-200 mt-2">Starting Premium/Week</div></div>
            <div><div className="text-4xl font-bold">15 min</div><div className="text-blue-200 mt-2">Average Payout Time</div></div>
            <div><div className="text-4xl font-bold">26</div><div className="text-blue-200 mt-2">Disruption Triggers</div></div>
            <div><div className="text-4xl font-bold">0</div><div className="text-blue-200 mt-2">Paperwork Required</div></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What We Cover</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-green-700 mb-4">✅ Covered (Income Loss)</h3>
            <ul className="space-y-2 text-gray-700">
              <li>🌧️ Heavy Rainfall / Flooding</li>
              <li>🌡️ Extreme Heat (above 45°C)</li>
              <li>🏭 Severe Air Pollution (AQI above 400)</li>
              <li>🌪️ Cyclone / Earthquake / Landslide</li>
              <li>🚫 Curfew / Bandh / Strike</li>
              <li>📱 App Server Down / Internet Shutdown</li>
              <li>🌫️ Dense Fog / Dust Storm</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-red-700 mb-4">❌ Not Covered</h3>
            <ul className="space-y-2 text-gray-700">
              <li>🏥 Health or Medical bills</li>
              <li>💀 Life Insurance</li>
              <li>🤕 Accident coverage</li>
              <li>🛵 Vehicle repair or damage</li>
              <li>😴 Personal reasons for absence</li>
              <li>📱 Phone damage or loss</li>
              <li>🚗 Normal traffic delays</li>
            </ul>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold">🛡️ GigShield</p>
          <p className="text-gray-400 mt-2">Built for India's Gig Workers | Guidewire DEVTrails 2026</p>
          <p className="text-gray-500 mt-1 text-sm">Because every delivery partner deserves a safety net.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;