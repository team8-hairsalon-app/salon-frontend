import { http } from "./http";

function mapStyle(s) {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    priceMin: s.price_min,
    priceMax: s.price_max,
    durationMins: s.duration_mins,
    imageUrl: s.image_url,
    ratingAvg: s.rating_avg,
  };
}

export const stylesApi = {
  async list({ q = "", category = "all", sort = "popular" } = {}) {
    const params = {};
    if (q) params.q = q;
    if (category && category !== "all") params.category = category;
    if (sort) params.sort = sort;

    const res = await http.get("/styles/", { params });
    console.log("GET /styles/ status", res.status, "data:", res.data);

    const raw = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    return raw.map(mapStyle);
  },
};