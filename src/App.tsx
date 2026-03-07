import { useEffect, useState } from "react";
import {
  getConfig,
  incrementOpenCount,
  subscribeConfig,
  setTheme as persistTheme,
  updateS3Config as persistS3Config,
  type UiTheme,
  S3Config,
  defaultS3Config,
  defaultUiConfig,
} from "./services/settings";
import { showToast } from "./components/toast";
import AppRouter from "./routes";

export default function App() {
  const [theme, setTheme] = useState<UiTheme>(() => {
    const initialConfig = getConfig();
    return (initialConfig.ui?.theme ?? defaultUiConfig.theme) as UiTheme;
  });

  const [s3Config, setS3Config] = useState<S3Config>(() => {
    const initialConfig = getConfig();
    return initialConfig.s3 ?? defaultS3Config;
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
      persistTheme(nextTheme).then(setTheme)
      showToast(`(${nextTheme})`);
    }} s3Config={s3Config} onS3ConfigChange={nextS3Config => {
      persistS3Config(nextS3Config).then(setS3Config)
    }} />
  );
}
