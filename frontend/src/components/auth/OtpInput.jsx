'use client';

import { useEffect, useRef, useState } from 'react';

export const OtpInput = ({ length = 6, onComplete, isError = false }) => {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Trigger shake animation on error
  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        inputRefs.current.forEach((ref) => {
          if (ref) {
            ref.classList.add('animate-shake');
            setTimeout(() => ref.classList.remove('animate-shake'), 500);
          }
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isError]);

  const handleChange = (e, index) => {
    const { value } = e.target;

    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    // Only allow one character
    if (value.length > 1) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all filled and call onComplete
    if (newValues.every((v) => v !== '') && onComplete) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // Backspace on empty input: focus previous
        inputRefs.current[index - 1]?.focus();
      } else if (values[index]) {
        // Backspace on filled input: clear it
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');

    // Extract only digits
    const digits = pastedData.replace(/\D/g, '').slice(0, length);

    if (digits.length > 0) {
      const newValues = Array(length).fill('');
      for (let i = 0; i < digits.length; i++) {
        newValues[i] = digits[i];
      }
      setValues(newValues);

      // Focus appropriate input based on paste length
      const nextIndex = Math.min(digits.length, length - 1);
      setTimeout(() => inputRefs.current[nextIndex]?.focus(), 0);

      // Check if all filled
      if (digits.length === length && onComplete) {
        onComplete(digits);
      }
    }
  };

  return (
    <div className="flex max-w-full gap-1.5 sm:gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={`w-10 h-12 sm:w-10 sm:h-12 md:w-10 md:h-12 rounded-sm border-2 text-center text-xl font-bold transition-all duration-200 ${
            isError
              ? 'border-error bg-error-light text-error'
              : values[index]
              ? 'border-primary bg-primary-subtle text-text-primary'
              : 'border-border bg-surface text-text-primary'
          } focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus`}
        />
      ))}

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
