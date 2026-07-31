"use client";

import { useEffect, useState } from "react";

export type ThemeChoice = "auto" | "light" | "forest" | "dark";
export type Preferences = { theme: ThemeChoice; density: "comfortable" | "compact"; font: "system" | "serif"; motion: boolean };
export const defaultPreferences: Preferences = { theme: "auto", density: "comfortable", font: "system", motion: true };
export const preferenceKey = "cyber-doc-preferences-v2";

function timedTheme(hour: number) {
  if (hour < 6 || hour >= 20) return "dark";
  if (hour >= 17) return "forest";
  return "light";
}

export function useThemePreferences() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    try { const saved = localStorage.getItem(preferenceKey); if (saved) setPreferences({ ...defaultPreferences, ...JSON.parse(saved) }); } catch { /* use defaults */ }
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const resolved = preferences.theme === "auto" ? timedTheme(now.getHours()) : preferences.theme;
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.density = preferences.density;
    root.dataset.font = preferences.font;
    root.dataset.motion = preferences.motion ? "on" : "off";
    localStorage.setItem(preferenceKey, JSON.stringify(preferences));
  }, [preferences, now]);

  return {
    preferences,
    setPreferences,
    resolvedTheme: preferences.theme === "auto" ? timedTheme(now.getHours()) : preferences.theme,
    timeLabel: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  };
}
