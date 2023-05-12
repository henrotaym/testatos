/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/App.{ts,vue}",
    require("./dist/server").messagingTailwindPath,
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
