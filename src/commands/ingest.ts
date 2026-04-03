import { Command } from "commander";
import { apiPost } from "../utils/api";
import { output, error } from "../utils/output";

export function ingestCommand(program: Command): void {
  program
    .command("ingest")
    .description("Send biometric signals, get unified state back")
    .requiredOption("--session <id>", "Session ID")
    .option("--heart-rate <bpm>", "Heart rate (30-220)", parseFloat)
    .option("--rmssd <ms>", "HRV RMSSD in ms", parseFloat)
    .option("--sdnn <ms>", "HRV SDNN in ms", parseFloat)
    .option("--tone <tone>", "Voice tone (calm|tense|anxious|hostile)")
    .option("--sentiment <val>", "Text sentiment (-1.0 to 1.0)", parseFloat)
    .option("--expression <expr>", "Facial expression (relaxed|neutral|tense)")
    .option("--urgency <level>", "Urgency (low|medium|high|critical)")
    .option("--subject <id>", "Subject ID (for trigger memory)")
    .option("--device <name>", "Source device name")
    .option("--json", "Output as JSON (for AI agents)", false)
    .action(async (opts) => {
      try {
        const payload: Record<string, any> = {
          session_id: opts.session,
          timestamp: new Date().toISOString(),
        };
        if (opts.heartRate) payload.heart_rate = opts.heartRate;
        if (opts.rmssd) payload.rmssd = opts.rmssd;
        if (opts.sdnn) payload.sdnn = opts.sdnn;
        if (opts.tone) payload.tone = opts.tone;
        if (opts.sentiment !== undefined) payload.sentiment = opts.sentiment;
        if (opts.expression) payload.expression = opts.expression;
        if (opts.urgency) payload.urgency = opts.urgency;
        if (opts.subject) payload.subject_id = opts.subject;
        if (opts.device) payload.source_device = opts.device;

        const data = await apiPost("/v1/ingest", payload);
        output(data, opts.json);
      } catch (e: any) {
        error(e.message);
      }
    });
}
