import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, ChevronRight, Fingerprint, Search, Info, Smartphone, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { sendAadhaarOTP, verifyAadhaarOTP, registerWorker, compareAllPlans, createPolicy, verifyUPI } from '../services/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [phone, setPhone] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [formData, setFormData] = useState({
    name: '', phone: '', platform: 'zepto', pincode: '', zone: '',
    monthly_earning: '', working_hours_per_day: '', working_days_per_week: '', upi_id: ''
  });
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [upiResult, setUpiResult] = useState(null);
  const [plans, setPlans] = useState(null);
  const [workerId, setWorkerId] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [policyData, setPolicyData] = useState(null);
  const [otpSentSuccess, setOtpSentSuccess] = useState(false);

  const handleSendOTP = async () => {
    setError(''); setLoading(true); setOtpSentSuccess(false);
    try {
      const res = await sendAadhaarOTP(aadhaar, phone);
      setSessionId(res.data.session_id);
      setMaskedPhone(res.data.masked_phone);
      setOtpSentSuccess(true);
      setTimeout(() => setStep(1.5), 800); // Brief success animation
    } catch (err) { setError(err.response?.data?.detail || 'Failed to send OTP'); }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setError(''); setLoading(true);
    try {
      await verifyAadhaarOTP(aadhaar, otp, sessionId);
      setFormData(prev => ({ ...prev, phone: phone }));
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail || 'OTP verification failed';
      setError(detail);
      setOtpAttempts(prev => prev + 1);
    }
    setLoading(false);
  };

  const handleVerifyUPI = async () => {
    if (!formData.upi_id) return;
    setUpiVerifying(true); setUpiResult(null); setError('');
    try {
      const res = await verifyUPI(formData.upi_id);
      setUpiResult(res.data);
      setUpiVerified(true);
    } catch (err) {
      setUpiResult({ verified: false, message: err.response?.data?.detail || 'UPI verification failed' });
      setUpiVerified(false);
    }
    setUpiVerifying(false);
  };

  const handleRegister = async () => {
    setError(''); setLoading(true);
    if (!upiVerified && formData.upi_id) {
      setError('Please verify your UPI ID first.');
      setLoading(false);
      return;
    }
    try {
      const data = {
        aadhaar_number: aadhaar, name: formData.name, phone: formData.phone || phone,
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

  const handleResendOTP = async () => {
    setOtp(''); setError(''); setOtpAttempts(0);
    setLoading(true);
    try {
      const res = await sendAadhaarOTP(aadhaar, phone);
      setSessionId(res.data.session_id);
      setMaskedPhone(res.data.masked_phone);
      setError('');
    } catch (err) { setError(err.response?.data?.detail || 'Failed to resend OTP'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-slate-100 py-12 px-4 relative flex items-center justify-center -mt-[80px]">
      <div className="fixed inset-0 bg-slate-950 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950 -z-10" />

      <div className="max-w-xl w-full z-10 pt-[80px]">
        {/* Progress Bar */}
        <div className="mb-8 p-6 glass-panel rounded-3xl border border-white/5 shadow-xl">
          <div className="flex justify-between mb-4 px-2 relative z-10">
            {['Identify', 'Details', 'Coverage', 'Secure'].map((label, i) => (
              <div key={i} className={`text-[10px] uppercase tracking-widest font-bold flex flex-col items-center flex-1 transition-colors duration-300 ${Math.ceil(step) >= i + 1 ? 'text-brand-300' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2 transition-all duration-500 z-10 relative ${
                  Math.ceil(step) > i + 1 ? 'bg-brand-500 border-brand-500 text-white' : 
                  Math.ceil(step) === i + 1 ? 'border-brand-400 text-brand-400 bg-brand-500/10 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 
                  'border-slate-800 bg-slate-900 text-slate-600'
                }`}>
                  {Math.ceil(step) > i + 1 ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span className="hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 relative overflow-hidden -mt-[38px] z-0 px-8">
            <div className="w-full h-full bg-slate-800" />
            <motion.div 
              className="absolute left-[32px] top-0 h-full bg-gradient-to-r from-brand-600 to-indigo-400" 
              initial={{ width: 0 }}
              animate={{ width: `calc(${(Math.ceil(step) / 4) * 100}% - 64px)` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center">
              <AlertTriangle className="mr-3 shrink-0" size={20} />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== STEP 1: AADHAAR + PHONE ===== */}
        {step === 1 && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="glass-panel p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] pointer-events-none" />
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center relative z-10"><Fingerprint size={28} className="mr-3 text-brand-400" /> Verify Identity</h2>
            <p className="text-slate-400 mb-8 relative z-10">Enter your Aadhaar and linked phone number to proceed securely.</p>

            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Aadhaar Number</label>
                <div className="relative">
                  <input type="text" maxLength="12" placeholder="0000 0000 0000" value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-5 pr-12 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl text-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none tracking-[0.2em] font-mono shadow-inner transition" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {aadhaar.length === 12 ? <CheckCircle2 className="text-emerald-400" size={20} /> : <ShieldAlert className="text-slate-600" size={20} />}
                  </div>
                </div>
                {aadhaar.length > 0 && aadhaar.length < 12 && (
                  <p className="text-[10px] text-orange-400 mt-2 uppercase tracking-wider font-bold">{12 - aadhaar.length} more digits needed</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Linked Mobile Number</label>
                <div className="flex bg-slate-900/80 border border-slate-700/50 rounded-2xl focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 shadow-inner transition overflow-hidden">
                  <div className="pl-5 pr-3 py-4 border-r border-slate-700/50 flex items-center bg-slate-800/50">
                    <span className="text-slate-400 font-bold">+91</span>
                  </div>
                  <input type="text" maxLength="10" placeholder="90000 00000" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 bg-transparent text-xl text-white focus:outline-none tracking-widest font-mono" />
                </div>
                {phone.length > 0 && phone.length < 10 && (
                  <p className="text-[10px] text-orange-400 mt-2 uppercase tracking-wider font-bold">{10 - phone.length} more digits needed</p>
                )}
              </div>
            </div>

            {otpSentSuccess && (
              <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mt-6 bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl text-center relative z-10">
                <span className="text-emerald-400 font-bold flex items-center justify-center"><CheckCircle2 className="mr-2" size={18}/> OTP Sent Successfully!</span>
              </motion.div>
            )}

            <button onClick={handleSendOTP} disabled={aadhaar.length !== 12 || phone.length !== 10 || loading}
              className="w-full mt-8 bg-brand-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-brand-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:shadow-none disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 transition-all flex justify-center items-center relative z-10">
              {loading ? <span className="flex items-center"><Smartphone className="mr-2 animate-bounce"/> Sending...</span> : <span className="flex items-center">Get OTP <ChevronRight className="ml-2" /></span>}
            </button>

            <div className="mt-6 border-t border-white/5 pt-6 relative z-10">
              <p className="text-slate-500 text-xs flex items-start leading-relaxed">
                <ShieldCheck size={16} className="text-emerald-500 mr-2 shrink-0 mt-0.5" /> 
                Your data is secure. We use government-approved UIDAI APIs for verification. We do not store your Aadhaar number.
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 1.5: OTP VERIFICATION ===== */}
        {step === 1.5 && (
          <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="glass-panel p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="mb-6 w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center text-brand-400 border border-brand-500/30 mx-auto">
               <Smartphone size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Check Your Phone</h2>
            <p className="text-slate-400 text-center mb-8 text-sm">
              We've sent a 6-digit code to <strong className="text-white">{maskedPhone}</strong>
            </p>

            <div className="mb-6">
              <input type="text" maxLength="6" placeholder="000000" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                className="w-full px-4 py-5 bg-slate-900/80 border border-slate-700/50 rounded-2xl text-4xl text-center text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none tracking-[1em] font-mono shadow-inner transition placeholder:opacity-30" />
            </div>

            <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl mb-6 flex items-start">
               <Info size={18} className="text-blue-400 mr-3 shrink-0 mt-0.5" />
              <p className="text-blue-300 text-xs leading-relaxed">
                For testing purposes, you can use the default OTP <strong className="font-mono text-white bg-white/10 px-1 py-0.5 rounded ml-1">123456</strong>
              </p>
            </div>

            {otpAttempts > 0 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-red-900/20 border border-red-500/20 p-3 rounded-xl mb-6 text-center">
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">
                  {3 - otpAttempts} attempt(s) remaining
                </p>
              </motion.div>
            )}

            <button onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading}
              className="w-full bg-brand-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-brand-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:shadow-none disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 transition-all flex justify-center items-center">
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div className="mt-8 flex justify-between items-center px-2">
              <button onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="text-slate-400 text-sm font-bold hover:text-white transition flex items-center">
                <ChevronRight size={16} className="rotate-180 mr-1"/> Back
              </button>
              <button onClick={handleResendOTP} disabled={loading}
                className="text-brand-400 text-sm font-bold hover:text-brand-300 disabled:text-slate-600 transition">
                Resend Code
              </button>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 2: WORKER DETAILS + UPI VERIFICATION ===== */}
        {step === 2 && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="glass-panel p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] pointer-events-none" />
            
            <div className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-xl mb-8 flex flex-col items-center justify-center relative z-10 w-fit mx-auto px-6">
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center">
                <ShieldCheck size={14} className="mr-2" /> Aadhaar Verified
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Your Details</h2>
            <p className="text-slate-400 mb-8 relative z-10 text-sm">Tell us about your delivery work to calculate your risk profile and premium.</p>
            
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                <input placeholder="As per Aadhaar" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                <div className="flex bg-slate-900/80 border border-slate-700/50 rounded-xl focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 shadow-inner transition overflow-hidden">
                  <div className="pl-4 pr-3 py-3 border-r border-slate-700/50 flex items-center bg-slate-800/50">
                    <span className="text-slate-400 font-bold">+91</span>
                  </div>
                  <input placeholder="Phone Number" maxLength="10" value={formData.phone || phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-3 bg-transparent text-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Delivery Platform</label>
                <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner appearance-none">
                  <option value="zepto" className="bg-slate-800">Zepto</option><option value="blinkit" className="bg-slate-800">Blinkit</option>
                  <option value="swiggy_instamart" className="bg-slate-800">Swiggy Instamart</option><option value="swiggy" className="bg-slate-800">Swiggy</option>
                  <option value="zomato" className="bg-slate-800">Zomato</option><option value="amazon" className="bg-slate-800">Amazon</option>
                  <option value="flipkart" className="bg-slate-800">Flipkart</option><option value="dunzo" className="bg-slate-800">Dunzo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Pincode</label>
                  <input placeholder="6-digit" maxLength="6" value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Zone Name</label>
                  <input placeholder="e.g. Andheri West" value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Monthly Earning (₹)</label>
                <input placeholder="e.g., 25000" type="number" value={formData.monthly_earning}
                  onChange={(e) => setFormData({...formData, monthly_earning: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hours/Day</label>
                  <input placeholder="e.g., 8" type="number" value={formData.working_hours_per_day}
                    onChange={(e) => setFormData({...formData, working_hours_per_day: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Days/Week</label>
                  <input placeholder="e.g., 6" type="number" value={formData.working_days_per_week}
                    onChange={(e) => setFormData({...formData, working_days_per_week: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner" />
                </div>
              </div>

              {/* ===== UPI VERIFICATION SECTION ===== */}
              <div className="border border-brand-500/30 rounded-2xl p-5 bg-brand-900/10 mt-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-brand-500/5 rounded-full blur-[20px] pointer-events-none" />
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-300 mb-3 flex items-center relative z-10">
                  <span className="bg-brand-500/20 p-1.5 rounded-lg mr-2"><ShieldCheck size={14} /></span> UPI ID (For Auto-Payouts)
                </label>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 relative z-10">
                  <input placeholder="e.g., test@upi" value={formData.upi_id}
                    onChange={(e) => { setFormData({...formData, upi_id: e.target.value}); setUpiVerified(false); setUpiResult(null); }}
                    className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none shadow-inner transition ${
                      upiVerified ? 'border-emerald-500/50 bg-emerald-900/20 text-emerald-100' : 
                      upiResult && !upiResult.verified ? 'border-red-500/50 bg-red-900/20 text-red-100' : 
                      'border-slate-700/50 bg-slate-900/80 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`} />
                  <button onClick={handleVerifyUPI} disabled={!formData.upi_id || upiVerifying || upiVerified}
                    className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition shadow-lg ${
                      upiVerified 
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default shadow-none' 
                        : 'bg-brand-600 text-white hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none'
                    }`}>
                    {upiVerifying ? 'Verifying...' : upiVerified ? '✓ Verified' : 'Verify UPI'}
                  </button>
                </div>

                {/* UPI Verification Result */}
                {upiResult && upiResult.verified && (
                  <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="mt-4 bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl relative z-10">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-emerald-300 font-bold text-sm">{upiResult.message}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs bg-black/20 p-2 rounded-lg">
                      <div><span className="text-slate-500 block text-[10px] uppercase">Bank</span> <span className="font-bold text-emerald-100">{upiResult.bank_name}</span></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase">Name</span> <span className="font-bold text-emerald-100">{upiResult.account_holder}</span></div>
                    </div>
                  </motion.div>
                )}
                {upiResult && !upiResult.verified && (
                  <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="mt-4 bg-red-900/20 border border-red-500/20 p-3 rounded-xl relative z-10">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={16} className="text-red-400" />
                      <span className="text-red-300 text-sm font-medium">{upiResult.message}</span>
                    </div>
                  </motion.div>
                )}

                <p className="text-[10px] text-slate-500 mt-3 relative z-10 flex items-center">
                  <Info size={12} className="mr-1 inline" /> Use <strong className="text-brand-300 mx-1">test@upi</strong> for demo purposes. Supported: @upi, @okaxis, @ybl etc.
                </p>
              </div>
            </div>

            <button onClick={handleRegister} disabled={loading || !formData.name || !(formData.phone || phone) || (formData.upi_id && !upiVerified)}
              className="w-full mt-8 bg-brand-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-brand-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:shadow-none disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 transition-all flex justify-center items-center relative z-10">
              {loading ? 'Registering...' : 'Register & View Plans'}
            </button>

            {formData.upi_id && !upiVerified && (
              <p className="text-orange-400 text-xs text-center mt-3 font-bold uppercase tracking-widest relative z-10">⚠️ Please verify your UPI ID</p>
            )}
          </motion.div>
        )}


{/* ===== STEP 3: PLAN SELECTION ===== */}
        {step === 3 && plans && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}}>
            <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-lg mb-6 border border-white/10 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
              <h2 className="text-2xl font-bold text-white mb-1 relative z-10">Welcome, {workerData?.name}!</h2>
              <p className="text-slate-400 text-sm mb-6 flex items-center relative z-10">
                Worker ID: <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-brand-300 border border-slate-700 ml-2">#{workerData?.token_id}</span>
              </p>
              
              <div className="grid grid-cols-3 gap-3 relative z-10">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Hourly Rate</div>
                  <div className="text-xl font-bold text-brand-400">₹{workerData?.hourly_rate}</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Auto Risk Level</div>
                  <div className="text-xl font-bold text-emerald-400">{plans?.risk_level}</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Trust Tier</div>
                  <div className="text-xl font-bold text-purple-400">{plans?.trust_tier}</div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-4 px-2">Choose Your Coverage</h3>
            <div className="space-y-4">
              {['basic', 'standard', 'pro'].map((planType) => {
                const plan = plans.plans[planType];
                const isRecommended = planType === 'standard';
                return (
                  <div key={planType} className={`glass-panel p-6 sm:p-8 rounded-[2rem] shadow-lg border-2 transition-all relative overflow-hidden ${
                    isRecommended ? 'border-brand-500 shadow-[0_0_30px_rgba(79,70,229,0.15)] transform hover:-translate-y-1' : 'border-white/5 hover:border-white/20'
                  }`}>
                    {isRecommended && (
                      <div className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-bl-2xl">
                        Most Popular
                      </div>
                    )}
                    {isRecommended && <div className="absolute -left-20 -top-20 w-40 h-40 bg-brand-500/10 rounded-full blur-[50px] pointer-events-none" />}
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <h4 className={`text-2xl font-bold capitalize mb-1 ${isRecommended ? 'text-brand-300' : 'text-white'}`}>{planType}</h4>
                        <div className="inline-flex items-center bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                          <ShieldCheck size={14} className="text-emerald-400 mr-1.5" />
                          <span className="text-xs text-slate-300 font-medium">Covers {plan.coverage_percent}% of lost earnings</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white tracking-tight">₹{plan.weekly_premium}</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Per Week</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Per Hour</div>
                        <div className="font-bold text-emerald-400 text-lg">₹{plan.hourly_payout}</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Daily Max</div>
                        <div className="font-bold text-white text-lg">₹{plan.daily_max_payout}</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Weekly Max</div>
                        <div className="font-bold text-white text-lg">₹{plan.weekly_max_payout}</div>
                      </div>
                    </div>
                    
                    <button onClick={() => handleCreatePolicy(planType)} disabled={loading}
                      className={`w-full flex justify-center items-center py-3.5 rounded-xl font-bold transition-all relative z-10 ${
                        isRecommended 
                          ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:bg-brand-800' 
                          : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 disabled:opacity-50'
                      }`}>
                      {loading ? 'Creating Policy...' : `Select ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`}
                      {!loading && <ChevronRight size={18} className="ml-1" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===== STEP 4: SUCCESS ===== */}
        {step === 4 && (
          <motion.div initial={{opacity:0, scale:0.9, y:20}} animate={{opacity:1, scale:1, y:0}} className="glass-panel p-8 sm:p-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.15)] border border-emerald-500/20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
            
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }} 
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-6 border-4 border-slate-950 z-10 relative"
            >
              <ShieldCheck size={48} className="text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight relative z-10">You're Protected!</h2>
            <p className="text-slate-400 mb-8 relative z-10">Your <strong className="text-emerald-400 capitalize">{selectedPlan}</strong> policy is now active and monitoring.</p>
            
            <div className="bg-slate-900/60 border border-white/5 p-6 rounded-2xl mb-8 text-left relative z-10">
              <h3 className="font-bold text-white mb-4 uppercase tracking-widest text-xs flex items-center"><Info size={14} className="mr-2 text-brand-400"/> Policy Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm">Worker ID</span>
                  <span className="font-mono font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">#{workerData?.token_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm">Active Plan</span>
                  <span className="font-bold text-white capitalize">{selectedPlan}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm">Weekly Premium</span>
                  <span className="font-bold text-white">₹{policyData?.policy?.weekly_premium}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm">Coverage</span>
                  <span className="font-bold text-emerald-400">{policyData?.policy?.coverage_percent}% of earnings</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 text-sm">First Payment</span>
                  <span className="font-bold text-emerald-400 flex items-center">✓ ₹{policyData?.payment?.amount} Processed</span>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-900/20 border border-brand-500/20 p-5 rounded-2xl mb-8 relative z-10">
              <p className="text-brand-200 text-xs leading-relaxed flex items-start text-left">
                <Zap size={16} className="text-brand-400 mr-2 shrink-0 mt-0.5" /> 
                <span className="opacity-90">When a disruption occurs in your zone, RahatPay APIs detect it live. Claims are <strong>auto-processed by AI</strong>. Zero paperwork. Instant payouts via UPI.</span>
              </p>
            </div>
            
            <button onClick={() => navigate(`/dashboard?worker_id=${workerId}`)}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center relative z-10 group">
              Go to My Dashboard <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
