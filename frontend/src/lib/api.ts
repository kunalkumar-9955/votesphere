import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  verifyOtp: (data: any) => api.post("/auth/verify-otp", data),
  resendOtp: (email: string) => api.post(`/auth/resend-otp?email=${email}`),
  refresh: (data: any) => api.post("/auth/refresh", data),
  me: () => api.get("/auth/me"),
  googleLogin: (id_token: string) => api.post("/auth/google", { id_token }),
  forgotPassword: (email: string) => api.post(`/auth/forgot-password?email=${email}`),
  resetPassword: (email: string, token: string, new_password: string) =>
    api.post(`/auth/reset-password?email=${email}&token=${token}&new_password=${new_password}`),
  contact: (data: any) => api.post("/auth/contact", data),
};

// ── Organizations ─────────────────────────────────────────────────────────────
export const orgApi = {
  list: (params?: any) => api.get("/organizations", { params }),
  get: (id: number) => api.get(`/organizations/${id}`),
  create: (data: any) => api.post("/organizations", data),
  update: (id: number, data: any) => api.put(`/organizations/${id}`, data),
  join: (invite_code: string) => api.post("/organizations/join", { invite_code }),
  updateStatus: (id: number, data: any) => api.patch(`/organizations/${id}/status`, data),
};

// ── Elections ─────────────────────────────────────────────────────────────────
export const electionApi = {
  list: (params?: any) => api.get("/elections", { params }),
  get: (id: number) => api.get(`/elections/${id}`),
  create: (data: any) => api.post("/elections", data),
  update: (id: number, data: any) => api.put(`/elections/${id}`, data),
  delete: (id: number) => api.delete(`/elections/${id}`),
  publishResult: (id: number) => api.post(`/elections/${id}/publish-result`),
  turnout: (id: number) => api.get(`/elections/${id}/turnout`),
  report: (id: number) => api.get(`/elections/${id}/report`, { responseType: "blob" }),
  addCandidate: (data: any) => api.post("/elections/candidates", data),
  getCandidates: (electionId: number) => api.get(`/elections/${electionId}/candidates`),
  deleteCandidate: (candidateId: number) => api.delete(`/elections/candidates/${candidateId}`),
  vote: (data: any) => api.post("/elections/vote", data),
  getResult: (id: number) => api.get(`/elections/results/${id}`),
  myVotes: () => api.get("/elections/my-votes/history"),
};

// ── Biometric / WebAuthn ──────────────────────────────────────────────────────
export const biometricApi = {
  getRegisterChallenge: () => api.get("/biometric/register/challenge"),
  verifyRegistration: (data: any) => api.post("/biometric/register/verify", data),
  getAuthChallenge: () => api.get("/biometric/authenticate/challenge"),
  verifyAuthentication: (data: any) => api.post("/biometric/authenticate/verify", data),
  listCredentials: () => api.get("/biometric/credentials"),
  deleteCredential: (id: number) => api.delete(`/biometric/credentials/${id}`),
  fraudLogs: (params?: any) => api.get("/biometric/fraud-logs", { params }),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  stats: () => api.get("/analytics/dashboard/stats"),
  voteTrends: (days?: number) => api.get("/analytics/vote-trends", { params: { days } }),
  electionTypes: () => api.get("/analytics/election-types"),
  fraudReports: () => api.get("/analytics/fraud/reports"),
  auditLogs: (params?: any) => api.get("/analytics/audit-logs", { params }),
  users: (params?: any) => api.get("/analytics/users", { params }),
  suspendUser: (id: number) => api.patch(`/analytics/users/${id}/suspend`),
};
