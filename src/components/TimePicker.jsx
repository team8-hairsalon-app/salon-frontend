export default function TimePicker({
  value,
  onChange,
  options = [],
  disabled = false,
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
        <option value="" disabled>
          {disabled
            ? "Pick a date first"
            : options.length ? "Select a time" : "No times left for this date"}
        </option>
        {options.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
