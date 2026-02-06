export type AppConfig = {
  version: 1;
  openCount: number;
};

const STORAGE_KEY = "azone.config";
const CONFIG_VERSION = 1 as const;
const CHANNEL_NAME = "azone.config.channel";

const defaultConfig: AppConfig = {
  version: CONFIG_VERSION,
  openCount: 0
};

function isBrowser() {
  return typeof window !== "undefined";
}

function loadConfig(): AppConfig {
  if (!isBrowser()) return { ...defaultConfig };
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
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function getChannel(): BroadcastChannel | null {
  if (!isBrowser() || typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL_NAME);
}

function notifyConfigChanged() {
  const channel = getChannel();
  if (!channel) return;
  channel.postMessage("changed");
  channel.close();
}

async function withConfigLock<T>(fn: () => T | Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return navigator.locks.request("azone.config", { mode: "exclusive" }, () =>
      fn()
    );
  }
  return fn();
}

export function getConfig(): AppConfig {
  return loadConfig();
}

export async function updateConfig(
  partial: Partial<AppConfig>
): Promise<AppConfig> {
  return withConfigLock(() => {
    const current = loadConfig();
    const next: AppConfig = { ...current, ...partial, version: CONFIG_VERSION };
    saveConfig(next);
    notifyConfigChanged();
    return next;
  });
}

export async function incrementOpenCount(): Promise<AppConfig> {
  return withConfigLock(() => {
    const current = loadConfig();
    const next: AppConfig = {
      ...current,
      openCount: current.openCount + 1,
      version: CONFIG_VERSION
    };
    saveConfig(next);
    notifyConfigChanged();
    return next;
  });
}

export function subscribeConfig(onChange: (config: AppConfig) => void) {
  if (!isBrowser()) return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange(loadConfig());
  };

  window.addEventListener("storage", handleStorage);

  const channel = getChannel();
  if (channel) {
    channel.onmessage = () => onChange(loadConfig());
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    channel?.close();
  };
}
