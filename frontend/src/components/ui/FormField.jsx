'use client';

import { AlertCircle } from 'lucide-react';

const FormField = ({
  label,
  required = false,
  optional = false,
  hint,
  error,
  children,
  htmlFor,
}) => {
  return (
    <div className="flex flex-col w-full">
      {/* Label Row */}
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-2 flex items-center gap-1 text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-error font-bold">*</span>}
          {optional && !required && (
            <span className="text-xs text-text-tertiary">(Optional)</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="w-full">
        {children}
      </div>

      {/* Hint or Error */}
      {error ? (
        <div
          className="mt-2 flex items-center gap-1 text-xs text-error animate-in fade-in-0 duration-200"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-text-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
