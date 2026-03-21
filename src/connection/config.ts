import { readFileSync, writeFileSync } from "fs";

interface AppConfig {
  portPath?: string;
  baudRate?: number;
}

const CONFIG_PATH = "./config.json";

export function loadConfig(): AppConfig {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export function saveConfig(config: AppConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
