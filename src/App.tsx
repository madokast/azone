import { useEffect, useState } from "react";
import {
  Button,
  NavBar,
  SafeArea,
} from "antd-mobile";
import {
  getConfig,
  incrementOpenCount,
  setTheme as persistTheme,
  subscribeConfig,
  type UiTheme,
} from "./storage/settings";
import { AppMenu } from "./components/layout/AppMenu";
import { showToast } from "./ui/toast";
import { appColor } from "./styles/theme-tokens";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        // 使用主题变量，亮色/暗色模式会自动切换
        background: appColor.bg,
        color: appColor.text,
      }}
    >
      <AppMenu
        open={isMenuOpen}
        theme={theme}
        onThemeChange={(value) => {
          setTheme(value);
          void persistTheme(value);
        }}
        onClose={() => setIsMenuOpen(false)}
      />

      <NavBar
        back={null}
        left={
          <Button
            fill="none"
            size="small"
            onClick={() => setIsMenuOpen(true)}
          >
            Menu
          </Button>
        }
      >
        Hello World
      </NavBar>

      <div style={{ flex: 1, padding: 16 }}>
        React + TypeScript + Vite + Ant Design Mobile
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${appColor.border}`,
          background: appColor.surface,
        }}
      >
        Open count: {openCount}
      </div>
      <SafeArea position="bottom" />
    </div>
  );
}
