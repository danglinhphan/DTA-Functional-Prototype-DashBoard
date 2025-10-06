/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dta-blue': '#1e3a8a',
        'dta-light-blue': '#3b82f6',
        'dca-high': '#10b981',
        'dca-medium-high': '#84cc16',
        'dca-medium': '#f59e0b',
        'dca-medium-low': '#f97316',
        'dca-low': '#ef4444',
        'dca-not-reported': '#6b7280',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}