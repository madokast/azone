import { useEffect, useState, type CSSProperties } from "react";
import {
  IonApp,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonPage,
  IonText,
} from "@ionic/react";
import { incrementOpenCount, subscribeConfig } from "./storage/settings";

const contentStyle = {
  "--background": "#f7f7fb",
} as CSSProperties;

const containerStyle: CSSProperties = {
  minHeight: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle: CSSProperties = {
  width: "min(720px, 100%)",
};

export default function App() {
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

  return (
    <IonApp>
      <IonPage>
        <IonContent fullscreen className="ion-padding" style={contentStyle}>
          <div style={containerStyle}>
            <IonCard style={cardStyle}>
              <IonCardHeader className="ion-text-center">
                <IonCardTitle>Hello World</IonCardTitle>
                <IonCardSubtitle>
                  React + TypeScript + Vite + Ionic React
                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent className="ion-text-center">
                <IonText color="medium">Open count: {openCount}</IonText>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
}
