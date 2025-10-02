import { http } from "./http";

export const profileApi = {
  async getMe() {
    const { data } = await http.get("/me/profile/");
    return data; // { id, first_name, last_name, email }
  },
  async updateMe(patch) {
    const { data } = await http.patch("/me/profile/", patch);
    return data;
  },
};