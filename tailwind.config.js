/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2349e7",
          primary: "#6f82fa",
          dark: "#5877e9",
          ink: "#2f3a4c",
          muted: "#6f7788",
          line: "#dfe4ee",
          soft: "#f7f9fe",
          success: "#18a56f",
          danger: "#ff7178",
          navy: "#070741"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};
