import React, { useMemo, useState } from "react";
import FormField from "./components/FormField.jsx";
import { validateEmail } from "./lib/validators.js";
// import { authApi } from "./lib/api.js"; // uncomment when backend is ready
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  const isValid = useMemo(() => {
    const e = {};
    if (!validateEmail(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form.email, form.password]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      // const res = await authApi.login(form);
      // TODO: save token to storage/context and redirect
      alert(`(demo) Logged in as ${form.email}`);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: "Invalid email or password.",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          required
        />

        <div className="relative">
          <FormField
            id="password"
            label="Password"
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-2 top-9 text-sm text-blue-600"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className={`w-full rounded py-2.5 text-white
            ${!isValid || submitting ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Don’t have an account?{" "}
        <Link className="text-blue-600 underline" to="/signup">
          Create one
        </Link>
      </p>
    </div>
  );
}
