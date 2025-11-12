import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const info = useMemo(() => {
    const first = (params.get("first") || "there").trim();
    const style = params.get("style") || "your service";
    const amount = params.get("amount") || "";
    const dt = params.get("dt") || "";

    let when = "your selected time";
    try {
      if (dt) {
        const d = new Date(dt);
        if (!isNaN(d.getTime())) {
          when = d.toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }
    } catch {
      /* noop */
    }

    return { first, style, amount, when };
  }, [params]);

  return (
    <main className="section">
      <div className="max-w-md mx-auto card text-center">
        <div className="text-3xl">✅</div>
        <h1 className="section-title mt-2">Payment received</h1>
        <p className="text-salon-dark/80 mt-2">
          Thanks, <span className="font-semibold">{info.first}</span>!
          {info.amount ? (
            <> We’ve received <span className="font-semibold">${info.amount}</span> for </>
          ) : (
            <> We’ve received your payment for </>
          )}
          <span className="font-semibold">{info.style}</span>.
        </p>
        <p className="text-salon-dark/70 mt-1">Appointment: {info.when}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate("/booking")}
            className="rounded-xl bg-salon-primary px-4 py-2.5 font-medium text-white hover:shadow-md transition"
          >
            Book another
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              window.dispatchEvent(new Event("auth-updated"));
              navigate("/", { replace: true });
            }}
            className="rounded-xl border border-rose-200 px-4 py-2.5 font-medium text-salon-dark hover:bg-rose-50 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
