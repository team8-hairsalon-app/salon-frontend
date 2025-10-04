
// salon-frontend/src/Booking.jsx

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { api } from "./lib/api";

// src/Booking.jsx
import { useMemo, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


import { stylesApi } from "./lib/stylesApi";
import { appointmentsApi } from "./lib/appointmentsApi";
import { SALON } from "./lib/config";

const categories = [
  { id: "all", label: "All" },
  { id: "braids", label: "Braids" },
  { id: "cut", label: "Cuts" },
  { id: "color", label: "Color" },
  { id: "styling", label: "Styling" },
];

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-salon-dark">{title}</h2>
      {children}
    </section>
  );
}

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  // Styles from backend
  const [styles, setStyles] = useState([]);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [stylesError, setStylesError] = useState("");

  // UI state
  const [bookingCategory, setBookingCategory] = useState("all");
  const [selectedStyleId, setSelectedStyleId] = useState("");
  const [customerName, setCustomerName] = useState(
    () => localStorage.getItem("user_first_name") || ""
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);


  // new: customer details
  const [customerEmail, setCustomerEmail] = useState("");


  // Post-create modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createdApptId, setCreatedApptId] = useState(null);

  // Load styles and preselect from ?styleId=
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

  // Filtered list by category
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

  // Form validation
  const errors = useMemo(() => {
    const e = {};
    if (!selectedStyleId) e.style = "Please select a style";
    if (!customerName.trim()) e.customerName = "Please enter your name";
    if (!date) e.date = "Choose a date";
    if (!time) e.time = "Choose a time";

    if (!customerName) e.customerName = "Your name is required";
    if (!customerEmail || !/^\S+@\S+\.\S+$/.test(customerEmail))
      e.customerEmail = "Enter a valid email";

    // basic future date check


    if (date && new Date(`${date}T${time || "00:00"}`) < new Date()) {
      e.date = "Pick a future date/time";
    }
    return e;

  }, [selectedStyleId, date, time, customerName, customerEmail]);



  const isValid = Object.keys(errors).length === 0;

  // Submit booking
  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || !selectedStyle) return;

    setSubmitting(true);
    try {

      // build ISO datetime from selected date + time (local -> toISOString() converts to UTC)
      const appointmentISO = new Date(`${date}T${time}`).toISOString();

      const payload = {
        customer_name: customerName,
        customer_email: customerEmail,
        style_id: selectedStyle.id,
        style_name: selectedStyle.name,
        appointment_time: appointmentISO,
        notes,
      };
      
      
      const appt = await appointmentsApi.create({
        styleId: selectedStyle.id,
        date,
        time,
        notes: notes || undefined,
      });

      toast.success(`Booked ${selectedStyle.name} on ${date} at ${time}!`);
      setCreatedApptId(appt.id);
      setConfirmOpen(true); // open two-button modal
    
      // reset form
      setSelectedStyleId("");
      setDate("");
      setTime("");
      setNotes("");
      setCustomerName("");
      setCustomerEmail("");

    } catch (err) {
      console.error(err);
      toast.error("Booking failed. Please try again.");

    } finally {
      setSubmitting(false);
    }
  }

  // Modal actions
  async function handlePayOnline() {
    if (!createdApptId) return;
    try {
      const { url } = await appointmentsApi.startCheckout(createdApptId);
      if (url) {
        window.location.href = url; // Stripe Checkout
      } else {
        toast.error("Payment session not available yet.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not start checkout.");
    }
  }

  function handlePayInSalon() {
    setConfirmOpen(false);
    toast.success(
      "Your booking was successfully saved! You'll be notified for availability."
    );
    setTimeout(() => {
      navigate("/", { replace: true }); // go home after success
    }, 1600);
  }

  return (
    <main className="section">
      <h1 className="section-title">Book an appointment</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: form */}
        <div className="lg:col-span-2 space-y-10">
          {/* pick a service */}
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
                {[...Array(6)].map((_, i) => (
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
                          ${s.priceMin}–{s.priceMax} • {s.durationMins} mins
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

          {/* name + date/time */}
          <Section title="2) Your details & time">
            <form className="grid sm:grid-cols-2 gap-5" onSubmit={handleSubmit}>

              {/* Customer name/email */}
              <div className="sm:col-span-2 grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-salon-dark">Full name</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2 outline-none"
                    placeholder="Your name"
                    required
                  />
                  {errors.customerName && <p className="text-xs text-rose-600 mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-salon-dark">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2 outline-none"
                    placeholder="you@example.com"
                    required
                  />
                  {errors.customerEmail && <p className="text-xs text-rose-600 mt-1">{errors.customerEmail}</p>}
                </div>
              </div>


              {/* Date */}

              <div>
                <label className="block text-sm font-medium text-salon-dark">Date</label>
                <DatePicker
                  selected={date ? new Date(date) : null}
                  onChange={(date) => setDate(date.toISOString().split("T")[0])}
                  minDate={new Date()}
                  placeholderText="Select a date"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition ${
                    errors.date ? "border-rose-300 ring-2 ring-rose-100" : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                  }`}
                />
                {errors.date && <p className="text-xs text-rose-600 mt-1">{errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-salon-dark">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition ${
                    errors.time
                      ? "border-rose-300 ring-2 ring-rose-100"
                      : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                  }`}
                />
                {errors.time && (
                  <p className="text-xs text-rose-600 mt-1">{errors.time}</p>
                )}
              </div>

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
                  disabled={!isValid || submitting}
                  className={`w-full rounded-xl px-4 py-3 font-medium text-white transition ${
                    isValid && !submitting
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

        {/* RIGHT: summary */}
        <aside className="space-y-5">
          <div className="card sticky top-24">
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
                <span>Date</span>
                <span className="font-medium">{date || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span className="font-medium">{time || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. duration</span>
                <span className="font-medium">
                  {selectedStyle ? `${selectedStyle.durationMins} mins` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Est. price</span>
                <span className="font-medium">
                  {selectedStyle
                    ? `$${selectedStyle.priceMin}–${selectedStyle.priceMax}`
                    : "—"}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-salon-dark/60">
              Final price may vary based on hair length/complexity. You’ll get a
              confirmation email after approval.
            </p>
          </div>

          <div className="card">
            <h4 className="font-semibold text-salon-dark">Need help?</h4>
            <p className="text-sm text-salon-dark/70 mt-1 space-x-2">
              <a className="underline" href={SALON.phoneHref}>
                {SALON.phone}
              </a>
              <span>•</span>
              <a className="underline" href={SALON.emailHref}>
                {SALON.email}
              </a>
              <span>•</span>
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

      {/* Two-button confirmation modal */}
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
              Hi <span className="font-medium">{customerName.trim()}</span>, your booking was created.
              How would you like to pay?
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handlePayOnline}
                className="rounded-xl bg-salon-primary px-4 py-2.5 font-medium text-white hover:shadow-md transition"
              >
                Pay online (Stripe)
              </button>
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
