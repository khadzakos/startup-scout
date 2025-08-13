/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Orange palette
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6d00', // Primary orange
          600: '#ff7900',
          700: '#ff8500',
          800: '#ff9100',
          900: '#ff9e00',
        },
        // Purple palette
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#240046', // Primary dark purple
          600: '#3c096c',
          700: '#5a189a',
          800: '#7b2cbf',
          900: '#9d4edd',
        },
        // Custom brand colors
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6d00',
          600: '#ff7900',
          700: '#ff8500',
          800: '#ff9100',
          900: '#ff9e00',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#240046',
          600: '#3c096c',
          700: '#5a189a',
          800: '#7b2cbf',
          900: '#9d4edd',
        },
      },
    },
  },
  plugins: [],
}
