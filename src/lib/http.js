import axios from "axios";

// Prefer env, else fall back to same-host dev backend on :8000
function resolveBaseURL() {
  const env = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (env) return env; // e.g. "http://127.0.0.1:8000/api"

  const proto = window.location.protocol;
  const host = window.location.hostname;
  const apiHost = (host === "localhost" || host === "127.0.0.1") ? host : "localhost";
  return `${proto}//${apiHost}:8000/api`;
}

const baseURL = resolveBaseURL();
console.log("HTTP baseURL =", baseURL);

// --- helpers ---
export function parseJwt(token) {
  try {
    const [, payloadB64] = token.split(".");
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payloadJson);
  } catch {
    return {};
  }
}
export function isJwtExpired(token) {
  try {
    const { exp } = parseJwt(token);
    const now = Math.floor(Date.now() / 1000);
    return typeof exp === "number" ? exp <= now : true;
  } catch {
    return true;
  }
}

/**
 * Ensure we have a fresh (non-expired) access token.
 * If expired and a refresh token exists, refresh it.
 * Returns true if we have a valid access after this call, else false.
 */
export async function ensureFreshAccessToken() {
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  if (access && !isJwtExpired(access)) return true;

  if (!refresh) {
    // nothing to refresh with — clear stale tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new Event("auth-updated"));
    return false;
  }

  // try to refresh
  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh });
    const newAccess = data?.access || "";
    if (newAccess) {
      localStorage.setItem("access_token", newAccess);
      window.dispatchEvent(new Event("auth-updated"));
      return true;
    }
  } catch (e) {
    console.warn("Token refresh failed", e?.response?.status);
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.dispatchEvent(new Event("auth-updated"));
  return false;
}

export const http = axios.create({
  baseURL,
  withCredentials: false,
});

// Add Authorization header for non-public endpoints
http.interceptors.request.use((config) => {
  const url = config.url || "";

  // Endpoints that should NEVER send auth
  const isPublic =
    url.startsWith("/styles") ||
    url.startsWith("/auth/login/") ||
    url.startsWith("/auth/register/");

  if (!isPublic) {
    const token = localStorage.getItem("access_token");
    if (token && !isJwtExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // remove any stale header
      delete config.headers?.Authorization;
    }
  } else {
    delete config.headers?.Authorization;
  }

  return config;
});
