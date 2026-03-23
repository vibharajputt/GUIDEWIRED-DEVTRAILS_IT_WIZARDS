import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendAadhaarOTP = (aadhaar_number) =>
  api.post('/api/aadhaar/send-otp', { aadhaar_number });

export const verifyAadhaarOTP = (aadhaar_number, otp, session_id) =>
  api.post('/api/aadhaar/verify-otp', { aadhaar_number, otp, session_id });

export const registerWorker = (data) =>
  api.post('/api/workers/register', data);

export const getWorkerById = (id) =>
  api.get(`/api/workers/${id}`);

export const getAllWorkers = () =>
  api.get('/api/workers');

export const calculatePremium = (worker_id, plan_type) =>
  api.post('/api/premium/calculate', { worker_id, plan_type });

export const compareAllPlans = (worker_id) =>
  api.get(`/api/premium/compare/${worker_id}`);

export const createPolicy = (worker_id, plan_type, auto_renew = true) =>
  api.post('/api/policies/create', { worker_id, plan_type, auto_renew });

export const getWorkerPolicies = (worker_id) =>
  api.get(`/api/policies/worker/${worker_id}`);

export const simulateDisruption = (data) =>
  api.post('/api/triggers/simulate', data);

export const getTriggerTypes = () =>
  api.get('/api/triggers/types');

export const getAllTriggers = () =>
  api.get('/api/triggers');

export const getWorkerClaims = (worker_id) =>
  api.get(`/api/claims/worker/${worker_id}`);

export const getAllClaims = () =>
  api.get('/api/claims');

export const approveClaim = (claim_id) =>
  api.put(`/api/claims/${claim_id}/approve`);

export const rejectClaim = (claim_id) =>
  api.put(`/api/claims/${claim_id}/reject`);

export const getWorkerDashboard = (worker_id) =>
  api.get(`/api/dashboard/worker/${worker_id}`);

export const getAdminDashboard = () =>
  api.get('/api/dashboard/admin');

export default api;