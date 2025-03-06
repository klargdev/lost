/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        funeral: {
          darkest: '#040303',
          dark: '#461111',
          medium: '#A13333',
          accent: '#B3541E',
        }
      },
    },
  },
  plugins: [],
}