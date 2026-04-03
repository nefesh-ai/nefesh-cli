import { Command } from "commander";
import { apiGet } from "../utils/api";
import { output, error } from "../utils/output";

export function historyCommand(program: Command): void {
  program
    .command("history <sessionId>")
    .description("Get state history with trend analysis")
    .option("--minutes <n>", "Lookback window in minutes", "5")
    .option("--json", "Output as JSON (for AI agents)", false)
    .action(async (sessionId, opts) => {
      try {
        const data = await apiGet("/v1/history", { session_id: sessionId, minutes: opts.minutes });
        output(data, opts.json);
      } catch (e: any) {
        error(e.message);
      }
    });
}
