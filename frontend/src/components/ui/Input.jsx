/**
 * Input Component - Serviqo Design System
 *
 * Supports: text, email, phone, password, number, search, tel, url
 * States: default, focus, hover, disabled, error, success
 * Features: label, helper text, error message, character limit, icon support
 *
 * Usage:
 *   <Input label="Full Name" placeholder="John Doe" />
 *   <Input type="email" label="Email" error="Invalid email address" />
 *   <Input label="Phone" helperText="Pakistan format: +92 3XX XXXXXXX" />
 *   <Input label="Password" type="password" />
 */

import React, { useState } from 'react';

const Input = React.forwardRef(
  (
    {
      type = 'text',
      label,
      placeholder,
      error,
      helperText,
      disabled = false,
      maxLength,
      showCharCount = false,
      icon: Icon,
      className = '',
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [value, setValue] = useState(props.value || '');

    const handleFocus = (e) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const charCount = value.length;
    const isNearLimit = maxLength && charCount > maxLength * 0.9;

    return (
      <div className="flex flex-col w-full">
        {/* Label */}
        {label && (
          <label className="mb-2 text-xs font-semibold text-text-primary uppercase tracking-wide">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative">
          {/* Input Field */}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`
              w-full px-4 py-3 text-base border rounded-lg
              transition-base font-sans
              bg-surface border-border text-text-primary placeholder-text-tertiary

              hover:bg-surface hover:border-border-strong

              focus:bg-surface focus:border-border-focus focus:shadow-md focus:shadow-primary/10
              focus:outline-none

              disabled:bg-surface disabled:border-border disabled:text-text-disabled disabled:cursor-not-allowed

              ${error ? 'border-2 border-error focus:border-error focus:shadow-md focus:shadow-error/10' : ''}

              ${Icon ? 'pr-12' : ''}

              ${className}
            `.trim()}
            {...props}
          />

          {/* Right Icon (Loading, Success, Error, etc.) */}
          {Icon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-tertiary pointer-events-none">
              <Icon size={20} />
            </div>
          )}

          {/* Error Icon */}
          {error && !Icon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-error">
              <span className="text-lg">✕</span>
            </div>
          )}

          {/* Success Icon */}
          {!error && props.value && !Icon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-success">
              <span className="text-lg">✓</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-caption text-error flex items-center gap-1">
            <span className="inline-block">⚠</span>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-1 text-caption text-text-secondary">
            {helperText}
          </p>
        )}

        {/* Character Count */}
        {showCharCount && maxLength && (
          <p className={`mt-1 text-caption text-right ${isNearLimit ? 'text-error' : 'text-text-tertiary'}`}>
            {charCount} / {maxLength} characters
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
