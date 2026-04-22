const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function call(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Xəta');
  return data;
}

export const ApiService = {
  users: {
    getAll: () => call('/users/all'),
    getProfile: (uid) => call(`/users/${uid}`),
    register: (data) => call('/users/register', { method: 'POST', body: data }),
    updateProfile: (uid, data) => call(`/users/${uid}`, { method: 'PUT', body: data }),
  },
  friends: {
    list: (uid) => call(`/friends/edges/${uid}`),
    pending: (uid) => call(`/friends/pending/${uid}`),
    sendRequest: (fromUid, toUid) => call('/friends/request', { method: 'POST', body: { fromUid, toUid } }),
    accept: (edgeId) => call(`/friends/accept/${edgeId}`, { method: 'POST' }),
    checkStatus: (uid1, uid2) => call(`/friends/check/${uid1}/${uid2}`),
  },
  messages: {
    getChat: (chatId) => call(`/messages/${chatId}`),
    send: (data) => call('/messages', { method: 'POST', body: data }),
  },
  letters: {
    inbox: (uid) => call(`/letters/inbox/${uid}`),
    sent: (uid) => call(`/letters/sent/${uid}`),
    send: (authorUid, body) => call('/letters', { method: 'POST', body: { authorUid, body } }),
  },
};
