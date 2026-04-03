import { Command } from "commander";
import { apiPost } from "../utils/api";
import { output, error } from "../utils/output";
import chalk from "chalk";

const SCENARIOS: Record<string, { name: string; generate: (tick: number) => Record<string, any> }> = {
  calm: {
    name: "Calm baseline",
    generate: (tick) => ({
      heart_rate: 65 + Math.round(Math.random() * 6 - 3),
      rmssd: 55 + Math.round(Math.random() * 10 - 5),
      tone: "calm",
      sentiment: 0.3 + Math.random() * 0.3,
    }),
  },
  stress_spike: {
    name: "Stress spike after 30s",
    generate: (tick) => {
      const stressed = tick > 30;
      return {
        heart_rate: stressed ? 95 + Math.round(Math.random() * 10) : 68 + Math.round(Math.random() * 6 - 3),
        rmssd: stressed ? 18 + Math.round(Math.random() * 6) : 52 + Math.round(Math.random() * 10 - 5),
        tone: stressed ? "tense" : "calm",
        sentiment: stressed ? -0.5 + Math.random() * 0.3 : 0.2 + Math.random() * 0.3,
      };
    },
  },
  recovery: {
    name: "Stress then recovery",
    generate: (tick) => {
      const phase = tick < 40 ? "stress" : tick < 80 ? "recovery" : "calm";
      if (phase === "stress") return { heart_rate: 92 + Math.round(Math.random() * 8), rmssd: 20 + Math.round(Math.random() * 5), tone: "anxious", sentiment: -0.6 };
      if (phase === "recovery") return { heart_rate: 78 + Math.round(Math.random() * 6 - 3), rmssd: 38 + Math.round(Math.random() * 8), tone: "calm", sentiment: 0.1 };
      return { heart_rate: 66 + Math.round(Math.random() * 4 - 2), rmssd: 55 + Math.round(Math.random() * 8), tone: "calm", sentiment: 0.4 };
    },
  },
  focused: {
    name: "Deep focus session",
    generate: (tick) => ({
      heart_rate: 75 + Math.round(Math.random() * 8 - 4),
      rmssd: 35 + Math.round(Math.random() * 8 - 4),
      tone: "focused",
      sentiment: 0.0 + Math.random() * 0.2,
    }),
  },
};

export function simulateCommand(program: Command): void {
  program
    .command("simulate")
    .description("Stream simulated biometric data for testing")
    .option("--scenario <name>", "Scenario: calm, stress_spike, recovery, focused", "stress_spike")
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
