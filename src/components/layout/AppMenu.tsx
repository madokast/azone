import { List, Popup, SafeArea, Selector } from "antd-mobile";
import { type UiTheme } from "../../storage/settings";

type AppMenuProps = {
  open: boolean;
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
  onClose: () => void;
};

const themeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export function AppMenu({
  open,
  theme,
  onThemeChange,
  onClose,
}: AppMenuProps) {
  return (
    <Popup
      visible={open}
      position="left"
      onMaskClick={onClose}
      onClose={onClose}
      bodyStyle={{ width: "80vw", height: "100vh" }}
    >
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            padding: "16px",
            borderBottom: "1px solid var(--adm-color-border)",
          }}
        >
          Menu
        </div>

        <List>
          <List.Item onClick={onClose}>Home</List.Item>
          <List.Item
            extra={
              <Selector
                options={themeOptions}
                value={[theme]}
                onChange={(values) => {
                  const [next] = values;
                  if (next) onThemeChange(next as UiTheme);
                }}
              />
            }
          >
            Theme
          </List.Item>
        </List>

        <SafeArea position="bottom" />
      </div>
    </Popup>
  );
}
