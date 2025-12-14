import type { Config } from "tailwindcss";
import tailwind_animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./presentation/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true, // Автоматически выравнивает по центру (mx-auto)
      padding: {
        DEFAULT: "1rem", // На мобильных (меньше sm) отступ 16px
        sm: "2rem", // На планшетах (от 640px) отступ 32px
        lg: "4rem", // На ноутбуках (от 1024px) отступ 64px
        xl: "5rem", // На десктопах (от 1280px) отступ 80px
        "2xl": "6rem", // На больших экранах (от 1536px) отступ 96px
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        brand: {
          green: "#7ab538", // Основной зеленый
          orange: "#fdb955", // Акцентный оранжевый
          bg: "#f0f2f5", // Светло-серый фон страницы
          dark: "#222222", // Цвет текста
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [tailwind_animate],
};
export default config;
