import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!emailRe.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Min 8 characters";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    // Placeholder: wire to real API when backend is ready
    // const res = await authApi.login({ email: form.email, password: form.password });

    alert(`Logged in as ${form.email} (placeholder)`);
  }

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-b from-white to-salon-beige/40">
      <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-salon-dark">Welcome back</h1>
        <p className="mt-1 text-sm text-salon-dark/60">
          Sign in to manage your appointments.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-salon-dark">
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
                ${errors.email && touched.email ? "border-rose-300 ring-2 ring-rose-100" : "border-rose-200 focus:ring-2 focus:ring-rose-200"}`}
              placeholder="you@example.com"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-salon-dark">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full rounded-xl border px-3 py-2 pr-12 outline-none transition
                  ${errors.password && touched.password ? "border-rose-300 ring-2 ring-rose-100" : "border-rose-200 focus:ring-2 focus:ring-rose-200"}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs text-salon-dark/60 hover:bg-rose-50"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full rounded-xl px-4 py-2 font-medium text-white transition
              ${isValid ? "bg-salon-primary hover:shadow-md" : "bg-rose-300/60 cursor-not-allowed"}`}
          >
            Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-salon-dark/70">
          New here?{" "}
          <Link to="/signup" className="font-medium text-salon-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
