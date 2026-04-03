import { Command } from "commander";
import { apiPost } from "../utils/api";
import { output, error } from "../utils/output";
import chalk from "chalk";

const SCENARIOS: Record<string, { name: string; generate: (tick: number) => Record<string, any> }> = {
  calm: {
    name: "Calm state (score 0-19)",
    generate: (tick) => ({
      heart_rate: 62 + Math.round(Math.random() * 6 - 3),
      rmssd: 60 + Math.round(Math.random() * 10 - 5),
      tone: "calm",
      sentiment: 0.4 + Math.random() * 0.3,
    }),
  },
  relaxed: {
    name: "Relaxed state (score 20-39)",
    generate: (tick) => ({
      heart_rate: 68 + Math.round(Math.random() * 6 - 3),
      rmssd: 50 + Math.round(Math.random() * 10 - 5),
      tone: "calm",
      sentiment: 0.2 + Math.random() * 0.3,
    }),
  },
  focused: {
    name: "Focused state (score 40-59)",
    generate: (tick) => ({
      heart_rate: 75 + Math.round(Math.random() * 8 - 4),
      rmssd: 35 + Math.round(Math.random() * 8 - 4),
      tone: "focused",
      sentiment: 0.0 + Math.random() * 0.2,
    }),
  },
  stressed: {
    name: "Stressed state (score 60-79)",
    generate: (tick) => ({
      heart_rate: 92 + Math.round(Math.random() * 10 - 5),
      rmssd: 20 + Math.round(Math.random() * 6 - 3),
      tone: "tense",
      sentiment: -0.4 + Math.random() * 0.2,
    }),
  },
  acute_stress: {
    name: "Acute stress state (score 80-100)",
    generate: (tick) => ({
      heart_rate: 105 + Math.round(Math.random() * 15),
      rmssd: 12 + Math.round(Math.random() * 5),
      tone: "hostile",
      sentiment: -0.8 + Math.random() * 0.2,
    }),
  },
};

export function simulateCommand(program: Command): void {
  program
    .command("simulate")
    .description("Stream simulated biometric data for testing")
    .option("--scenario <name>", "Scenario: calm, relaxed, focused, stressed, acute_stress", "relaxed")
    .option("--session <id>", "Session ID", `sim-${Date.now()}`)
    .option("--duration <seconds>", "Duration in seconds", "120")
    .option("--interval <seconds>", "Seconds between sends", "2")
    .option("--json", "Output as JSON (for AI agents)", false)
    .action(async (opts) => {
      const scenario = SCENARIOS[opts.scenario];
      if (!scenario) {
        error(`Unknown scenario: ${opts.scenario}. Available: ${Object.keys(SCENARIOS).join(", ")}`);
      }

      const duration = parseInt(opts.duration);
      const interval = parseInt(opts.interval);

      if (!opts.json) {
        console.log(chalk.bold(`Simulating: ${scenario.name}`));
        console.log(chalk.dim(`Session: ${opts.session} | Duration: ${duration}s | Interval: ${interval}s`));
        console.log(chalk.dim("Press Ctrl+C to stop.\n"));
      }

      let tick = 0;
      const timer = setInterval(async () => {
        if (tick >= duration) {
          clearInterval(timer);
          if (!opts.json) console.log(chalk.green("\nSimulation complete."));
          process.exit(0);
        }

        try {
          const signals = scenario.generate(tick);
          const payload = {
            session_id: opts.session,
            timestamp: new Date().toISOString(),
            ...signals,
          };
          const data = await apiPost("/v1/ingest", payload);

          if (opts.json) {
            console.log(JSON.stringify(data));
          } else {
            const stateColors: Record<string, (s: string) => string> = {
              calm: chalk.green, relaxed: chalk.cyan, focused: chalk.yellow,
              stressed: chalk.hex("#F97316"), acute_stress: chalk.red,
            };
            const colorFn = stateColors[data.state] || chalk.white;
            const bar = "█".repeat(Math.round(data.stress_score / 5)) + "░".repeat(20 - Math.round(data.stress_score / 5));
            console.log(`${chalk.dim(`[${tick}s]`)} ${colorFn(data.state.padEnd(13))} ${bar} ${data.stress_score}`);
          }
        } catch (e: any) {
          if (!opts.json) console.log(chalk.red(`  [${tick}s] Error: ${e.message}`));
        }

        tick += interval;
      }, interval * 1000);
    });
}
