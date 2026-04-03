import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".nefesh");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface NefeshConfig {
  apiKey?: string;
  baseUrl?: string;
}

export function loadConfig(): NefeshConfig {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function saveConfig(config: NefeshConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey(): string | undefined {
  return process.env.NEFESH_API_KEY || loadConfig().apiKey;
}

export function getBaseUrl(): string {
  return process.env.NEFESH_API_URL || loadConfig().baseUrl || "https://api.nefesh.ai";
}
