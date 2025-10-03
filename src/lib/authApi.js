import { http } from "./http";

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
    const { data } = await http.post("/auth/login/", { email, password });
    if (data?.access) localStorage.setItem("access_token", data.access);
    if (data?.refresh) localStorage.setItem("refresh_token", data.refresh);
    return data;
  },

  async logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};