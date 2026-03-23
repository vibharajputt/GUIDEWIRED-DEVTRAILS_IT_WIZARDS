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
// WEATHER WIDGET COMPONENT
// ============================================
function WeatherWidget({ pincode }) {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWeather();
  }, [pincode]);

  const loadWeather = async () => {
    if (!pincode) return;
    setLoading(true);
    setError('');
    try {
      const [weatherRes, aqiRes] = await Promise.allSettled([
        getCurrentWeather(pincode),
        getCurrentAQI(pincode),
      ]);
      if (weatherRes.status === 'fulfilled') {
        setWeather(weatherRes.value.data);
      }
      if (aqiRes.status === 'fulfilled') {
        setAqi(aqiRes.value.data);
      }
    } catch (err) {
      setError('Weather data unavailable');
    }
    setLoading(false);
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
      Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Haze: '🌫️',
      Fog: '🌫️', Dust: '🌪️', Smoke: '💨',
    };
    return icons[condition] || '🌤️';
  };

  const getAQIColor = (value) => {
    if (value <= 50) return 'text-green-600 bg-green-50';
    if (value <= 100) return 'text-yellow-600 bg-yellow-50';
    if (value <= 200) return 'text-orange-600 bg-orange-50';
    if (value <= 300) return 'text-red-600 bg-red-50';
    return 'text-red-800 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
        <div className="animate-pulse flex items-center justify-center py-4">
          <span className="text-lg">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-6 rounded-2xl text-white">
        <p className="text-center">
          🌤️ Weather data unavailable. 
          <button onClick={loadWeather} className="underline ml-2">Retry</button>
        </p>
      </div>
    );
  }

  const w = weather.current_weather;
  const hasTriggers = weather.trigger_count > 0;

  return (
    <div className={`p-6 rounded-2xl text-white ${
      hasTriggers 
        ? 'bg-gradient-to-r from-red-500 to-red-600' 
        : 'bg-gradient-to-r from-blue-500 to-blue-600'
    }`}>
      <div className="flex justify-between items-start">
        {/* Left: Main Weather */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-3xl">{getWeatherIcon(w.condition)}</span>
            <span className="text-4xl font-bold">{Math.round(w.temperature)}°C</span>
          </div>
          <p className="text-blue-100 capitalize text-sm">{w.description}</p>
          <p className="text-blue-100 text-sm mt-1">
            Feels like {Math.round(w.feels_like)}°C
          </p>
          <p className="text-blue-200 text-xs mt-2">
            {weather.zone}, {weather.city}
          </p>
        </div>

        {/* Right: Details */}
        <div className="text-right text-sm space-y-1">
          <div className="flex items-center justify-end space-x-1">
            <span>💨</span>
            <span>{w.wind_speed_kmh} km/h</span>
          </div>
          <div className="flex items-center justify-end space-x-1">
            <span>💧</span>
            <span>{w.humidity}%</span>
          </div>
          {w.rainfall_1h > 0 && (
            <div className="flex items-center justify-end space-x-1">
              <span>🌧️</span>
              <span>{w.rainfall_1h} mm/hr</span>
            </div>
          )}
          {aqi && aqi.aqi && (
            <div className={`mt-2 px-2 py-1 rounded-lg text-xs font-bold inline-block ${getAQIColor(aqi.aqi.value)}`}>
              AQI: {aqi.aqi.value} ({aqi.aqi.category})
            </div>
          )}
        </div>
      </div>

      {/* Trigger Alerts */}
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
          <p className="text-xs text-white/80 mt-2">
            If you're affected, your claim will be auto-processed!
          </p>
        </div>
      )}

      {!hasTriggers && (
        <div className="mt-4 bg-white/10 rounded-xl p-3">
          <p className="text-sm flex items-center">
            <span className="mr-2">✅</span>
            Safe conditions for delivery. Your coverage is active!
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-white/60">
          Updated: {weather.fetched_at}
        </span>
        <button
          onClick={loadWeather}
          className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}


// ============================================
// FORECAST COMPONENT
// ============================================
function ForecastWidget({ pincode }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, [pincode]);

  const loadForecast = async () => {
    if (!pincode) return;
    setLoading(true);
    try {
      const res = await getForecast(pincode);
      setForecast(res.data);
    } catch (err) {
      console.error('Forecast failed:', err);
    }
    setLoading(false);
  };

  if (loading || !forecast) return null;

  const predictions = forecast.predictions;

  const getBarColor = (prob) => {
    if (prob < 30) return 'bg-green-400';
    if (prob < 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">📅 Next Week Forecast</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {forecast.current_season}
        </span>
      </div>

      <div className="space-y-3">
        {Object.entries(predictions).map(([key, pred]) => {
          const labels = {
            heavy_rain: { icon: '🌧️', name: 'Heavy Rain' },
            severe_aqi: { icon: '🏭', name: 'Severe AQI' },
            flooding: { icon: '🌊', name: 'Flooding' },
            curfew_bandh: { icon: '🚫', name: 'Curfew/Bandh' },
          };
          const label = labels[key] || { icon: '⚡', name: key };
          return (
            <div key={key}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span>{label.icon} {label.name}</span>
                <span className={`font-bold ${
                  pred.probability > 60 ? 'text-red-600' :
                  pred.probability > 30 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {pred.probability}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(pred.probability)}`}
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

      {/* Expected Impact */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 p-2 rounded-lg text-center">
          <div className="text-gray-500">Expected Claims</div>
          <div className="font-bold text-gray-700">
            {forecast.expected_impact.expected_claims}
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg text-center">
          <div className="text-gray-500">Expected Payout</div>
          <div className="font-bold text-gray-700">
            {forecast.expected_impact.expected_payout}
          </div>
        </div>
      </div>
    </div>
  );
}


// ============================================
// STREAK REWARDS COMPONENT
// ============================================
function StreakWidget({ workerId }) {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    loadStreak();
  }, [workerId]);

  const loadStreak = async () => {
    try {
      const res = await getWorkerStreak(workerId);
      setStreak(res.data);
    } catch (err) {
      console.error('Streak failed:', err);
    }
  };

  if (!streak) return null;

  return (
    <div className={`p-5 rounded-2xl shadow-lg ${
      streak.streak_active
        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
        : 'bg-white'
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`font-bold ${streak.streak_active ? 'text-white' : 'text-gray-800'}`}>
            🔥 Clean Streak
          </h3>
          <p className={`text-sm mt-1 ${streak.streak_active ? 'text-yellow-100' : 'text-gray-500'}`}>
            {streak.message}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${streak.streak_active ? 'text-white' : 'text-gray-800'}`}>
            {streak.clean_weeks}/4
          </div>
          <div className={`text-xs ${streak.streak_active ? 'text-yellow-100' : 'text-gray-500'}`}>
            weeks clean
          </div>
        </div>
      </div>

      {/* Streak progress bar */}
      <div className="mt-3">
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((week) => (
            <div
              key={week}
              className={`flex-1 h-2 rounded-full ${
                week <= streak.clean_weeks
                  ? streak.streak_active ? 'bg-white' : 'bg-green-400'
                  : streak.streak_active ? 'bg-white/30' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {streak.streak_active && (
        <div className="mt-3 bg-white/20 rounded-xl p-2 text-center text-sm">
          🎉 You earned <strong>{streak.premium_discount}</strong> off next week!
        </div>
      )}
    </div>
  );
}


// ============================================
// POLICY MANAGEMENT COMPONENT
// ============================================
function PolicyCard({ workerId, policy, onUpdate }) {
  const [actionLoading, setActionLoading] = useState('');

  if (!policy || policy.status === 'none') {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="font-bold text-gray-800 mb-2">No Active Policy</h3>
        <p className="text-gray-500 text-sm mb-4">
          You don't have an active policy. Get protected now!
        </p>
        <a
          href="/onboarding"
          className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800"
        >
          Get Coverage →
        </a>
      </div>
    );
  }

  const handleAction = async (action) => {
    if (!window.confirm(
      action === 'pause' ? 'Pause your policy? You won\'t be covered.' :
      action === 'cancel' ? 'Cancel your policy? This cannot be undone easily.' :
      'Renew your policy for another week?'
    )) return;

    setActionLoading(action);
    try {
      // We need policy ID - fetch it
      const policiesRes = await getWorkerPolicies(workerId);
      const activePolicy = policiesRes.data.policies?.find(
        p => p.status === 'active'
      );

      if (!activePolicy) {
        alert('No active policy found');
        setActionLoading('');
        return;
      }

      if (action === 'pause') {
        await pausePolicy(activePolicy.id);
        alert('Policy paused. Resume anytime from your dashboard.');
      } else if (action === 'cancel') {
        await cancelPolicy(activePolicy.id);
        alert('Policy cancelled.');
      } else if (action === 'renew') {
        await renewPolicy(activePolicy.id);
        alert('Policy renewed for another week!');
      }

      onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to ${action} policy`);
    }
    setActionLoading('');
  };

  const planColors = {
    basic: 'from-gray-500 to-gray-600',
    standard: 'from-blue-500 to-blue-600',
    pro: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${planColors[policy.plan_type] || planColors.standard} p-4 text-white`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-80">Active Policy</div>
            <div className="text-xl font-bold capitalize mt-1">
              {policy.plan_type} Plan
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">₹{policy.weekly_premium}</div>
            <div className="text-xs opacity-80">/week</div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500">Coverage</div>
            <div className="font-bold text-blue-700">{policy.coverage_percent}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Daily Max</div>
            <div className="font-bold text-green-600">₹{policy.daily_max}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Days Left</div>
            <div className={`font-bold ${policy.days_remaining <= 2 ? 'text-red-600' : 'text-gray-700'}`}>
              {policy.days_remaining}
            </div>
          </div>
        </div>

        {/* Days remaining warning */}
        {policy.days_remaining <= 2 && policy.days_remaining > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg text-xs text-yellow-700 mb-3 text-center">
            ⚠️ Policy expires in {policy.days_remaining} day{policy.days_remaining > 1 ? 's' : ''}. Renew soon!
          </div>
        )}

        {policy.days_remaining === 0 && (
          <div className="bg-red-50 border border-red-200 p-2 rounded-lg text-xs text-red-700 mb-3 text-center">
            🔴 Policy expired! Renew now to stay protected.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          {policy.days_remaining === 0 ? (
            <button
              onClick={() => handleAction('renew')}
              disabled={actionLoading === 'renew'}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {actionLoading === 'renew' ? '...' : '🔄 Renew Now'}
            </button>
          ) : (
            <>
              <button
                onClick={() => handleAction('pause')}
                disabled={!!actionLoading}
                className="flex-1 bg-yellow-100 text-yellow-700 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 disabled:opacity-50"
              >
                {actionLoading === 'pause' ? '...' : '⏸️ Pause'}
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={!!actionLoading}
                className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
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
function ClaimDetailModal({ claim, onClose, onAppeal, workerId }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appealReason, setAppealReason] = useState('');
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealLoading, setAppealLoading] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [claim.id]);

  const loadDetails = async () => {
    try {
      const res = await getClaimDetails(claim.id);
      setDetails(res.data);
    } catch (err) {
      console.error('Failed to load claim details');
    }
    setLoading(false);
  };

  const handleAppeal = async () => {
    if (!appealReason.trim()) {
      alert('Please enter a reason for your appeal');
      return;
    }
    setAppealLoading(true);
    try {
      await appealClaim(claim.id, {
        claim_id: claim.id,
        reason: appealReason,
        evidence_type: 'text',
      });
      alert('Appeal submitted! Admin will review within 4 hours.');
      onAppeal();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || 'Appeal failed');
    }
    setAppealLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-5 rounded-t-2xl ${
          claim.status === 'auto_approved' || claim.status === 'approved'
            ? 'bg-green-500 text-white'
            : claim.status === 'manual_review' || claim.status === 'under_appeal'
            ? 'bg-yellow-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm opacity-80">Claim #{claim.id}</div>
              <div className="text-xl font-bold capitalize">
                {claim.status.replace('_', ' ')}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-2xl bg-white/20 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Trigger Info */}
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <div className="font-bold text-blue-800 mb-2">⚡ Disruption</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>{' '}
                <span className="font-medium">{claim.trigger_type}</span>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>{' '}
                <span className="font-medium">{claim.disruption_hours}h</span>
              </div>
              <div>
                <span className="text-gray-500">Zone:</span>{' '}
                <span className="font-medium">{claim.trigger_zone || 'Your zone'}</span>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>{' '}
                <span className="font-medium">{claim.created_at}</span>
              </div>
            </div>
          </div>

          {/* Payout Info */}
          <div className="bg-green-50 p-4 rounded-xl mb-4">
            <div className="font-bold text-green-800 mb-2">💰 Payout</div>
            <div className="text-3xl font-bold text-green-700 text-center my-2">
              ₹{claim.payout_amount}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Claim Amount:</span>{' '}
                <span className="font-medium">₹{claim.claim_amount || claim.payout_amount}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>{' '}
                <span className="font-medium capitalize">{claim.payout_status}</span>
              </div>
              {claim.transaction_id && (
                <div className="col-span-2">
                  <span className="text-gray-500">Txn ID:</span>{' '}
                  <span className="font-mono text-xs">{claim.transaction_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fraud Score */}
          <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <div className="font-bold text-gray-800 mb-2">🔍 Verification Score</div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    claim.fraud_score <= 30 ? 'bg-green-500' :
                    claim.fraud_score <= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${claim.fraud_score}%` }}
                />
              </div>
              <span className={`font-bold text-lg ${
                claim.fraud_score <= 30 ? 'text-green-600' :
                claim.fraud_score <= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {claim.fraud_score}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {claim.fraud_score <= 30
                ? '✅ Low risk — Auto approved'
                : claim.fraud_score <= 70
                ? '⚠️ Medium risk — Needs review'
                : '🔴 High risk — Flagged'}
            </p>

            {/* Show fraud details if available */}
            {details?.claim?.fraud_details && (
              <div className="mt-3 space-y-1">
                {Object.entries(details.claim.fraud_details)
                  .filter(([key]) => !['final_score', 'decision', 'decision_reason', 'appeal'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className={`font-medium ${
                        String(value).includes('PASS') ? 'text-green-600' :
                        String(value).includes('FLAG') ? 'text-yellow-600' :
                        String(value).includes('FAIL') ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Appeal Section */}
          {(claim.status === 'rejected' || claim.status === 'manual_review') && (
            <div className="border-t pt-4">
              {!showAppealForm ? (
                <button
                  onClick={() => setShowAppealForm(true)}
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
                    placeholder="Explain why you believe this claim is valid (e.g., I was stuck in heavy rain in Andheri West...)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAppeal}
                      disabled={appealLoading}
                      className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:bg-gray-400"
                    >
                      {appealLoading ? 'Submitting...' : '✅ Submit Appeal'}
                    </button>
                    <button
                      onClick={() => setShowAppealForm(false)}
                      className="px-4 bg-gray-200 text-gray-600 py-2 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Admin will review within 4 hours. If approved, you'll get full payout + trust bonus.
                  </p>
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
// MAIN DASHBOARD COMPONENT
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
  const [activeSection, setActiveSection] = useState('overview');

  const loadDashboard = async () => {
    if (!workerId) return;
    setLoading(true);
    setError('');
    try {
      const dashRes = await getWorkerDashboard(workerId);
      setDashboard(dashRes.data);
      const claimsRes = await getWorkerClaims(workerId);
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

    const pincode = dashboard.worker.zone === 'Andheri West' ? '400053' :
                    dashboard.worker.zone === 'Bandra' ? '400050' :
                    dashboard.worker.zone === 'Sion' ? '400069' :
                    dashboard.worker.zone === 'Connaught Place' ? '110001' :
                    dashboard.worker.zone === 'Rohini' ? '110085' :
                    dashboard.worker.zone === 'Dwarka' ? '110075' :
                    dashboard.worker.zone === 'Whitefield' ? '560066' :
                    dashboard.worker.zone === 'Koramangala' ? '560034' :
                    dashboard.worker.zone === 'Sector 29' ? '122001' :
                    dashboard.worker.zone === 'Marina Beach' ? '600004' :
                    dashboard.worker.zone === 'Sector 62' ? '201301' :
                    '400053';

    try {
      const res = await simulateDisruption({
        disruption_type: type,
        pincode: pincode,
        zone: dashboard.worker.zone,
        value: value,
        duration_hours: 4,
      });
      setSimResult(res.data);
      setTimeout(loadDashboard, 1000);
    } catch (err) {
      setSimResult({ error: err.response?.data?.detail || 'Simulation failed' });
    }
    setSimLoading(false);
  };

  // Worker ID input screen
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
              {loading ? '...' : 'Go →'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

          {/* Quick access buttons for demo */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-400 mb-3">Quick access (Demo):</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3, 5, 8].map(id => (
                <button
                  key={id}
                  onClick={() => { setWorkerId(String(id)); }}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs hover:bg-blue-100 hover:text-blue-700 transition"
                >
                  Worker #{id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  // Get pincode for weather
  const zoneToPincode = {
    'Andheri West': '400053', 'Bandra': '400050', 'Sion': '400069',
    'Connaught Place': '110001', 'Rohini': '110085', 'Dwarka': '110075',
    'Whitefield': '560066', 'Koramangala': '560034', 'Sector 29': '122001',
    'Marina Beach': '600004', 'Sector 62': '201301',
  };
  const workerPincode = zoneToPincode[dashboard.worker.zone] || '400053';

  const trustColors = {
    PLATINUM: 'bg-purple-100 text-purple-700',
    GOLD: 'bg-yellow-100 text-yellow-700',
    SILVER: 'bg-gray-100 text-gray-700',
    BRONZE: 'bg-orange-100 text-orange-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Claim Detail Modal */}
      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          workerId={workerId}
          onClose={() => setSelectedClaim(null)}
          onAppeal={loadDashboard}
        />
      )}

      {/* Top Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Welcome, {dashboard.worker.name}! 👋
              </h2>
              <p className="text-sm text-gray-500">
                Token: <span className="font-mono font-bold text-blue-700">
                  {dashboard.worker.token}
                </span>
                <span className="mx-2">|</span>
                {dashboard.worker.platform} — {dashboard.worker.zone}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                trustColors[dashboard.worker.trust_tier] || trustColors.SILVER
              }`}>
                {dashboard.worker.trust_tier} ({dashboard.worker.trust_score})
              </span>
              <button
                onClick={() => { setDashboard(null); setWorkerId(''); }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'claims', label: '📋 Claims' },
            { id: 'simulate', label: '⚡ Test' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                activeSection === tab.id
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-lg font-bold text-blue-700 capitalize">
                  {dashboard.active_policy.plan_type || 'None'}
                </div>
                <div className="text-xs text-gray-500">Active Plan</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-lg font-bold text-green-600">
                  ₹{dashboard.active_policy.weekly_premium}
                </div>
                <div className="text-xs text-gray-500">Weekly Premium</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-lg font-bold text-blue-600">
                  ₹{dashboard.stats.total_earnings_protected}
                </div>
                <div className="text-xs text-gray-500">Total Protected</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">📝</div>
                <div className="text-lg font-bold text-orange-600">
                  {dashboard.stats.total_claims}
                </div>
                <div className="text-xs text-gray-500">Total Claims</div>
              </div>
            </div>

            {/* Weather + Policy Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <WeatherWidget pincode={workerPincode} />
              <PolicyCard
                workerId={workerId}
                policy={dashboard.active_policy}
                onUpdate={loadDashboard}
              />
            </div>

            {/* Streak + Forecast Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <StreakWidget workerId={workerId} />
              <ForecastWidget pincode={workerPincode} />
            </div>

            {/* Recent Claims */}
            {dashboard.recent_claims && dashboard.recent_claims.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold mb-4">🕒 Recent Claims</h3>
                <div className="space-y-2">
                  {dashboard.recent_claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-gray-50 p-3 rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => setSelectedClaim({
                        ...claim,
                        trigger_type: claim.type,
                        disruption_hours: claim.hours,
                        payout_amount: claim.payout,
                        fraud_score: 0,
                        created_at: claim.date,
                      })}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {claim.type === 'HEAVY_RAIN' ? '🌧️' :
                           claim.type === 'SEVERE_AQI' ? '🏭' :
                           claim.type === 'EXTREME_HEAT' ? '🌡️' :
                           claim.type === 'CURFEW' ? '🚫' :
                           claim.type === 'APP_DOWN' ? '📱' :
                           claim.type === 'FLOOD' ? '🌊' : '⚡'}
                        </span>
                        <div>
                          <div className="font-medium text-sm">{claim.type}</div>
                          <div className="text-xs text-gray-500">
                            {claim.date} | {claim.hours}hrs
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{claim.payout}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          claim.status === 'auto_approved' ? 'bg-green-100 text-green-700' :
                          claim.status === 'manual_review' ? 'bg-yellow-100 text-yellow-700' :
                          claim.status === 'under_appeal' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>{claim.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== CLAIMS TAB ==================== */}
        {activeSection === 'claims' && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                📋 All Claims ({claims?.total_claims || 0})
              </h3>
              <div className="text-sm text-gray-500">
                Total Protected: <span className="font-bold text-green-600">
                  ₹{claims?.total_earnings_protected || 0}
                </span>
              </div>
            </div>

            {claims && claims.claims && claims.claims.length > 0 ? (
              <div className="space-y-3">
                {claims.claims.map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className="bg-gray-50 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 border border-transparent transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {claim.trigger_type === 'HEAVY_RAIN' ? '🌧️' :
                         claim.trigger_type === 'SEVERE_AQI' ? '🏭' :
                         claim.trigger_type === 'EXTREME_HEAT' ? '🌡️' :
                         claim.trigger_type === 'CURFEW' ? '🚫' :
                         claim.trigger_type === 'APP_DOWN' ? '📱' :
                         claim.trigger_type === 'FLOOD' ? '🌊' : '⚡'}
                      </div>
                      <div>
                        <div className="font-medium">{claim.trigger_type}</div>
                        <div className="text-sm text-gray-500">
                          {claim.created_at} | {claim.disruption_hours}hrs
                          {claim.trigger_zone && ` | ${claim.trigger_zone}`}
                        </div>
                        {claim.transaction_id && (
                          <div className="text-xs text-gray-400 font-mono">
                            Txn: {claim.transaction_id}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-lg">
                        ₹{claim.payout_amount}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        claim.status === 'auto_approved' || claim.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : claim.status === 'manual_review'
                          ? 'bg-yellow-100 text-yellow-700'
                          : claim.status === 'under_appeal'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {claim.status}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        Fraud: {claim.fraud_score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🛡️</div>
                <p className="text-gray-500">No claims yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Your coverage is active. Claims are auto-processed when disruptions occur!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== SIMULATE TAB ==================== */}
        {activeSection === 'simulate' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold mb-2">
                ⚡ Simulate Disruption (Testing Only)
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Press a button to simulate a disruption in your zone ({dashboard.worker.zone}).
                The system will auto-create a trigger, run fraud detection, and process payout.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'HEAVY_RAIN', value: 35, icon: '🌧️', label: 'Heavy Rain', desc: '35mm/hr for 4hrs', color: 'blue' },
                  { type: 'EXTREME_HEAT', value: 47, icon: '🌡️', label: 'Extreme Heat', desc: '47°C for 4hrs', color: 'red' },
                  { type: 'SEVERE_AQI', value: 520, icon: '🏭', label: 'Severe AQI', desc: 'AQI 520 for 4hrs', color: 'yellow' },
                  { type: 'CURFEW', value: 1, icon: '🚫', label: 'Curfew', desc: 'Section 144 for 4hrs', color: 'purple' },
                  { type: 'APP_DOWN', value: 120, icon: '📱', label: 'App Down', desc: 'Server crash 4hrs', color: 'orange' },
                  { type: 'FLOOD', value: 1, icon: '🌊', label: 'Flood', desc: 'Red alert for 4hrs', color: 'cyan' },
                ].map(sim => (
                  <button
                    key={sim.type}
                    onClick={() => handleSimulate(sim.type, sim.value)}
                    disabled={simLoading}
                    className={`bg-${sim.color}-50 hover:bg-${sim.color}-100 border border-${sim.color}-200 p-4 rounded-xl text-left transition disabled:opacity-50`}
                  >
                    <div className="text-2xl mb-1">{sim.icon}</div>
                    <div className="font-semibold text-sm text-gray-800">{sim.label}</div>
                    <div className="text-xs text-gray-500">{sim.desc}</div>
                  </button>
                ))}
              </div>

              {simLoading && (
                <div className="mt-4 text-center">
                  <div className="text-3xl animate-bounce mb-2">⚡</div>
                  <p className="text-blue-600 font-medium">Processing disruption...</p>
                  <p className="text-gray-400 text-sm">Running 7-layer fraud detection...</p>
                </div>
              )}
            </div>

            {/* Simulation Result */}
            {simResult && !simResult.error && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-700 mb-3">
                  ✅ Disruption Processed!
                </h3>

                {/* Trigger Info */}
                <div className="bg-blue-50 p-4 rounded-xl mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Type</div>
                      <div className="font-bold">{simResult.trigger?.type}</div>
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

                {/* Impact Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-500">Workers in Zone</div>
                    <div className="text-xl font-bold text-gray-700">
                      {simResult.impact?.workers_in_zone}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-500">Claims Created</div>
                    <div className="text-xl font-bold text-green-700">
                      {simResult.impact?.claims_created}
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-500">Rejected</div>
                    <div className="text-xl font-bold text-red-700">
                      {simResult.impact?.claims_rejected}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <div className="text-xs text-gray-500">Total Payout</div>
                    <div className="text-xl font-bold text-blue-700">
                      ₹{simResult.impact?.total_payout}
                    </div>
                  </div>
                </div>

                {/* Individual Claims */}
                {simResult.claims && simResult.claims.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2 text-sm">Claims Processed:</h4>
                    <div className="space-y-2">
                      {simResult.claims.map((c, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">{c.worker_name}</span>
                            <span className="text-gray-500 ml-2">({c.worker_token})</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              c.fraud_score <= 30 ? 'bg-green-100 text-green-700' :
                              c.fraud_score <= 70 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              Fraud: {c.fraud_score}
                            </span>
                            <span className="font-bold text-green-600">₹{c.payout_amount}</span>
                            <span className={`text-xs font-medium ${
                              c.status === 'auto_approved' ? 'text-green-600' :
                              c.status === 'manual_review' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {c.status === 'auto_approved' ? '✅' :
                               c.status === 'manual_review' ? '⏳' : '❌'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected */}
                {simResult.rejected && simResult.rejected.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-bold text-red-700 mb-2 text-sm">Not Eligible:</h4>
                    {simResult.rejected.map((r, i) => (
                      <div key={i} className="text-sm text-gray-500">
                        ❌ {r.worker_name}: {r.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {simResult?.error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-700">❌ {simResult.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;