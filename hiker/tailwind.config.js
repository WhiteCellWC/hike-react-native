/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        background: "#F3F3F3",
        nav_background: "#FFFFFF",
        primary: {
          DEFAULT: "#6A469C",
          100: "#7A56AC",
          500: "#6A469C",
          700: "#593985",
        },
        gray: {
          DEFAULT: "#787878",
          50: "#F7F7F7",
          100: "#EDEDED",
          200: "#CFCFCF",
          300: "#B0B0B0",
          400: "#909090",
          500: "#787878",
          600: "#5F5F5F",
          700: "#474747",
          800: "#2E2E2E",
          900: "#161616",
          op_50: "#50787878", // translucent variant
        },
        red: {
          DEFAULT: "#DD421C",
          100: "#F2694B",
          500: "#DD421C",
          700: "#B73718",
        },
      },
    },
  },
  plugins: [],
};
