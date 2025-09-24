
const BASE_URL = "http://127.0.0.1:8000/api";

export const api = {
  async listStyles({ q = "", category = "all", sort = "popular" } = {}) {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (category !== "all") params.append("category", category);
    if (sort) params.append("sort", sort);

    const res = await fetch(`${BASE_URL}/styles/?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch styles");
    const data = await res.json();
    return data;
  },

  async listAppointments() {
    const res = await fetch(`${BASE_URL}/appointments/`);
    if (!res.ok) throw new Error("Failed to fetch appointments");
    const data = await res.json();
    return data;
  },

  async createAppointment(appointment) {
    const res = await fetch(`${BASE_URL}/appointments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointment),
    });
    if (!res.ok) throw new Error("Failed to create appointment");
    return await res.json();
  },
};