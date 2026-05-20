// Design Tokens for Portal
// Colors adapted from new design but using #2563EB as primary blue

export const colors = {
  // Primary Colors (using portal spec)
  primary: '#2563EB',
  'primary-hover': '#1D4ED8',

  // New Design Colors (for reference)
  'new-primary': '#1713ed',
  'surface-dark': '#161616',
  'background-dark': '#111022',
  'background-light': '#f6f6f8',

  // Portal Colors
  white: '#FFFFFF',
  'white-10': 'rgba(255, 255, 255, 0.1)',
  'white-20': 'rgba(255, 255, 255, 0.2)',
  'white-30': 'rgba(255, 255, 255, 0.3)',
  'white-50': 'rgba(255, 255, 255, 0.5)',
  'white-60': 'rgba(255, 255, 255, 0.6)',
  'white-70': 'rgba(255, 255, 255, 0.7)',
  'white-80': 'rgba(255, 255, 255, 0.8)',
  'white-90': 'rgba(255, 255, 255, 0.9)',

  'gray-50': '#FAFAFA',
  'gray-100': '#F3F4F6',
  'gray-200': '#E5E7EB',
  'gray-300': '#D1D5DB',
  'gray-400': '#9CA3AF',
  'gray-500': '#6B7280',
  'gray-600': '#4B5563',
  'gray-700': '#374151',
  'gray-800': '#1F2937',
  'gray-900': '#111827',

  // Status Colors
  'accent-green': '#E2E8DC',
  'accent-green-hover': '#2DCD96',

  // Text Colors
  'text-foreground': '#171717',
  'text-muted': '#737373',
  'text-muted-text': '#64748B',

  // Border Colors
  'border-primary': '#1D4ED8',
  'border-secondary': '#E5E7EB',
  'border-muted': '#F3F4F6',
} as const

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const

export const typography = {
  display: 'font-display',
  sans: 'font-sans',
} as const
