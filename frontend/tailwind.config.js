/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17223B",
        paper: "#F4F5F4",
        line: "#DCDFE3",
        muted: "#6B7280",
        accent: "#B8842A",
        accentSoft: "#F3E8CC",
        danger: "#B3261E",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};