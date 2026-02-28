/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "gap-blue": "#03588c",
        "ocean-blue": "#04c4d9",
        "dark-blue": "#012340",
        white: "#ffffff",
        cyan: "#61bcc1",
        "detail-1": "#e0f7fa",
        "detail-2": "#b2ebf2",
        "detail-3": "#80deea",
      },
    },
  },
  plugins: [],
};
