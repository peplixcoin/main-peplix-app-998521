/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"
  ],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        spinnerGrow: {
          '0%': {
            transform: 'scale(0)',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '0',
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideInRight: 'slideInRight 0.5s ease-in-out',
        spinnerGrow: 'spinnerGrow 0.5s ease-in-out', // Add the spinnerGrow animation
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["light", "night"], // Enable only light and night themes
    darkTheme: "night", // Set the default dark theme to "night"
  },
};
