import { useEffect, useState } from "react";
import {
  IonApp,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonText,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import { menuController } from "@ionic/core";
import {
  getConfig,
  incrementOpenCount,
  setTheme as persistTheme,
  subscribeConfig,
  type UiTheme,
} from "./storage/settings";
import { AppMenu } from "./components/layout/AppMenu";

const MENU_ID = "main-menu";
const CONTENT_ID = "main-content";
const FOOTER_ID = "main-footer";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [theme, setTheme] = useState<UiTheme>("system");
  const [showStartingToast, setShowStartingToast] = useState(true);

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
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const root = document.documentElement;
    const body = document.body;
    const applyTheme = (isDark: boolean) => {
      const className = "ion-palette-dark";
      root.classList.toggle(className, isDark);
      body.classList.toggle(className, isDark);
      root.style.colorScheme = isDark ? "dark" : "light";
      body.style.colorScheme = isDark ? "dark" : "light";
    };

    if (theme === "dark") {
      applyTheme(true);
      return;
    }

    if (theme === "light") {
      applyTheme(false);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) =>
      applyTheme(event.matches);

    applyTheme(media.matches);

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    return;
  }, [theme]);

  const handleContentClick = () => {
    if (!isMenuOpen) return;
    void menuController.close(MENU_ID);
  };

  return (
    <IonApp>
      <AppMenu
        contentId={CONTENT_ID}
        menuId={MENU_ID}
        theme={theme}
        onThemeChange={(value) => {
          setTheme(value);
          void persistTheme(value);
        }}
        onMenuOpenChange={setIsMenuOpen}
      />
      <IonPage id={CONTENT_ID} onClick={handleContentClick}>
        <IonToast
          isOpen={showStartingToast}
          message="Starting"
          duration={2500}
          position="bottom"
          positionAnchor={FOOTER_ID}
          onDidDismiss={() => setShowStartingToast(false)}
        />
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Hello World</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText>React + TypeScript + Vite + Ionic React</IonText>
        </IonContent>
        <IonFooter id={FOOTER_ID}>
          <IonToolbar>
            <IonText className="ion-padding-start">
              Open count: {openCount}
            </IonText>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </IonApp>
  );
}
