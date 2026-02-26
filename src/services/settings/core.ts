import { AppConfig, CONFIG_VERSION, defaultConfig, STORAGE_KEY } from "./schema";

/**
 * Core settings access for local-only app configuration.
 * Typical use: read/update config at startup and subscribe to changes across tabs.
 */

const CHANNEL_NAME = "azone.config.channel";

// Internal: guard for SSR or non-window environments.
function isBrowser() {
  return typeof window !== "undefined";
}

// Internal: ensure defaults, version, and nested object merging.
function normalizeConfig(config: Partial<AppConfig>): AppConfig {
  return {
    ...defaultConfig,
    ...config,
    ui: { ...defaultConfig.ui, ...config.ui },
    s3: { ...defaultConfig.s3, ...config.s3 },
    version: CONFIG_VERSION
  };
}

// Internal: load config from storage with defaults and safe parsing.
function loadConfig(): AppConfig {
  if (!isBrowser()) return { ...defaultConfig };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultConfig };

  try {
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return normalizeConfig(parsed);
  } catch {
    return { ...defaultConfig };
  }
}

// Internal: persist config to storage.
function saveConfig(config: AppConfig) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Internal: best-effort broadcast channel for cross-tab sync.
function getChannel(): BroadcastChannel | null {
  if (!isBrowser() || typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL_NAME);
}

// Internal: notify other tabs that config changed.
function notifyConfigChanged() {
  const channel = getChannel();
  if (!channel) return;
  channel.postMessage("changed");
  channel.close();
}

// Internal: serialize updates across tabs when Web Locks API is available.
async function withConfigLock<T>(fn: () => T | Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return navigator.locks.request("azone.config", { mode: "exclusive" }, () =>
      fn()
    );
  }
  return fn();
}

/**
 * Read current config (merged with defaults). Safe to call anytime.
 */
export function getConfig(): AppConfig {
  return loadConfig();
}

/**
 * Merge and persist partial config. Returns the updated config.
 * Use for general settings updates (theme, language, endpoints, etc.).
 */
export async function updateConfig(
  partial: Partial<AppConfig>
): Promise<AppConfig> {
  return updateConfigWith((current) => ({
    ...current,
    ...partial,
    ui: { ...current.ui, ...partial.ui },
    s3: { ...current.s3, ...partial.s3 }
  }));
}

/**
 * Advanced: update config via a function under a cross-tab lock.
 * Use this when you need to merge nested objects safely.
 */
export async function updateConfigWith(
  updater: (current: AppConfig) => AppConfig
): Promise<AppConfig> {
  return withConfigLock(() => {
    const current = loadConfig();
    const next = normalizeConfig(updater(current));
    saveConfig(next);
    notifyConfigChanged();
    return next;
  });
}

/**
 * Subscribe to config changes across tabs/windows.
 * Returns an unsubscribe function.
 */
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
