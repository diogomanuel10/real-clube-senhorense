/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        'primary-dark': '#004c99',
        secondary: '#00cc66',
      }
    },
  },
  plugins: [],
}
