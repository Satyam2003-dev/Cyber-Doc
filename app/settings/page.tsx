"use client";

import { defaultPreferences, Preferences, ThemeChoice, useThemePreferences } from "../useThemePreferences";

export default function SettingsPage() {
  const { preferences, setPreferences, resolvedTheme, timeLabel } = useThemePreferences();
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => setPreferences({ ...preferences, [key]: value });
  const themes: { value: ThemeChoice; label: string; note: string }[] = [
    { value: "auto", label: "Automatic", note: "Follows browser time" },
    { value: "light", label: "Light", note: "Bright and neutral" },
    { value: "forest", label: "Forest", note: "Calm green surface" },
    { value: "dark", label: "Dark", note: "Low-light reading" },
  ];

  return <main className="settings-app">
    <header className="settings-bar"><a href="/" className="back-link">← Documentation</a><span>Cyber-Doc</span></header>
    <div className="settings-layout">
      <aside><h1>Settings</h1><nav><a className="active" href="#appearance">Appearance</a><a href="#reading">Reading</a><a href="#storage">Storage</a></nav></aside>
      <section className="settings-content">
        <div className="settings-intro"><span className="material-icon">⚙</span><div><h2>Your reading environment</h2><p>Preferences stay on this device and apply across the documentation workspace.</p></div></div>
        <section className="settings-section" id="appearance"><div className="setting-title"><h3>Appearance</h3><p>Choose a theme or let Cyber-Doc follow the time reported by your browser.</p></div><div className="theme-grid">{themes.map(theme => <button key={theme.value} className={preferences.theme === theme.value ? "selected" : ""} onClick={() => update("theme", theme.value)} aria-pressed={preferences.theme === theme.value}><span className={`theme-swatch ${theme.value}`}><i/><i/><i/></span><b>{theme.label}</b><small>{theme.note}</small></button>)}</div>{preferences.theme === "auto" && <div className="auto-status"><span>◷</span><p><b>{timeLabel} · {resolvedTheme} theme active</b><small>Light from 6:00, forest at 17:00, and dark at 20:00 based on browser time.</small></p></div>}</section>
        <section className="settings-section" id="reading"><div className="setting-title"><h3>Reading</h3><p>Control spacing, typography, and motion.</p></div><SettingRow title="Layout density" description="Adjust spacing in the explorer and page"><div className="segmented"><button className={preferences.density === "comfortable" ? "active" : ""} onClick={() => update("density", "comfortable")}>Comfortable</button><button className={preferences.density === "compact" ? "active" : ""} onClick={() => update("density", "compact")}>Compact</button></div></SettingRow><SettingRow title="Reading typeface" description="Choose the body typeface for documentation"><div className="segmented"><button className={preferences.font === "system" ? "active" : ""} onClick={() => update("font", "system")}>System</button><button className={preferences.font === "serif" ? "active" : ""} onClick={() => update("font", "serif")}>Serif</button></div></SettingRow><SettingRow title="Interface motion" description="Use short transitions when views change"><button className={`switch ${preferences.motion ? "on" : ""}`} role="switch" aria-checked={preferences.motion} onClick={() => update("motion", !preferences.motion)}><i/></button></SettingRow></section>
        <section className="settings-section" id="storage"><div className="setting-title"><h3>Local storage</h3><p>Your folders, pages, and preferences are stored in this browser.</p></div><div className="storage-card"><span>▰</span><p><b>Device-local workspace</b><small>No account or network connection is required.</small></p><button onClick={() => { localStorage.removeItem("cyber-doc-documentation-v3"); location.href = "/"; }}>Reset documentation</button></div></section>
        <button className="reset-preferences" onClick={() => setPreferences(defaultPreferences)}>Restore default preferences</button>
      </section>
    </div>
  </main>;
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="setting-row"><p><b>{title}</b><small>{description}</small></p>{children}</div>;
}
