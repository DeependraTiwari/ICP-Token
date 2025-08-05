/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      animation: {
        glow: "glow 2s infinite ease-in-out",
      },
      keyframes: {
        glow: {
          "0%, 100%": { textShadow: "0 0 10px #00f7ff, 0 0 20px #00f7ff" },
          "50%": { textShadow: "0 0 20px #00e1ff, 0 0 30px #00e1ff" },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
