import { useMemo, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { stylesApi } from "./lib/stylesApi";
import { appointmentsApi } from "./lib/appointmentsApi";
import { SALON } from "./lib/config";

import DatePicker from "./components/DatePicker.jsx";
import TimePicker from "./components/TimePicker.jsx";

/* ---------------- helpers ---------------- */

const categories = [
  { id: "all", label: "All" },
  { id: "braids", label: "Braids" },
  { id: "cut", label: "Cuts" },
  { id: "color", label: "Color" },
  { id: "styling", label: "Styling" },
];

function parseHHMM(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

// Returns closing time in minutes after midnight for the given date.
function closingMinutesForDate(dateStr) {
  if (!dateStr) return 19 * 60;
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = d.getDay();
  if (dow === 0) return 0;
  const closeHour = dow === 6 ? 18 : 19;
  return closeHour * 60;
}

const isLoggedIn = () => !!localStorage.getItem("access_token");
const firstNameFromLocal = () =>
  (localStorage.getItem("user_first_name") || "").trim();
const emailFromLocal = () =>
  (localStorage.getItem("user_email") || "").trim();

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-salon-dark">{title}</h2>
      {children}
    </section>
  );
}

// Salon working hours: Mon–Fri 09:00–19:00, Sat 09:00–18:00, Sun closed
function slotsForDate(dateStr) {
  if (!dateStr) return [];
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = d.getDay();
  if (dow === 0) return [];

  const openHour = 9;
  const closeHour = dow === 6 ? 18 : 19;
  const out = [];
  for (let h = openHour; h < closeHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

/* ---------------- component ---------------- */

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  // auth snapshot
  const [authed, setAuthed] = useState(isLoggedIn());
  useEffect(() => {
    const sync = () => setAuthed(isLoggedIn());
    window.addEventListener("storage", sync);
    window.addEventListener("auth-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-updated", sync);
    };
  }, []);

  // Styles
  const [styles, setStyles] = useState([]);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [stylesError, setStylesError] = useState("");

  // UI selections
  const [bookingCategory, setBookingCategory] = useState("all");
  const [selectedStyleId, setSelectedStyleId] = useState("");

  // Book as (guest/signed-in)
  const [bookingAs, setBookingAs] = useState(authed ? "signedin" : "guest");
  useEffect(() => {
    if (authed) setBookingAs("signedin");
  }, [authed]);

  // Contact
  const [customerName, setCustomerName] = useState(firstNameFromLocal());
  const [customerEmail, setCustomerEmail] = useState(emailFromLocal());
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (bookingAs === "signedin") {
      if (!customerName) setCustomerName(firstNameFromLocal());
      if (!customerEmail) setCustomerEmail(emailFromLocal());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingAs]);

  // Booking fields
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Post-create modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createdApptId, setCreatedApptId] = useState(null);
  const [createdOwnedByUser, setCreatedOwnedByUser] = useState(false);

  // Taken slots from API (per 30-min block, all styles, all users)
  const [takenSlots, setTakenSlots] = useState([]);

  // User's own upcoming appointments (for overlap blocking)
  const [userAppts, setUserAppts] = useState([]);

  // Fetch styles & honor ?styleId=
  const loadStyles = useCallback(async () => {
    setLoadingStyles(true);
    setStylesError("");
    try {
      const data = await stylesApi.list();
      setStyles(data);

      const params = new URLSearchParams(location.search);
      const fromUrl = params.get("styleId");
      if (fromUrl && data.some((s) => String(s.id) === String(fromUrl))) {
        setSelectedStyleId(fromUrl);
      }
    } catch (e) {
      console.error(e);
      setStylesError("Couldn’t load styles from the server.");
    } finally {
      setLoadingStyles(false);
    }
  }, [location.search]);

  useEffect(() => {
    loadStyles();
  }, [loadStyles]);

  // Load user's own upcoming appointments when logged in
  useEffect(() => {
    if (!authed) {
      setUserAppts([]);
      return;
    }
    (async () => {
      try {
        const data = await appointmentsApi.upcoming();
        setUserAppts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load user appointments", err);
        setUserAppts([]);
      }
    })();
  }, [authed]);

  // Derived lists
  const visibleStyles = useMemo(
    () =>
      styles.filter(
        (s) => bookingCategory === "all" || s.category === bookingCategory
      ),
    [styles, bookingCategory]
  );

  const selectedStyle = useMemo(
    () => styles.find((s) => String(s.id) === String(selectedStyleId)) || null,
    [styles, selectedStyleId]
  );

  const businessSlots = useMemo(() => slotsForDate(date), [date]);

  // Load taken slots for a given date (all styles)
  useEffect(() => {
    let ignore = false;
    (async () => {
      setTakenSlots([]);
      if (!date || !selectedStyleId) return;
      try {
        const taken = await appointmentsApi.getTakenSlots(date);
        if (!ignore) setTakenSlots(taken);
      } catch (err) {
        console.error("Failed to load taken slots:", err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [date, selectedStyleId]);

    const userBlockedSlots = useMemo(() => {
    if (!authed || !date || !userAppts.length) return [];

    const blocked = new Set();

    userAppts.forEach((appt) => {
      const dtStr = appt?.datetime;
      if (!dtStr || typeof dtStr !== "string") return;

      const apptDate = dtStr.slice(0, 10);
      if (apptDate !== date) return;

      const hh = parseInt(dtStr.slice(11, 13), 10);
      const mm = parseInt(dtStr.slice(14, 16), 10);
      if (Number.isNaN(hh) || Number.isNaN(mm)) return;

      const startMinutes = hh * 60 + mm;

      const duration = Number(appt.style_duration_mins ?? appt.style?.duration_mins ?? appt.style?.durationMins ?? 60);

      const slotCount = Math.ceil(duration / 30);

      for (let i = 0; i < slotCount; i++) {
        const totalMins = startMinutes + i * 30;
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        blocked.add(label);
      }
    });

    return Array.from(blocked);
  }, [authed, date, userAppts]);

  const guestBlockedSlots = useMemo(() => {
    if (authed) return [];
    if (!date) return [];

    const email = (customerEmail || "").trim().toLowerCase();
    const phone = (customerPhone || "").trim();

    if (!email && !phone) return [];

    const blocked = new Set();

    takenSlots.forEach((slot) => {
      const isSameEmail =
        email &&
        slot.contact_email &&
        slot.contact_email.toLowerCase() === email;

      const isSamePhone =
        phone && slot.contact_phone && slot.contact_phone === phone;

      if (!isSameEmail && !isSamePhone) return;

      if (slot.time) {
        blocked.add(slot.time);
      }
    });

    return Array.from(blocked);
  }, [authed, date, customerEmail, customerPhone, takenSlots]);

  // Validation
  const errors = useMemo(() => {
    const e = {};
    if (!selectedStyleId) e.style = "Please select a style";
    if (!customerName.trim()) e.customerName = "Please enter your name";

    if (bookingAs === "guest") {
      const email = (customerEmail || "").trim();
      const phone = (customerPhone || "").trim();
      if (!email && !phone) e.contact = "Provide an email or phone.";
    }

    if (!date) e.date = "Choose a date";
    if (!time) e.time = "Choose a time";

    if (date && time && new Date(`${date}T${time}`) < new Date()) {
      e.date = "Pick a future date/time";
    }

    if (authed && date && time && userBlockedSlots.includes(time)) {
      e.time = "You already have a booking that overlaps this time.";
    }

    return e;
  }, [
    selectedStyleId,
    customerName,
    bookingAs,
    customerEmail,
    customerPhone,
    date,
    time,
    authed,
    userBlockedSlots,
  ]);

  const isValid = Object.keys(errors).length === 0;

  // Submit
  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!isValid || !selectedStyle) return;

    setSubmitting(true);
    try {
      const appt = await appointmentsApi.create({
        styleId: selectedStyle.id,
        date,
        time,
        notes: notes || undefined,
        contact_name: customerName || undefined,
        contact_email: customerEmail || undefined,
        contact_phone: customerPhone || undefined,
      });

      setCreatedOwnedByUser(isLoggedIn());
      setCreatedApptId(appt.id);

      toast.dismiss("booking-success");
      toast.success(`Booked ${selectedStyle.name} on ${date} at ${time}!`, {
        id: "booking-success",
      });

      setConfirmOpen(true);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 409) toast.error("You already have that slot.");
      else toast.error(err?.response?.data?.detail || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // Stripe flow
  async function handlePayOnline() {
    if (!createdApptId) return;
    if (!isLoggedIn() || !createdOwnedByUser) {
      toast("Please log in before paying online.");
      navigate("/login", { replace: true, state: { from: "/booking" } });
      return;
    }
    try {
      const { url } = await appointmentsApi.startCheckout(createdApptId);
      if (url) window.location.href = url;
      else toast.error("Payment session not available yet.");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.status === 403
          ? "Not allowed to start checkout for this booking."
          : "Could not start checkout."
      );
    }
  }

  // Pay in salon
  function handlePayInSalon() {
    setConfirmOpen(false);
    toast.success("Your booking was saved! See you soon!");

    const first = (customerName || firstNameFromLocal() || "there").split(" ")[0];
    const dtIso = `${date}T${time || "00:00"}`;
    const params = new URLSearchParams({
      first,
      style: selectedStyle?.name || "Service",
      dt: dtIso,
    });
    navigate(`/booking-received?${params.toString()}`, { replace: true });
  }

  // Greeting
  const greeting = (() => {
    const fallback = firstNameFromLocal();
    const first = (customerName || fallback || "").trim();
    if (!first) return "Book an appointment";
    const hr = new Date().getHours();
    const greet =
      hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
    return `${greet}, ${first}`;
  })();

  // Combined disable logic for timepicker
  const disabledTimes = useMemo(() => {
    if (!date || !selectedStyle) return [];

    // Styles API uses camelCase keys in the frontend objects
    const duration =
      Number(selectedStyle.durationMins) ||
      Number(selectedStyle.duration_mins) ||
      60;

    const disabled = new Set();

    const today = new Date();
    const todayYMD = today.getFullYear() +
      "-" + String(today.getMonth()+1).padStart(2,"0") +
      "-" + String(today.getDate()).padStart(2,"0");
    const nowMins = today.getHours() * 60 + today.getMinutes();

    const dayClosingMins = closingMinutesForDate(date);

    const overlapBlocked = authed ? userBlockedSlots : guestBlockedSlots;

    businessSlots.forEach((slot) => {
      const start = parseHHMM(slot);
      const end = start + duration;

      if (date === todayYMD && start <= nowMins) {
        disabled.add(slot);
        return;
      }

      if (end > dayClosingMins) {
        disabled.add(slot);
        return;
      }

      if (overlapBlocked.includes(slot)) {
        disabled.add(slot);
        return;
      }

      for (const blocked of overlapBlocked) {
        const blockedStart = parseHHMM(blocked);
        const blockedEnd = blockedStart + 30;

        const newStart = start;
        const newEnd = start + duration;

        if (newStart < blockedEnd && newEnd > blockedStart) {
          disabled.add(slot);
          return;
        }
      }
    });

    return Array.from(disabled);
  }, [date, selectedStyle, authed, userBlockedSlots, guestBlockedSlots, businessSlots]);

  return (
    <main className="section">
      <h1 className="section-title">{greeting}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-10">
          {/* 1) Choose a style */}
          <Section title="1) Choose a style">
            <div className="flex justify-between items-center gap-3 mb-3 flex-wrap">
              <p className="text-sm text-salon-dark/70">
                Pick from our most popular services.
              </p>
              <select
                value={bookingCategory}
                onChange={(e) => setBookingCategory(e.target.value)}
                className="rounded-xl border border-rose-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {loadingStyles ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-36 w-full rounded-xl bg-rose-100/60" />
                    <div className="mt-3 h-4 w-2/3 bg-rose-100/60 rounded" />
                    <div className="mt-2 h-4 w-1/2 bg-rose-100/60 rounded" />
                  </div>
                ))}
              </div>
            ) : stylesError ? (
              <p className="text-sm text-rose-600">{stylesError}</p>
            ) : visibleStyles.length === 0 ? (
              <p className="text-sm text-salon-dark/70">No styles here yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleStyles.map((s) => {
                  const selected = String(selectedStyleId) === String(s.id);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSelectedStyleId(String(s.id))}
                      className={`card text-left group ${
                        selected ? "ring-2 ring-salon-primary" : "ring-1 ring-rose-100"
                      }`}
                    >
                      <div className="relative rounded-xl overflow-hidden">
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
                        />
                        {selected && (
                          <span className="absolute top-2 right-2 rounded-full bg-salon-primary/90 px-2 py-0.5 text-xs text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <h3 className="text-base font-semibold text-salon-dark">
                          {s.name}
                        </h3>
                        <p className="text-sm text-salon-dark/70">
                          ${s.priceMin}–${s.priceMax} • {s.durationMins} mins
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.style && (
              <p className="text-sm text-rose-600 mt-1">{errors.style}</p>
            )}
          </Section>

          {/* 2) Your details & time */}
          <Section title="2) Your details & time">
            <form className="grid sm:grid-cols-2 gap-5" onSubmit={handleSubmit}>
              {/* Book as */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-salon-dark">
                  Book as
                </label>
                <div className="mt-1 inline-flex rounded-full bg-rose-50 p-1 shadow-sm">
                  <button
                    type="button"
                    disabled={authed}
                    onClick={!authed ? () => setBookingAs("guest") : undefined}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition
                      ${
                        authed
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : bookingAs === "guest"
                          ? "bg-salon-primary text-white shadow"
                          : "text-salon-dark hover:bg-white/60"
                      }
                    `}
                  >
                    Guest
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isLoggedIn()) setBookingAs("signedin");
                      else navigate("/login");
                    }}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                      bookingAs === "signedin"
                        ? "bg-salon-primary text-white shadow"
                        : "text-salon-dark hover:bg-white/60"
                    }`}
                  >
                    Signed-in
                  </button>
                </div>
                <p className="text-xs text-salon-dark/60 mt-1">
                  Guests can book without creating an account.
                </p>
              </div>

              {/* Contact */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-salon-dark">
                  Your name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Jane Doe"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition ${
                    errors.customerName
                      ? "border-rose-300 ring-2 ring-rose-100"
                      : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-salon-dark">
                  Email{" "}
                  {bookingAs === "guest"
                    ? "(email or phone required)"
                    : "(optional)"}
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-xl border border-rose-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-salon-dark">
                  Phone{" "}
                  {bookingAs === "guest"
                    ? "(email or phone required)"
                    : "(optional)"}
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(704) 555-0123"
                  className="mt-1 w-full rounded-xl border border-rose-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {errors.contact && (
                <p className="sm:col-span-2 text-xs text-rose-600">
                  {errors.contact}
                </p>
              )}

              {/* Date (Calendar) */}
              <div>
                <label className="block text-sm font-medium text-salon-dark">
                  Date
                </label>
                <DatePicker
                  value={date}
                  onChange={(val) => {
                    setDate(val);
                    setTime("");
                  }}
                  disableSunday={true}
                  disablePast={true}
                  className="mt-1"
                />
                {errors.date && (
                  <p className="text-xs text-rose-600 mt-1">{errors.date}</p>
                )}
              </div>

              {/* Time (all business hours; greying logic in TimePicker) */}
              <TimePicker
                value={time}
                onChange={setTime}
                options={businessSlots}
                disabled={false}
                disabledTimes={disabledTimes}
              />


              {/* Time error */}
              {errors.time && (
                <p className="sm:col-span-2 text-xs text-rose-600">
                  {errors.time}
                </p>
              )}

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-salon-dark">
                  Notes (optional)
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any preferences or info for your stylist?"
                  className="mt-1 w-full rounded-xl border border-rose-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {/* Submit */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!isValid || submitting || confirmOpen}
                  className={`w-full rounded-xl px-4 py-3 font-medium text-white transition ${
                    isValid && !submitting && !confirmOpen
                      ? "bg-salon-primary hover:shadow-md"
                      : "bg-rose-300/60 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Booking…" : "Confirm booking"}
                </button>
              </div>
            </form>
          </Section>
        </div>

        {/* RIGHT */}
        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          {/* Booking summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-salon-dark">
              Booking summary
            </h3>

            <div className="mt-4 space-y-3 text-sm text-salon-dark/80">
              <div className="flex justify-between">
                <span>Style</span>
                <span className="font-medium">
                  {selectedStyle ? selectedStyle.name : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Name</span>
                <span className="font-medium">
                  {customerName.trim() || "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Contact</span>
                <span className="font-medium">
                  {customerEmail || customerPhone || "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-medium">{date || "—"}</span>
              </div>

              <div className="flex justify-between">
                <span>Time</span>
                <span className="font-medium">
                  {time
                    ? (() => {
                        const [hour, minute] = time.split(":").map(Number);
                        const ampm = hour >= 12 ? "PM" : "AM";
                        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
                        return `${hour12}:${minute
                          .toString()
                          .padStart(2, "0")} ${ampm}`;
                      })()
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium">
                  {selectedStyle ? `${selectedStyle.durationMins} mins` : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Price</span>
                <span className="font-medium">
                  {selectedStyle
                    ? `$${selectedStyle.priceMin}–${selectedStyle.priceMax}`
                    : "—"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-salon-dark/60">
              Final price may vary based on hair length/complexity. You’ll get a
              confirmation message after approval.
            </p>
          </div>

          {/* Need help box */}
          <div className="card">
            <h4 className="font-semibold text-salon-dark">Need help?</h4>

            <p className="text-sm text-salon-dark/70 mt-2">
              <a className="underline" href={SALON.phoneHref}>
                {SALON.phone}
              </a>
            </p>

            <p className="text-sm text-salon-dark/70 mt-1">
              <a className="underline" href={SALON.emailHref}>
                {SALON.email}
              </a>
            </p>

            <p className="text-sm text-salon-dark/70 mt-1">
              <a
                className="underline"
                target="_blank"
                rel="noreferrer"
                href={SALON.mapsUrl}
              >
                Get directions
              </a>
            </p>
          </div>
        </aside>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-salon-dark">
              Booking created
            </h3>
            <p className="mt-2 text-salon-dark/70">
              Hi{" "}
              <span className="font-medium">
                {(customerName || "there").trim()}
              </span>
              , your booking was created. How would you like to pay?
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {authed && createdOwnedByUser ? (
                <button
                  onClick={handlePayOnline}
                  className="rounded-xl bg-salon-primary px-4 py-2.5 font-medium text-white hover:shadow-md transition"
                >
                  Pay online (Stripe)
                </button>
              ) : (
                <button
                  onClick={() =>
                    navigate("/login", {
                      replace: true,
                      state: { from: "/booking" },
                    })
                  }
                  className="rounded-xl border border-rose-200 px-4 py-2.5 font-medium text-salon-dark hover:bg-rose-50 transition"
                >
                  Log in to pay online
                </button>
              )}

              <button
                onClick={handlePayInSalon}
                className="rounded-xl border border-rose-200 px-4 py-2.5 font-medium text-salon-dark hover:bg-rose-50 transition"
              >
                Pay in salon
              </button>
            </div>

            <button
              onClick={() => setConfirmOpen(false)}
              className="mt-4 text-sm text-salon-dark/60 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
