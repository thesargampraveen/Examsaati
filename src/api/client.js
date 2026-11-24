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
  register: (name, phone, password) =>
    request('/api/auth/register', { method: 'POST', body: { name, phone, password } }),
  login: (phone, password) => request('/api/auth/login', { method: 'POST', body: { phone, password } }),
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

  // groups
  getGroups: () => request('/api/groups'),
  getGroup: (id) => request(`/api/groups/${id}`),
  createGroup: (name, memberIds) =>
    request('/api/groups', { method: 'POST', body: { name, memberIds } }),
  getGroupMessages: (id) => request(`/api/groups/${id}/messages`),
  sendGroupMessage: (id, text) =>
    request(`/api/groups/${id}/messages`, { method: 'POST', body: { text } }),
  addGroupMembers: (id, memberIds) =>
    request(`/api/groups/${id}/members`, { method: 'POST', body: { memberIds } }),
  leaveGroup: (id) => request(`/api/groups/${id}/leave`, { method: 'POST' }),

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

  // exam essentials checklist
  getChecklist: () => request('/api/checklist'),
  saveChecklist: (items) =>
    request('/api/checklist', { method: 'PUT', body: { items } }),
};
