import axios from "axios";

/**
 * Build the API base URL:
 * - Prefer VITE_API_BASE_URL (e.g. http://127.0.0.1:8000/api)
 * - Else default to current protocol + localhost:8000/api in dev
 */
function resolveBaseURL() {
  const env = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
  if (env) return env; // e.g. "http://127.0.0.1:8000/api"

  const proto = window.location.protocol; // "http:" | "https:"
  const host = window.location.hostname;  // "localhost", "127.0.0.1", etc.
  const apiHost = host === "localhost" || host === "127.0.0.1" ? host : "localhost";
  return `${proto}//${apiHost}:8000/api`;
}

const BASE_URL = resolveBaseURL();
console.log("HTTP baseURL =", BASE_URL);

export const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

/** Attach Authorization header on every request if we have a token */
http.interceptors.request.use((config) => {
  const access = localStorage.getItem("access_token");
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

/**
 * If a request fails with 401 and we have a refresh token,
 * silently call /auth/refresh/ once, update access token,
 * and retry the original request.
 */
let isRefreshing = false;
let queue = [];

function drainQueue(err, newToken = null) {
  queue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(newToken);
  });
  queue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    const hasRefresh = !!localStorage.getItem("refresh_token");
    const shouldAttemptRefresh =
      status === 401 && hasRefresh && !original?._retry;

    if (!shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      // Wait for the ongoing refresh to finish
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            if (token) {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${token}`;
            }
            resolve(http(original));
          },
          reject,
        });
      });
    }

    try {
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refresh_token");
      const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, {
        refresh: refreshToken,
      });

      const newAccess = data?.access;
      if (!newAccess) throw new Error("No access token in refresh response");

      localStorage.setItem("access_token", newAccess);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;

      drainQueue(null, newAccess);
      return http(original);
    } catch (err) {
      // Refresh failed -> clear tokens so UI can treat user as signed out
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      drainQueue(err, null);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);