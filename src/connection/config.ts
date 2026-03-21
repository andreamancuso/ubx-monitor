import { readFileSync, writeFileSync } from "fs";

interface AppConfig {
  portPath?: string;
  baudRate?: number;
  coordFormat?: number;
}

const CONFIG_PATH = "./config.json";

let cache: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cache) {
    try {
      cache = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    } catch {
      cache = {};
    }
  }
  return cache;
}

export function updateConfig(partial: Partial<AppConfig>): void {
  Object.assign(getConfig(), partial);
}

process.on("exit", () => {
  if (cache) {
    writeFileSync(CONFIG_PATH, JSON.stringify(cache, null, 2));
  }
});
