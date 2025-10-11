import { http } from "./http";

export const appointmentsApi = {
  async create({ style_id, datetime, notes }) {
    const { data } = await http.post("/appointments/", {
      style_id,
      datetime,
      notes,
    });
    return data;
  },

  async mine() {
    const { data } = await http.get("/appointments/mine/");
    return data;
  },
  async upcoming() {
    const { data } = await http.get("/appointments/upcoming/");
    return data;
  }
};
