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
            Book braids, cuts, color and styling with our friendly team. Easy online
            booking, fair pricing, and great vibes.
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

          {/* quick value bullets */}
          <ul className="mt-6 flex flex-wrap gap-6 text-sm text-salon-dark/60">
            <li>✓ Master stylists</li>
            <li>✓ Premium products</li>
            <li>✓ Personalized service</li>
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-rose-100/40 blur-2xl" />
          <div className="relative rounded-3xl overflow-hidden shadow-xl ring-1 ring-rose-100">
            <img
              className="h-[360px] w-full object-cover"
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop"
              alt="Stylist working in the salon"
              loading="lazy"
            />
          </div>
        </div>
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
          <p className="mt-1 text-sm text-salon-dark/60">Parking available on site.</p>
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