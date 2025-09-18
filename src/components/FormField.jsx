import React from 'react';

export default function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  ...rest
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className={`w-full rounded border px-3 py-2 outline-none focus:ring
          ${error ? 'border-red-500 ring-red-200' : 'border-gray-300 ring-blue-200'}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}