import { UiConfig, UiTheme, defaultUiConfig } from "./schema";
import { getConfig, updateConfigWith } from "./core";

/**
 * Read UI-specific settings.
 */
export function getUiConfig(): UiConfig {
  return getConfig().ui ?? defaultUiConfig;
}

/**
 * Merge UI settings and persist.
 */
export async function updateUiConfig(
  partial: Partial<UiConfig>
): Promise<UiConfig> {
  const config = await updateConfigWith((current) => ({
    ...current,
    ui: { ...defaultUiConfig, ...current.ui, ...partial }
  }));
  return config.ui ?? defaultUiConfig;
}

export async function setTheme(theme: UiConfig["theme"]): Promise<UiTheme> {
  const config = await updateUiConfig({ theme });
  return config.theme ?? defaultUiConfig.theme;
}
