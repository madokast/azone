import { type CSSProperties } from "react";
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { type UiTheme } from "../../storage/settings";

type AppMenuProps = {
  contentId: string;
  menuId: string;
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
  onMenuOpenChange: (isOpen: boolean) => void;
};

const menuStyle = {
  "--width": "80vw",
} as CSSProperties;

export function AppMenu({
  contentId,
  menuId,
  theme,
  onThemeChange,
  onMenuOpenChange,
}: AppMenuProps) {
  return (
    <IonMenu
      menuId={menuId}
      contentId={contentId}
      type="push"
      swipeGesture={true}
      style={menuStyle}
      onIonDidOpen={() => onMenuOpenChange(true)}
      onIonDidClose={() => onMenuOpenChange(false)}
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
              onIonChange={(event) =>
                onThemeChange(event.detail.value as UiTheme)
              }
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
  );
}
