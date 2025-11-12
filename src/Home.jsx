import { Link } from "react-router-dom";
import { SALON } from "./lib/config";

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-salon-beige to-white dark:from-slate-900 dark:to-slate-950">
      <section className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        {/* Copy */}
        <div>
          <span className="inline-block rounded-full bg-rose-50 text-salon-primary px-3 py-1 text-xs font-semibold dark:bg-rose-200/20">
            Luxury hair care • Since 2025
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-salon-dark leading-tight dark:text-white">
            Look &amp; feel <span className="text-salon-primary">stunning</span>
          </h1>
          <p className="mt-4 text-salon-dark/70 dark:text-slate-300">
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
              className="rounded-full border border-rose-200 px-5 py-3 text-salon-dark font-medium hover:bg-rose-50 transition dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800/50"
            >
              View gallery
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-6 text-sm text-salon-dark/60 dark:text-slate-400">
            <li>✓ Master stylists</li>
            <li>✓ Premium products</li>
            <li>✓ Personalized service</li>
          </ul>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-rose-100/40 blur-2xl dark:bg-slate-800/40" />
          <div className="relative rounded-3xl overflow-hidden shadow-xl ring-1 ring-rose-100 dark:ring-slate-700">
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop"
              alt="Hair styling"
              className="h-[360px] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-rose-100 bg-gradient-to-b from-rose-50 to-white
                         dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-6
                        text-salon-dark/80 dark:text-slate-200 text-sm">
          <div>
            <h3 className="font-semibold text-lg text-salon-dark dark:text-white">
              {SALON.name}
            </h3>
            <p className="mt-2">{SALON.address}</p>
            <p className="mt-1">
              <a
                href={SALON.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 decoration-rose-300 hover:decoration-rose-400
                           dark:decoration-rose-400 dark:hover:decoration-rose-300"
              >
                View on Google Maps
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-salon-dark dark:text-white">Contact</h3>
            <p className="mt-2">
              <a
                href={SALON.phoneHref}
                className="underline underline-offset-2 decoration-rose-300 hover:decoration-rose-400
                           dark:decoration-rose-400 dark:hover:decoration-rose-300"
              >
                {SALON.phone}
              </a>
            </p>
            <p>
              <a
                href={SALON.emailHref}
                className="underline underline-offset-2 decoration-rose-300 hover:decoration-rose-400
                           dark:decoration-rose-400 dark:hover:decoration-rose-300"
              >
                {SALON.email}
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-salon-dark dark:text-white">Hours</h3>
            <ul className="mt-2 space-y-1">
              <li>Mon–Fri: 9am – 7pm</li>
              <li>Sat: 9am – 6pm</li>
              <li>Sun: Closed</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs text-salon-dark/60 dark:text-slate-400 py-4
                        border-t border-rose-100 dark:border-slate-800">
          © {new Date().getFullYear()} {SALON.name}. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
