const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(method, endpoint, data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || 'Xəta baş verdi');
  }
  return json;
}

export const api = {
  users: {
    all: () => request('GET', '/users/all'),
    get: (uid) => request('GET', `/users/${uid}`),
    register: (data) => request('POST', '/users/register', data),
    update: (uid, data) => request('PUT', `/users/${uid}`, data),
  },
  friends: {
    list: (uid) => request('GET', `/friends/edges/${uid}`),
    pending: (uid) => request('GET', `/friends/pending/${uid}`),
    request: (fromUid, toUid) => request('POST', '/friends/request', { fromUid, toUid }),
    accept: (edgeId) => request('POST', `/friends/accept/${edgeId}`),
    check: (uid1, uid2) => request('GET', `/friends/check/${uid1}/${uid2}`),
  },
  messages: {
    get: (chatId) => request('GET', `/messages/${chatId}`),
    send: (data) => request('POST', '/messages', data),
  },
  letters: {
    inbox: (uid) => request('GET', `/letters/inbox/${uid}`),
    sent: (uid) => request('GET', `/letters/sent/${uid}`),
    send: (authorUid, body) => request('POST', '/letters', { authorUid, body }),
  },
};
