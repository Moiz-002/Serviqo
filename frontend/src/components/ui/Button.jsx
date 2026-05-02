/**
 * Button Component - AI-Focused Color System
 *
 * Variants: primary (Deep Blue), secondary (Indigo AI), accent (Green), danger
 * Sizes: sm (32px), md (40px), lg (48px), xl (56px)
 * States: default, hover, active, focus, disabled
 * Features: AI glow, gradient options, loading state
 *
 * Usage:
 *   <Button variant="primary">Click me</Button>
 *   <Button variant="secondary" size="lg" aiGlow>AI Feature</Button>
 *   <Button variant="accent">Success Action</Button>
 *   <Button variant="danger" isLoading>Deleting...</Button>
 */

import React from 'react';

const Button = React.forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      isLoading = false,
      aiGlow = false,
      gradient = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      'font-sans font-semibold inline-flex items-center justify-center border rounded transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed active:scale-95';

    // Variant styles with new color system
    const variantStyles = {
      // Deep Navy (Primary - Trust)
      primary: `
        bg-primary text-primary-fg border-primary shadow-sm
        hover:bg-primary-hover hover:shadow-md hover:border-primary-hover
        active:bg-primary-active active:shadow-sm
        focus-visible:outline-primary
        disabled:bg-primary-light disabled:text-text-tertiary disabled:shadow-none disabled:border-primary-light cursor-pointer
      `,
      // Cyan (Secondary/Alt - Accent)
      secondary: `
        ${gradient ? 'bg-gradient-to-r from-navy-600 to-cyan-500' : 'bg-cyan-500'} text-white border-cyan-600 shadow-sm cursor-pointer
        hover:bg-cyan-600 hover:shadow-md hover:border-cyan-700
        active:bg-cyan-700 active:shadow-sm
        ${aiGlow ? 'shadow-lg shadow-cyan-500/30' : 'shadow-sm'}
        focus-visible:outline-cyan-500
        disabled:bg-neutral-300 disabled:text-neutral-500 disabled:border-neutral-300
      `,
      // Cyan (Accent/Success)
      accent: `
        bg-cyan-500 text-navy-900 border-cyan-600 shadow-sm
        hover:bg-cyan-600 hover:shadow-md hover:border-cyan-700
        active:bg-cyan-700 active:shadow-sm
        focus-visible:outline-cyan-500 cursor-pointer
        disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none disabled:border-neutral-300
      `,
      // Red (Danger - Destructive)
      danger: `
        bg-error text-white border-red-700 shadow-sm
        hover:bg-red-700 hover:shadow-md hover:border-red-800
        active:bg-red-800 active:shadow-sm
        focus-visible:outline-error cursor-pointer
        disabled:bg-neutral-300 disabled:text-neutral-500 disabled:border-neutral-300
      `,
      // Outline variant (for secondary actions)
      outline: `
        border-2 border-navy-600 text-navy-600 bg-transparent shadow-sm cursor-pointer
        hover:bg-navy-50 hover:border-navy-700 hover:text-navy-700 hover:shadow-md
        active:bg-navy-100 active:border-navy-800
        focus-visible:outline-navy-600
        disabled:border-neutral-300 disabled:text-neutral-500 disabled:shadow-none
      `,
      // Ghost variant (minimal)
      ghost: `
        border border-neutral-300 text-text-primary bg-transparent cursor-pointer
        hover:bg-navy-50 hover:border-neutral-400 hover:shadow-sm
        active:bg-navy-100 active:scale-95
        focus-visible:outline-navy-600
        disabled:opacity-50
      `,
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-2 text-xs h-8',
      md: 'px-4 py-3 text-sm h-10',
      lg: 'px-6 py-3.5 text-base h-12',
      xl: 'px-8 py-4.5 text-lg h-14',
    };

    // Combine all styles
    const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        className={buttonStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
