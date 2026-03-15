import { EncryptConfig, defaultEncryptConfig } from "./schema";
import { getConfig, updateConfigWith } from "./core";

export function getEncryptConfig(): EncryptConfig {
  return getConfig().encrypt ?? defaultEncryptConfig;
}

export async function updateEncryptConfig(
    partial: Partial<EncryptConfig>): Promise<EncryptConfig> {
  const config = await updateConfigWith((current) => ({
    ...current,
    encrypt: { ...defaultEncryptConfig,  ...current.encrypt, ...partial },
  }));
  return config.encrypt ?? defaultEncryptConfig;
}

export async function setEncryptPassword(password: string) : Promise<EncryptConfig> {
  return updateEncryptConfig({ password });
}

