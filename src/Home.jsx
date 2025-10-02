import { Link } from "react-router-dom";
import { SALON } from "./lib/config";

export default function Home() {
  return (
    <main className="section">
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-salon-dark">
            Look your best with {SALON.name}
          </h1>
          <p className="mt-3 text-salon-dark/70">
            Book braids, cuts, color and styling with our friendly team. Easy online booking, fair pricing, and great vibes.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/booking"
              className="rounded-full bg-salon-primary px-5 py-2.5 text-white font-medium shadow-sm hover:shadow-md transition"
              aria-label="Book an appointment"
            >
              Book an appointment
            </Link>
            <Link
              to="/gallery"
              className="rounded-full border border-rose-200 px-5 py-2.5 text-salon-dark hover:bg-rose-50 transition"
              aria-label="Browse styles in gallery"
            >
              Browse styles
            </Link>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden border border-rose-100">
          <img
            className="w-full h-64 object-cover"
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop"
            alt="Stylist working in the salon"
            loading="lazy"
          />
        </div>
      </section>

      {/* Value props */}
      <section className="mt-12 grid sm:grid-cols-3 gap-4">
        {["Master stylists", "Premium products", "Personalized service"].map((t) => (
          <div key={t} className="card flex items-center gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">
              ✓
            </span>
            <p className="text-salon-dark">{t}</p>
          </div>
        ))}
      </section>

      {/* Visit & Contact */}
      <section className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-salon-dark">Visit us</h2>
          <p className="mt-2 text-salon-dark/70">
            <a
              className="underline"
              href={SALON.mapsUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in Google Maps"
            >
              {SALON.address}
            </a>
          </p>
          <p className="mt-1 text-sm text-salon-dark/60">
            Parking available on site.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-salon-dark">Need help?</h2>
          <p className="mt-2 text-salon-dark/70">
            Call us at{" "}
            <a className="underline" href={SALON.phoneHref}>
              {SALON.phone}
            </a>{" "}
            or email{" "}
            <a className="underline" href={SALON.emailHref}>
              {SALON.email}
            </a>
            .
          </p>
          <div className="mt-3">
            <Link
              to="/booking"
              className="inline-flex rounded-full bg-salon-primary px-4 py-2 text-white font-medium shadow-sm hover:shadow-md transition"
              aria-label="Book now"
            >
              Book now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}