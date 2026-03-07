import { defaultS3Config, S3Config } from "./schema";
import { getConfig, updateConfigWith } from "./core";

/**
 * Read S3-specific settings.
 */
export function getS3Config(): S3Config {
  return getConfig().s3 ?? defaultS3Config;
}
/**
 * Merge S3 settings and persist.
 */
export async function updateS3Config(
  partial: Partial<S3Config>
): Promise<S3Config> {
  const config = await updateConfigWith((current) => ({
    ...current,
    s3: { ...defaultS3Config, ...current.s3, ...partial },
  }));
  return config.s3 ?? defaultS3Config;
}

