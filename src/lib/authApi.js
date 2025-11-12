// authApi.js
import { http } from "./http";

function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export const authApi = {
  async register({ first_name, last_name, email, password, dob }) {
    const { data } = await http.post("/auth/register/", {
      first_name,
      last_name,
      email,
      password,
      dob,
    });
    return data;
  },

  async login({ email, password }) {
    // Your backend’s JWT view expects "username" (you allow email-as-username)
    const { data } = await http.post("/auth/login/", {
      username: email,
      password,
    });

    // tokens
    if (data?.access) {
      localStorage.setItem("access_token", data.access);

      // Prefer JWT claims for friendly info (you add `name` + `email`)
      const claims = decodeJwt(data.access);
      if (claims?.email) localStorage.setItem("user_email", claims.email);

      // If claim has "name", store first name for greetings
      if (claims?.name) {
        const first = String(claims.name).split(" ")[0] || "";
        if (first) localStorage.setItem("user_first_name", first);
      }
    }
    if (data?.refresh) localStorage.setItem("refresh_token", data.refresh);

    // Fallback: if API also returns first_name, store it
    if (data?.first_name && !localStorage.getItem("user_first_name")) {
      localStorage.setItem("user_first_name", data.first_name);
    }
    if (email && !localStorage.getItem("user_email")) {
      localStorage.setItem("user_email", email);
    }

    return data;
  },

  async refresh() {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("No refresh token");
    const { data } = await http.post("/auth/refresh/", { refresh });
    if (data?.access) localStorage.setItem("access_token", data.access);
    return data;
  },

  async forgotPassword(email) {
    return http.post("/auth/password/reset/", { email });
  },

  async logout() {
    const hadToken = Boolean(localStorage.getItem("access_token"));

    // Always clear tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Only clear user info if they were actually logged in.
    // (Keep for guests so Booking can still greet & prefill.)
    if (hadToken) {
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_first_name");
    }
  },
};
