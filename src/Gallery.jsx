import { useEffect, useMemo, useState } from "react";
import StyleCard from "./components/StyleCard";
import { api } from "./lib/api";

const categories = [
  { id: "all", label: "All" },
  { id: "braids", label: "Braids" },
  { id: "cut", label: "Cuts" },
  { id: "color", label: "Color" },
  { id: "styling", label: "Styling" },
];

const sorts = [
  { id: "popular", label: "Most popular" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "duration", label: "Shortest duration" },
];

export default function Gallery() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  const empty = useMemo(() => !loading && styles.length === 0, [loading, styles]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .listStyles({ q, category, sort })
      .then((data) => {
        if (alive) setStyles(data);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q, category, sort]);

  function handleSelect(style) {
    // Navigate to booking prefilled later if you want:
    // navigate(`/booking?styleId=${style.id}`)
    // For now, just a nice toast:
    alert(`Selected "${style.name}" — go to Booking to confirm.`);
  }

  return (
    <main className="section">
      <header className="mb-6">
        <h1 className="section-title">Style Gallery</h1>
        <p className="text-center text-salon-dark/70">
          Browse services by category, compare prices & durations, and pick your favorite.
        </p>
      </header>

      {/* Controls */}
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search styles…"
          className="rounded-xl border border-rose-200 px-4 py-2 outline-none focus:ring-2 focus:ring-rose-200"
        />

        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-rose-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-xl border border-rose-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
          >
            {sorts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end">
          <a
            href="/booking"
            className="rounded-full bg-salon-primary px-5 py-2 text-white font-medium shadow-sm hover:shadow-md transition"
          >
            Go to Booking
          </a>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-40 w-full rounded-xl bg-rose-100/60" />
              <div className="mt-3 h-4 w-2/3 bg-rose-100/60 rounded" />
              <div className="mt-2 h-4 w-1/2 bg-rose-100/60 rounded" />
            </div>
          ))}
        </div>
      ) : empty ? (
        <div className="text-center text-salon-dark/70">
          No styles match your search. Try a different term or category.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {styles.map((s) => (
            <StyleCard key={s.id} style={s} onClick={handleSelect} />
          ))}
        </div>
      )}
    </main>
  );
}
