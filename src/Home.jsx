import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-salon-beige to-white">
      <section className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        {/* Copy */}
        <div>
          <span className="inline-block rounded-full bg-rose-50 text-salon-primary px-3 py-1 text-xs font-semibold">
            Luxury hair care • Since 2025
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-salon-dark leading-tight">
            Look & feel <span className="text-salon-primary">stunning</span>
          </h1>
          <p className="mt-4 text-salon-dark/70">
            From precision cuts to rich color and styling, our team crafts
            effortless beauty for every guest.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/booking"
              className="rounded-full bg-salon-primary px-5 py-3 text-white font-medium shadow-sm hover:shadow-md transition"
            >
              Book an appointment
            </Link>
            <Link
              to="/gallery"
              className="rounded-full border border-rose-200 px-5 py-3 text-salon-dark font-medium hover:bg-rose-50 transition"
            >
              View gallery
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-6 text-sm text-salon-dark/60">
            <li>✓ Master stylists</li>
            <li>✓ Premium products</li>
            <li>✓ Personalized service</li>
          </ul>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-rose-100/40 blur-2xl" />
          <div className="relative rounded-3xl overflow-hidden shadow-xl ring-1 ring-rose-100">
            {/* Replace with your salon image later */}
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop"
              alt="Hair styling"
              className="h-[360px] w-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
