import { http } from "./http";

export const stylesApi = {
  async list() {
    try {
      const res = await http.get("/styles/");
      console.log("GET /styles/ →", res.status, res.data);

      // The backend already returns correctly shaped fields
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error("Failed to fetch styles:", err);
      throw err; // ensures the UI shows the error message
    }
  },
};
