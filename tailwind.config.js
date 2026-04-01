/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-dim": "rgb(var(--color-surface-dim) / <alpha-value>)",
        "surface-bright": "rgb(var(--color-surface-bright) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
        "surface-container-lowest":
          "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        "surface-container-low":
          "rgb(var(--color-surface-container-low) / <alpha-value>)",
        "surface-container":
          "rgb(var(--color-surface-container) / <alpha-value>)",
        "surface-container-high":
          "rgb(var(--color-surface-container-high) / <alpha-value>)",
        "surface-container-highest":
          "rgb(var(--color-surface-container-highest) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-soft": "rgb(var(--color-primary-soft) / <alpha-value>)",
        "primary-dim": "rgb(var(--color-primary-dim) / <alpha-value>)",
        "primary-container":
          "rgb(var(--color-primary-container) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-soft": "rgb(var(--color-secondary-soft) / <alpha-value>)",
        "secondary-dim":
          "rgb(var(--color-secondary-dim) / <alpha-value>)",
        "secondary-container":
          "rgb(var(--color-secondary-container) / <alpha-value>)",
        tertiary: "rgb(var(--color-tertiary) / <alpha-value>)",
        "tertiary-container":
          "rgb(var(--color-tertiary-container) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",
        "outline-variant":
          "rgb(var(--color-outline-variant) / <alpha-value>)",
        "on-background": "rgb(var(--color-on-background) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-surface-variant":
          "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        "on-primary-container":
          "rgb(var(--color-on-primary-container) / <alpha-value>)",
        "on-secondary": "rgb(var(--color-on-secondary) / <alpha-value>)",
        "on-secondary-container":
          "rgb(var(--color-on-secondary-container) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
      },
      fontFamily: {
        headline: ['"Space Grotesk"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Manrope", "sans-serif"],
        mono: ['"Fira Code"', "monospace"],
      },
      boxShadow: {
        glass: "0 18px 60px rgba(0, 0, 0, 0.45)",
        cyan: "0 0 24px rgba(0, 212, 255, 0.24)",
        violet: "0 0 28px rgba(124, 58, 237, 0.28)",
      },
      backgroundImage: {
        "kinetic-grid":
          "linear-gradient(rgba(69,72,79,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(69,72,79,0.08) 1px, transparent 1px)",
        "primary-gradient":
          "linear-gradient(135deg, rgb(var(--color-primary-soft)), rgb(var(--color-primary-container)))",
        "secondary-gradient":
          "linear-gradient(135deg, rgb(var(--color-secondary)), rgb(var(--color-secondary-container)))",
        "hero-gradient":
          "radial-gradient(circle at top left, rgba(0,212,255,0.13), transparent 36%), radial-gradient(circle at bottom right, rgba(124,58,237,0.18), transparent 40%)",
      },
      keyframes: {
        pulseHalo: {
          "0%": { boxShadow: "0 0 0 0 rgba(0, 212, 255, 0.5)" },
          "100%": { boxShadow: "0 0 0 14px rgba(0, 212, 255, 0)" },
        },
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        halo: "pulseHalo 1.8s infinite",
        "float-up": "floatUp 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
