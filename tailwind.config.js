/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6",
        secondary: "#C4B5FD",
        accent: "#10B981",
        "brand-bg": "#FAF5FF",
        "text-main": "#4C1D95",
      },
      fontFamily: {
        heading: ["Caveat"],
        body: ["Quicksand"],
      },
    },
  },
  plugins: [],
}
