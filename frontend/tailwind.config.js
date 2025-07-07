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
        // Pizza Pachorra Brand Colors
        brand: {
          orange: {
            50: '#fef7ee',
            100: '#fdebd7', 
            500: '#ed6421',
            600: '#e84a17',
            700: '#c13616',
          },
          red: {
            500: '#dc2626',
            600: '#b91c1c',
            700: '#991b1b',
          },
          amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            500: '#f59e0b',
            700: '#b45309',
          }
        },
        // Theme-specific colors
        dashboard: {
          bg: '#0f172a',      // slate-900
          card: '#1e293b',    // slate-800  
          border: '#334155',  // slate-700
          text: '#f1f5f9',    // slate-100
          accent: '#3b82f6',  // blue-500
        },
        traditional: {
          bg: '#7c2d12',      // red-900
          card: '#dc2626',    // red-600
          border: '#fbbf24',  // amber-400
          text: '#fef3c7',    // amber-100
          accent: '#f59e0b',  // amber-500
        },
        success: '#10b981',   // emerald-500
        warning: '#f59e0b',   // amber-500
        error: '#ef4444',     // red-500
        info: '#3b82f6',      // blue-500
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'pizza': '0 10px 25px -3px rgba(237, 100, 33, 0.1), 0 4px 6px -2px rgba(237, 100, 33, 0.05)',
        'traditional': '0 10px 25px -3px rgba(124, 45, 18, 0.1), 0 4px 6px -2px rgba(124, 45, 18, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-success': 'pulse 1s ease-in-out 2',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}