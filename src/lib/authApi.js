import { http } from "./http";

// Tiny helper to parse a JWT (no external libs)
function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
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
    // Django SimpleJWT expects "username"
    const { data } = await http.post("/auth/login/", {
      username: email,
      password,
    });

    if (data?.access) localStorage.setItem("access_token", data.access);
    if (data?.refresh) localStorage.setItem("refresh_token", data.refresh);

    // Try to pull the user's name/email from the access token
    const payload = data?.access ? parseJwt(data.access) : null;
    const fullName = (payload && payload.name) || "";
    const firstName =
      fullName.trim().split(" ")[0] || (email ? email.split("@")[0] : "");
    const emailFromToken = (payload && payload.email) || email || "";

    localStorage.setItem("user_first_name", firstName);
    localStorage.setItem("user_email", emailFromToken);

    // Let the app (Navbar) know auth info changed
    window.dispatchEvent(new Event("auth-updated"));

    return data;
  },

  async logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // optionally keep name/email, or clear them if you prefer:
    // localStorage.removeItem("user_first_name");
    // localStorage.removeItem("user_email");
    window.dispatchEvent(new Event("auth-updated"));
  },
};
