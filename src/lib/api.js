import { mockStyles } from "./mockStyles";

export const api = {
  async listStyles({ q = "", category = "all", sort = "popular" } = {}) {
    // simulate network
    await new Promise((r) => setTimeout(r, 150));

    let data = [...mockStyles];

    if (category !== "all") {
      data = data.filter((s) => s.category === category);
    }
    if (q.trim()) {
      const term = q.toLowerCase();
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.category.toLowerCase().includes(term)
      );
    }
    if (sort === "price_asc") data.sort((a, b) => a.priceMin - b.priceMin);
    if (sort === "price_desc") data.sort((a, b) => b.priceMax - a.priceMax);
    if (sort === "duration") data.sort((a, b) => a.durationMins - b.durationMins);
    if (sort === "popular") data.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));

    return data;
  },
};
