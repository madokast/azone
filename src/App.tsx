import { useEffect, useState } from "react";
import {
  IonApp,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { incrementOpenCount, subscribeConfig } from "./storage/settings";

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
        <IonHeader>
          <IonToolbar>
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
