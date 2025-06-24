/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdebd7',
          200: '#fad4ae',
          300: '#f6b37b',
          400: '#f18947',
          500: '#ed6421',
          600: '#e84a17',
          700: '#c13616',
          800: '#9a2e19',
          900: '#7c2818',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}