import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,
});

// Example placeholder calls (wire up later to your DRF endpoints)
export const authApi = {
  login: (payload) => api.post("/auth/login/", payload),
  register: (payload) => api.post("/auth/register/", payload),
};
