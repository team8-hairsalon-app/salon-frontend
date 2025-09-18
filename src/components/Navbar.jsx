import { NavLink, Link } from "react-router-dom";

const navItem =
  "px-3 py-2 rounded-full text-sm font-medium transition hover:bg-rose-50 hover:text-salon-primary";
const active =
  "bg-salon-primary text-white hover:bg-salon-primary hover:text-white";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-rose-100">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-salon-primary text-white font-bold">
            HS
          </span>
          <span className="text-lg font-semibold text-salon-dark">
            Hair<span className="text-salon-primary">Salon</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={({isActive}) => `${navItem} ${isActive ? active : "text-salon-dark"}`}>Home</NavLink>
          <NavLink to="/gallery" className={({isActive}) => `${navItem} ${isActive ? active : "text-salon-dark"}`}>Gallery</NavLink>
          <NavLink to="/booking" className={({isActive}) => `${navItem} ${isActive ? active : "text-salon-dark"}`}>Booking</NavLink>
          <NavLink to="/login" className={({isActive}) => `${navItem} ${isActive ? active : "text-salon-dark"}`}>Login</NavLink>
          <NavLink to="/profile" className={({isActive}) => `${navItem} ${isActive ? active : "text-salon-dark"}`}>Profile</NavLink>
        </nav>

        {/* CTA */}
        <Link
          to="/booking"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-salon-primary px-4 py-2 text-white shadow-sm hover:shadow-md transition"
        >
          Book Now
        </Link>

        {/* Mobile menu placeholder (simple) */}
        <div className="md:hidden">
          <Link
            to="/booking"
            className="inline-flex items-center rounded-full bg-salon-primary px-4 py-2 text-white"
          >
            Book
          </Link>
        </div>
      </div>
    </header>
  );
}
