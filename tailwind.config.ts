import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";

export default {
  darkMode: ["class"],
  content: [
    "./client/index.html", 
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "Courier New", "monospace"],
        retro: ["VT323", "Courier New", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glow": {
          "0%, 100%": { 
            textShadow: "0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor",
          },
          "50%": { 
            textShadow: "0 0 2px currentColor, 0 0 5px currentColor, 0 0 8px currentColor",
          },
        },
        "scanline": {
          "0%": { 
            transform: "translateY(-100%)",
          },
          "100%": { 
            transform: "translateY(100vh)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "scanline": "scanline 4s linear infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    heroui({
      themes: {
        "retro-light": {
          extend: "light",
          colors: {
            background: "#f7f4f0", // Cream/off-white
            foreground: "#2d2d2d", // Dark charcoal
            content1: "#ffffff",
            content2: "#f7f4f0",
            content3: "#ede7e0",
            content4: "#e3ddd6",
            default: {
              50: "#fefefe",
              100: "#fdfdfd", 
              200: "#fafafa",
              300: "#f5f5f5",
              400: "#eeeeee",
              500: "#e0e0e0", // Light gray
              600: "#bdbdbd",
              700: "#9e9e9e",
              800: "#757575",
              900: "#424242",
              foreground: "#2d2d2d",
            },
            primary: {
              50: "#fff4e6",
              100: "#ffe9cc",
              200: "#ffcc80",
              300: "#ffb74d",
              400: "#ff9800", // Retro orange
              500: "#f57c00",
              600: "#ef6c00",
              700: "#e65100",
              800: "#bf360c",
              900: "#ff5722",
              foreground: "#ffffff",
            },
            secondary: {
              50: "#f3e5f5",
              100: "#e1bee7",
              200: "#ce93d8",
              300: "#ba68c8",
              400: "#ab47bc", // Retro purple
              500: "#9c27b0",
              600: "#8e24aa",
              700: "#7b1fa2",
              800: "#6a1b9a",
              900: "#4a148c",
              foreground: "#ffffff",
            },
            success: {
              50: "#e8f5e8",
              100: "#c8e6c8",
              200: "#a5d6a5",
              300: "#81c784",
              400: "#66bb6a", // Retro green
              500: "#4caf50",
              600: "#43a047",
              700: "#388e3c",
              800: "#2e7d32",
              900: "#1b5e20",
              foreground: "#ffffff",
            },
            warning: {
              50: "#fff8e1",
              100: "#ffecb3",
              200: "#ffe082",
              300: "#ffd54f",
              400: "#ffca28", // Retro yellow
              500: "#ffc107",
              600: "#ffb300",
              700: "#ffa000",
              800: "#ff8f00",
              900: "#ff6f00",
              foreground: "#2d2d2d",
            },
            danger: {
              50: "#ffebee",
              100: "#ffcdd2",
              200: "#ef9a9a",
              300: "#e57373",
              400: "#ef5350", // Retro red
              500: "#f44336",
              600: "#e53935",
              700: "#d32f2f",
              800: "#c62828",
              900: "#b71c1c",
              foreground: "#ffffff",
            },
          },
          layout: {
            fontSize: {
              tiny: "0.75rem",
              small: "0.875rem",
              medium: "1rem",
              large: "1.125rem",
            },
            lineHeight: {
              tiny: "1rem",
              small: "1.25rem",
              medium: "1.5rem",
              large: "1.75rem",
            },
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
        "retro-dark": {
          extend: "dark",
          colors: {
            background: "#1a1a1a", // Dark background
            foreground: "#00ff80", // Neon green text
            content1: "#2d2d2d",
            content2: "#363636",
            content3: "#404040",
            content4: "#4a4a4a",
            primary: {
              50: "#e6fff0",
              100: "#ccffe0",
              200: "#99ffcc",
              300: "#66ffb3",
              400: "#33ff99",
              500: "#00ff80", // Neon green
              600: "#00e673",
              700: "#00cc66",
              800: "#00b359",
              900: "#00994d",
              foreground: "#1a1a1a",
            },
            secondary: {
              50: "#fff0e6",
              100: "#ffe0cc",
              200: "#ffcc99",
              300: "#ffb366",
              400: "#ff9933",
              500: "#ff8000", // Neon orange
              600: "#e6730d",
              700: "#cc661a",
              800: "#b35926",
              900: "#994d33",
              foreground: "#1a1a1a",
            },
            success: {
              50: "#e6fff0",
              100: "#ccffe0",
              200: "#99ffcc",
              300: "#66ffb3",
              400: "#33ff99",
              500: "#00ff80",
              600: "#00e673",
              700: "#00cc66",
              800: "#00b359",
              900: "#00994d",
              foreground: "#1a1a1a",
            },
            warning: {
              50: "#fffae6",
              100: "#fff5cc",
              200: "#ffeb99",
              300: "#ffe066",
              400: "#ffd633",
              500: "#ffcc00", // Neon yellow
              600: "#e6b800",
              700: "#cca300",
              800: "#b38f00",
              900: "#997a00",
              foreground: "#1a1a1a",
            },
            danger: {
              50: "#ffe6f0",
              100: "#ffcce0",
              200: "#ff99cc",
              300: "#ff66b3",
              400: "#ff3399",
              500: "#ff0080", // Neon pink
              600: "#e60073",
              700: "#cc0066",
              800: "#b30059",
              900: "#99004d",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
} satisfies Config;
