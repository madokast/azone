import { useEffect, useState } from "react";
import {
  getConfig,
  incrementOpenCount,
  subscribeConfig,
  type UiTheme,
} from "./storage/settings";
import { showToast } from "./ui/toast";
import AppRouter from "./routes";

export default function App() {
  const [, setOpenCount] = useState(0);
  const [theme, setTheme] = useState<UiTheme>("system");

  useEffect(() => {
    let cancelled = false;
    const initialConfig = getConfig();
    const initialTheme = (initialConfig.ui?.theme ?? "system") as UiTheme;
    if (!cancelled) setTheme(initialTheme);

    incrementOpenCount().then((next) => {
      if (!cancelled) setOpenCount(next.openCount);
    });

    const unsubscribe = subscribeConfig((config) => {
      if (cancelled) return;
      setOpenCount(config.openCount);
      const nextTheme = (config.ui?.theme ?? "system") as UiTheme;
      setTheme(nextTheme);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    showToast("Starting");
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

    if (media.addListener) {
      media.addListener(handleChange);
      return () => media.removeListener(handleChange);
    }

    return;
  }, [theme]);

  return (
    <AppRouter />
  );
}
