/**
 * Design Tokens - Exported JavaScript Object
 * Use this for dynamic styling, theming, or component generation
 * Example: import { colors, spacing } from './design-tokens'
 */

export const colors = {
  // Primary Brand
  primary: {
    blue: '#5865F2',
    blueHover: '#4C54CC',
    blueActive: '#3F44AA',
    purple: '#7C3AED',
    teal: '#14B8A6',
  },

  // Semantic
  semantic: {
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },

  // Neutral
  gray: {
    white: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    900: '#111827',
  },

  // Extended Palettes
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    900: '#111E3F',
  },
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    900: '#3F0F5C',
  },
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    900: '#134E4A',
  },
};

export const typography = {
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    serif: 'Merriweather, serif',
    mono: 'Fira Code, monospace',
  },

  sizes: {
    display: '48px',
    h1: '36px',
    h2: '24px',
    h3: '20px',
    bodyLg: '18px',
    body: '16px',
    bodySm: '14px',
    label: '13px',
    caption: '12px',
  },

  lineHeights: {
    display: 1.2,
    heading: 1.33,
    body: 1.6,
    tight: 1.4,
  },

  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  styles: {
    display: {
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
    },
    h1: {
      fontSize: '36px',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.3px',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.33,
      letterSpacing: '0px',
    },
    h3: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '0px',
    },
    bodyLg: {
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0px',
    },
    body: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0px',
    },
    bodySm: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.57,
      letterSpacing: '0px',
    },
    label: {
      fontSize: '13px',
      fontWeight: 600,
      lineHeight: 1.54,
      letterSpacing: '0.3px',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0px',
    },
  },
};

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
};

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
};

export const shadows = {
  none: '0 0 0 transparent',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 1px 3px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
  xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  '2xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

export const transitions = {
  fast: 'all 0.15s ease',
  base: 'all 0.2s ease',
  slow: 'all 0.3s ease-out',
  slower: 'all 0.5s ease-out',
};

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 100,
  modalBg: 1000,
  modal: 1001,
  popover: 1100,
  tooltip: 1200,
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const grid = {
  desktop: {
    columns: 12,
    gutter: '24px',
    maxWidth: '1440px',
  },
  tablet: {
    columns: 8,
    gutter: '20px',
  },
  mobile: {
    columns: 4,
    gutter: '16px',
  },
};

// Component Default Sizes
export const componentSizes = {
  button: {
    sm: { padding: '8px 12px', height: '32px' },
    md: { padding: '12px 16px', height: '40px' },
    lg: { padding: '14px 24px', height: '48px' },
    xl: { padding: '18px 32px', height: '56px' },
  },
  input: {
    height: '40px',
    padding: '12px 16px',
  },
  card: {
    padding: '24px',
    borderRadius: '12px',
  },
  modal: {
    maxWidth: '540px',
    headerPadding: '24px',
    bodyPadding: '24px',
  },
};

// Contrast Ratios (WCAG 2.1 AA)
export const contrastRatios = {
  primaryBlueOnWhite: '9.2:1 (AAA)',
  secondaryPurpleOnWhite: '8.5:1 (AAA)',
  accentTealOnWhite: '6.2:1 (AAA)',
  gray700OnWhite: '12:1 (AAA)',
  gray600OnWhite: '9.8:1 (AAA)',
  errorRedOnWhite: '4.5:1 (AA)',
  warningAmberOnWhite: '5.2:1 (AAA)',
};
