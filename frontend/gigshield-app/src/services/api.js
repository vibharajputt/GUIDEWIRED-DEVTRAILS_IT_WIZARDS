import axios from 'axios';

const API_BASE = 'https://guidewired-devtrails-it-wizards.onrender.com';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Aadhaar
export const sendAadhaarOTP = (aadhaar_number, phone) =>
  api.post('/api/aadhaar/send-otp', { aadhaar_number, phone });

export const verifyAadhaarOTP = (aadhaar_number, otp, session_id) =>
  api.post('/api/aadhaar/verify-otp', { aadhaar_number, otp, session_id });

// Workers
export const registerWorker = (data) =>
  api.post('/api/workers/register', data);

// UPI Verification
export const verifyUPI = (upi_id) =>
  api.post('/api/upi/verify', { upi_id });

export const getWorkerById = (id) =>
  api.get(`/api/workers/${id}`);

export const getAllWorkers = () =>
  api.get('/api/workers');

export const getWorkerStreak = (workerId) =>
  api.get(`/api/workers/${workerId}/streak`);

// Premium
export const calculatePremium = (worker_id, plan_type) =>
  api.post('/api/premium/calculate', { worker_id, plan_type });

export const compareAllPlans = (worker_id) =>
  api.get(`/api/premium/compare/${worker_id}`);

// Policies
export const createPolicy = (worker_id, plan_type, auto_renew = true) =>
  api.post('/api/policies/create', { worker_id, plan_type, auto_renew });

export const getWorkerPolicies = (worker_id) =>
  api.get(`/api/policies/worker/${worker_id}`);

export const getPolicyDetails = (policyId) =>
  api.get(`/api/policies/${policyId}`);

export const pausePolicy = (policyId) =>
  api.put(`/api/policies/${policyId}/pause`);

export const cancelPolicy = (policyId) =>
  api.put(`/api/policies/${policyId}/cancel`);

export const renewPolicy = (policyId) =>
  api.post('/api/policies/renew', { policy_id: policyId });

// Triggers
export const simulateDisruption = (data) =>
  api.post('/api/triggers/simulate', data);

export const approveZone = (trigger_id) =>
  api.put(`/api/triggers/${trigger_id}/approve_zone`);

export const getTriggerTypes = () =>
  api.get('/api/triggers/types');

export const getAllTriggers = () =>
  api.get('/api/triggers');

// Claims
export const getWorkerClaims = (worker_id) =>
  api.get(`/api/claims/worker/${worker_id}`);

export const getAllClaims = () =>
  api.get('/api/claims');

export const getClaimDetails = (claimId) =>
  api.get(`/api/claims/${claimId}`);

export const approveClaim = (claim_id) =>
  api.put(`/api/claims/${claim_id}/approve`);

export const rejectClaim = (claim_id) =>
  api.put(`/api/claims/${claim_id}/reject`);

export const appealClaim = (claimId, data) =>
  api.post(`/api/claims/${claimId}/appeal`, data);

// Dashboard
export const getWorkerDashboard = (worker_id) =>
  api.get(`/api/dashboard/worker/${worker_id}`);

export const getAdminDashboard = () =>
  api.get('/api/dashboard/admin');

// Live Weather
export const getCurrentWeather = (pincode, lat, lon) =>
  api.get(`/api/weather/current/${pincode}`, { params: { lat, lon } });

export const getCurrentAQI = (pincode, lat, lon) =>
  api.get(`/api/weather/aqi/${pincode}`, { params: { lat, lon } });

export const scanAllZones = () =>
  api.get('/api/weather/scan-all-zones');

// Risk Map
export const getRiskMapData = () =>
  api.get('/api/zones/risk-map');

// Forecast
export const getForecast = (pincode, lat, lon) =>
  api.get(`/api/forecast/${pincode}`, { params: { lat, lon } });

// 7-Layer Fraud Detection
export const submitSensorData = (data) =>
  api.post('/api/fraud/collect-sensor-data', data);

export const getVerificationStatus = (worker_id) =>
  api.get(`/api/fraud/verification-status/${worker_id}`);

// Notifications
export const getWorkerNotifications = (worker_id) =>
  api.get(`/api/notifications/worker/${worker_id}`);

export const getAdminNotifications = () =>
  api.get('/api/notifications/admin');

export const markNotificationRead = (notif_id) =>
  api.post(`/api/notifications/${notif_id}/read`);

export default api;
