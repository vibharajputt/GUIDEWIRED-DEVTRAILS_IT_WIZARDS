import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  getAdminDashboard, getAllClaims, getAllTriggers,
  approveClaim, rejectClaim, getAllWorkers
} from '../services/api';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1'];
const BAR_COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

function Admin() {
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
    loadData();
  }, []);

  const handleApprove = async (claimId) => {
    try {
      await approveClaim(claimId);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🛡️</div>
          <p className="text-xl text-gray-600">Loading Admin Dashboard...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🛡️ GigShield Admin Portal
            </h1>
            <p className="text-gray-500 text-sm">
              Insurance Operations Dashboard
            </p>
          </div>
          <button
            onClick={loadData}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-gray-600 hover:text-gray-800'
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
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <div className="text-3xl mb-1">👥</div>
                <div className="text-2xl font-bold text-blue-700">
                  {dashboard.overview.total_workers}
                </div>
                <div className="text-sm text-gray-500">Total Workers</div>
                <div className="text-xs text-green-500 mt-1">
                  {dashboard.overview.active_workers} active
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <div className="text-3xl mb-1">📋</div>
                <div className="text-2xl font-bold text-green-600">
                  {dashboard.overview.active_policies}
                </div>
                <div className="text-sm text-gray-500">Active Policies</div>
                <div className="text-xs text-gray-400 mt-1">
                  of {dashboard.overview.total_policies} total
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <div className="text-3xl mb-1">📝</div>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboard.overview.total_claims}
                </div>
                <div className="text-sm text-gray-500">Total Claims</div>
                <div className="text-xs text-orange-400 mt-1">
                  {dashboard.overview.total_triggers} triggers
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <div className="text-3xl mb-1">⏳</div>
                <div className={`text-2xl font-bold ${
                  dashboard.overview.pending_review > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboard.overview.pending_review}
                </div>
                <div className="text-sm text-gray-500">Pending Review</div>
                <div className="text-xs text-gray-400 mt-1">
                  {dashboard.overview.pending_review > 0 ? '⚠️ Needs attention' : '✅ All clear'}
                </div>
              </div>
            </div>

            {/* Financial Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border-2 border-green-200 p-5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-green-600 font-medium">
                      Weekly Premium Revenue
                    </div>
                    <div className="text-3xl font-bold text-green-700 mt-1">
                      ₹{dashboard.financials.weekly_premium_collection}
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>
              <div className="bg-red-50 border-2 border-red-200 p-5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-red-600 font-medium">
                      Total Claim Payouts
                    </div>
                    <div className="text-3xl font-bold text-red-700 mt-1">
                      ₹{dashboard.financials.total_payouts}
                    </div>
                  </div>
                  <span className="text-3xl">💸</span>
                </div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Loss Ratio</div>
                    <div className="text-3xl font-bold text-blue-700 mt-1">
                      {dashboard.financials.loss_ratio}
                    </div>
                    <div
                      className={`text-xs mt-1 font-bold ${
                        dashboard.financials.loss_ratio_status === 'Healthy'
                          ? 'text-green-600'
                          : dashboard.financials.loss_ratio_status === 'Warning'
                          ? 'text-yellow-600'
                          : 'text-red-600'
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

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Revenue vs Payouts Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold mb-4">💰 Revenue vs Payouts</h3>
                {revenueBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revenueBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                  <div className="flex items-center justify-center h-[280px] text-gray-400">
                    No financial data yet
                  </div>
                )}
              </div>

              {/* Fraud Distribution Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
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
                  <div className="flex items-center justify-center h-[280px] text-gray-400">
                    No claims data yet
                  </div>
                )}
              </div>
            </div>

            {/* Trigger Type Distribution */}
            {triggerBarData.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <h3 className="text-lg font-bold mb-4">⚡ Triggers by Type</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={triggerBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                <div className="bg-white p-6 rounded-2xl shadow-lg">
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
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-bold mb-4">⭐ Trust Tier Distribution</h3>
                  <div className="space-y-3 mt-2">
                    {trustData.map((tier) => {
                      const total = workers?.total_workers || 1;
                      const pct = Math.round((tier.count / total) * 100);
                      return (
                        <div key={tier.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{tier.name}</span>
                            <span className="text-gray-500">
                              {tier.count} workers ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
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
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold mb-4">🕒 Recent Triggers</h3>
                <div className="space-y-2">
                  {dashboard.recent_triggers.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            t.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : t.severity === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {t.severity?.toUpperCase()}
                        </span>
                        <span className="font-medium">{t.type}</span>
                        <span className="text-gray-500 text-sm">in {t.zone}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{t.date}</span>
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
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-gray-700">
                  {claims.total_claims}
                </div>
                <div className="text-xs text-gray-500">Total Claims</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-green-700">
                  {claims.claims?.filter((c) =>
                    ['auto_approved', 'approved'].includes(c.status)
                  ).length || 0}
                </div>
                <div className="text-xs text-green-600">Approved</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-yellow-700">
                  {claims.pending_review}
                </div>
                <div className="text-xs text-yellow-600">Pending Review</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-blue-700">
                  ₹{claims.total_payout}
                </div>
                <div className="text-xs text-blue-600">Total Payout</div>
              </div>
            </div>

            {/* Pending Review Queue */}
            {claims.claims &&
              claims.claims.filter((c) => c.status === 'manual_review').length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-yellow-800 mb-4">
                    ⏳ Pending Review Queue (
                    {claims.claims.filter((c) => c.status === 'manual_review').length})
                  </h3>
                  <div className="space-y-3">
                    {claims.claims
                      .filter((c) => c.status === 'manual_review')
                      .map((c) => (
                        <div
                          key={c.id}
                          className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm"
                        >
                          <div>
                            <div className="font-medium text-gray-800">
                              {c.worker_name}
                              <span className="text-gray-400 text-sm ml-2">
                                ({c.worker_token})
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {c.trigger_type} | {c.disruption_hours}h | Fraud:{' '}
                              <span
                                className={`font-bold ${
                                  c.fraud_score <= 30
                                    ? 'text-green-600'
                                    : c.fraud_score <= 70
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {c.fraud_score}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-green-600 text-lg">
                              ₹{c.payout_amount}
                            </span>
                            <button
                              onClick={() => handleApprove(c.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleReject(c.id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
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
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">📋 All Claims</h3>
              {claims.claims && claims.claims.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
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
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-gray-500">#{c.id}</td>
                          <td className="p-3">
                            <div className="font-medium">{c.worker_name}</div>
                            <div className="text-xs text-gray-400">
                              {c.worker_token}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                              {c.trigger_type}
                            </span>
                          </td>
                          <td className="p-3">{c.disruption_hours}h</td>
                          <td className="p-3 font-bold text-green-600">
                            ₹{c.payout_amount}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                c.fraud_score <= 30
                                  ? 'bg-green-100 text-green-700'
                                  : c.fraud_score <= 70
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {c.fraud_score}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs font-medium ${
                                c.priority_rank === 'critical'
                                  ? 'text-red-600'
                                  : c.priority_rank === 'high'
                                  ? 'text-orange-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {c.priority_rank?.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                ['auto_approved', 'approved'].includes(c.status)
                                  ? 'bg-green-100 text-green-700'
                                  : c.status === 'manual_review'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : c.status === 'under_appeal'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 text-xs">{c.created_at}</td>
                          <td className="p-3">
                            {(c.status === 'manual_review' ||
                              c.status === 'under_appeal') && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleApprove(c.id)}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  onClick={() => handleReject(c.id)}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
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
                <p className="text-gray-400 text-center py-8">No claims yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== TRIGGERS TAB ==================== */}
        {activeTab === 'triggers' && triggers && (
          <div className="space-y-4">
            {/* Trigger Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-gray-700">
                  {triggers.total_triggers}
                </div>
                <div className="text-xs text-gray-500">Total Triggers</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-red-700">
                  {triggers.triggers?.filter((t) =>
                    ['critical', 'high'].includes(t.severity)
                  ).length || 0}
                </div>
                <div className="text-xs text-red-600">High/Critical</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-blue-700">
                  {triggers.triggers?.reduce(
                    (sum, t) => sum + (t.claims_generated || 0),
                    0
                  ) || 0}
                </div>
                <div className="text-xs text-blue-600">Claims Generated</div>
              </div>
            </div>

            {/* Trigger Chart */}
            {triggerBarData.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold mb-4">⚡ Trigger Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={triggerBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">
                ⚡ All Triggers ({triggers.total_triggers})
              </h3>
              {triggers.triggers && triggers.triggers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
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
                        <tr key={t.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-gray-500">#{t.id}</td>
                          <td className="p-3 font-medium">{t.type}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                t.severity === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : t.severity === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-yellow-100 text-yellow-700'
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
                            <div className="text-xs text-gray-400">{t.pincode}</div>
                          </td>
                          <td className="p-3">{t.duration_hours}h</td>
                          <td className="p-3 text-gray-500 text-xs">{t.source}</td>
                          <td className="p-3 font-bold">{t.claims_generated}</td>
                          <td className="p-3 text-gray-400 text-xs">{t.started_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No triggers yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== WORKERS TAB ==================== */}
        {activeTab === 'workers' && workers && (
          <div className="space-y-4">
            {/* Worker Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-xl font-bold text-blue-700">
                  {workers.total_workers}
                </div>
                <div className="text-xs text-gray-500">Total Workers</div>
              </div>
              {platformData.slice(0, 3).map((p, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow text-center">
                  <div className="text-xl font-bold text-gray-700">{p.count}</div>
                  <div className="text-xs text-gray-500 capitalize">{p.name}</div>
                </div>
              ))}
            </div>

            {/* Workers Table */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">
                👥 All Workers ({workers.total_workers})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
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
                        <tr key={w.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-500">#{w.id}</td>
                          <td className="p-3 font-medium">{w.name}</td>
                          <td className="p-3 font-mono text-xs text-blue-600">
                            {w.token_id}
                          </td>
                          <td className="p-3 capitalize">{w.platform}</td>
                          <td className="p-3">
                            {w.zone}
                            <div className="text-xs text-gray-400">{w.pincode}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">₹{w.monthly_earning}/mo</div>
                            <div className="text-xs text-gray-400">
                              ₹{w.hourly_rate}/hr
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
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
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : w.trust_tier === 'SILVER'
                                  ? 'bg-gray-100 text-gray-700'
                                  : w.trust_tier === 'BRONZE'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {w.trust_tier} ({w.trust_score})
                            </span>
                          </td>
                          <td className="p-3">
                            {w.is_active ? (
                              <span className="text-green-600 text-xs font-bold">
                                ✅ Active
                              </span>
                            ) : (
                              <span className="text-red-600 text-xs font-bold">
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
              <div className="bg-green-50 border border-green-200 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-700">
                  {dashboard.fraud_stats.auto_approved}
                </div>
                <div className="text-sm text-green-600 font-medium">Auto Approved</div>
                <div className="text-xs text-green-500 mt-1">Score 0-30</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-yellow-700">
                  {dashboard.fraud_stats.manual_review}
                </div>
                <div className="text-sm text-yellow-600 font-medium">Manual Review</div>
                <div className="text-xs text-yellow-500 mt-1">Score 31-70</div>
              </div>
              <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-red-700">
                  {dashboard.fraud_stats.rejected}
                </div>
                <div className="text-sm text-red-600 font-medium">Rejected</div>
                <div className="text-xs text-red-500 mt-1">Score 71-100</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-700">
                  {dashboard.fraud_stats.avg_fraud_score}
                </div>
                <div className="text-sm text-blue-600 font-medium">Avg Fraud Score</div>
                <div className="text-xs text-blue-500 mt-1">Lower is better</div>
              </div>
            </div>

            {/* Fraud Pie Chart */}
            {fraudPieData.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
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
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
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
                    className="flex items-start space-x-3 bg-gray-50 p-3 rounded-xl"
                  >
                    <div className="bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {l.layer}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {l.name}{' '}
                        <span className="text-blue-600 text-xs">({l.weight})</span>
                      </div>
                      <div className="text-xs text-gray-500">{l.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Review Queue */}
            {claims && claims.claims && (
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold mb-4">
                  ⏳ Fraud Review Queue (
                  {claims.claims.filter((c) => c.status === 'manual_review').length})
                </h3>
                {claims.claims.filter((c) => c.status === 'manual_review').length >
                0 ? (
                  <div className="space-y-3">
                    {claims.claims
                      .filter((c) => c.status === 'manual_review')
                      .map((c) => (
                        <div
                          key={c.id}
                          className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{c.worker_name}</div>
                            <div className="text-sm text-gray-500">
                              {c.trigger_type} | {c.disruption_hours}h | Fraud:{' '}
                              {c.fraud_score}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-green-600">
                              ₹{c.payout_amount}
                            </span>
                            <button
                              onClick={() => handleApprove(c.id)}
                              className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleReject(c.id)}
                              className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-green-600 text-center py-4">
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