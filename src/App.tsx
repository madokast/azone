import { useEffect, useState, type CSSProperties } from "react";
import {
  IonApp,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonText,
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

const MENU_ID = "main-menu";
const CONTENT_ID = "main-content";
const menuStyle = {
  "--width": "80vw",
} as CSSProperties;

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

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [theme]);

  const handleContentClick = () => {
    if (!isMenuOpen) return;
    void menuController.close(MENU_ID);
  };

  return (
    <IonApp>
      <IonMenu
        menuId={MENU_ID}
        contentId={CONTENT_ID}
        type="push"
        swipeGesture={true}
        style={menuStyle}
        onIonDidOpen={() => setIsMenuOpen(true)}
        onIonDidClose={() => setIsMenuOpen(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonMenuToggle>
              <IonItem button detail={false}>
                <IonLabel>Home</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonItem>
              <IonLabel>Theme</IonLabel>
              <IonSelect
                value={theme}
                interface="popover"
                onIonChange={(event) => {
                  const value = event.detail.value as UiTheme;
                  setTheme(value);
                  void persistTheme(value);
                }}
                slot="end"
              >
                <IonSelectOption value="system">System</IonSelectOption>
                <IonSelectOption value="light">Light</IonSelectOption>
                <IonSelectOption value="dark">Dark</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
      <IonPage id={CONTENT_ID} onClick={handleContentClick}>
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
        <IonFooter>
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
