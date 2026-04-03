import { Command } from "commander";
import { apiDelete } from "../utils/api";
import { output, error, success } from "../utils/output";

export function deleteCommand(program: Command): void {
  program
    .command("delete <subjectId>")
    .description("GDPR-compliant deletion of all data for a subject")
    .option("--confirm", "Skip confirmation prompt")
    .option("--json", "Output as JSON (for AI agents)", false)
    .action(async (subjectId, opts) => {
      if (!opts.confirm) {
        error("This permanently deletes all data. Add --confirm to proceed.");
      }
      try {
        const data = await apiDelete(`/v1/subjects/${encodeURIComponent(subjectId)}`);
        output(data, opts.json);
      } catch (e: any) {
        error(e.message);
      }
    });
}
