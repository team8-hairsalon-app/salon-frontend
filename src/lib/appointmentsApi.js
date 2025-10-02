// src/lib/appointmentsApi.js
import { http } from "./http";

/**
 * Convert UI date (YYYY-MM-DD) and time ("10:00 AM" or "14:00") to ISO8601.
 */
function toIso(dateStr, timeLabel) {
  let hours = 9;
  let mins = 0;

  // Try 12-hour format first (e.g., "10:00 AM")
  const ampm = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(timeLabel || "");
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const suffix = ampm[3].toUpperCase();
    if (suffix === "PM" && h < 12) h += 12;
    if (suffix === "AM" && h === 12) h = 0;
    hours = h;
    mins = m;
  } else {
    // Fall back to 24-hour "HH:MM"
    const h24 = /(\d{1,2}):(\d{2})/.exec(timeLabel || "");
    if (h24) {
      hours = parseInt(h24[1], 10);
      mins = parseInt(h24[2], 10);
    }
  }

  // Build ISO in local timezone then serialize to UTC ISO string
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
}

export const appointmentsApi = {
  /**
   * Create an appointment.
   * Backend expects:
   *  - style (number)
   *  - datetime (ISO string)
   *  - notes (optional)
   */
  async create({ styleId, date, time, notes }) {
    const datetime = toIso(date, time);
    const { data } = await http.post("/appointments/", {
      style: styleId,
      datetime,
      notes: notes || "",
    });
    return data;
  },

  /** Start Stripe checkout for an appointment. Returns { url }. */
  async startCheckout(appointmentId) {
    const { data } = await http.post(
      `/appointments/${appointmentId}/start_checkout/`
    );
    return data; // { url: "https://checkout.stripe.com/..." }
  },

  /** Get upcoming appointments for the current user. */
  async myUpcoming() {
    const { data } = await http.get("/appointments/upcoming/");
    return data;
  },
};

/* ---- Backward-compatibility named helpers (optional) ---- */
export async function createAppointment(args) {
  return appointmentsApi.create(args);
}
export async function startCheckout(appointmentId) {
  return appointmentsApi.startCheckout(appointmentId);
}