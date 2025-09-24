import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { authApi } from "./lib/authApi";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pwStrongRe = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    dob: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const e = {};
    if (!form.firstName) e.firstName = "First name is required";
    if (!form.lastName) e.lastName = "Last name is required";
    if (!form.email) e.email = "Email is required";
    else if (!emailRe.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (!pwStrongRe.test(form.password))
      e.password = "8+ chars with upper, lower, and a number";
    if (!form.confirm) e.confirm = "Confirm your password";
    else if (form.confirm !== form.password)
      e.confirm = "Passwords do not match";
    if (!form.dob) e.dob = "Date of birth is required";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    try {
      await authApi.register({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        dob: form.dob,
      });
      alert(`Welcome, ${form.firstName}! Your account is created.`);
      // TODO: navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed. Try a different email or check fields.");
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-b from-white to-salon-beige/40">
      <div className="w-full max-w-2xl rounded-3xl border border-rose-100 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-salon-dark">Create account</h1>
        <p className="mt-1 text-sm text-salon-dark/60">
          Join us to book appointments and track your history.
        </p>

        <form
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* First name */}
          <div className="col-span-1">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-salon-dark"
            >
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              onBlur={onBlur}
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition
                ${
                  errors.firstName && touched.firstName
                    ? "border-rose-300 ring-2 ring-rose-100"
                    : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                }`}
              placeholder="Jane"
            />
            {errors.firstName && touched.firstName && (
              <p className="mt-1 text-xs text-rose-500">{errors.firstName}</p>
            )}
          </div>

          {/* Last name */}
          <div className="col-span-1">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-salon-dark"
            >
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              onBlur={onBlur}
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition
                ${
                  errors.lastName && touched.lastName
                    ? "border-rose-300 ring-2 ring-rose-100"
                    : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                }`}
              placeholder="Doe"
            />
            {errors.lastName && touched.lastName && (
              <p className="mt-1 text-xs text-rose-500">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-salon-dark"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              onBlur={onBlur}
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition
                ${
                  errors.email && touched.email
                    ? "border-rose-300 ring-2 ring-rose-100"
                    : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                }`}
              placeholder="you@example.com"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="col-span-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-salon-dark"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full rounded-xl border px-3 py-2 pr-12 outline-none transition
                  ${
                    errors.password && touched.password
                      ? "border-rose-300 ring-2 ring-rose-100"
                      : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                  }`}
                placeholder="Strong password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs text-salon-dark/60 hover:bg-rose-50"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-salon-dark/60">
              Must include 8+ chars, 1 uppercase, 1 lowercase, and 1 number.
            </p>
          </div>

          {/* Confirm password */}
          <div className="col-span-1">
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-salon-dark"
            >
              Confirm password
            </label>
            <div className="relative mt-1">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                value={form.confirm}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full rounded-xl border px-3 py-2 pr-12 outline-none transition
                  ${
                    errors.confirm && touched.confirm
                      ? "border-rose-300 ring-2 ring-rose-100"
                      : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                  }`}
                placeholder="Repeat password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs text-salon-dark/60 hover:bg-rose-50"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirm && touched.confirm && (
              <p className="mt-1 text-xs text-rose-500">{errors.confirm}</p>
            )}
          </div>

          {/* DOB */}
          <div className="md:col-span-2">
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-salon-dark"
            >
              Date of birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={onChange}
              onBlur={onBlur}
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none transition
                ${
                  errors.dob && touched.dob
                    ? "border-rose-300 ring-2 ring-rose-100"
                    : "border-rose-200 focus:ring-2 focus:ring-rose-200"
                }`}
            />
            {errors.dob && touched.dob && (
              <p className="mt-1 text-xs text-rose-500">{errors.dob}</p>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full rounded-xl px-4 py-2 font-medium text-white transition
                ${
                  isValid
                    ? "bg-salon-primary hover:shadow-md"
                    : "bg-rose-300/60 cursor-not-allowed"
                }`}
            >
              Create account
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-salon-dark/70">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-salon-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
