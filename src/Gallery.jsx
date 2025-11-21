// src/Gallery.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import StyleCard from "./components/StyleCard";
import { stylesApi } from "./lib/stylesApi";

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

// ---------- numeric helpers ----------
function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

function getMinPrice(style) {
  if (style.priceMin !== undefined && style.priceMin !== null) {
    return toNumber(style.priceMin);
  }
  if (style.price_min !== undefined && style.price_min !== null) {
    return toNumber(style.price_min);
  }
  return 0;
}

function getDuration(style) {
  if (style.durationMins !== undefined && style.durationMins !== null) {
    return toNumber(style.durationMins);
  }
  if (style.duration_mins !== undefined && style.duration_mins !== null) {
    return toNumber(style.duration_mins);
  }
  return 0;
}

function getRating(style) {
  if (style.ratingAvg !== undefined && style.ratingAvg !== null) {
    return toNumber(style.ratingAvg);
  }
  if (style.rating_avg !== undefined && style.rating_avg !== null) {
    return toNumber(style.rating_avg);
  }
  return 0;
}

// ---------- reusable dropdown ----------
function Dropdown({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value) || options[0];

  return (
    <div
      className="relative w-full"
      tabIndex={0}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-salon-dark outline-none focus:ring-2 focus:ring-rose-200"
      >
        <span className="truncate text-left">{selected.label}</span>
        <svg
          className="ml-2 h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-rose-200 bg-white py-1 text-sm shadow-lg">
          {options.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left ${
                  opt.id === value
                    ? "bg-rose-100 text-salon-dark font-medium"
                    : "text-salon-dark/80 hover:bg-rose-50"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- main component ----------
export default function Gallery() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // load all once, filter client-side
  const fetchStyles = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const items = await stylesApi.list();
      setStyles(items || []);
    } catch (err) {
      console.error("Failed to load styles:", err);
      setStyles([]);
      setLoadError("Couldn’t load styles from the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  // search + filter + sort
  const filteredStyles = useMemo(() => {
    let result = Array.isArray(styles) ? [...styles] : [];

    const term = q.trim().toLowerCase();

    if (term) {
      result = result.filter((s) => {
        const name = (s.name || "").toLowerCase();
        const desc = (s.description || "").toLowerCase();
        const cat = (s.category || "").toLowerCase();
        return (
          name.includes(term) ||
          desc.includes(term) ||
          cat.includes(term)
        );
      });
    }

    if (category !== "all") {
      result = result.filter(
        (s) => (s.category || "").toLowerCase() === category
      );
    }

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case "price_desc":
        result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case "duration":
        result.sort((a, b) => getDuration(a) - getDuration(b));
        break;
      case "popular":
      default:
        result.sort((a, b) => getRating(b) - getRating(a));
        break;
    }

    return result;
  }, [styles, q, category, sort]);

  const empty =
    !loading && !loadError && filteredStyles.length === 0;

  function handleSelect(style) {
    navigate(`/booking?styleId=${encodeURIComponent(style.id)}`);
  }

  return (
    <main className="section">
      <header className="mb-6">
        <h1 className="section-title">Style Gallery</h1>
        <p className="text-center text-salon-dark/70">
          Browse services by category, compare prices &amp; durations, and pick
          your favorite.
        </p>
      </header>

      {/* Controls */}
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search styles…"
          className="rounded-xl border border-rose-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
        />

        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Dropdown
            value={category}
            options={categories}
            onChange={setCategory}
            ariaLabel="Filter by category"
          />
          <Dropdown
            value={sort}
            options={sorts}
            onChange={setSort}
            ariaLabel="Sort styles"
          />
        </div>

        <div className="flex items-center justify-end">
          <Link
            to="/booking"
            className="rounded-full bg-salon-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
          >
            Go to Booking
          </Link>
        </div>
      </div>

      {/* Grid / states */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] w-full rounded-xl bg-rose-100/60" />
              <div className="mt-3 h-4 w-2/3 rounded bg-rose-100/60" />
              <div className="mt-2 h-4 w-1/2 rounded bg-rose-100/60" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center text-rose-600">{loadError}</div>
      ) : empty ? (
        <div className="text-center text-salon-dark/70">
          No styles match your search. Try a different term or category.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStyles.map((s) => (
            <StyleCard key={s.id} style={s} onClick={handleSelect} />
          ))}
        </div>
      )}
    </main>
  );
}
