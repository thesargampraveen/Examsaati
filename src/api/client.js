import { API_BASE_URL } from '../config';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // auth
  sendOtp: (phone) => request('/api/auth/send-otp', { method: 'POST', body: { phone } }),
  verifyOtp: (phone, otp) => request('/api/auth/verify-otp', { method: 'POST', body: { phone, otp } }),
  completeProfile: (profile) =>
    request('/api/auth/complete-profile', { method: 'POST', body: profile }),
  me: () => request('/api/auth/me'),

  // centers
  searchCenters: (q) => request(`/api/centers/search?q=${encodeURIComponent(q)}`),
  addCenter: (name, city, code) =>
    request('/api/centers', { method: 'POST', body: { name, city, code } }),
  getCenter: (id) => request(`/api/centers/${id}`),
  getCenterStudents: (id) => request(`/api/centers/${id}/students`),

  // partners
  getTravelPartners: (from, gender) =>
    request(
      `/api/partners/travel?from=${encodeURIComponent(from || '')}&gender=${encodeURIComponent(gender || '')}`
    ),
  getStayPartners: (gender) =>
    request(`/api/partners/stay?gender=${encodeURIComponent(gender || '')}`),

  // connections
  connect: (userId) => request('/api/connections', { method: 'POST', body: { userId } }),
  getRequests: () => request('/api/connections/requests'),
  getFriends: () => request('/api/connections/friends'),
  acceptRequest: (id) => request(`/api/connections/${id}/accept`, { method: 'POST' }),
  declineRequest: (id) => request(`/api/connections/${id}/decline`, { method: 'POST' }),

  // chat
  getThreads: () => request('/api/chat/threads'),
  getMessages: (friendId) => request(`/api/chat/${friendId}`),
  sendMessage: (friendId, text) =>
    request(`/api/chat/${friendId}`, { method: 'POST', body: { text } }),

  // guide
  getGuideTips: (centerId) => request(`/api/guide/${centerId}`),
  addGuideTip: (centerId, category, text) =>
    request(`/api/guide/${centerId}`, { method: 'POST', body: { category, text } }),
  deleteGuideTip: (id) => request(`/api/guide/tip/${id}`, { method: 'DELETE' }),

  // safety
  getGuardian: () => request('/api/safety/guardian'),
  saveGuardian: (name, phone) =>
    request('/api/safety/guardian', { method: 'PUT', body: { name, phone } }),
  reached: () => request('/api/safety/reached', { method: 'POST' }),
  getBlocked: () => request('/api/safety/blocked'),
  block: (userId) => request('/api/safety/block', { method: 'POST', body: { userId } }),
  unblock: (userId) => request('/api/safety/unblock', { method: 'POST', body: { userId } }),
  report: (userId, reason, details) =>
    request('/api/safety/report', { method: 'POST', body: { userId, reason, details } }),
};
