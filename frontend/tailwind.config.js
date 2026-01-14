/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'factory-normal': '#10b981',
        'factory-warning': '#f59e0b',
        'factory-failure': '#ef4444',
        'factory-maintenance': '#3b82f6',
      },
    },
  },
  plugins: [],
}