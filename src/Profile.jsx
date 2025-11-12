// src/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import FormField from "./components/FormField";
import { validateEmail, validateDOB } from "./lib/validators";
import { appointmentsApi } from "./lib/appointmentsApi";
import { http } from "./lib/http";

/* ---------- small helpers ---------- */

const phoneOk = (p) => {
  const s = (p || "").trim();
  if (!s) return true; // optional
  return /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(s);
};

const fmtMoney = (n) => {
  const num = Number.isFinite(n) ? n : 0;
  return `$${num.toFixed(2)}`;
};

// Map API <-> UI shapes
function fromApi(u = {}) {
  return {
    avatarUrl: "",
    firstName: u.first_name || "",
    lastName: u.last_name || "",
    email: u.email || "",
    phone: u.phone || "",                    // profile.phone_number
    dob: u.dob || "",
    preferredStylist: u.preferred_stylist || "",
  };
}
function toApi(f) {
  return {
    first_name: f.firstName || "",
    last_name: f.lastName || "",
    dob: f.dob || null,
    phone: f.phone || "",                    // profile.phone_number
    preferred_stylist: f.preferredStylist || "",
  };
}

/* ----------------------------- */

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(fromApi({}));
  const [loadingUser, setLoadingUser] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const fullName = useMemo(
    () => `${user.firstName} ${user.lastName}`.trim(),
    [user.firstName, user.lastName]
  );

  const validate = (f) => {
    const e = {};
    if (!f.firstName) e.firstName = "First name is required";
    if (!f.lastName) e.lastName = "Last name is required";
    if (!validateEmail(f.email)) e.email = "Enter a valid email";
    if (!phoneOk(f.phone)) e.phone = "Enter a valid phone (or leave blank)";
    if (f.dob && !validateDOB(f.dob)) e.dob = "Enter a valid past date";
    return e;
  };

  const onChange = (ev) => {
    const { name, value } = ev.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setErrors(validate(next));
  };

  async function onSave(ev) {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const payload = toApi(form);
      const { data } = await http.patch("/me/profile/", payload);
      const saved = fromApi(data || {});
      setUser(saved);
      setForm(saved);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Please sign in to update your profile.");
        navigate("/login");
      } else {
        toast.error("Could not save your profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    setForm(user);
    setErrors({});
    setEditing(false);
  }

  // Cancel a booking (server-side)
  async function cancelBooking(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await http.post(`/appointments/${id}/cancel/`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Could not cancel appointment.");
    }
  }

  // Load profile + bookings
  useEffect(() => {
    let mounted = true;

    (async () => {
      // profile
      try {
        setLoadingUser(true);
        const { data } = await http.get("/me/profile/");
        if (!mounted) return;
        const u = fromApi(data || {});
        setUser(u);
        setForm(u);
      } catch (err) {
        if (err?.response?.status === 401) {
          toast.error("Please sign in to view your profile.");
          navigate("/login");
          return;
        }
        toast.error("Could not load your profile.");
      } finally {
        if (mounted) setLoadingUser(false);
      }

      // bookings
      try {
        const data = await appointmentsApi.upcoming();
        if (!mounted) return;

        const normalized = (Array.isArray(data) ? data : [])
          .filter((b) => (b.status || "").toLowerCase() !== "cancelled")
          .map((b, idx) => {
            const id = b.id ?? idx;
            const status = (b.status || "").toLowerCase();
            const styleName = b.style_name ?? b.style?.name ?? "Appointment";
            const datetime =
              b.datetime ?? b.appointment_time ?? b.start_time ?? null;

            // derive amount: prefer explicit amount if you add it; otherwise fall back to style min price
            const priceMin =
              typeof b.amount === "number"
                ? b.amount
                : Number(b.style?.price_min ?? 0);

            // paid detection:
            // 1) server sets status="paid" (webhook path)
            // 2) server may expose is_paid=true (if you add it later)
            // 3) local fallback flag for local dev without webhooks
            const paidByStatus = status === "paid";
            // eslint-disable-next-line eqeqeq
            const paidByFlag = b.is_paid == true;
            const paidByLocal =
              localStorage.getItem(`paid_appt:${id}`) === "1";

            const paid = Boolean(paidByStatus || paidByFlag || paidByLocal);

            return {
              id,
              style_name: styleName,
              datetime,
              status,            // keep original
              amount: priceMin,  // number
              paid,              // derived for display
            };
          });

        setBookings(normalized);
      } catch {
        // keep empty on failure
      } finally {
        if (mounted) setLoadingBookings(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Overview */}
      <section className="rounded-xl border border-gray-200 bg-white/60 backdrop-blur p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={
              user.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullName || "User"
              )}`
            }
            alt="Avatar"
            className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200"
          />
        </div>
        <div className="mt-4 flex items-start gap-4">
          <div className="grow">
            <h1 className="text-2xl font-semibold">
              {loadingUser ? "Loading…" : fullName || "Your profile"}
            </h1>
            <p className="text-gray-600">{user.email || "—"}</p>
            <p className="text-gray-600">{user.phone || "—"}</p>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">DOB:</span> {user.dob || "—"}
              </div>
              <div>
                <span className="font-medium">Preferred stylist:</span>{" "}
                {user.preferredStylist || "—"}
              </div>
            </div>
          </div>
          {!editing && !loadingUser && (
            <button
              className="ms-auto rounded-lg px-4 py-2 bg-black text-white hover:bg-black/90"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
      </section>

      {/* Edit form */}
      {editing && !loadingUser && (
        <form
          onSubmit={onSave}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              error={errors.firstName}
            />
            <FormField
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              error={errors.lastName}
            />
          </div>

          <FormField
            type="email"
            label="Email"
            name="email"
            value={form.email}
            onChange={onChange}
            error={errors.email}
            disabled
          />
          <FormField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            error={errors.phone}
            placeholder="555-555-5555"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              type="date"
              label="Date of birth"
              name="dob"
              value={form.dob}
              onChange={onChange}
              error={errors.dob}
            />
            <FormField
              label="Preferred stylist"
              name="preferredStylist"
              value={form.preferredStylist}
              onChange={onChange}
              placeholder="Any"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || Object.keys(errors).length > 0}
              className={`rounded-lg px-4 py-2 text-white ${
                saving || Object.keys(errors).length
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 border border-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Upcoming Bookings */}
      <section className="rounded-xl border border-gray-200 bg-white/60 backdrop-blur p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>

        {loadingBookings ? (
          <p>Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">You have no upcoming bookings.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bookings.map((b) => {
              const badgeClasses = b.paid
                ? "text-emerald-600 font-semibold"
                : "text-rose-600 font-semibold";
              const label = b.paid ? "paid" : "pay in salon";
              return (
                <li key={b.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{b.style_name}</p>
                      <p className="text-sm text-gray-600">
                        {b.datetime ? new Date(b.datetime).toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={badgeClasses}>
                        {label} • {fmtMoney(b.amount)}
                      </span>
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                        title="Cancel this appointment"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
