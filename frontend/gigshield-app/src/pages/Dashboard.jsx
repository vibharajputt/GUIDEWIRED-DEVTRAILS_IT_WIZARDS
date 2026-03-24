import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
function WeatherWidget({ pincode }) {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pincode) loadWeather();
  }, [pincode]);

  const loadWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const [wRes, aRes] = await Promise.allSettled([
        getCurrentWeather(pincode),
        getCurrentAQI(pincode),
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
    if (val <= 50) return 'text-green-700 bg-green-100';
    if (val <= 100) return 'text-yellow-700 bg-yellow-100';
    if (val <= 200) return 'text-orange-700 bg-orange-100';
    if (val <= 300) return 'text-red-700 bg-red-100';
    return 'text-red-900 bg-red-200';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white animate-pulse">
        <div className="flex items-center justify-center py-6">
          <span className="text-lg">☁️ Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-6 rounded-2xl text-white text-center">
        <p>🌤️ Weather data unavailable</p>
        <button onClick={loadWeather} className="underline text-sm mt-1">Retry</button>
      </div>
    );
  }

  const w = weather.current_weather;
  const hasTriggers = weather.trigger_count > 0;

  return (
    <div className={`p-6 rounded-2xl text-white shadow-lg ${
      hasTriggers
        ? 'bg-gradient-to-r from-red-500 to-red-600'
        : 'bg-gradient-to-r from-blue-500 to-blue-600'
    }`}>
      {/* Main Weather */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-4xl">{getIcon(w.condition)}</span>
            <span className="text-4xl font-bold">{Math.round(w.temperature)}°C</span>
          </div>
          <p className="text-white/80 capitalize text-sm">{w.description}</p>
          <p className="text-white/70 text-sm mt-1">Feels like {Math.round(w.feels_like)}°C</p>
          <p className="text-white/60 text-xs mt-2">{weather.zone}, {weather.city}</p>
        </div>
        <div className="text-right text-sm space-y-1">
          <div>💨 {w.wind_speed_kmh} km/h</div>
          <div>💧 {w.humidity}%</div>
          {w.rainfall_1h > 0 && <div>🌧️ {w.rainfall_1h} mm/hr</div>}
          {aqi && aqi.aqi && (
            <div className={`mt-2 px-2 py-1 rounded-lg text-xs font-bold inline-block ${getAqiStyle(aqi.aqi.value)}`}>
              AQI: {aqi.aqi.value} ({aqi.aqi.category})
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {hasTriggers && (
        <div className="mt-4 bg-white/20 backdrop-blur rounded-xl p-3">
          <p className="font-bold text-sm mb-2">
            ⚠️ {weather.trigger_count} Active Alert{weather.trigger_count > 1 ? 's' : ''}
          </p>
          {weather.triggers_detected.map((t, i) => (
            <div key={i} className="bg-white/10 rounded-lg px-3 py-2 mb-1 text-sm">
              🔴 {t.description}
            </div>
          ))}
          <p className="text-xs text-white/70 mt-2">
            If you're affected, your claim will be auto-processed!
          </p>
        </div>
      )}

      {!hasTriggers && (
        <div className="mt-4 bg-white/10 rounded-xl p-3 text-sm">
          ✅ Safe conditions for delivery. Your coverage is active!
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-white/50">{weather.fetched_at}</span>
        <button onClick={loadWeather} className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}


// ============================================
// FORECAST WIDGET
// ============================================
function ForecastWidget({ pincode }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pincode) loadForecast();
  }, [pincode]);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const res = await getForecast(pincode);
      setForecast(res.data);
    } catch (err) {
      console.error('Forecast failed');
    }
    setLoading(false);
  };

  if (loading || !forecast) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">📅 Next Week Forecast</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
          {forecast.current_season}
        </span>
      </div>

      <div className="space-y-3">
        {Object.entries(forecast.predictions).map(([key, pred]) => {
          const label = labels[key] || { icon: '⚡', name: key };
          return (
            <div key={key}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span>{label.icon} {label.name}</span>
                <span className={`font-bold ${textColor(pred.probability)}`}>
                  {pred.probability}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${barColor(pred.probability)}`}
                  style={{ width: `${Math.min(pred.probability, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory */}
      <div className={`mt-4 p-3 rounded-xl text-sm ${
        forecast.predictions.heavy_rain?.probability > 50
          ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          : 'bg-green-50 border border-green-200 text-green-700'
      }`}>
        💡 {forecast.worker_advisory}
      </div>

      {/* Impact */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-2 rounded-lg text-center">
          <div className="text-xs text-gray-500">Expected Claims</div>
          <div className="font-bold text-sm text-gray-700">{forecast.expected_impact.expected_claims}</div>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg text-center">
          <div className="text-xs text-gray-500">Expected Payout</div>
          <div className="font-bold text-sm text-gray-700">{forecast.expected_impact.expected_payout}</div>
        </div>
      </div>
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
    <div className={`p-5 rounded-2xl shadow-lg ${
      active
        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
        : 'bg-white'
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`font-bold text-lg ${active ? 'text-white' : 'text-gray-800'}`}>
            🔥 Clean Streak
          </h3>
          <p className={`text-sm mt-1 ${active ? 'text-yellow-100' : 'text-gray-500'}`}>
            {streak.message}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${active ? 'text-white' : 'text-gray-800'}`}>
            {streak.clean_weeks}/4
          </div>
          <div className={`text-xs ${active ? 'text-yellow-100' : 'text-gray-500'}`}>
            weeks clean
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 flex space-x-1">
        {[1, 2, 3, 4].map((week) => (
          <div
            key={week}
            className={`flex-1 h-2.5 rounded-full transition-all ${
              week <= streak.clean_weeks
                ? active ? 'bg-white' : 'bg-green-400'
                : active ? 'bg-white/30' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {active && (
        <div className="mt-3 bg-white/20 rounded-xl p-2 text-center text-sm font-medium">
          🎉 You earned <strong>{streak.premium_discount}</strong> off next week!
        </div>
      )}

      <div className="mt-2 flex justify-between items-center">
        <span className={`text-xs ${active ? 'text-yellow-100' : 'text-gray-400'}`}>
          Trust: {streak.trust_score} ({streak.trust_tier})
        </span>
        {!active && streak.weeks_to_streak > 0 && (
          <span className="text-xs text-blue-600 font-medium">
            {streak.weeks_to_streak} weeks to go!
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
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="font-bold text-gray-800 mb-2">No Active Policy</h3>
        <p className="text-gray-500 text-sm mb-4">Get protected from disruptions now!</p>
        <a href="/onboarding" className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 inline-block">
          Get Coverage →
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
    basic: 'from-gray-500 to-gray-600',
    standard: 'from-blue-500 to-blue-600',
    pro: 'from-purple-500 to-purple-600',
  };

  const planEmojis = { basic: '🥉', standard: '🥈', pro: '🥇' };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${planGradients[policy.plan_type] || planGradients.standard} p-5 text-white`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-80">Active Policy</div>
            <div className="text-xl font-bold capitalize mt-1">
              {planEmojis[policy.plan_type]} {policy.plan_type} Plan
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">₹{policy.weekly_premium}</div>
            <div className="text-xs opacity-80">/week</div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center bg-gray-50 p-2 rounded-lg">
            <div className="text-xs text-gray-500">Coverage</div>
            <div className="font-bold text-blue-700">{policy.coverage_percent}%</div>
          </div>
          <div className="text-center bg-gray-50 p-2 rounded-lg">
            <div className="text-xs text-gray-500">Daily Max</div>
            <div className="font-bold text-green-600">₹{policy.daily_max}</div>
          </div>
          <div className="text-center bg-gray-50 p-2 rounded-lg">
            <div className="text-xs text-gray-500">Days Left</div>
            <div className={`font-bold ${policy.days_remaining <= 2 ? 'text-red-600' : 'text-gray-700'}`}>
              {policy.days_remaining}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {policy.days_remaining <= 2 && policy.days_remaining > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg text-xs text-yellow-700 mb-3 text-center">
            ⚠️ Expires in {policy.days_remaining} day{policy.days_remaining > 1 ? 's' : ''}!
          </div>
        )}
        {policy.days_remaining === 0 && (
          <div className="bg-red-50 border border-red-200 p-2 rounded-lg text-xs text-red-700 mb-3 text-center">
            🔴 Policy expired! Renew now to stay protected.
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {policy.days_remaining === 0 ? (
            <button
              onClick={() => handleAction('renew')}
              disabled={actionLoading === 'renew'}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {actionLoading === 'renew' ? '⏳ Renewing...' : '🔄 Renew Now'}
            </button>
          ) : (
            <>
              <button
                onClick={() => handleAction('pause')}
                disabled={!!actionLoading}
                className="flex-1 bg-yellow-100 text-yellow-700 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 disabled:opacity-50 transition"
              >
                {actionLoading === 'pause' ? '...' : '⏸️ Pause'}
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={!!actionLoading}
                className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition"
              >
                {actionLoading === 'cancel' ? '...' : '✖️ Cancel'}
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`p-5 rounded-t-2xl text-white ${statusColors[status] || 'bg-gray-500'}`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm opacity-80">Claim #{claim.id}</div>
              <div className="text-xl font-bold capitalize">{status.replace(/_/g, ' ')}</div>
            </div>
            <button onClick={onClose} className="text-2xl bg-white/20 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/30">×</button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Trigger */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="font-bold text-blue-800 mb-2">⚡ Disruption Details</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Type:</span> <span className="font-medium">{TRIGGER_ICONS[triggerType] || '⚡'} {triggerType}</span></div>
              <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{disruption}h</span></div>
              <div><span className="text-gray-500">Zone:</span> <span className="font-medium">{claim.trigger_zone || details?.trigger?.zone || 'Your zone'}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{createdAt}</span></div>
            </div>
          </div>

          {/* Payout */}
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="font-bold text-green-800 mb-2">💰 Payout</div>
            <div className="text-3xl font-bold text-green-700 text-center my-2">₹{payoutAmount}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Status:</span> <span className="font-medium capitalize">{claim.payout_status || status}</span></div>
              {claim.transaction_id && (
                <div><span className="text-gray-500">Txn:</span> <span className="font-mono text-xs">{claim.transaction_id}</span></div>
              )}
            </div>
          </div>

          {/* Fraud Score */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="font-bold text-gray-800 mb-2">🔍 Verification Score</div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    fraudScore <= 30 ? 'bg-green-500' :
                    fraudScore <= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fraudScore}%` }}
                />
              </div>
              <span className={`font-bold text-lg ${
                fraudScore <= 30 ? 'text-green-600' :
                fraudScore <= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {fraudScore}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {fraudScore <= 30 ? '✅ Low risk — Auto approved' :
               fraudScore <= 70 ? '⚠️ Medium risk — Under review' : '🔴 High risk — Flagged'}
            </p>

            {/* Fraud Details */}
            {details?.claim?.fraud_details && (
              <div className="mt-3 space-y-1 border-t pt-2">
                {Object.entries(details.claim.fraud_details)
                  .filter(([key]) => !['final_score', 'decision', 'decision_reason', 'appeal'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className={`font-medium ${
                        String(value).includes('PASS') ? 'text-green-600' :
                        String(value).includes('FLAG') ? 'text-yellow-600' :
                        String(value).includes('FAIL') ? 'text-red-600' : 'text-gray-700'
                      }`}>{String(value)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Appeal Section */}
          {(status === 'rejected' || status === 'manual_review') && (
            <div className="border-t pt-4">
              {!showAppeal ? (
                <button
                  onClick={() => setShowAppeal(true)}
                  className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-200 transition"
                >
                  📝 Appeal This Decision
                </button>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800">📝 Submit Appeal</h4>
                  <textarea
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Explain why this claim is valid (e.g., I was stuck in heavy rain in my delivery zone...)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAppeal}
                      disabled={appealLoading}
                      className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:bg-gray-400"
                    >
                      {appealLoading ? '⏳ Submitting...' : '✅ Submit Appeal'}
                    </button>
                    <button onClick={() => setShowAppeal(false)} className="px-4 bg-gray-200 text-gray-600 py-2 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Admin reviews within 4 hours. If approved: full payout + trust bonus.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================
// MAIN DASHBOARD
// ============================================
function Dashboard() {
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

  const loadDashboard = async () => {
    if (!workerId) return;
    setLoading(true);
    setError('');
    try {
      const [dashRes, claimsRes] = await Promise.all([
        getWorkerDashboard(workerId),
        getWorkerClaims(workerId),
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

  // ===== LOGIN SCREEN =====
  if (!dashboard && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Worker Dashboard</h2>
          <p className="text-gray-500 mb-6">Enter your Worker ID to view your dashboard</p>
          <div className="flex space-x-3">
            <input
              type="number"
              placeholder="Worker ID (e.g. 1)"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDashboard()}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
            />
            <button
              onClick={loadDashboard}
              disabled={!workerId || loading}
              className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 disabled:bg-gray-400 transition"
            >
              Go →
            </button>
          </div>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-400 mb-3">Quick access (Demo):</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { id: 1, name: 'Rahul' },
                { id: 3, name: 'Deepak' },
                { id: 5, name: 'Priya' },
                { id: 8, name: 'Amit' },
                { id: 10, name: 'Ravi' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => { setWorkerId(String(w.id)); }}
                  className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100 hover:text-blue-700 transition"
                >
                  #{w.id} {w.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🛡️</div>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Claim Modal */}
      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={loadDashboard}
        />
      )}

      {/* Top Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Welcome, {dashboard.worker.name}! 👋</h2>
              <p className="text-sm text-gray-500">
                <span className="font-mono font-bold text-blue-700">{dashboard.worker.token}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{dashboard.worker.platform}</span>
                <span className="mx-2">•</span>
                {dashboard.worker.zone}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${trustStyles[dashboard.worker.trust_tier] || trustStyles.SILVER}`}>
                {dashboard.worker.trust_tier} ({dashboard.worker.trust_score})
              </span>
              <button onClick={() => { setDashboard(null); setClaims(null); setWorkerId(''); }} className="text-gray-400 hover:text-gray-600 ml-2" title="Logout">✕</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'claims', label: '📋 Claims' },
            { id: 'simulate', label: '⚡ Simulate' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-lg font-bold text-blue-700 capitalize">{dashboard.active_policy.plan_type || 'None'}</div>
                <div className="text-xs text-gray-500">Active Plan</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-lg font-bold text-green-600">₹{dashboard.active_policy.weekly_premium}</div>
                <div className="text-xs text-gray-500">Weekly Premium</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-lg font-bold text-blue-600">₹{dashboard.stats.total_earnings_protected}</div>
                <div className="text-xs text-gray-500">Total Protected</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">📝</div>
                <div className="text-lg font-bold text-orange-600">{dashboard.stats.total_claims}</div>
                <div className="text-xs text-gray-500">Total Claims</div>
              </div>
            </div>

            {/* This Week Stats */}
            {(dashboard.stats.this_week_claims > 0 || dashboard.stats.this_week_payout > 0) && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex justify-between items-center">
                <div>
                  <div className="font-bold text-blue-800">📅 This Week</div>
                  <div className="text-sm text-blue-600">{dashboard.stats.this_week_claims} claims processed</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-700">₹{dashboard.stats.this_week_payout}</div>
                  <div className="text-xs text-blue-500">protected this week</div>
                </div>
              </div>
            )}

            {/* Weather + Policy */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <WeatherWidget pincode={workerPincode} />
              <PolicyCard workerId={workerId} policy={dashboard.active_policy} onUpdate={loadDashboard} />
            </div>

            {/* Streak + Forecast */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <StreakWidget workerId={workerId} />
              <ForecastWidget pincode={workerPincode} />
            </div>

            {/* Recent Claims */}
            {dashboard.recent_claims && dashboard.recent_claims.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold mb-4">🕒 Recent Claims</h3>
                <div className="space-y-2">
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
                        className="bg-gray-50 p-3 rounded-xl flex justify-between items-center cursor-pointer hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{icon}</span>
                          <div>
                            <div className="font-medium text-sm">{c.type}</div>
                            <div className="text-xs text-gray-500">{c.date} • {c.hours}hrs</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">₹{c.payout}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            c.status === 'auto_approved' ? 'bg-green-100 text-green-700' :
                            c.status === 'approved' ? 'bg-green-100 text-green-700' :
                            c.status === 'manual_review' ? 'bg-yellow-100 text-yellow-700' :
                            c.status === 'under_appeal' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>{c.status}</span>
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
          </>
        )}

        {/* ===== CLAIMS TAB ===== */}
        {activeTab === 'claims' && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">📋 All Claims ({claims?.total_claims || 0})</h3>
              <div className="text-sm">
                Protected: <span className="font-bold text-green-600">₹{claims?.total_earnings_protected || 0}</span>
              </div>
            </div>

            {claims && claims.claims && claims.claims.length > 0 ? (
              <div className="space-y-3">
                {claims.claims.map((c) => {
                  const icon = TRIGGER_ICONS[c.trigger_type] || '⚡';
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClaim(c)}
                      className="bg-gray-50 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{icon}</div>
                        <div>
                          <div className="font-medium">{c.trigger_type}</div>
                          <div className="text-sm text-gray-500">
                            {c.created_at} • {c.disruption_hours}hrs
                            {c.trigger_zone && ` • ${c.trigger_zone}`}
                          </div>
                          {c.transaction_id && (
                            <div className="text-xs text-gray-400 font-mono mt-0.5">Txn: {c.transaction_id}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-lg">₹{c.payout_amount}</div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          ['auto_approved', 'approved'].includes(c.status) ? 'bg-green-100 text-green-700' :
                          c.status === 'manual_review' ? 'bg-yellow-100 text-yellow-700' :
                          c.status === 'under_appeal' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>{c.status}</span>
                        <div className="text-xs text-gray-400 mt-1">Score: {c.fraud_score}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🛡️</div>
                <p className="text-gray-500 font-medium">No claims yet</p>
                <p className="text-gray-400 text-sm mt-1">Your coverage is active. Claims are auto-processed!</p>
              </div>
            )}
          </div>
        )}

        {/* ===== SIMULATE TAB ===== */}
        {activeTab === 'simulate' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold mb-2">⚡ Simulate Disruption</h3>
              <p className="text-gray-500 text-sm mb-4">
                Test the system by simulating a disruption in <strong>{dashboard.worker.zone}</strong>.
                System will create trigger → run fraud detection → process payout.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { type: 'HEAVY_RAIN', value: 35, icon: '🌧️', label: 'Heavy Rain', desc: '35mm/hr, 4hrs', bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
                  { type: 'EXTREME_HEAT', value: 47, icon: '🌡️', label: 'Extreme Heat', desc: '47°C, 4hrs', bg: 'bg-red-50 border-red-200 hover:bg-red-100' },
                  { type: 'SEVERE_AQI', value: 520, icon: '🏭', label: 'Severe AQI', desc: 'AQI 520, 4hrs', bg: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
                  { type: 'CURFEW', value: 1, icon: '🚫', label: 'Curfew', desc: 'Section 144, 4hrs', bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
                  { type: 'APP_DOWN', value: 120, icon: '📱', label: 'App Down', desc: 'Server crash, 4hrs', bg: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
                  { type: 'FLOOD', value: 1, icon: '🌊', label: 'Flood', desc: 'Red alert, 4hrs', bg: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' },
                ].map((sim) => (
                  <button
                    key={sim.type}
                    onClick={() => handleSimulate(sim.type, sim.value)}
                    disabled={simLoading}
                    className={`${sim.bg} border p-4 rounded-xl text-left transition disabled:opacity-50`}
                  >
                    <div className="text-2xl mb-1">{sim.icon}</div>
                    <div className="font-semibold text-sm text-gray-800">{sim.label}</div>
                    <div className="text-xs text-gray-500">{sim.desc}</div>
                  </button>
                ))}
              </div>

              {simLoading && (
                <div className="mt-6 text-center">
                  <div className="text-4xl animate-bounce mb-2">⚡</div>
                  <p className="text-blue-600 font-medium">Processing disruption...</p>
                  <p className="text-gray-400 text-sm">Running fraud detection → calculating payout...</p>
                </div>
              )}
            </div>

            {/* Result */}
            {simResult && !simResult.error && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-700 mb-4">✅ Disruption Processed!</h3>

                <div className="bg-blue-50 p-4 rounded-xl mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Type</div>
                      <div className="font-bold">{TRIGGER_ICONS[simResult.trigger?.type] || '⚡'} {simResult.trigger?.type}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Severity</div>
                      <div className="font-bold capitalize">{simResult.trigger?.severity}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Zone</div>
                      <div className="font-bold">{simResult.trigger?.zone}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Duration</div>
                      <div className="font-bold">{simResult.trigger?.duration_hours}hrs</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-500">Workers</div>
                    <div className="text-xl font-bold text-gray-700">{simResult.impact?.workers_in_zone}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-500">Claims</div>
                    <div className="text-xl font-bold text-green-700">{simResult.impact?.claims_created}</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-500">Rejected</div>
                    <div className="text-xl font-bold text-red-700">{simResult.impact?.claims_rejected}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-500">Payout</div>
                    <div className="text-xl font-bold text-blue-700">₹{simResult.impact?.total_payout}</div>
                  </div>
                </div>

                {/* Individual Claims */}
                {simResult.claims && simResult.claims.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 mb-2">Claims Processed:</h4>
                    <div className="space-y-2">
                      {simResult.claims.map((c, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">{c.worker_name}</span>
                            <span className="text-gray-400 text-xs ml-2">({c.worker_token})</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              c.fraud_score <= 30 ? 'bg-green-100 text-green-700' :
                              c.fraud_score <= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>F:{c.fraud_score}</span>
                            <span className="font-bold text-green-600">₹{c.payout_amount}</span>
                            <span className="text-xs">
                              {c.status === 'auto_approved' ? '✅' : c.status === 'manual_review' ? '⏳' : '❌'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {simResult.rejected && simResult.rejected.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-bold text-sm text-red-700 mb-2">Not Eligible:</h4>
                    {simResult.rejected.map((r, i) => (
                      <div key={i} className="text-sm text-gray-500">❌ {r.worker_name}: {r.reason}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {simResult?.error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-700 font-medium">❌ {simResult.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;