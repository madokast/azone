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
  IonTitle,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { menuController } from "@ionic/core";
import { incrementOpenCount, subscribeConfig } from "./storage/settings";

const MENU_ID = "main-menu";
const CONTENT_ID = "main-content";
const menuStyle = {
  "--width": "80vw",
} as CSSProperties;

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    incrementOpenCount().then((next) => {
      if (!cancelled) setOpenCount(next.openCount);
    });

    const unsubscribe = subscribeConfig((config) => {
      if (!cancelled) setOpenCount(config.openCount);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

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
