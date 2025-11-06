import { http } from "./http";

export const appointmentsApi = {
  async create(payload) {
    // payload must include:
    // customer_name, customer_email, style_id, style_name, appointment_time (ISO), notes?
    const { data } = await http.post("/appointments/", payload);
    return data;
  },

  async mine() {
    const { data } = await http.get("/appointments/mine/");
    return data;
  },

  async upcoming() {
    const { data } = await http.get("/appointments/upcoming/");
    return data;
  },

  async startCheckout(appointmentId) {
    const { data } = await http.post(`/appointments/${appointmentId}/start_checkout/`);
    return data; // { url: string|null }
  },
};
