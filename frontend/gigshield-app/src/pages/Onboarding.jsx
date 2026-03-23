import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendAadhaarOTP, verifyAadhaarOTP, registerWorker, compareAllPlans, createPolicy } from '../services/api';

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', platform: 'zepto', pincode: '', zone: '',
    monthly_earning: '', working_hours_per_day: '', working_days_per_week: '', upi_id: ''
  });
  const [plans, setPlans] = useState(null);
  const [workerId, setWorkerId] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [policyData, setPolicyData] = useState(null);

  const handleSendOTP = async () => {
    setError(''); setLoading(true);
    try {
      const res = await sendAadhaarOTP(aadhaar);
      setSessionId(res.data.session_id); setStep(1.5);
    } catch (err) { setError(err.response?.data?.detail || 'Failed to send OTP'); }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setError(''); setLoading(true);
    try {
      await verifyAadhaarOTP(aadhaar, otp, sessionId); setStep(2);
    } catch (err) { setError(err.response?.data?.detail || 'OTP verification failed'); }
    setLoading(false);
  };

  const handleRegister = async () => {
    setError(''); setLoading(true);
    try {
      const data = {
        aadhaar_number: aadhaar, name: formData.name, phone: formData.phone,
        platform: formData.platform, pincode: formData.pincode, zone: formData.zone,
        monthly_earning: parseFloat(formData.monthly_earning),
        working_hours_per_day: parseFloat(formData.working_hours_per_day),
        working_days_per_week: parseInt(formData.working_days_per_week),
        upi_id: formData.upi_id || null,
      };
      const res = await registerWorker(data);
      setWorkerId(res.data.id); setWorkerData(res.data);
      const plansRes = await compareAllPlans(res.data.id);
      setPlans(plansRes.data); setStep(3);
    } catch (err) { setError(err.response?.data?.detail || 'Registration failed'); }
    setLoading(false);
  };

  const handleCreatePolicy = async (planType) => {
    setError(''); setLoading(true);
    try {
      const res = await createPolicy(workerId, planType);
      setPolicyData(res.data); setSelectedPlan(planType); setStep(4);
    } catch (err) { setError(err.response?.data?.detail || 'Policy creation failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {['Aadhaar', 'Details', 'Plan', 'Done'].map((label, i) => (
              <div key={i} className={`text-sm font-medium ${Math.ceil(step) >= i + 1 ? 'text-blue-700' : 'text-gray-400'}`}>{label}</div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-700 h-2 rounded-full transition-all duration-500" style={{ width: `${(Math.ceil(step) / 4) * 100}%` }}></div>
          </div>
        </div>

        {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>)}

        {step === 1 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🔐 Verify Your Identity</h2>
            <p className="text-gray-500 mb-6">Enter your 12-digit Aadhaar number</p>
            <input type="text" maxLength="12" placeholder="Enter Aadhaar Number" value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none mb-4" />
            <button onClick={handleSendOTP} disabled={aadhaar.length !== 12 || loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
            <p className="text-gray-400 text-sm mt-4 text-center">We never store your Aadhaar number. Only a secure hash is saved.</p>
          </div>
        )}

        {step === 1.5 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📱 Enter OTP</h2>
            <p className="text-gray-500 mb-6">OTP sent to your Aadhaar-linked mobile</p>
            <input type="text" maxLength="6" placeholder="Enter 6-digit OTP" value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-center tracking-widest focus:border-blue-500 focus:outline-none mb-2" />
            <p className="text-blue-600 text-sm mb-4">💡 For testing, use OTP: <strong>123456</strong></p>
            <button onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400">
              {loading ? 'Verifying...' : 'Verify OTP →'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📝 Your Details</h2>
            <p className="text-gray-500 mb-6">Tell us about your delivery work</p>
            <div className="space-y-4">
              <input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              <input placeholder="Phone Number" maxLength="10" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white">
                <option value="zepto">Zepto</option><option value="blinkit">Blinkit</option>
                <option value="swiggy_instamart">Swiggy Instamart</option><option value="swiggy">Swiggy</option>
                <option value="zomato">Zomato</option><option value="amazon">Amazon</option>
                <option value="flipkart">Flipkart</option><option value="dunzo">Dunzo</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Pincode" maxLength="6" value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                <input placeholder="Zone (e.g. Andheri West)" value={formData.zone}
                  onChange={(e) => setFormData({...formData, zone: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <input placeholder="Monthly Earning (₹)" type="number" value={formData.monthly_earning}
                onChange={(e) => setFormData({...formData, monthly_earning: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Hours/Day" type="number" value={formData.working_hours_per_day}
                  onChange={(e) => setFormData({...formData, working_hours_per_day: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                <input placeholder="Days/Week" type="number" value={formData.working_days_per_week}
                  onChange={(e) => setFormData({...formData, working_days_per_week: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <input placeholder="UPI ID (e.g. name@upi)" value={formData.upi_id}
                onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
            </div>
            <button onClick={handleRegister} disabled={loading || !formData.name || !formData.phone}
              className="w-full mt-6 bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400">
              {loading ? 'Registering...' : 'Register & View Plans →'}
            </button>
          </div>
        )}

        {step === 3 && plans && (
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">👤 Welcome, {workerData?.name}!</h2>
              <p className="text-gray-500">Token: <span className="font-mono font-bold text-blue-700">{workerData?.token_id}</span></p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Hourly Rate</div>
                  <div className="text-lg font-bold text-blue-700">₹{workerData?.hourly_rate}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Risk Level</div>
                  <div className="text-lg font-bold text-green-700">{plans?.risk_level}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Trust Tier</div>
                  <div className="text-lg font-bold text-purple-700">{plans?.trust_tier}</div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Choose Your Plan</h3>
            <div className="space-y-4">
              {['basic', 'standard', 'pro'].map((planType) => {
                const plan = plans.plans[planType];
                const isRecommended = planType === 'standard';
                return (
                  <div key={planType} className={`bg-white p-6 rounded-2xl shadow-lg border-2 ${isRecommended ? 'border-blue-500' : 'border-gray-200'} relative`}>
                    {isRecommended && (<div className="absolute -top-3 left-4 bg-blue-700 text-white text-xs px-3 py-1 rounded-full">⭐ RECOMMENDED</div>)}
                    <div className="flex justify-between items-center">
                      <div><h4 className="text-xl font-bold capitalize">{planType}</h4><p className="text-gray-500 text-sm">Coverage: {plan.coverage_percent}%</p></div>
                      <div className="text-right"><div className="text-2xl font-bold text-blue-700">₹{plan.weekly_premium}</div><div className="text-gray-500 text-sm">/week</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
                      <div className="bg-gray-50 p-2 rounded text-center"><div className="text-xs text-gray-500">Per Hour</div><div className="font-bold">₹{plan.hourly_payout}</div></div>
                      <div className="bg-gray-50 p-2 rounded text-center"><div className="text-xs text-gray-500">Daily Max</div><div className="font-bold">₹{plan.daily_max_payout}</div></div>
                      <div className="bg-gray-50 p-2 rounded text-center"><div className="text-xs text-gray-500">Weekly Max</div><div className="font-bold">₹{plan.weekly_max_payout}</div></div>
                    </div>
                    <button onClick={() => handleCreatePolicy(planType)} disabled={loading}
                      className={`w-full py-3 rounded-lg font-semibold ${isRecommended ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:bg-gray-400`}>
                      {loading ? 'Creating...' : `Choose ${planType.charAt(0).toUpperCase() + planType.slice(1)}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">You're Protected!</h2>
            <p className="text-gray-600 mb-6">Your {selectedPlan?.toUpperCase()} policy is now active.</p>
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-6 text-left">
              <h3 className="font-bold text-green-700 mb-3">Policy Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Token:</span> <span className="font-mono font-bold">{workerData?.token_id}</span></p>
                <p><span className="text-gray-500">Plan:</span> <span className="font-bold capitalize">{selectedPlan}</span></p>
                <p><span className="text-gray-500">Premium:</span> <span className="font-bold">₹{policyData?.policy?.weekly_premium}/week</span></p>
                <p><span className="text-gray-500">Coverage:</span> <span className="font-bold">{policyData?.policy?.coverage_percent}%</span></p>
                <p><span className="text-gray-500">Payment:</span> <span className="font-bold text-green-600">₹{policyData?.payment?.amount} paid ✅</span></p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
              <p className="text-blue-700 text-sm">🌧️ If any disruption occurs in your zone, your claim will be processed automatically. Zero paperwork. Zero waiting.</p>
            </div>
            <button onClick={() => navigate(`/dashboard?worker_id=${workerId}`)}
              className="w-full bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-800">
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;