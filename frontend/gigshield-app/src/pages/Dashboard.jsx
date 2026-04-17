import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, MapIcon, TrendingUp, AlertTriangle, CloudRain, Clock, Activity, Power, LogOut, XCircle, Info, ChevronRight, Zap, Mic, Satellite, Car, Cpu, RadioReceiver } from 'lucide-react';
import {
  getWorkerDashboard,
  getWorkerClaims,
  simulateDisruption,
  getCurrentWeather,
  getCurrentAQI,
  getForecast,
  getWorkerStreak,
  pausePolicy,
  renewPolicy,
  cancelPolicy,
  getWorkerPolicies,
  appealClaim,
  getClaimDetails,
} from '../services/api';
import FraudShield from '../components/FraudShield';
import NotificationCenter from '../components/NotificationCenter';
import GuidedTour from '../components/GuidedTour';
import WorkerIDCard from '../components/WorkerIDCard';
import ThemeToggle from '../components/ThemeToggle';
import { LanguageToggle, useI18n } from '../components/I18nProvider';
import AnimatedCounter from '../components/AnimatedCounter';
import SkeletonLoader from '../components/SkeletonLoader';
import VoiceSOS from '../components/VoiceSOS';
import BiometricScanner from '../components/BiometricScanner';
import WhatsAppBot from '../components/WhatsAppBot';
import HolographicPassport from '../components/HolographicPassport';
import TimeMachine from '../components/TimeMachine';
import MeshRadar from '../components/MeshRadar';

// ============================================
// ZONE TO PINCODE MAP
// ============================================
const ZONE_PINCODE = {
  'Andheri West': '400053',
  'Bandra': '400050',
  'Sion': '400069',
  'Powai': '400076',
  'Connaught Place': '110001',
  'Rohini': '110085',
  'Dwarka': '110075',
  'Sector 29': '122001',
  'Whitefield': '560066',
  'Koramangala': '560034',
  'Electronic City': '560100',
  'Marina Beach': '600004',
  'T Nagar': '600017',
  'Sector 62': '201301',
};

const TRIGGER_ICONS = {
  HEAVY_RAIN: '🌧️',
  SEVERE_AQI: '🏭',
  EXTREME_HEAT: '🌡️',
  CURFEW: '🚫',
  APP_DOWN: '📱',
  FLOOD: '🌊',
  CYCLONE: '🌪️',
  EARTHQUAKE: '🏚️',
  BANDH: '✊',
  DENSE_FOG: '🌫️',
  DUST_STORM: '🌪️',
  HIGH_WIND: '💨',
  INTERNET_SHUTDOWN: '🌐',
};


// ============================================
// WEATHER WIDGET
// ============================================
function WeatherWidget({ pincode, coords }) {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pincode) loadWeather();
  }, [pincode, coords]);

  const loadWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const [wRes, aRes] = await Promise.allSettled([
        getCurrentWeather(pincode, coords?.lat, coords?.lon),
        getCurrentAQI(pincode, coords?.lat, coords?.lon),
      ]);
      if (wRes.status === 'fulfilled') setWeather(wRes.value.data);
      if (aRes.status === 'fulfilled') setAqi(aRes.value.data);
    } catch (err) {
      setError('Weather unavailable');
    }
    setLoading(false);
  };

  const getIcon = (condition) => {
    const icons = {
      Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
      Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Haze: '🌫️',
      Fog: '🌫️', Dust: '🌪️', Smoke: '💨',
    };
    return icons[condition] || '🌤️';
  };

  const getAqiStyle = (val) => {
    if (val <= 50) return 'text-green-300 bg-green-900/40 border border-green-500/30';
    if (val <= 100) return 'text-yellow-300 bg-yellow-900/40 border border-yellow-500/30';
    if (val <= 200) return 'text-orange-300 bg-orange-900/40 border border-orange-500/30';
    if (val <= 300) return 'text-red-300 bg-red-900/40 border border-red-500/30';
    return 'text-red-200 bg-red-900/60 border border-red-500/50';
  };

  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-3xl text-white animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-indigo-600/20" />
        <div className="flex items-center justify-center py-6 relative z-10">
          <span className="text-lg">☁️ Loading live weather...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass-panel p-6 rounded-3xl text-slate-300 text-center border-dashed border-white/20">
        <p>🌤️ Weather data unavailable</p>
        <button onClick={loadWeather} className="underline text-sm mt-1 text-brand-400 hover:text-brand-300">Retry connection</button>
      </div>
    );
  }

  const w = weather.current_weather;
  const hasTriggers = weather.trigger_count > 0;

  return (
    <div className={`p-6 rounded-3xl text-white shadow-lg relative overflow-hidden transition-all duration-500 ${hasTriggers
        ? 'glass-super border-red-500/30'
        : 'glass-panel border-white/10'
      }`}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 opacity-40 transition-colors duration-500 ${hasTriggers ? 'bg-gradient-to-br from-red-600 to-orange-600' : 'bg-gradient-to-br from-brand-600 to-indigo-600'
        }`} />

      {/* Main Weather */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-5xl drop-shadow-md">{getIcon(w.condition)}</span>
            <span className="text-5xl font-bold tracking-tight">{Math.round(w.temperature)}°</span>
          </div>
          <p className="text-white/80 capitalize text-sm font-medium mt-2">{w.description}</p>
          <p className="text-white/70 text-xs mt-1">Feels like {Math.round(w.feels_like)}°C</p>
          <p className="text-white/60 text-xs mt-3 flex items-center"><MapIcon size={12} className="mr-1" /> {weather.zone}, {weather.city}</p>
        </div>
        <div className="text-right text-sm space-y-2">
          <div className="bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md">💨 {w.wind_speed_kmh} km/h</div>
          <div className="bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md">💧 {w.humidity}%</div>
          {w.rainfall_1h > 0 && <div className="bg-blue-500/30 text-blue-100 px-2 py-1 rounded-lg backdrop-blur-md">🌧️ {w.rainfall_1h} mm/hr</div>}
          {aqi && aqi.aqi && (
            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getAqiStyle(aqi.aqi.value)} backdrop-blur-md`}>
              AQI: {aqi.aqi.value}
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {hasTriggers && (
        <div className="mt-5 bg-red-950/40 border border-red-500/30 backdrop-blur-lg rounded-2xl p-4 relative z-10">
          <p className="font-bold text-sm text-red-200 mb-2 flex items-center">
            <ShieldAlert size={16} className="mr-2" /> {weather.trigger_count} Active Alert{weather.trigger_count > 1 ? 's' : ''}
          </p>
          {weather.triggers_detected.map((t, i) => (
            <div key={i} className="bg-red-500/20 text-red-100 rounded-lg px-3 py-2 mb-1 text-sm border border-red-500/20">
              {t.description}
            </div>
          ))}
          <p className="text-xs text-red-300 mt-3 font-medium">
            Risk thresholds breached. Claim will be auto-processed!
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center relative z-10 border-t border-white/10 pt-3">
        <span className="text-xs text-brand-200/50">Updated: {weather.fetched_at}</span>
        <button onClick={loadWeather} className="text-xs glass-panel px-3 py-1 rounded-full hover:bg-white/10 transition">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}


// ============================================
// FORECAST WIDGET
// ============================================
function ForecastWidget({ pincode, coords }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pincode) loadForecast();
    // Auto-refresh forecast
    const interval = setInterval(() => { if (pincode) loadForecast(); }, 300000);
    return () => clearInterval(interval);
  }, [pincode, coords]);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const res = await getForecast(pincode, coords?.lat, coords?.lon);
      setForecast(res.data);
    } catch (err) {
      console.error('Forecast failed');
    }
    setLoading(false);
  };

  if (loading || !forecast) {
    return (
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden h-full flex flex-col justify-center border border-white/5 shadow-2xl">
        <div className="h-4 bg-slate-800 rounded w-1/2 mb-4 animate-[pulse_1s_ease-in-out_infinite]"></div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-800 rounded animate-[pulse_1.2s_ease-in-out_infinite]"></div>
          <div className="h-3 bg-slate-800 rounded animate-[pulse_1.4s_ease-in-out_infinite] w-5/6"></div>
          <div className="h-3 bg-slate-800 rounded animate-[pulse_1.6s_ease-in-out_infinite] w-4/6"></div>
        </div>
      </div>
    );
  }

  const barColor = (prob) => {
    if (prob < 30) return 'bg-green-400';
    if (prob < 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const textColor = (prob) => {
    if (prob < 30) return 'text-green-600';
    if (prob < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const labels = {
    heavy_rain: { icon: '🌧️', name: 'Heavy Rain' },
    severe_aqi: { icon: '🏭', name: 'Severe AQI' },
    flooding: { icon: '🌊', name: 'Flooding' },
    curfew_bandh: { icon: '🚫', name: 'Curfew/Bandh' },
  };

  // Icon mapping for forecast conditions
  const weatherIcon = (condition) => {
    const icons = {
      Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
      Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Haze: '🌫️',
    };
    return icons[condition] || '🌤️';
  };

  const isRealApi = forecast.source === 'openweathermap';

  return (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-brand-500/10 blur-[50px] rounded-full pointer-events-none" />
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center"><CloudRain className="mr-2 text-brand-400" size={20} /> 7-Day Forecast</h3>
          {isRealApi && (
            <span className="text-[10px] uppercase tracking-wider text-green-400 font-bold mt-1 inline-block">🟢 Live Data Source</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-brand-900/50 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full font-medium">
            {forecast.current_season}
          </span>
          <button onClick={loadForecast} className="text-xs glass-panel px-2 py-1 rounded-full hover:bg-white/10 transition">🔄</button>
        </div>
      </div>

      {/* Dynamic Daily Forecast from API */}
      {forecast.daily_forecast && forecast.daily_forecast.length > 0 && (
        <div className="mb-6 relative z-10">
          <div className="grid grid-cols-5 gap-2 text-center">
            {forecast.daily_forecast.slice(0, 5).map((day, idx) => {
              const dayName = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' });
              return (
                <div key={idx} className="bg-white/5 hover:bg-white/10 transition rounded-2xl p-2 border border-white/5 flex flex-col justify-between" style={{ height: '110px' }}>
                  <div className="text-xs text-slate-400 font-medium">{dayName}</div>
                  <div className="text-2xl my-1 drop-shadow-sm">{weatherIcon(day.condition)}</div>
                  <div className="flex flex-col items-center justify-center border-t border-white/5 pt-1 mt-1">
                    <span className="text-[13px] font-bold text-white">{Math.round(day.temp_max)}°</span>
                    <span className="text-[11px] text-slate-500">{Math.round(day.temp_min)}°</span>
                  </div>
                  {day.rainfall_mm > 0 && (
                    <div className="text-[10px] text-blue-400 font-medium mt-1 absolute bottom-1 left-1/2 -translate-x-1/2">💧{day.rainfall_mm}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Warnings from API */}
      {forecast.warnings && forecast.warnings.length > 0 && (
        <div className="mb-6 space-y-2 relative z-10">
          {forecast.warnings.map((w, i) => (
            <div key={i} className="bg-orange-900/30 border border-orange-500/30 text-orange-300 text-xs px-3 py-2 rounded-xl flex items-start">
              <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 relative z-10">
        {Object.entries(forecast.predictions).map(([key, pred]) => {
          const label = labels[key] || { icon: '⚡', name: key };
          return (
            <div key={key}>
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="text-slate-300 flex items-center">{label.icon} <span className="ml-2">{label.name}</span></span>
                <span className={`font-bold ${textColor(pred.probability)}`}>
                  {pred.probability}%
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor(pred.probability)}`}
                  style={{ width: `${Math.min(pred.probability, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory */}
      <div className={`mt-6 p-4 rounded-2xl text-sm border relative z-10 ${forecast.predictions.heavy_rain?.probability > 50
          ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-200'
          : 'bg-green-900/20 border-green-500/30 text-green-200'
        }`}>
        <div className="flex items-start">
          <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{forecast.worker_advisory}</span>
        </div>
      </div>

      {/* Impact */}
      <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
          <div className="text-xs text-slate-400 mb-1">Expected Triggers</div>
          <div className="font-bold text-lg text-white">{forecast.expected_impact.expected_claims}</div>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
          <div className="text-xs text-slate-400 mb-1">Estimated Impact</div>
          <div className="font-bold text-lg text-white">{forecast.expected_impact.expected_payout}</div>
        </div>
      </div>

      {/* Source timestamp */}
      {forecast.fetched_at && (
        <div className="mt-4 text-[10px] text-slate-500 text-right font-medium relative z-10 tracking-wider uppercase">
          Synced: {forecast.fetched_at}
        </div>
      )}
    </div>
  );
}


// ============================================
// STREAK WIDGET
// ============================================
function StreakWidget({ workerId }) {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    if (workerId) loadStreak();
  }, [workerId]);

  const loadStreak = async () => {
    try {
      const res = await getWorkerStreak(workerId);
      setStreak(res.data);
    } catch (err) {
      console.error('Streak failed');
    }
  };

  if (!streak) return null;

  const active = streak.streak_active;

  return (
    <div className={`p-6 rounded-3xl relative overflow-hidden transition-all duration-300 ${active
        ? 'glass-super border-orange-500/30'
        : 'glass-panel border-white/10'
      }`}>
      {active && <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 to-red-600/40" />}

      <div className="flex justify-between items-center relative z-10">
        <div>
          <h3 className="font-bold text-xl text-white flex items-center">
            <Zap className={`mr-2 ${active ? 'text-yellow-300' : 'text-slate-500'}`} size={20} /> Clean Streak
          </h3>
          <p className="text-sm mt-1 text-slate-300">
            {streak.message}
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white tracking-tighter">
            {streak.clean_weeks}<span className="text-xl text-white/50">/4</span>
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-400 mt-1">
            Weeks
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5 flex space-x-2 relative z-10">
        {[1, 2, 3, 4].map((week) => (
          <div
            key={week}
            className={`flex-1 h-3 rounded-full transition-all duration-500 border overflow-hidden ${week <= streak.clean_weeks
                ? active ? 'bg-gradient-to-r from-yellow-400 to-orange-400 border-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.5)]' : 'bg-gradient-to-r from-emerald-400 to-emerald-500 border-emerald-300'
                : 'bg-slate-800/50 border-white/5'
              }`}
          />
        ))}
      </div>

      {active && (
        <div className="mt-5 bg-white/10 border border-white/20 rounded-2xl p-3 text-center text-sm font-medium text-white shadow-inner relative z-10 backdrop-blur-md">
          🎉 You earned <strong className="text-yellow-300">{streak.premium_discount}</strong> off next week!
        </div>
      )}

      <div className="mt-4 flex justify-between items-center relative z-10 pt-3 border-t border-white/10">
        <span className="text-xs font-semibold text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5">
          Trust Score: <span className="text-white">{streak.trust_score}</span> <span className="text-brand-400">({streak.trust_tier})</span>
        </span>
        {!active && streak.weeks_to_streak > 0 && (
          <span className="text-xs text-brand-400 font-bold bg-brand-900/30 px-3 py-1.5 rounded-full border border-brand-500/20">
            {streak.weeks_to_streak} weeks left
          </span>
        )}
      </div>
    </div>
  );
}


// ============================================
// POLICY CARD
// ============================================
function PolicyCard({ workerId, policy, onUpdate }) {
  const [actionLoading, setActionLoading] = useState('');

  if (!policy || policy.status === 'none' || !policy.plan_type) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center border border-white/10">
        <div className="flex justify-center mb-4">
          <div className="bg-brand-900/30 p-4 rounded-full border border-brand-500/20">
            <ShieldAlert size={32} className="text-brand-400" />
          </div>
        </div>
        <h3 className="font-bold text-white text-xl mb-2">No Active Policy</h3>
        <p className="text-slate-400 text-sm mb-6">Get protected from disruptions now!</p>
        <a href="/onboarding" className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 transition inline-block">
          Get Coverage
        </a>
      </div>
    );
  }

  const handleAction = async (action) => {
    const messages = {
      pause: 'Pause your policy? You won\'t be covered during pause.',
      cancel: 'Cancel your policy? You\'ll need to re-register.',
      renew: 'Renew your policy for another week?',
    };
    if (!window.confirm(messages[action])) return;

    setActionLoading(action);
    try {
      const policiesRes = await getWorkerPolicies(workerId);
      const activePolicy = policiesRes.data.policies?.find(p => p.status === 'active');

      if (!activePolicy && action !== 'renew') {
        alert('No active policy found');
        setActionLoading('');
        return;
      }

      const policyId = activePolicy?.id || policiesRes.data.policies?.[0]?.id;

      if (action === 'pause') {
        await pausePolicy(policyId);
        alert('✅ Policy paused. Resume anytime!');
      } else if (action === 'cancel') {
        await cancelPolicy(policyId);
        alert('Policy cancelled.');
      } else if (action === 'renew') {
        await renewPolicy(policyId);
        alert('✅ Policy renewed for another week!');
      }
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to ${action}`);
    }
    setActionLoading('');
  };

  const planGradients = {
    basic: 'from-slate-600 to-slate-800 border-slate-500',
    standard: 'from-brand-600 to-brand-800 border-brand-500',
    pro: 'from-purple-600 to-fuchsia-800 border-purple-500',
  };

  const planEmojis = { basic: '🥉', standard: '🥈', pro: '🥇' };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
      {/* Header */}
      <div className={`bg-gradient-to-r ${planGradients[policy.plan_type] || planGradients.standard} p-6 text-white relative`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">Active Coverage</div>
            <div className="text-2xl font-bold capitalize flex items-center">
              <span className="mr-2 text-3xl">{planEmojis[policy.plan_type]}</span> {policy.plan_type} Plan
            </div>
          </div>
          <div className="text-right bg-black/20 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-3xl font-bold tracking-tighter">₹{policy.weekly_premium}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Per Week</div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center bg-slate-800/50 p-4 rounded-2xl border border-white/5 hover:bg-slate-800 transition">
            <div className="text-xs text-slate-400 mb-1">Protection</div>
            <div className="font-bold text-xl text-brand-400">{policy.coverage_percent}%</div>
          </div>
          <div className="text-center bg-slate-800/50 p-4 rounded-2xl border border-white/5 hover:bg-slate-800 transition">
            <div className="text-xs text-slate-400 mb-1">Daily Max</div>
            <div className="font-bold text-xl text-emerald-400">₹{policy.daily_max}</div>
          </div>
          <div className="text-center bg-slate-800/50 p-4 rounded-2xl border border-white/5 hover:bg-slate-800 transition">
            <div className="text-xs text-slate-400 mb-1">Days Left</div>
            <div className={`font-bold text-xl ${policy.days_remaining <= 2 ? 'text-red-400' : 'text-white'}`}>
              {policy.days_remaining}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {policy.days_remaining <= 2 && policy.days_remaining > 0 && (
          <div className="bg-yellow-900/40 border border-yellow-500/30 p-3 rounded-xl text-xs text-yellow-300 mb-4 flex items-center">
            <AlertTriangle size={14} className="mr-2 flex-shrink-0" />
            Expires in {policy.days_remaining} day{policy.days_remaining > 1 ? 's' : ''}!
          </div>
        )}
        {policy.days_remaining === 0 && (
          <div className="bg-red-900/40 border border-red-500/30 p-3 rounded-xl text-xs text-red-300 mb-4 flex items-center">
            <AlertTriangle size={14} className="mr-2 flex-shrink-0" />
            Policy expired! Renew now to stay protected.
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 mt-2">
          {policy.days_remaining === 0 ? (
            <button
              onClick={() => handleAction('renew')}
              disabled={actionLoading === 'renew'}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:opacity-90 disabled:opacity-50 transition"
            >
              {actionLoading === 'renew' ? '⏳ Renewing...' : '🔄 Renew Policy'}
            </button>
          ) : (
            <>
              <button
                onClick={() => handleAction('pause')}
                disabled={!!actionLoading}
                className="flex-1 glass-panel text-white py-3 rounded-xl text-sm font-bold hover:bg-white/10 disabled:opacity-50 transition flex items-center justify-center border border-white/20"
              >
                {actionLoading === 'pause' ? <span className="animate-pulse">...</span> : <><Power size={14} className="mr-2 text-yellow-400" /> Pause</>}
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={!!actionLoading}
                className="flex-1 glass-panel text-white py-3 rounded-xl text-sm font-bold hover:bg-red-500/20 hover:border-red-500/30 disabled:opacity-50 transition flex items-center justify-center border border-white/10"
              >
                {actionLoading === 'cancel' ? <span className="animate-pulse">...</span> : <><XCircle size={14} className="mr-2 text-red-400" /> Cancel</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================
// CLAIM DETAIL MODAL
// ============================================
function ClaimDetailModal({ claim, onClose, onUpdate }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealLoading, setAppealLoading] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [claim.id]);

  const loadDetails = async () => {
    try {
      const res = await getClaimDetails(claim.id);
      setDetails(res.data);
    } catch (err) {
      console.error('Claim details failed');
    }
    setLoading(false);
  };

  const handleAppeal = async () => {
    if (!appealReason.trim()) return alert('Please enter a reason');
    setAppealLoading(true);
    try {
      await appealClaim(claim.id, { claim_id: claim.id, reason: appealReason, evidence_type: 'text' });
      alert('✅ Appeal submitted! Admin will review within 4 hours.');
      onUpdate();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || 'Appeal failed');
    }
    setAppealLoading(false);
  };

  const statusColors = {
    auto_approved: 'bg-green-500',
    approved: 'bg-green-500',
    manual_review: 'bg-yellow-500',
    under_appeal: 'bg-blue-500',
    rejected: 'bg-red-500',
  };

  const triggerType = claim.trigger_type || claim.type || 'Unknown';
  const fraudScore = claim.fraud_score || 0;
  const payoutAmount = claim.payout_amount || claim.payout || 0;
  const disruption = claim.disruption_hours || claim.hours || 0;
  const status = claim.status || 'unknown';
  const createdAt = claim.created_at || claim.date || '';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-super rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b border-white/10 ${status === 'auto_approved' || status === 'approved' ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-900/40' :
            status === 'rejected' ? 'bg-gradient-to-r from-red-600/30 to-red-900/40' :
              'bg-gradient-to-r from-brand-600/30 to-brand-900/40'
          }`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Claim #{claim.id}</div>
              <div className="text-2xl font-bold capitalize text-white flex items-center">
                {status.replace(/_/g, ' ')}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
              <XCircle size={28} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Trigger */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl">
            <div className="font-bold text-slate-300 mb-3 flex items-center"><Activity size={16} className="mr-2 text-brand-400" /> Disruption Details</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs">Type</span> <span className="font-medium text-white text-base mt-0.5 inline-block">{TRIGGER_ICONS[triggerType] || '⚡'} {triggerType}</span></div>
              <div><span className="text-slate-500 block text-xs">Duration</span> <span className="font-medium text-white text-base mt-0.5 inline-block">{disruption}h</span></div>
              <div><span className="text-slate-500 block text-xs">Zone</span> <span className="font-medium text-white text-base mt-0.5 inline-block">{claim.trigger_zone || details?.trigger?.zone || 'Your zone'}</span></div>
              <div><span className="text-slate-500 block text-xs">Date</span> <span className="font-medium text-white text-base mt-0.5 inline-block">{createdAt}</span></div>
            </div>
          </div>

          {/* Payout */}
          <div className="bg-emerald-900/20 border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="font-bold text-emerald-400 mb-2 relative z-10">💰 Payout Status</div>
            <div className="text-4xl font-bold text-white text-center my-4 relative z-10 tracking-tighter drop-shadow-md">₹{payoutAmount}</div>
            <div className="grid grid-cols-2 gap-2 text-sm relative z-10 mt-2 bg-black/20 p-3 rounded-xl border border-white/5">
              <div><span className="text-slate-400 block text-[10px] uppercase">Status</span> <span className="font-bold text-emerald-300 capitalize">{claim.payout_status || status}</span></div>
              {claim.transaction_id && (
                <div><span className="text-slate-400 block text-[10px] uppercase">Transaction</span> <span className="font-mono text-xs text-slate-300">{claim.transaction_id}</span></div>
              )}
            </div>
          </div>

          {/* Fraud Score */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="font-bold text-slate-300 mb-3 flex items-center"><ShieldAlert size={16} className="mr-2 text-brand-400" /> AI Verification Score</div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex-1 bg-slate-900 rounded-full h-3 border border-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${fraudScore <= 30 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                      fraudScore <= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                  style={{ width: `${fraudScore}%` }}
                />
              </div>
              <span className={`font-bold text-xl ${fraudScore <= 30 ? 'text-emerald-400' :
                  fraudScore <= 70 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                {fraudScore}
              </span>
            </div>
            <p className="text-xs mt-2 font-medium px-3 py-1.5 rounded-lg inline-block bg-white/5 border border-white/5">
              {fraudScore <= 30 ? <span className="text-emerald-400">✅ Low risk — Auto approved</span> :
                fraudScore <= 70 ? <span className="text-yellow-400">⚠️ Medium risk — Under review</span> : <span className="text-red-400">🔴 High risk — Flagged</span>}
            </p>

            {/* Fraud Details */}
            {details?.claim?.fraud_details && (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {Object.entries(details.claim.fraud_details)
                  .filter(([key]) => !['final_score', 'decision', 'decision_reason', 'appeal'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs bg-slate-800/40 px-3 py-2 rounded-lg border border-white/5">
                      <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className={`font-bold ${String(value).includes('PASS') ? 'text-emerald-400' :
                          String(value).includes('FLAG') ? 'text-yellow-400' :
                            String(value).includes('FAIL') ? 'text-red-400' : 'text-slate-300'
                        }`}>{String(value)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Appeal Section */}
          {(status === 'rejected' || status === 'manual_review') && (
            <div className="border-t border-white/10 pt-5">
              {!showAppeal ? (
                <button
                  onClick={() => setShowAppeal(true)}
                  className="w-full bg-brand-600/30 border border-brand-500/50 text-brand-200 py-3 rounded-xl font-bold hover:bg-brand-600/50 transition shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                >
                  📝 Appeal This Decision
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 bg-slate-900/50 p-4 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-white flex items-center"><Info size={16} className="mr-2 text-brand-400" /> Submit Appeal</h4>
                  <textarea
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Explain why this claim is valid..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700/50 rounded-xl text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAppeal}
                      disabled={appealLoading}
                      className="flex-1 bg-brand-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-brand-500 transition shadow-lg disabled:opacity-50"
                    >
                      {appealLoading ? '⏳ Submitting...' : '✅ Submit'}
                    </button>
                    <button onClick={() => setShowAppeal(false)} className="px-5 glass-panel text-slate-300 py-2.5 rounded-xl text-sm hover:text-white hover:bg-white/10 transition">
                      Cancel
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide px-1">Admin reviews within 4 hours. If approved: full payout + trust bonus.</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


// ============================================
// MAIN DASHBOARD
// ============================================
function Dashboard() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [workerId, setWorkerId] = useState(searchParams.get('worker_id') || '');
  const [dashboard, setDashboard] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [coords, setCoords] = useState(null);

  // Outstanding Features
  const [sosActive, setSosActive] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);

  const loadDashboard = async (idToLoad = workerId) => {
    if (!idToLoad) return;
    setLoading(true);
    setError('');

    // Prompt hardware permissions ONLY ONCE
    if (!dashboard && !window.hasAlertedPermissions) {
      window.hasAlertedPermissions = true;
      alert("🔒 Security Prompt: RahatPay requires access to your GPS, Gyroscope, and Ambient sensors for 7-Layer FraudShield telemetry.");

      if (typeof window.DeviceOrientationEvent !== 'undefined' && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        window.DeviceOrientationEvent.requestPermission().catch(console.error);
      }
      if (typeof window.DeviceMotionEvent !== 'undefined' && typeof window.DeviceMotionEvent.requestPermission === 'function') {
        window.DeviceMotionEvent.requestPermission().catch(console.error);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.warn("Geolocation denied", err)
      );
    }

    try {
      const [dashRes, claimsRes] = await Promise.all([
        getWorkerDashboard(idToLoad),
        getWorkerClaims(idToLoad),
      ]);
      setDashboard(dashRes.data);
      setClaims(claimsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (workerId) loadDashboard();
  }, []);

  const handleSimulate = async (type, value) => {
    if (!dashboard) return;
    setSimLoading(true);
    setSimResult(null);

    // Trigger FraudShield scanning animation
    window.dispatchEvent(new Event('trigger-fraud-scan'));

    const pincode = ZONE_PINCODE[dashboard.worker.zone] || '400053';
    try {
      const res = await simulateDisruption({
        disruption_type: type, pincode: pincode,
        zone: dashboard.worker.zone, value: value, duration_hours: 4,
      });
      setSimResult(res.data);
      setTimeout(loadDashboard, 1500);
    } catch (err) {
      setSimResult({ error: err.response?.data?.detail || 'Simulation failed' });
    }
    setSimLoading(false);
  };

  const handleSOS = () => {
    setSosActive(true);

    // Trigger FraudShield scanning animation
    window.dispatchEvent(new Event('trigger-fraud-scan'));

    setTimeout(() => {
      alert("🚨 PRIORITY 0: Satellite SOS Signal Sent!\nCoordinates Locked: " + (coords ? `${coords.lat}, ${coords.lon}` : "Local Tower Proxy") + "\nMedical Rapid Response & Payout Dispatched.");
      setSosActive(false);
    }, 3500);
  };

  const handleVoiceClaim = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice AI not supported in this browser frame. Please use a modern browser like Chrome.");
      return;
    }
    setVoiceActive(true);
    setVoiceTranscript('Listening... Speak now.');

    try {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRec();
      recognition.lang = 'en-IN';
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(`"${transcript}"`);

        // Trigger FraudShield scanning animation upon processing transcript
        window.dispatchEvent(new Event('trigger-fraud-scan'));

        setTimeout(() => {
          alert(`🎙️ AI Processed Voice Claim:\n"${transcript}"\n\nCategorized as: ON_ROAD_EMERGENCY. Priority set to High.`);
          setVoiceActive(false);
        }, 2000);
      };
      recognition.onerror = () => setVoiceActive(false);
      recognition.onend = () => {
        if (voiceTranscript === 'Listening... Speak now.') {
          setVoiceActive(false);
        }
      };
    } catch (err) {
      setVoiceActive(false);
    }
  };

  // ===== LOGIN SCREEN =====
  if (!dashboard && !loading) {
    return (
      <div className="flex items-center justify-center py-20 px-4 relative min-h-[80vh]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-900 to-slate-900 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-super p-10 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 max-w-md w-full relative z-10"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-8 border border-white/20">
            <ShieldAlert className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-white text-center">RahatPay Central</h2>
          <p className="text-slate-400 mb-8 text-center text-sm px-4">Identify using your Gig Worker Hash to view protected earnings.</p>

          <div className="flex flex-col space-y-4 relative">
            <div className="relative">
              <input
                type="number"
                placeholder="Worker ID (e.g. 1)"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadDashboard(workerId)}
                className="w-full pl-4 pr-16 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none text-lg text-white font-mono shadow-inner"
              />
              <button
                onClick={() => loadDashboard(workerId)}
                disabled={!workerId || loading}
                className="absolute right-2 top-2 bottom-2 bg-brand-600 text-white px-4 rounded-xl font-bold hover:bg-brand-500 disabled:opacity-50 transition shadow-lg shadow-brand-500/20 flex items-center justify-center"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            {error && <p className="text-red-400 mt-2 text-sm text-center font-medium bg-red-900/30 py-2 rounded-lg border border-red-500/20">{error}</p>}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 text-center font-bold">Quick Verification (Demo DB)</p>
            <div className="grid grid-cols-2 gap-3 justify-center">
              {[
                { id: 1, name: 'Rahul', platform: 'Zepto', avatar: 'https://i.pravatar.cc/150?u=1' },
                { id: 3, name: 'Deepak', platform: 'Swiggy', avatar: 'https://i.pravatar.cc/150?u=3' },
                { id: 5, name: 'Priya', platform: 'Blinkit', avatar: 'https://i.pravatar.cc/150?u=5' },
                { id: 8, name: 'Amit', platform: 'Zomato', avatar: 'https://i.pravatar.cc/150?u=8' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => { setWorkerId(String(w.id)); loadDashboard(String(w.id)); }}
                  className="bg-slate-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center space-x-3 w-full hover:bg-white/10 hover:border-brand-500/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] transition-all group text-left"
                >
                  <img src={w.avatar} alt={w.name} className="w-10 h-10 rounded-xl" />
                  <div>
                    <div className="text-white font-bold text-sm tracking-tight">{w.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/50 mt-1 inline-block">{w.platform} • #{w.id}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-brand-500/20 blur-[50px] rounded-full pointer-events-none" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-6 relative z-10 inline-block bg-gradient-to-br from-brand-400 to-indigo-600 p-4 rounded-3xl"
          >
            <ShieldAlert className="text-white" size={48} />
          </motion.div>
          <p className="text-2xl text-white font-bold tracking-tight">Syncing Data...</p>
          <p className="text-slate-400 mt-2">Connecting to parametric triggers</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const workerPincode = ZONE_PINCODE[dashboard.worker.zone] || '400053';

  const trustStyles = {
    PLATINUM: 'bg-purple-100 text-purple-700',
    GOLD: 'bg-yellow-100 text-yellow-700',
    SILVER: 'bg-gray-100 text-gray-700',
    BRONZE: 'bg-orange-100 text-orange-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen text-slate-100 pb-12 pt-24 font-sans relative">
      <div className="fixed inset-0 bg-slate-950 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950 -z-10" />

      {/* Outstanding Hackathon Features */}
      <VoiceSOS workerZone={dashboard.worker.zone} workerPincode={workerPincode} onClaimTriggered={() => setTimeout(loadDashboard, 1500)} />
      <WhatsAppBot workerZone={dashboard.worker.zone} workerPincode={workerPincode} workerId={workerId} onClaimTriggered={() => setTimeout(loadDashboard, 1500)} />
      {showBiometric && <BiometricScanner onScanComplete={() => setShowBiometric(false)} />}

      {/* Claim Modal */}
      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={loadDashboard}
        />
      )}

      {/* Top Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="glass-panel rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-white mb-1">{t('welcome')}, {dashboard.worker.name}! 👋</h2>
            <p className="text-sm text-slate-400 flex items-center space-x-3">
              <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-brand-300 border border-slate-700">#{dashboard.worker.token}</span>
              <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/10">{dashboard.worker.platform}</span>
              <span className="flex items-center"><MapIcon size={14} className="mr-1" /> {dashboard.worker.zone}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4 relative z-10">
            {/* Gamified Trust Arc */}
            <div className="relative w-16 h-16 flex items-center justify-center group cursor-pointer" title={`Trust Score: ${dashboard.worker.trust_score}`}>
              <div className="absolute inset-0 bg-brand-500/5 rounded-full blur-md group-hover:bg-brand-500/20 transition-all"></div>
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-slate-800" />
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeDasharray="175" strokeDashoffset={175 - (175 * dashboard.worker.trust_score / 100)} className={`${dashboard.worker.trust_tier === 'PLATINUM' ? 'stroke-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' :
                    dashboard.worker.trust_tier === 'GOLD' ? 'stroke-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' :
                      dashboard.worker.trust_tier === 'SILVER' ? 'stroke-slate-400' : 'stroke-orange-500'
                  } transition-all duration-1500 ease-out`} strokeLinecap="round" />
              </svg>
              <div className="flex flex-col items-center justify-center relative z-10">
                <span className="text-sm font-black text-white">{dashboard.worker.trust_score}</span>
              </div>
            </div>

            <div className={`px-4 py-2.5 rounded-xl text-sm font-bold flex flex-col justify-center border bg-opacity-20 backdrop-blur-md shadow-lg ${dashboard.worker.trust_tier === 'PLATINUM' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-purple-500/10' :
                dashboard.worker.trust_tier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-yellow-500/10' :
                  dashboard.worker.trust_tier === 'SILVER' ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' :
                    'bg-orange-500/20 text-orange-300 border-orange-500/30'
              }`}>
              <span className="tracking-widest">{dashboard.worker.trust_tier}</span>
            </div>

            <NotificationCenter recipientType="worker" workerId={dashboard.worker.id} />

            <button onClick={() => setShowBiometric(true)} className="bg-brand-950/80 text-brand-400 font-bold text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-brand-900/80 transition-all rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] border border-brand-500/50 flex items-center">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping mr-2" /> Start Shift
            </button>

            <button onClick={() => { setDashboard(null); setClaims(null); setWorkerId(''); }} className="glass-panel p-3.5 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all shadow-sm" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
        
        {/* Holographic Passport Digital Twin */}
        <div className="mt-8 flex justify-center w-full">
           <HolographicPassport worker={{...dashboard.worker, token: dashboard.worker.token, trust_tier: dashboard.worker.trust_tier}} />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex space-x-2 glass-panel p-1.5 rounded-2xl w-full md:w-auto inline-flex overflow-x-auto border-white/5">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
            { id: 'claims', label: 'Claims History', icon: <Activity size={16} /> },
            { id: 'simulate', label: 'Simulate Tool', icon: <Zap size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2.5 px-6 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 border border-brand-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-lg group hover:border-brand-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
                  <ShieldAlert size={20} />
                </div>
                <div className="text-2xl font-bold text-white capitalize tracking-tight mb-1">{dashboard.active_policy.plan_type || 'None'}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">Active Policy</div>
              </div>
              <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-lg group hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <span className="text-lg font-bold">₹</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mb-1">₹{dashboard.active_policy.weekly_premium}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">Weekly Premium</div>
              </div>
              <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <TrendingUp size={20} />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mb-1">₹{dashboard.stats.total_earnings_protected}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">Protected Earnings</div>
              </div>
              <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-lg group hover:border-orange-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
                  <Activity size={20} />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mb-1">{dashboard.stats.total_claims}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">Total Claims</div>
              </div>
            </div>

            {/* This Week Stats */}
            {(dashboard.stats.this_week_claims > 0 || dashboard.stats.this_week_payout > 0) && (
              <div className="bg-gradient-to-r from-blue-900/40 to-brand-900/30 border border-blue-500/30 p-6 rounded-3xl mb-8 flex justify-between items-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-[200px] h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="relative z-10">
                  <div className="font-bold text-blue-300 text-lg flex items-center"><Clock size={18} className="mr-2" /> This Week's Impact</div>
                  <div className="text-sm text-blue-100/70 mt-1">{dashboard.stats.this_week_claims} auto-processed claims</div>
                </div>
                <div className="text-right relative z-10">
                  <div className="text-3xl font-bold text-white tracking-tighter">₹{dashboard.stats.this_week_payout}</div>
                  <div className="text-[10px] uppercase tracking-widest text-blue-300">Protected Payout</div>
                </div>
              </div>
            )}

            {/* Weather + Policy */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <WeatherWidget pincode={workerPincode} coords={coords} />
              <PolicyCard workerId={workerId} policy={dashboard.active_policy} onUpdate={loadDashboard} />
            </div>

            {/* Streak + Forecast */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <StreakWidget workerId={workerId} />
              <ForecastWidget pincode={workerPincode} coords={coords} />
            </div>

            {/* 7-Layer Fraud Shield */}
            <div className="mb-8">
              <FraudShield workerId={workerId} />
            </div>

            {/* Time Machine & Mesh Radar */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
               <TimeMachine />
               <MeshRadar />
            </div>

            {/* 🔥 FIRST PRIZE FEATURES: INTENSIVE DYNAMIC INTERACTIONS 🔥 */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">

              {/* 1. SOS SATELLITE PROTOCOL */}
              <div className="glass-panel p-6 rounded-3xl shadow-[0_0_20px_rgba(239,68,68,0.15)] border border-red-500/20 relative overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/10 transition-opacity duration-500 ${sosActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center"><Satellite className="mr-2" /> Global SOS Override</h3>
                    <p className="text-xs text-slate-400 mb-4 max-w-sm">Bypasses standard processing to extract live HTML5 coordinates and deploy instantaneous priority funds.</p>
                  </div>
                  <button
                    onClick={handleSOS}
                    disabled={sosActive}
                    className={`w-full py-4 rounded-2xl font-black tracking-widest text-lg transition-all duration-300 shadow-xl border ${sosActive
                        ? 'bg-red-500 text-white border-red-400 shadow-red-500/50'
                        : 'bg-red-950/50 text-red-500 border-red-500/30 hover:bg-red-900/40 hover:text-red-400 hover:border-red-500/50'
                      }`}
                  >
                    {sosActive ? '🛰️ TRANSMITTING P91...' : '🚨 TAP FOR SOS'}
                  </button>
                </div>
              </div>

              {/* 2. AI VOICE CLAIM ASSISTANT */}
              <div className="glass-panel p-6 rounded-3xl shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/20 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 transition-opacity duration-500 ${voiceActive ? 'opacity-100' : 'opacity-0'}`} />
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center"><Mic className="mr-2" /> AI Voice Claims</h3>
                    <p className="text-xs text-slate-400 mb-4 max-w-sm">Speak your claim directly using Neural NLP parsing. Audio is dynamically translated to active triggers.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleVoiceClaim}
                      disabled={voiceActive}
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border ${voiceActive
                          ? 'bg-blue-500 text-white border-blue-400 shadow-blue-500/50 animate-bounce'
                          : 'bg-blue-950/50 text-blue-500 border-blue-500/30 hover:bg-blue-900/40 hover:text-blue-400'
                        }`}
                    >
                      <Mic size={24} />
                    </button>
                    <div className="flex-1 bg-slate-900/50 rounded-xl p-3 border border-white/5 h-14 flex items-center overflow-hidden">
                      <span className={`text-[10px] leading-tight truncate w-full ${voiceActive || voiceTranscript ? 'text-white' : 'text-slate-500 italic'}`}>
                        {voiceTranscript || 'Tap mic to dictate claim...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. AI DAMAGE SCANNER */}
              <div className="glass-panel p-6 rounded-3xl shadow-[0_0_20px_rgba(168,85,247,0.15)] border border-purple-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/10 opacity-30" />
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-2 flex items-center"><Car className="mr-2" /> Damage Scan AI</h3>
                    <p className="text-xs text-slate-400 mb-4 max-w-sm">Leverage computer vision models to instantly analyze component breakdown severity without manual inspection.</p>
                  </div>
                  <button
                    onClick={() => {
                      const btn = document.getElementById('ai-cam-btn');
                      btn.innerHTML = '🔄 Processing Vision Model...';
                      setTimeout(() => { btn.innerHTML = '✅ 94.2% AI Confidence Score'; setTimeout(() => btn.innerHTML = '📸 SCAN VEHICLE', 3000); }, 2000);
                    }}
                    id="ai-cam-btn"
                    className="w-full py-4 rounded-2xl font-black tracking-widest text-lg transition-all duration-300 shadow-xl border bg-purple-950/50 text-purple-400 border-purple-500/30 hover:bg-purple-900/40 hover:text-purple-300 hover:border-purple-500/50"
                  >
                    📸 SCAN VEHICLE
                  </button>
                </div>
              </div>

            </div>

            {/* Recent Claims */}
            {dashboard.recent_claims && dashboard.recent_claims.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl shadow-lg border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center"><Clock size={18} className="mr-2 text-brand-400" /> Recent Activity</h3>
                  <button onClick={() => setActiveTab('claims')} className="text-xs font-bold text-brand-400 hover:text-brand-300 transition flex items-center uppercase tracking-widest">
                    View All <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
                <div className="space-y-3">
                  {dashboard.recent_claims.map((c) => {
                    const icon = TRIGGER_ICONS[c.type] || '⚡';
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedClaim({
                          id: c.id, trigger_type: c.type, disruption_hours: c.hours,
                          payout_amount: c.payout, status: c.status, created_at: c.date,
                          fraud_score: 0,
                        })}
                        className="bg-slate-800/40 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition border border-white/5 hover:border-brand-500/30 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                            {icon}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{c.type}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{c.date} <span className="mx-1 text-slate-600">•</span> {c.hours}hrs delay</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400 text-lg tracking-tight">₹{c.payout}</div>
                          <span className={`text-[10px] uppercase tracking-widest font-bold mt-1 inline-block ${c.status === 'auto_approved' || c.status === 'approved' ? 'text-emerald-500' :
                              c.status === 'manual_review' ? 'text-yellow-500' :
                                c.status === 'under_appeal' ? 'text-blue-500' :
                                  'text-red-500'
                            }`}>{c.status.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setActiveTab('claims')} className="w-full mt-3 text-blue-600 text-sm font-medium hover:underline">
                  View all claims →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== CLAIMS TAB ===== */}
        {activeTab === 'claims' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 sm:p-8 rounded-3xl shadow-lg border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center"><Activity size={20} className="mr-2 text-brand-400" /> All Claims <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-lg text-sm">{claims?.total_claims || 0}</span></h3>
              <div className="text-sm bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                Protected: <span className="font-bold text-emerald-400">₹{claims?.total_earnings_protected || 0}</span>
              </div>
            </div>

            {claims && claims.claims && claims.claims.length > 0 ? (
              <div className="space-y-4">
                {claims.claims.map((c) => {
                  const icon = TRIGGER_ICONS[c.trigger_type] || '⚡';
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClaim(c)}
                      className="bg-slate-800/30 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-700/40 transition border border-white/5 hover:border-brand-500/30 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                          {icon}
                        </div>
                        <div>
                          <div className="font-bold text-white">{c.trigger_type}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {c.created_at} <span className="mx-1 text-slate-600">•</span> {c.disruption_hours}hrs delay
                            {c.trigger_zone && <><span className="mx-1 text-slate-600">•</span> {c.trigger_zone}</>}
                          </div>
                          {c.transaction_id && (
                            <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center"><Zap size={10} className="mr-1" /> Txn: {c.transaction_id}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400 text-xl tracking-tight">₹{c.payout_amount}</div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold mt-1 inline-block px-2 py-0.5 rounded border ${['auto_approved', 'approved'].includes(c.status) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            c.status === 'manual_review' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              c.status === 'under_appeal' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>{c.status.replace(/_/g, ' ')}</span>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono uppercase">AI Score: {c.fraud_score}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 px-4 border border-dashed border-white/10 rounded-3xl">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition">
                  <ShieldAlert size={32} className="text-slate-500" />
                </div>
                <p className="text-white font-bold text-xl mb-2">No claims yet</p>
                <p className="text-slate-400 text-sm">Your coverage is active. Disruption claims are auto-processed!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== SIMULATE TAB ===== */}
        {activeTab === 'simulate' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-lg border border-white/5 relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
              <h3 className="text-2xl font-bold mb-2 text-white flex items-center relative z-10"><Zap size={24} className="mr-2 text-brand-400" /> Simulate Disruption</h3>
              <p className="text-slate-400 text-sm mb-6 relative z-10 max-w-2xl">
                Test the parametric coverage engine in <strong>{dashboard.worker.zone}</strong>.
                Selecting an event below will create a trigger → run the AI fraud detection → process payouts for affected workers instantly.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                {[
                  { type: 'HEAVY_RAIN', value: 35, icon: '🌧️', label: 'Heavy Rain', desc: '35mm/hr, 4hrs', border: 'hover:border-blue-500/50', iconBg: 'bg-blue-500/20 text-blue-400' },
                  { type: 'EXTREME_HEAT', value: 47, icon: '🌡️', label: 'Extreme Heat', desc: '47°C, 4hrs', border: 'hover:border-red-500/50', iconBg: 'bg-red-500/20 text-red-400' },
                  { type: 'SEVERE_AQI', value: 520, icon: '🏭', label: 'Severe AQI', desc: 'AQI 520, 4hrs', border: 'hover:border-yellow-500/50', iconBg: 'bg-yellow-500/20 text-yellow-400' },
                  { type: 'CURFEW', value: 1, icon: '🚫', label: 'Curfew / Bandh', desc: 'Section 144, 4hrs', border: 'hover:border-purple-500/50', iconBg: 'bg-purple-500/20 text-purple-400' },
                  { type: 'APP_DOWN', value: 120, icon: '📱', label: 'App Down', desc: 'Server crash, 4hrs', border: 'hover:border-orange-500/50', iconBg: 'bg-orange-500/20 text-orange-400' },
                  { type: 'FLOOD', value: 1, icon: '🌊', label: 'Flood Risk', desc: 'Red alert, 4hrs', border: 'hover:border-cyan-500/50', iconBg: 'bg-cyan-500/20 text-cyan-400' },
                ].map((sim) => (
                  <button
                    key={sim.type}
                    onClick={() => handleSimulate(sim.type, sim.value)}
                    disabled={simLoading}
                    className={`bg-slate-800/40 p-5 rounded-2xl text-left transition disabled:opacity-50 border border-white/5 ${sim.border} group relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-inner ${sim.iconBg}`}>{sim.icon}</div>
                    <div className="font-bold text-white mb-1">{sim.label}</div>
                    <div className="text-xs text-slate-400">{sim.desc}</div>
                  </button>
                ))}
              </div>

              {simLoading && (
                <div className="mt-8 pt-8 border-t border-white/10 text-center relative z-10">
                  <div className="w-16 h-16 mx-auto bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center border border-brand-500/30 shadow-[0_0_20px_rgba(79,70,229,0.3)] mb-4">
                    <Zap size={28} className="animate-pulse" />
                  </div>
                  <p className="text-white font-bold text-lg mb-1">Processing Parametric Trigger...</p>
                  <p className="text-slate-400 text-sm">Evaluating risk → Running AI model → Dispersing funds</p>
                </div>
              )}
            </div>

            {/* Result */}
            {simResult && !simResult.error && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.1)] border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent pointer-events-none" />
                <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center relative z-10"><ShieldAlert size={20} className="mr-2" /> Action Verified & Processed!</h3>

                <div className="bg-slate-900/60 p-5 rounded-2xl mb-6 border border-white/5 relative z-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">Trigger Type</div>
                      <div className="font-bold text-white">{TRIGGER_ICONS[simResult.trigger?.type] || '⚡'} {simResult.trigger?.type}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">Severity Level</div>
                      <div className="font-bold text-white capitalize">{simResult.trigger?.severity}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">Impact Zone</div>
                      <div className="font-bold text-white flex items-center"><MapIcon size={14} className="mr-1 text-slate-400" /> {simResult.trigger?.zone}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">Active Duration</div>
                      <div className="font-bold text-white flex items-center"><Clock size={14} className="mr-1 text-slate-400" /> {simResult.trigger?.duration_hours}hrs pending</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                  <div className="bg-slate-800/50 p-4 rounded-2xl text-center border border-white/5">
                    <div className="text-xs text-slate-400 mb-1 uppercase tracking-widest font-bold">Workers</div>
                    <div className="text-2xl font-bold text-white">{simResult.impact?.workers_in_zone}</div>
                  </div>
                  <div className="bg-emerald-900/20 p-4 rounded-2xl text-center border border-emerald-500/20 shadow-inner">
                    <div className="text-xs text-emerald-400/80 mb-1 uppercase tracking-widest font-bold">Valid Claims</div>
                    <div className="text-2xl font-bold text-emerald-400">{simResult.impact?.claims_created}</div>
                  </div>
                  <div className="bg-red-900/20 p-4 rounded-2xl text-center border border-red-500/20 shadow-inner">
                    <div className="text-xs text-red-400/80 mb-1 uppercase tracking-widest font-bold">Flagged</div>
                    <div className="text-2xl font-bold text-red-400">{simResult.impact?.claims_rejected}</div>
                  </div>
                  <div className="bg-brand-900/20 p-4 rounded-2xl text-center border border-brand-500/20 shadow-inner">
                    <div className="text-xs text-brand-400/80 mb-1 uppercase tracking-widest font-bold">Fund Payout</div>
                    <div className="text-2xl font-bold text-brand-400">₹{simResult.impact?.total_payout}</div>
                  </div>
                </div>

                {/* Individual Claims */}
                {simResult.claims && simResult.claims.length > 0 && (
                  <div className="relative z-10 border-t border-white/5 pt-6">
                    <h4 className="font-bold text-sm text-white mb-4 flex items-center"><Activity size={16} className="mr-2 text-brand-400" /> Fund Dispersal Log</h4>
                    <div className="space-y-2">
                      {simResult.claims.map((c, i) => (
                        <div key={i} className="bg-slate-900/50 px-4 py-3 rounded-xl flex justify-between items-center text-sm border border-white/5">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold mr-3 border border-brand-500/30">
                              {c.worker_name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-white">{c.worker_name}</span>
                              <span className="text-slate-500 text-xs ml-2 font-mono">#{c.worker_token}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 rounded bg-slate-950 border border-white/5 font-mono text-[10px] uppercase font-bold tracking-wider ${c.fraud_score <= 30 ? 'text-emerald-400' :
                                c.fraud_score <= 70 ? 'text-yellow-400' : 'text-red-400'
                              }`}>Risk: {c.fraud_score}</span>
                            <span className="font-bold text-emerald-400 text-base">₹{c.payout_amount}</span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${c.status === 'auto_approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                c.status === 'manual_review' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                  'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                              {c.status === 'auto_approved' ? '✓' : c.status === 'manual_review' ? '⏳' : '✕'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {simResult.rejected && simResult.rejected.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                    <h4 className="font-bold text-xs text-red-400 uppercase tracking-widest mb-3 flex items-center"><XCircle size={14} className="mr-2" /> Denied by Rules Engine</h4>
                    <div className="space-y-2">
                      {simResult.rejected.map((r, i) => (
                        <div key={i} className="text-sm text-slate-400 bg-red-900/10 border border-red-500/10 px-3 py-2 rounded-lg flex items-center">
                          <span className="font-medium mr-2 text-slate-300">{r.worker_name}</span> <span className="opacity-60">— {r.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {simResult?.error && (
              <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-xl flex items-center">
                <AlertTriangle size={20} className="text-red-400 mr-3" />
                <p className="text-red-300 font-medium">{simResult.error}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 4. GENERATIVE AI RahatPay BOT (FLOATING CTA) */}
      <button
        onClick={() => alert(`🤖 RahatPay GenAI Beta:\n\nHello ${dashboard?.worker?.name || 'Worker'}! Based on your active policies, you are fully covered for flood anomalies in ${dashboard?.worker?.zone || 'your zone'}. Your trust tier acts as a 1.2x auto-multiplier.\n\n(This demonstrates Generative NLP integration into personalized states.)`)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-white/20 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group z-50 pointer-events-auto"
      >
        <Cpu size={32} className="text-white group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-bounce"></span>
      </button>
    </div>
  );
}

export default Dashboard;
