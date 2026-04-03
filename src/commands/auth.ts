import { Command } from "commander";
import { saveConfig, loadConfig, getApiKey } from "../utils/config";
import { success, error } from "../utils/output";

export function authCommand(program: Command): void {
  const auth = program.command("auth").description("Manage API key authentication");

  auth
    .command("login")
    .description("Save your Nefesh API key")
    .requiredOption("--key <apiKey>", "Your Nefesh API key (nfsh_...)")
    .action((opts) => {
      if (!opts.key.startsWith("nfsh_")) {
        error("Invalid key format. Keys start with nfsh_. Get one at https://nefesh.ai/signup");
      }
      const config = loadConfig();
      config.apiKey = opts.key;
      saveConfig(config);
      success("API key saved to ~/.nefesh/config.json");
    });

  auth
    .command("status")
    .description("Show current authentication status")
    .action(() => {
      const key = getApiKey();
      if (key) {
        const masked = key.slice(0, 10) + "..." + key.slice(-4);
        console.log(`Key: ${masked}`);
        console.log(`Source: ${process.env.NEFESH_API_KEY ? "NEFESH_API_KEY env var" : "~/.nefesh/config.json"}`);
      } else {
        error("No API key configured. Run: nefesh auth login --key YOUR_KEY");
      }
    });

  auth
    .command("logout")
    .description("Remove saved API key")
    .action(() => {
      const config = loadConfig();
      delete config.apiKey;
      saveConfig(config);
      success("API key removed.");
    });
}
