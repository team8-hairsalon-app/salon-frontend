import { useMemo, useState } from "react";

// Utilities
function toDateOnly(d) {
  const z = new Date(d);
  z.setHours(0, 0, 0, 0);
  return z;
}
function ymd(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export default function DatePicker({
  value,            // "yyyy-mm-dd"
  onChange,         // (yyyy-mm-dd) => void
  disableSunday = true,
  disablePast = true,
  disabled = false,
  className = "",
}) {
  const today = toDateOnly(new Date());
  const initial = value ? new Date(value) : today;
  const [cursor, setCursor] = useState(startOfMonth(initial));

  const weeks = useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);

    // Build grid starting from Monday (Mon=1) or Sunday (Sun=0) — we’ll keep Sunday=0
    const cells = [];
    const leading = first.getDay(); // 0..6 with Sun=0
    // fill leading blanks
    for (let i = 0; i < leading; i++) cells.push(null);

    // fill real days
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }

    // chunk into weeks of 7
    const w = [];
    for (let i = 0; i < cells.length; i += 7) {
      w.push(cells.slice(i, i + 7));
    }
    return w;
  }, [cursor]);

  function isDisabled(dateObj) {
    if (!dateObj) return true;
    if (disablePast && toDateOnly(dateObj) < toDateOnly(new Date())) return true;
    if (disableSunday && dateObj.getDay() === 0) return true; // Sunday
    return false;
    // (You can add more business rules here if needed)
  }

  const selectedYMD = value;

  return (
    <div className={`w-full rounded-xl border border-rose-200 p-3 ${disabled ? "bg-gray-100 opacity-50 pointer-events-none" : ""} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="px-2 py-1 rounded hover:bg-rose-50"
        >
          ‹
        </button>
        <div className="font-medium text-salon-dark">
          {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="px-2 py-1 rounded hover:bg-rose-50"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-salon-dark/70 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.map((row, ri) =>
          row.map((cell, ci) => {
            if (!cell) return <div key={`${ri}-${ci}`} className="h-9" />;
            const disabled = isDisabled(cell);
            const isSelected = selectedYMD === ymd(cell);
            return (
              <button
                key={`${ri}-${ci}`}
                type="button"
                disabled={disabled}
                onClick={() => onChange?.(ymd(cell))}
                className={[
                  "h-9 rounded-md text-sm",
                  disabled
                    ? "text-salon-dark/30 cursor-not-allowed border border-transparent"
                    : "hover:bg-rose-50",
                  isSelected
                    ? "bg-salon-primary text-white"
                    : "text-salon-dark",
                ].join(" ")}
              >
                {cell.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
