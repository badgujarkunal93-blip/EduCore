import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const accentPalettes = {
  observatory: {
    id: "observatory",
    label: "Cyan / Violet",
    primary: "0 212 255",
    primarySoft: "153 247 255",
    primaryDim: "0 226 238",
    primaryContainer: "0 241 254",
    secondary: "124 58 237",
    secondarySoft: "172 137 255",
    secondaryDim: "135 76 255",
    secondaryContainer: "112 0 255",
  },
  aurora: {
    id: "aurora",
    label: "Mint / Sky",
    primary: "16 185 129",
    primarySoft: "167 243 208",
    primaryDim: "5 150 105",
    primaryContainer: "52 211 153",
    secondary: "14 165 233",
    secondarySoft: "125 211 252",
    secondaryDim: "2 132 199",
    secondaryContainer: "3 105 161",
  },
  ember: {
    id: "ember",
    label: "Amber / Rose",
    primary: "245 158 11",
    primarySoft: "253 230 138",
    primaryDim: "217 119 6",
    primaryContainer: "251 191 36",
    secondary: "244 63 94",
    secondarySoft: "251 113 133",
    secondaryDim: "225 29 72",
    secondaryContainer: "190 24 93",
  },
  signal: {
    id: "signal",
    label: "Magenta / Blue",
    primary: "232 121 249",
    primarySoft: "245 208 254",
    primaryDim: "217 70 239",
    primaryContainer: "236 72 153",
    secondary: "37 99 235",
    secondarySoft: "147 197 253",
    secondaryDim: "29 78 216",
    secondaryContainer: "30 64 175",
  },
};

function applyAccent(palette) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", palette.primary);
  root.style.setProperty("--color-primary-soft", palette.primarySoft);
  root.style.setProperty("--color-primary-dim", palette.primaryDim);
  root.style.setProperty("--color-primary-container", palette.primaryContainer);
  root.style.setProperty("--color-secondary", palette.secondary);
  root.style.setProperty("--color-secondary-soft", palette.secondarySoft);
  root.style.setProperty("--color-secondary-dim", palette.secondaryDim);
  root.style.setProperty("--color-secondary-container", palette.secondaryContainer);
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("educore-theme-mode") || "dark",
  );
  const [accent, setAccent] = useState(
    () => localStorage.getItem("educore-theme-accent") || "observatory",
  );

  useEffect(() => {
    localStorage.setItem("educore-theme-mode", themeMode);
    document.documentElement.dataset.theme = themeMode === "auto" ? "dark" : themeMode;
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("educore-theme-accent", accent);
    applyAccent(accentPalettes[accent] || accentPalettes.observatory);
  }, [accent]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      accent,
      setAccent,
      accentPalettes: Object.values(accentPalettes),
    }),
    [accent, themeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
