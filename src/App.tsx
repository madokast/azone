import { useEffect, useState } from "react";
import {
  getConfig,
  incrementOpenCount,
  subscribeConfig,
  setTheme as persistTheme,
  type UiTheme,
} from "./storage/settings";
import { showToast } from "./components/toast";
import AppRouter from "./routes";

export default function App() {
  const [theme, setTheme] = useState<UiTheme>(() => {
    const initialConfig = getConfig();
    return (initialConfig.ui?.theme ?? "system") as UiTheme;
  });

  useEffect(() => {
    let cancelled = false;
    incrementOpenCount().then((next) => {
      if (!cancelled) showToast(`Starting (${next.openCount})`);
    });

    const unsubscribe = subscribeConfig((config) => {
      if (cancelled) return;
      const nextTheme = (config.ui?.theme ?? "system") as UiTheme;
      setTheme(nextTheme);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const root = document.documentElement;
    const body = document.body;
    const applyTheme = (next: "light" | "dark") => {
      root.setAttribute("data-prefers-color-scheme", next);
      root.style.colorScheme = next;
      body.style.colorScheme = next;
    };

    if (theme === "dark") {
      applyTheme("dark");
      return;
    }

    if (theme === "light") {
      applyTheme("light");
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncFromSystem = (isDark: boolean) =>
      applyTheme(isDark ? "dark" : "light");
    const handleChange = (event: MediaQueryListEvent) => {
      syncFromSystem(event.matches);
    };

    syncFromSystem(media.matches);

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    return;
  }, [theme]);

  return (
    <AppRouter theme={theme} onThemeChange={nextTheme => {
      setTheme(nextTheme);
      persistTheme(nextTheme);
      showToast(`(${nextTheme})`);
    }} />
  );
}
