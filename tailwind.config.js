/** @type {import('tailwindcss').Config} */
const { colors: defaultColors } = require('tailwindcss/defaultTheme');

module.exports = {
  // https://tailwindcss.com/docs/configuration#important
  important: true,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...defaultColors,
        primary: {
          100: "#DFDFFE",
          200: "#BFC0FD",
          300: "#9EA0FA",
          400: "#8486F5",
          500: "#5D5FEF",
          600: "#4345CD",
          700: "#2E30AC",
          800: "#1D1E8A",
          900: "#111272",
        },
        secondary: {
          100: "#001727",
          200: "#001524",
          300: "#00121F",
          400: "#000F1A",
          500: "#000C14",
          600: "#00090F",
          700: "#00060A",
          800: "#000305",
          900: "#000000",
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

