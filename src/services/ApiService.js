const API_BASE_FROM_ENV = import.meta.env.VITE_API_URL;
const API_BASE_CACHE_KEY = "UC_API_BASE";
let apiBaseMemo = null;

async function probeApiBase(origin) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 1200);
  try {
    const res = await fetch(`${origin}/api/health`, { signal: controller.signal });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json || json.status !== "ok") return null;
    return `${origin}/api`;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function getApiBase() {
  if (API_BASE_FROM_ENV) return API_BASE_FROM_ENV;
  if (apiBaseMemo) return apiBaseMemo;

  const cached = localStorage.getItem(API_BASE_CACHE_KEY);
  if (cached) {
    apiBaseMemo = cached;
    return cached;
  }

  const host = window.location.hostname;
  const candidatePorts = [];
  for (let p = 3001; p <= 3025; p += 1) candidatePorts.push(p);
  for (const port of candidatePorts) {
    const origin = `http://${host}:${port}`;
    const base = await probeApiBase(origin);
    if (base) {
      apiBaseMemo = base;
      localStorage.setItem(API_BASE_CACHE_KEY, base);
      return base;
    }
  }

  throw new Error("API server tapılmadı. Backend-i işə salın (server qovluğunda: npm run dev).");
}

async function call(endpoint, options = {}) {
  try {
    const API_BASE = await getApiBase();
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
  } catch (err) {
    console.error(`API Error (${endpoint}):`, err);
    throw err;
  }
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
    unread: (uid) => call(`/messages/unread/${uid}`),
    markRead: (chatId, uid) =>
      call(`/messages/read/${chatId}`, { method: 'POST', body: { uid } }),
  },
  letters: {
    inbox: (uid) => call(`/letters/inbox/${uid}`),
    sent: (uid) => call(`/letters/sent/${uid}`),
    send: (authorUid, body) => call('/letters', { method: 'POST', body: { authorUid, body } }),
  },
};
