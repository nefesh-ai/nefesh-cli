import { Command } from "commander";
import { apiGet } from "../utils/api";
import { output, error } from "../utils/output";

export function triggersCommand(program: Command): void {
  program
    .command("triggers <subjectId>")
    .description("Get psychological trigger profile")
    .option("--json", "Output as JSON (for AI agents)", false)
    .action(async (subjectId, opts) => {
      try {
        const data = await apiGet("/v1/triggers", { subject_id: subjectId });
        output(data, opts.json);
      } catch (e: any) {
        error(e.message);
      }
    });
}
