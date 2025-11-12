import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-[60vh] grid place-items-center bg-gradient-to-b from-white to-salon-beige/30">
      <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-salon-dark">Forgot password</h1>
        <p className="mt-1 text-sm text-salon-dark/60">
          Enter your email to receive a reset link.
        </p>

        {!sent ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-4 w-full rounded-xl border border-rose-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              onClick={()=> setSent(true)}
              disabled={!email}
              className="mt-3 w-full rounded-xl bg-salon-primary px-4 py-2 text-white disabled:opacity-50"
            >
              Send reset link
            </button>
          </>
        ) : (
          <p className="mt-4 text-salon-dark/80">
            If an account exists for <span className="font-medium">{email}</span>,
            a reset link has been sent.
          </p>
        )}

        <p className="mt-5 text-center text-sm">
          <Link to="/login" className="text-salon-primary underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
