import { Command } from "commander";
import { apiGet } from "../utils/api";
import { output, error } from "../utils/output";

export function stateCommand(program: Command): void {
  program
    .command("state <sessionId>")
    .description("Get current human state for a session")
    .option("--json", "Output as JSON (for AI agents)", false)
    .action(async (sessionId, opts) => {
      try {
        const data = await apiGet("/v1/state", { session_id: sessionId });
        output(data, opts.json);
      } catch (e: any) {
        error(e.message);
      }
    });
}
