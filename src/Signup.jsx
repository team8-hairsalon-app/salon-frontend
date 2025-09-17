import React, { useMemo, useState } from "react";
import FormField from "./components/FormField.jsx";
import { validateEmail, validateDOB, passwordStrength } from "./lib/validators.js";
// import { authApi } from "./lib/api.js"; // uncomment when backend is ready

function StrengthBar({ score = 0 }) {
  const bars = [0, 1, 2, 3];
  const labels = ["Too weak", "Weak", "Okay", "Strong", "Very strong"];
  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {bars.map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded ${
              score > i ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-600">{labels[score] ?? labels[0]}</p>
    </div>
  );
}

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);
  const passwordsMatch = form.password && form.password === form.confirmPassword;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  const isValid = useMemo(() => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!validateEmail(form.email)) e.email = "Enter a valid email.";
    if (strength < 2)
      e.password = "Use at least 8 chars with mixed case and a number/symbol.";
    if (!passwordsMatch) e.confirmPassword = "Passwords do not match.";
    if (!validateDOB(form.dob)) e.dob = "Select a valid date (13+ years old).";

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, strength, passwordsMatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      // const res = await authApi.register({
      //   first_name: form.firstName,
      //   last_name: form.lastName,
      //   email: form.email,
      //   password: form.password,
      //   dob: form.dob,
      // });
      alert(`(demo) Account created for ${form.firstName} ${form.lastName}`);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: "Email already in use (example).",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create account</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label="First name"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Jane"
            error={errors.firstName}
            required
          />
          <FormField
            id="lastName"
            label="Last name"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Doe"
            error={errors.lastName}
            required
          />
        </div>

        <FormField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane@example.com"
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
            placeholder="At least 8 characters"
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
        <StrengthBar score={strength} />

        <div className="relative">
          <FormField
            id="confirmPassword"
            label="Confirm password"
            type={showPw2 ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw2((s) => !s)}
            className="absolute right-2 top-9 text-sm text-blue-600"
            aria-label={showPw2 ? "Hide password" : "Show password"}
          >
            {showPw2 ? "Hide" : "Show"}
          </button>
        </div>

        <FormField
          id="dob"
          label="Date of birth"
          type="date"
          value={form.dob}
          onChange={handleChange}
          error={errors.dob}
          required
        />

        <button
          type="submit"
          disabled={!isValid || submitting}
          className={`mt-2 w-full rounded py-2.5 text-white
            ${!isValid || submitting ? "bg-green-300" : "bg-green-600 hover:bg-green-700"}`}
        >
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
