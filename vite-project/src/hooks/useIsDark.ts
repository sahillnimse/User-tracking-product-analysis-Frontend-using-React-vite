// src/hooks/useIsDark.ts
import { useState, useEffect } from "react";

function detect(): boolean {
  return (
    document.documentElement.classList.contains("dark") ||
    document.documentElement.getAttribute("data-theme") === "dark" ||
    document.body.classList.contains("dark")
  );
}

export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return detect(); } catch { return false; }
  });
  useEffect(() => {
    setIsDark(detect());
    const obs = new MutationObserver(() => setIsDark(detect()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

/** Pick a class string based on dark/light mode */
export function tw(dark: boolean, darkCls: string, lightCls: string): string {
  return dark ? darkCls : lightCls;
}