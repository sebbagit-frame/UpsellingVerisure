import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        corporativo: {
          rojo: "#E30613",
          negro: "#121212",
          fondo: "#F7F7F8",
          textoSecundario: "#6B7280",
        },
      },
      fontFamily: {
        titulos: ["var(--fuente-titulos)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        tarjeta: "10px",
      },
      boxShadow: {
        // Sombra sutil única del sistema de diseño: apenas despega la tarjeta
        tarjeta: "0 1px 3px rgba(18, 18, 18, 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
