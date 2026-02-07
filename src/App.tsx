import { useEffect, useState, type CSSProperties } from "react";
import {
  IonApp,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
  IonText,
} from "@ionic/react";
import { incrementOpenCount, subscribeConfig } from "./storage/settings";

const contentStyle = {
  "--background": "#f7f7fb",
} as CSSProperties;

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
          <IonGrid style={{ minHeight: "100%" }}>
            <IonRow
              className="ion-justify-content-center ion-align-items-center"
              style={{ minHeight: "100%" }}
            >
              <IonCol size="12" sizeMd="8" sizeLg="6" style={{ maxWidth: 720 }}>
                <IonCard>
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
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    </IonApp>
  );
}
