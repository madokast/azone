import { useEffect, useState } from "react";
import {
  getConfig,
  incrementOpenCount,
  subscribeConfig,
  setTheme as persistTheme,
  updateS3Config as persistS3Config,
  type UiTheme,
  S3Config,
  defaultS3Config,
  defaultUiConfig,
  updateEncryptConfig as persistEncryptConfig,
} from "./services/settings";
import { showToast } from "./components/toast";
import AppRouter from "./routes";
import { PrefixObjectStorage, StoragePostService } from "./services/posts";
import { CryptoObjectStorage, IndexDBObjectStorage, MemoryObjectStorage, ObjectStorage } from "./services/object-storage";
import { createS3ObjectStorage } from "./services/object-storage/s3.fs";
import SimpleCrypto from "./services/crypto-wrapper";
import { defaultEncryptConfig, EncryptConfig } from "./services/settings/schema";
import { StorageAttachmentService } from "./services/attachments/storage.service";
import { clearIndexDB } from "./services/object-storage/indexdb.cache.fs";
import MutexPostService from "./services/posts/mutex.service";

export default function App() {
  const [theme, setTheme] = useState<UiTheme>(() => {
    const initialConfig = getConfig();
    return (initialConfig.ui?.theme ?? defaultUiConfig.theme) as UiTheme;
  });

  const [s3Config, setS3Config0] = useState<S3Config>(() => {
    const initialConfig = getConfig();
    return initialConfig.s3 ?? defaultS3Config;
  });

  const setS3Config = (next: S3Config) => {
    clearIndexDB(s3Config.workDir);
    setS3Config0(next);
  }



  const [encryptConfig, setEncryptConfig] = useState<EncryptConfig>(() => {
    const initialConfig = getConfig();
    return initialConfig.encrypt ?? defaultEncryptConfig;
  });

  useEffect(() => {
    let cancelled = false;
    incrementOpenCount().then((next) => {
      if (!cancelled) showToast(`Starting (${next.openCount})`);
    });

    const unsubscribe = subscribeConfig((config) => {
      if (cancelled) return;
      const nextTheme = (config.ui?.theme ?? "system") as UiTheme;
      setTheme(nextTheme);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const root = document.documentElement;
    const body = document.body;
    const applyTheme = (next: "light" | "dark") => {
      root.setAttribute("data-prefers-color-scheme", next);
      root.style.colorScheme = next;
      body.style.colorScheme = next;
    };

    if (theme === "dark") {
      applyTheme("dark");
      return;
    }

    if (theme === "light") {
      applyTheme("light");
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncFromSystem = (isDark: boolean) =>
      applyTheme(isDark ? "dark" : "light");
    const handleChange = (event: MediaQueryListEvent) => {
      syncFromSystem(event.matches);
    };

    syncFromSystem(media.matches);

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    return;
  }, [theme]);


  let objectStorage: ObjectStorage;

  try {
    objectStorage = createS3ObjectStorage(s3Config);
    objectStorage = new PrefixObjectStorage(s3Config.workDir, objectStorage);
  } catch (error) {
    showToast(`S3 Conn Err. Use Memory Storage`);
    objectStorage = new MemoryObjectStorage();
  }
  if (encryptConfig.password && encryptConfig.password.length > 0) {
    const crypto = new SimpleCrypto(encryptConfig.password);
    objectStorage = new CryptoObjectStorage(crypto, objectStorage);
  }
  objectStorage = new IndexDBObjectStorage(s3Config.workDir, objectStorage);
  
  const attachmentService = new StorageAttachmentService("attachments", objectStorage);

  const postService = new MutexPostService(
    new StoragePostService("posts", objectStorage, attachmentService)
  );

  return (
    <AppRouter theme={theme} onThemeChange={nextTheme => {
      persistTheme(nextTheme).then(setTheme)
      showToast(`(${nextTheme})`);
    }} s3Config={s3Config} onS3ConfigChange={nextS3Config => {
      persistS3Config(nextS3Config).then(setS3Config)
    }} postService={postService} attachmentService={attachmentService} 
    encryptConfig={encryptConfig} onEncryptConfigChange={nextEncryptConfig => {
      persistEncryptConfig(nextEncryptConfig).then(setEncryptConfig)
    }} />
  );
}
