export type AppConfig = {
  version: 1;
  openCount: number;
};

const STORAGE_KEY = "azone.config";
const CONFIG_VERSION = 1 as const;

const defaultConfig: AppConfig = {
  version: CONFIG_VERSION,
  openCount: 0
};

function loadConfig(): AppConfig {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultConfig };

  try {
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return {
      ...defaultConfig,
      ...parsed,
      version: CONFIG_VERSION
    };
  } catch {
    return { ...defaultConfig };
  }
}

function saveConfig(config: AppConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getConfig(): AppConfig {
  return loadConfig();
}

export function updateConfig(partial: Partial<AppConfig>): AppConfig {
  const current = loadConfig();
  const next: AppConfig = { ...current, ...partial, version: CONFIG_VERSION };
  saveConfig(next);
  return next;
}

export function incrementOpenCount(): AppConfig {
  const current = loadConfig();
  const next: AppConfig = {
    ...current,
    openCount: current.openCount + 1,
    version: CONFIG_VERSION
  };
  saveConfig(next);
  return next;
}
