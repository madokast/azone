/**
 * Settings module schema for local-only app configuration.
 * Keep this small and serializable.
 */
export type UiTheme = "light" | "dark" | "system";

export type UiConfig = {
  theme: UiTheme;
};

export type S3Config = {
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle: boolean;
  workDir: string;
};

export type EncryptConfig = {
  password?: string;
};

export type AppConfig = {
  version: 1;
  openCount: number;
  ui?: UiConfig;
  s3?: S3Config;
  encrypt?: EncryptConfig;
};

export const STORAGE_KEY = "azone.config";
export const CONFIG_VERSION = 1 as const;

export const defaultUiConfig: UiConfig = {
  theme: "system",
};

export const defaultS3Config: S3Config = {
  workDir: "azone",
  forcePathStyle: false,
};

export const defaultEncryptConfig: EncryptConfig = {
  password: undefined,
};

export const defaultConfig: AppConfig = {
  version: CONFIG_VERSION,
  openCount: 0,
  ui: defaultUiConfig,
  s3: defaultS3Config,
  encrypt: defaultEncryptConfig,
};
