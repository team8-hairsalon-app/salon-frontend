// src/lib/http.js
import axios from "axios";

// Prefer env, else fall back to same-host dev backend on :8000
function resolveBaseURL() {
  const env = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (env) return env; // e.g. "http://127.0.0.1:8000/api" or "http://localhost:8000/api"

  // If no env var, build it from the page's protocol/host
  const proto = window.location.protocol;               // "http:" or "https:"
  const host  = window.location.hostname;               // "localhost", "127.0.0.1", etc.
  const apiHost = (host === "localhost" || host === "127.0.0.1") ? host : "localhost";
  return `${proto}//${apiHost}:8000/api`;
}

const baseURL = resolveBaseURL();
console.log("HTTP baseURL =", baseURL);

export const http = axios.create({
  baseURL,
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});