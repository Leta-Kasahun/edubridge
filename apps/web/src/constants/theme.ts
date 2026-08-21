export const THEME_FONTS = {
  family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  count: 1,
  weights: {
    regular: 400,
    medium: 500,
    heading: 600,
  },
} as const;

export const THEME_COLORS = {
  brand: {
    primary: '#059669',
    hover: '#047857',
    activeBg: '#ECFDF5',
  },
  text: {
    primary: '#0F172A',
    body: '#334155',
    secondary: '#64748B',
    disabled: '#94A3B8',
    placeholder: '#94A3B8',
    brand: '#059669',
    error: '#DC2626',
  },
  surfaces: {
    mainBg: '#F8FAFC',
    surface: '#FFFFFF',
    hover: '#F1F5F9',
    border: '#E2E8F0',
    activeBg: '#ECFDF5',
  },
  error: {
    main: '#DC2626',
    hover: '#B91C1C',
    lightBg: '#FEF2F2',
  },
  sidebar: {
    bg: '#0F172A',
    text: '#CBD5E1',
    icon: '#94A3B8',
    normal: {
      bg: 'transparent',
      text: '#CBD5E1',
      icon: '#94A3B8',
    },
    hover: {
      bg: '#1E293B',
      text: '#FFFFFF',
    },
    active: {
      bg: '#064E3B',
      text: '#6EE7B7',
      icon: '#6EE7B7',
    },
    divider: '#1E293B',
  },
  header: {
    bg: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
  },
  footer: {
    bg: '#FFFFFF',
    text: '#64748B',
    border: '#E2E8F0',
  },
} as const;

export const THEME_TYPOGRAPHY = {
  h1: {
    mobile: '24px',
    desktop: '30px',
    weight: 600,
    lineHeight: { mobile: '32px', desktop: '38px' },
    minSize: '24px',
  },
  h2: {
    mobile: '20px',
    desktop: '24px',
    weight: 600,
    lineHeight: { mobile: '28px', desktop: '32px' },
  },
  h3: {
    mobile: '18px',
    desktop: '20px',
    weight: 600,
    lineHeight: { mobile: '26px', desktop: '28px' },
  },
  h4: {
    mobile: '16px',
    desktop: '18px',
    weight: 600,
    lineHeight: { mobile: '24px', desktop: '26px' },
  },
  body: {
    size: '16px',
    weight: 400,
    lineHeight: '24px',
    minSize: '16px',
  },
  navigation: {
    size: '15px',
    weight: 500,
    lineHeight: '22px',
  },
  label: {
    size: '14px',
    weight: 500,
    lineHeight: '20px',
  },
  small: {
    size: '14px',
    weight: 400,
    lineHeight: '20px',
    minSize: '14px',
  },
  placeholder: {
    size: '14px',
    weight: 400,
    lineHeight: '20px',
  },
} as const;

export const THEME_BREAKPOINTS = {
  min: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const THEME_SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const THEME_FOCUS = {
  color: '#059669',
  width: '2px',
  offset: '2px',
  style: 'solid',
} as const;

export const THEME_RADIUS = {
  sm: '6px',
  md: '8px',
  lg: '12px',
} as const;

export const THEME_BORDERS = {
  default: '#E2E8F0',
  width: '1px',
  style: 'solid',
} as const;

export const THEME_SHADOWS = {
  none: 'none',
  sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
  md: '0 4px 12px rgba(15, 23, 42, 0.08)',
  lg: '0 10px 24px rgba(15, 23, 42, 0.10)',
} as const;

export const THEME_Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

export const THEME_TRANSITIONS = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    entrance: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

export const THEME_OPACITY = {
  disabled: 0.5,
  muted: 0.7,
  overlay: 0.5,
} as const;

export default {
  fonts: THEME_FONTS,
  colors: THEME_COLORS,
  typography: THEME_TYPOGRAPHY,
  breakpoints: THEME_BREAKPOINTS,
  spacing: THEME_SPACING,
  focus: THEME_FOCUS,
  radius: THEME_RADIUS,
  borders: THEME_BORDERS,
  shadows: THEME_SHADOWS,
  zIndex: THEME_Z_INDEX,
  transitions: THEME_TRANSITIONS,
  opacity: THEME_OPACITY,
};
