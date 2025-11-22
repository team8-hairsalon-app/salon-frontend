export default function TimePicker({
  value,
  onChange,
  options = [],
  disabled = false,
  disabledTimes = [],
  }) {
  return (
    <div>
      <label className="block text-sm font-medium text-salon-dark">Time</label>

      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled || options.length === 0}
        className="mt-1 w-full rounded-xl border border-rose-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 disabled:bg-gray-50"
      >
        {/* Placeholder option */}
        <option value="" disabled>
          {disabled
            ? "Pick a date first"
            : options.length
            ? "Select a time"
            : "No times left for this date"}
        </option>

        {/* Actual time options */}
        {options.map((t) => {
          const [hour, minute] = t.split(":").map(Number);
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 === 0 ? 12 : hour % 12;
          const label = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;

          const isDisabled = disabledTimes.includes(t);

          return (
            <option key={t} value={t} disabled={isDisabled}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
