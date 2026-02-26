import { AppConfig } from "./schema";
import { updateConfigWith } from "./core";

/**
 * Increment-and-get primitive for app open count.
 * Intended to be called once on app startup.
 */
export async function incrementOpenCount(): Promise<AppConfig> {
  return updateConfigWith((current) => ({
    ...current,
    openCount: current.openCount + 1
  }));
}
