import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getWorkerDashboard, getWorkerClaims, simulateDisruption } from '../services/api';

function Dashboard() {
  const [searchParams] = useSearchParams();
  const [workerId, setWorkerId] = useState(searchParams.get('worker_id') || '');
  const [dashboard, setDashboard] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const loadDashboard = async () => {
    if (!workerId) return;
    setLoading(true); setError('');
    try {
      const dashRes = await getWorkerDashboard(workerId);
      setDashboard(dashRes.data);
      const claimsRes = await getWorkerClaims(workerId);
      setClaims(claimsRes.data);
    } catch (err) { setError(err.response?.data?.detail || 'Failed to load dashboard'); }
    setLoading(false);
  };

  useEffect(() => { if (workerId) loadDashboard(); }, []);

  const handleSimulate = async (type, value) => {
    if (!dashboard) return;
    setSimLoading(true); setSimResult(null);
    try {
      const res = await simulateDisruption({
        disruption_type: type,
        pincode: dashboard.worker.zone === 'Andheri West' ? '400053' : '110001',
        zone: dashboard.worker.zone, value: value, duration_hours: 4,
      });
      setSimResult(res.data); loadDashboard();
    } catch (err) { setSimResult({ error: err.response?.data?.detail || 'Simulation failed' }); }
    setSimLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {!dashboard && (
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">📊 Worker Dashboard</h2>
            <p className="text-gray-500 mb-6">Enter your Worker ID to view dashboard</p>
            <div className="flex space-x-4 max-w-md mx-auto">
              <input type="number" placeholder="Worker ID (e.g. 1)" value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              <button onClick={loadDashboard} disabled={!workerId || loading}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400">
                {loading ? 'Loading...' : 'View'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        )}

        {dashboard && (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Welcome, {dashboard.worker.name}! 👋</h2>
                  <p className="text-gray-500">Token: <span className="font-mono font-bold text-blue-700">{dashboard.worker.token}</span></p>
                </div>
                <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold">
                  {dashboard.worker.trust_tier} ({dashboard.worker.trust_score})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-sm text-gray-500">Policy</div>
                <div className="text-lg font-bold text-blue-700 capitalize">{dashboard.active_policy.plan_type || 'None'}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-sm text-gray-500">Premium</div>
                <div className="text-lg font-bold text-green-600">₹{dashboard.active_policy.weekly_premium}/wk</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-sm text-gray-500">Protected</div>
                <div className="text-lg font-bold text-blue-600">₹{dashboard.stats.total_earnings_protected}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-sm text-gray-500">Claims</div>
                <div className="text-lg font-bold text-orange-600">{dashboard.stats.total_claims}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
              <h3 className="text-lg font-bold mb-4">⚡ Simulate Disruption (Testing)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => handleSimulate('HEAVY_RAIN', 35)} disabled={simLoading}
                  className="bg-blue-100 text-blue-700 p-3 rounded-lg text-sm font-medium hover:bg-blue-200">🌧️ Heavy Rain</button>
                <button onClick={() => handleSimulate('EXTREME_HEAT', 47)} disabled={simLoading}
                  className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-medium hover:bg-red-200">🌡️ Extreme Heat</button>
                <button onClick={() => handleSimulate('SEVERE_AQI', 520)} disabled={simLoading}
                  className="bg-yellow-100 text-yellow-700 p-3 rounded-lg text-sm font-medium hover:bg-yellow-200">🏭 Severe AQI</button>
                <button onClick={() => handleSimulate('CURFEW', 1)} disabled={simLoading}
                  className="bg-purple-100 text-purple-700 p-3 rounded-lg text-sm font-medium hover:bg-purple-200">🚫 Curfew</button>
              </div>
              {simLoading && <p className="text-blue-600 mt-4 text-center">Processing disruption...</p>}
              {simResult && !simResult.error && (
                <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-xl">
                  <p className="font-bold text-green-700">✅ {simResult.message}</p>
                  <p className="text-sm mt-2">Claims Created: <strong>{simResult.impact?.claims_created}</strong></p>
                  <p className="text-sm">Total Payout: <strong>₹{simResult.impact?.total_payout}</strong></p>
                </div>
              )}
              {simResult?.error && (
                <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-xl">
                  <p className="text-red-700">{simResult.error}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">📋 Claims History</h3>
              {claims && claims.claims && claims.claims.length > 0 ? (
                <div className="space-y-3">
                  {claims.claims.map((claim) => (
                    <div key={claim.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-medium">{claim.trigger_type}</div>
                        <div className="text-sm text-gray-500">{claim.created_at} | {claim.disruption_hours} hrs</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{claim.payout_amount}</div>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          claim.status === 'auto_approved' ? 'bg-green-100 text-green-700' :
                          claim.status === 'manual_review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{claim.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (<p className="text-gray-400 text-center py-8">No claims yet. Your coverage is active!</p>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;