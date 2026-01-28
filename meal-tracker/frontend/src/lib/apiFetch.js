let accessToken = null;
let refreshingPromise = null;

const tokenListeneres = new Set();

export function setAccessToken(token) {
  accessToken = token;
  tokenListeneres.forEach((cb) => cb(token));
}

export function subscribeAccessToken(listener) {
  tokenListeneres.add(listener);
  return () => tokenListeneres.delete(listener);
}

async function refreshAccessToken() {
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.accessToken || null;
  })();

  const token = await refreshingPromise;
  refreshingPromise = null;
  return token;
}

export async function restoreSession() {
  const token = await refreshAccessToken();
  setAccessToken(token);
  return !!token;
}

export async function apiFetch(url, options = {}) {
  if (url.startsWith("/api/auth/login") || url.startsWith("/api/auth/refresh")) {
    return fetch(url, { ...options, credentials: "include" });
  }

  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status !== 401) return res;
  if (options.__retried) return res;

  const newToken = await refreshAccessToken();
  if (!newToken) {
    setAccessToken(null);
    return res;
  }
  
  setAccessToken(newToken);

  const retryHeaders = new Headers(options.headers || {});
  retryHeaders.set("Authorization", `Bearer ${newToken}`);

  return apiFetch(url, {
    ...options,
    headers: retryHeaders,
    __retried: true,
  });
}
