import { UiConfig } from "./schema";
import { getConfig, updateConfigWith } from "./core";

/**
 * Read UI-specific settings.
 */
export function getUiConfig(): UiConfig {
  return getConfig().ui ?? {};
}

/**
 * Merge UI settings and persist.
 */
export async function updateUiConfig(
  partial: Partial<UiConfig>
): Promise<void> {
  await updateConfigWith((current) => ({
    ...current,
    ui: { ...current.ui, ...partial }
  }));
}

export async function setLanguage(language: string): Promise<void> {
  await updateUiConfig({ language });
}

export async function setTheme(theme: UiConfig["theme"]): Promise<void> {
  await updateUiConfig({ theme });
}
