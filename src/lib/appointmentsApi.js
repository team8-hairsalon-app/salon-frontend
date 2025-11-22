// src/lib/appointmentsApi.js
import { http, ensureFreshAccessToken } from "./http";

/**
 * Appointments API
 * - `create` accepts either {styleId, date, time} OR {style_id, datetime}
 * - `getTakenSlots(date, styleId?)` fetches HH:MM times already booked
 * - `startCheckout` refreshes the token, then calls the protected backend route
 *   `/checkout/create-session/{id}/` (backend verifies ownership)
 */
export const appointmentsApi = {
  /**
   * Create an appointment
   * Accepts:
   *   - { styleId, date: 'YYYY-MM-DD', time: 'HH:MM', ... }
   *   - or { style_id, datetime: 'YYYY-MM-DDTHH:MM', ... }
   * The serializer on the backend supports `datetime` (preferred).
   */
  async create({
    styleId,
    style_id,
    date,
    time,
    datetime,
    notes,
    contact_name,
    contact_email,
    contact_phone,
  }) {
    const style = styleId ?? style_id;
    const dt = datetime ?? (date && time ? `${date}T${time}` : date ?? null);

    const payload = {
      style,
      datetime: dt,
      notes,
      contact_name,
      contact_email,
      contact_phone,
    };

    const { data } = await http.post("/appointments/", payload);
    return data; // => { id, ... }
  },

  /** Your appointments (requires auth) -> GET /api/me/appointments/ */
  async mine() {
    const { data } = await http.get("/me/appointments/");
    return data;
  },

  /** Upcoming appointments for current user (requires auth) -> GET /api/appointments/upcoming/ */
  async upcoming() {
    const { data } = await http.get("/appointments/upcoming/");
    return data;
  },

  /** Read one appointment (auth required to see your own; staff can see all) */
  async get(id) {
    const { data } = await http.get(`/appointments/${id}/`);
    return data;
  },

  /** Cancel an appointment you own (or staff) -> POST /api/appointments/{id}/cancel/ */
  async cancel(id) {
    const { data } = await http.post(`/appointments/${id}/cancel/`);
    return data;
  },

  /**
   * Start Stripe Checkout for an appointment you own.
   * Backend route: POST /api/checkout/create-session/{appointmentId}/
   */
  async startCheckout(appointmentId) {
    // Ensure we have a fresh access token for the protected route
    const ok = await ensureFreshAccessToken();
    if (!ok) {
      const err = new Error("not-authenticated");
      err.status = 401;
      throw err;
    }

    // Match the backend function-view URL
    const { data } = await http.post(
      `/checkout/create-session/${appointmentId}/`,
      {} // explicit empty JSON for DRF
    );
    return data; // => { url }
  },

   async getTakenSlots(date) {
    const params = { date };

    const { data } = await http.get("/appointments/taken/", { params });

    return Array.isArray(data?.taken) ? data.taken : [];
  },
};
