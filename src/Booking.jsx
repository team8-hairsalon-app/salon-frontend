// salon-frontend/src/Booking.jsx
import { useMemo, useState } from "react";
import { api } from "./lib/api";

const mockStyles = [
  {
    id: "style_1",
    name: "Silk Press",
    priceMin: 70,
    priceMax: 100,
    durationMins: 90,
    imageUrl:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1600&auto=format&fit=crop",
    category: "styling",
  },
  {
    id: "style_2",
    name: "Box Braids",
    priceMin: 140,
    priceMax: 220,
    durationMins: 240,
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    category: "braids",
  },
  {
    id: "style_3",
    name: "Taper Fade",
    priceMin: 35,
    priceMax: 55,
    durationMins: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop",
    category: "cut",
  },
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
  const [selectedStyleId, setSelectedStyleId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // new: customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const selectedStyle = useMemo(
    () => mockStyles.find((s) => s.id === selectedStyleId) || null,
    [selectedStyleId]
  );

  const errors = useMemo(() => {
    const e = {};
    if (!selectedStyleId) e.style = "Please select a style";
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

      await api.createAppointment(payload);

      alert(`Booked: ${selectedStyle.name} on ${date} at ${time}`);

      // reset form
      setSelectedStyleId("");
      setDate("");
      setTime("");
      setNotes("");
      setCustomerName("");
      setCustomerEmail("");
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment. See console for details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="section">
      <h1 className="section-title">Book an appointment</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: form */}
        <div className="lg:col-span-2 space-y-10">
          {/* pick a service */}
          <Section title="1) Choose a style">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mockStyles.map((s) => {
                const selected = selectedStyleId === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSelectedStyleId(s.id)}
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
            {errors.style && (
              <p className="text-sm text-rose-600 mt-1">{errors.style}</p>
            )}
          </Section>

          {/* date + time */}
          <Section title="2) Pick date & time">
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

              <div>
                <label className="block text-sm font-medium text-salon-dark">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition
                    ${
                      errors.date
                        ? "border-rose-300 ring-2 ring-rose-100"
                        : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                    }`}
                />
                {errors.date && (
                  <p className="text-xs text-rose-600 mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-salon-dark">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition
                    ${
                      errors.time
                        ? "border-rose-300 ring-2 ring-rose-100"
                        : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                    }`}
                />
                {errors.time && (
                  <p className="text-xs text-rose-600 mt-1">{errors.time}</p>
                )}
              </div>

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

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className={`w-full rounded-xl px-4 py-3 font-medium text-white transition
                    ${
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
            <p className="text-sm text-salon-dark/70 mt-1">
              Call us at (704) 555-0123 or email hello@hairsalon.dev
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
