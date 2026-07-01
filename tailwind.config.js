/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2349e7",
          primary: "#7489FF",
          secondary: "#F8FAFF",
          secondaryText: "#384EC7",
          dark: "#6277f7",
          ink: "#2f3a4c",
          muted: "#6f7788",
          line: "#dfe4ee",
          soft: "#f7f9fe",
          success: "#18a56f",
          danger: "#FF7F7F",
          navy: "#070741"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      keyframes: {
        skeleton: {
          "0%": { backgroundPosition: "220% 0" },
          "100%": { backgroundPosition: "-220% 0" }
        }
      }
    }
  },
  plugins: []
};
