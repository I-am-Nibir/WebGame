import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        bob: "bob 3s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        pop: "pop 0.35s ease-out",
        "fade-in": "fadeIn 0.25s ease-out",
        "float-text": "floatText 0.9s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
