import { S3Config } from "./schema";
import { getConfig, updateConfigWith } from "./core";

/**
 * Read S3-specific settings.
 */
export function getS3Config(): S3Config {
  return getConfig().s3 ?? {};
}

/**
 * Merge S3 settings and persist.
 */
export async function updateS3Config(
  partial: Partial<S3Config>
): Promise<void> {
  await updateConfigWith((current) => ({
    ...current,
    s3: { ...current.s3, ...partial }
  }));
}

export async function setS3Endpoint(endpoint: string): Promise<void> {
  await updateS3Config({ endpoint });
}

export async function setS3Credentials(
  accessKeyId: string,
  secretAccessKey: string
): Promise<void> {
  await updateS3Config({ accessKeyId, secretAccessKey });
}
