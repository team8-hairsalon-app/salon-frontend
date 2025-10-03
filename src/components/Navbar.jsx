import { NavLink, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SALON } from "../lib/config";

const baseItem =
  "px-3 py-2 rounded-full text-sm font-medium transition hover:bg-rose-50 hover:text-salon-primary";
const activeItem =
  "bg-salon-primary text-white hover:bg-salon-primary hover:text-white";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [greetingName, setGreetingName] = useState("");

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("access_token");
      const first = localStorage.getItem("user_first_name");
      const email = localStorage.getItem("user_email");
      setIsAuthed(!!token);
      setGreetingName(first || (email ? email.split("@")[0] : ""));
    };

    // initial
    syncAuth();

    // react to changes from other tabs / code
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-updated", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-updated", syncAuth);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new Event("auth-updated"));
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-rose-100">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-salon-primary text-white font-bold">
            HS
          </span>
          <span className="text-lg font-semibold text-salon-dark">
            {SALON.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
            }
          >
            Gallery
          </NavLink>
          <NavLink
            to="/booking"
            className={({ isActive }) =>
              `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
            }
          >
            Booking
          </NavLink>

          {!isAuthed ? (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
              }
            >
              Login
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
                }
              >
                Profile
              </NavLink>
              <span className="px-3 py-2 text-sm text-salon-dark/70">
                {greetingName ? `Welcome, ${greetingName}` : "Welcome"}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-full text-sm font-medium bg-rose-50 text-salon-dark hover:bg-rose-100 transition"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        {/* CTA */}
        <Link
          to="/booking"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-salon-primary px-4 py-2 text-white shadow-sm hover:shadow-md transition"
        >
          Book Now
        </Link>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex items-center rounded-full px-3 py-2 border border-rose-200 text-salon-dark"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          Menu
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-rose-100">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            <NavLink
              to="/"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/gallery"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
              }
            >
              Gallery
            </NavLink>
            <NavLink
              to="/booking"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
              }
            >
              Booking
            </NavLink>

            {!isAuthed ? (
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
                }
              >
                Login
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${baseItem} ${isActive ? activeItem : "text-salon-dark"}`
                  }
                >
                  Profile
                </NavLink>
                <span className="px-3 py-2 text-sm text-salon-dark/70">
                  {greetingName ? `Welcome, ${greetingName}` : "Welcome"}
                </span>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-2 rounded-full text-sm font-medium bg-rose-50 text-salon-dark hover:bg-rose-100 transition text-left"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}