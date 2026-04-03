import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { getApiKey } from "../utils/config";
import { success, error } from "../utils/output";
import chalk from "chalk";

const MCP_CONFIG = (key?: string) => {
  const config: any = { url: "https://mcp.nefesh.ai/mcp" };
  if (key) config.headers = { "X-Nefesh-Key": key };
  return { mcpServers: { nefesh: config } };
};

const AGENTS: Record<string, { path: string; format: "json" | "merge" }> = {
  cursor: { path: join(homedir(), ".cursor", "mcp.json"), format: "merge" },
  "claude-desktop": { path: join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json"), format: "merge" },
  "claude-code": { path: join(process.cwd(), ".mcp.json"), format: "merge" },
  vscode: { path: join(process.cwd(), ".vscode", "mcp.json"), format: "merge" },
  windsurf: { path: join(homedir(), ".codeium", "windsurf", "mcp_config.json"), format: "merge" },
  kiro: { path: join(homedir(), ".kiro", "mcp.json"), format: "merge" },
  openclaw: { path: join(homedir(), ".config", "openclaw", "mcp.json"), format: "merge" },
};

export function setupCommand(program: Command): void {
  program
    .command("setup <agent>")
    .description("Auto-setup Nefesh MCP for an AI agent")
    .option("--key <apiKey>", "API key to include (optional, uses saved key if available)")
    .action((agent, opts) => {
      const agentConfig = AGENTS[agent.toLowerCase()];
      if (!agentConfig) {
        console.log(chalk.bold("Available agents:"));
        for (const name of Object.keys(AGENTS)) {
          console.log(`  nefesh setup ${name}`);
        }
        error(`Unknown agent: ${agent}`);
      }

      const key = opts.key || getApiKey();
      const mcpConfig = MCP_CONFIG(key);
      const configPath = agentConfig.path;

      // Ensure directory exists
      const dir = join(configPath, "..");
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      // Merge with existing config if file exists
      let finalConfig = mcpConfig;
      if (existsSync(configPath)) {
        try {
          const existing = JSON.parse(readFileSync(configPath, "utf-8"));
          finalConfig = {
            ...existing,
            mcpServers: { ...existing.mcpServers, ...mcpConfig.mcpServers },
          };
        } catch {
          // File exists but can't parse, overwrite
        }
      }

      writeFileSync(configPath, JSON.stringify(finalConfig, null, 2));
      success(`Nefesh MCP configured for ${agent} at ${configPath}`);

      if (!key) {
        console.log(chalk.dim("No API key included. Your agent can get one automatically via request_api_key."));
      }
    });
}
