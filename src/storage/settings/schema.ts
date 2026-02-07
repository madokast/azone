/**
 * Settings module schema for local-only app configuration.
 * Keep this small and serializable.
 */
export type UiTheme = "light" | "dark" | "system";

export type UiConfig = {
  theme?: UiTheme;
  language?: string;
};

export type S3Config = {
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

export type AppConfig = {
  version: 1;
  openCount: number;
  ui?: UiConfig;
  s3?: S3Config;
};

export const STORAGE_KEY = "azone.config";
export const CONFIG_VERSION = 1 as const;

export const defaultConfig: AppConfig = {
  version: CONFIG_VERSION,
  openCount: 0,
  ui: { theme: "system" },
  s3: {}
};
