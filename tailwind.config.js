/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#EEF2F6',
        surface: '#FFFFFF',
        surfaceAlt: '#F8FAFC',
        deep: '#EDF2F7',
        ink: { DEFAULT: '#0F172A', 2: '#475569', 3: '#5B6573', faint: '#94A3B8' },
        primary: { DEFAULT: '#0F766E', strong: '#0B5C55', soft: '#CCFBF1', tint: '#F0FDFA' },
        secondary: '#14B8A6',
        accent: { DEFAULT: '#0369A1', strong: '#075985', soft: '#E0F2FE' },
        success: { DEFAULT: '#059669', bg: '#D1FAE5' },
        warn: { DEFAULT: '#D97706', bg: '#FEF3C7' },
        danger: { DEFAULT: '#DC2626', bg: '#FEE2E2' },
        line: { DEFAULT: '#E2E8F0', strong: '#CBD5E1' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SF Mono', 'Courier New', 'monospace'],
        serif: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
        sm: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        md: '0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        lg: '0 18px 40px -12px rgba(15, 23, 42, 0.18)',
        ring: '0 0 0 3px rgba(15, 118, 110, 0.22)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '22px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
