"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  performanceMode: boolean;
  togglePerformanceMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [performanceMode, setPerformanceMode] = useState(false);

  // load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
    const perf = localStorage.getItem("performanceMode");
    if (perf === "true") setPerformanceMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("no-anim", performanceMode);
    localStorage.setItem("performanceMode", performanceMode ? "true" : "false");
  }, [performanceMode]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const togglePerformanceMode = () => setPerformanceMode((p) => !p);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, performanceMode, togglePerformanceMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
