import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ChatGPT color palette
        chatgpt: {
          bg: "#343541",
          sidebar: "#202123",
          panel: "#40414f",
          border: "#565869",
          "text-primary": "#ececf1",
          "text-secondary": "#c5c5d2",
          "text-muted": "#9a9aab",
          "accent-green": "#10a37f",
        },
        // Light mode colors
        light: {
          bg: "#ffffff",
          sidebar: "#f7f7f8",
          panel: "#ffffff",
          border: "#e5e5e5",
          "text-primary": "#353740",
          "text-secondary": "#6e6e80",
          "text-muted": "#8e8ea0",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;

