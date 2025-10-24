// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // ⭐ Habilitar modo oscuro con clase
  theme: {
    extend: {
      colors: {
        primary: "#26BBFF",
        night:   "#201A2F",
        coal:    "#000000",
        ink:     "#111115",
        slate:   "#848282",
        olive:   "#0F0F02",
      },
    },
  },
  plugins: [],
};
