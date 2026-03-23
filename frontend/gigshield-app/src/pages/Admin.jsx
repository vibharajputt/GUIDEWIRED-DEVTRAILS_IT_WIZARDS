import React, { useState, useEffect } from 'react';
import { getAdminDashboard, getAllClaims, approveClaim, rejectClaim } from '../services/api';

function Admin() {
  const [dashboard, setDashboard] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const dashRes = await getAdminDashboard(); setDashboard(dashRes.data);
      const claimsRes = await getAllClaims(); setClaims(claimsRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (claimId) => {
    try { await approveClaim(claimId); loadData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };
  const handleReject = async (claimId) => {
    try { await rejectClaim(claimId); loadData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">🛡️ GigShield Admin Dashboard</h1>
        {dashboard && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <div className="text-sm text-gray-500">Workers</div>
                <div className="text-2xl font-bold text-blue-700">{dashboard.overview.total_workers}</div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <div className="text-sm text-gray-500">Active Policies</div>
                <div className="text-2xl font-bold text-green-600">{dashboard.overview.active_policies}</div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <div className="text-sm text-gray-500">Total Claims</div>
                <div className="text-2xl font-bold text-orange-600">{dashboard.overview.total_claims}</div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <div className="text-sm text-gray-500">Pending Review</div>
                <div className="text-2xl font-bold text-red-600">{dashboard.overview.pending_review}</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
                <div className="text-sm text-green-600">Weekly Premium</div>
                <div className="text-2xl font-bold text-green-700">₹{dashboard.financials.weekly_premium_collection}</div>
              </div>
              <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
                <div className="text-sm text-red-600">Total Payouts</div>
                <div className="text-2xl font-bold text-red-700">₹{dashboard.financials.total_payouts}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
                <div className="text-sm text-blue-600">Loss Ratio</div>
                <div className="text-2xl font-bold text-blue-700">{dashboard.financials.loss_ratio}</div>
                <div className="text-xs">{dashboard.financials.loss_ratio_status}</div>
              </div>
            </div>
          </>
        )}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">📋 All Claims</h3>
          {claims && claims.claims && claims.claims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-100">
                  <th className="p-3 text-left">ID</th><th className="p-3 text-left">Worker</th>
                  <th className="p-3 text-left">Trigger</th><th className="p-3 text-left">Payout</th>
                  <th className="p-3 text-left">Fraud</th><th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr></thead>
                <tbody>
                  {claims.claims.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{c.id}</td><td className="p-3">{c.worker_name}</td>
                      <td className="p-3">{c.trigger_type}</td>
                      <td className="p-3 font-bold text-green-600">₹{c.payout_amount}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.fraud_score <= 30 ? 'bg-green-100 text-green-700' : c.fraud_score <= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{c.fraud_score}</span></td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'auto_approved' || c.status === 'approved' ? 'bg-green-100 text-green-700' : c.status === 'manual_review' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span></td>
                      <td className="p-3">{c.status === 'manual_review' && (
                        <div className="flex space-x-2">
                          <button onClick={() => handleApprove(c.id)} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">✅</button>
                          <button onClick={() => handleReject(c.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">❌</button>
                        </div>
                      )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (<p className="text-gray-400 text-center py-8">No claims yet.</p>)}
        </div>
      </div>
    </div>
  );
}

export default Admin;