import chalk from "chalk";

export function output(data: any, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  // Human-readable state output
  if (data.state && data.stress_score !== undefined) {
    const stateColors: Record<string, (s: string) => string> = {
      calm: chalk.green,
      relaxed: chalk.cyan,
      focused: chalk.yellow,
      stressed: chalk.hex("#F97316"),
      acute_stress: chalk.red,
    };
    const colorFn = stateColors[data.state] || chalk.white;

    console.log(`${chalk.bold("State:")} ${colorFn(data.state)}`);
    console.log(`${chalk.bold("Score:")} ${data.stress_score}/100`);
    if (data.confidence !== undefined) console.log(`${chalk.bold("Confidence:")} ${data.confidence}`);
    if (data.suggested_action) console.log(`${chalk.bold("Action:")} ${data.suggested_action}`);
    if (data.action_reason) console.log(`${chalk.dim("Reason:")} ${data.action_reason}`);
    if (data.signals_received) console.log(`${chalk.bold("Signals:")} ${data.signals_received.join(", ")}`);

    if (data.adaptation_effectiveness) {
      const ae = data.adaptation_effectiveness;
      const delta = ae.stress_delta > 0 ? chalk.red(`+${ae.stress_delta}`) : chalk.green(`${ae.stress_delta}`);
      console.log(`${chalk.bold("Adaptation:")} ${ae.previous_action} ${delta} ${ae.effective ? chalk.green("effective") : chalk.red("not effective")}`);
    }

    if (data.topics_detected?.length) console.log(`${chalk.bold("Topics:")} ${data.topics_detected.join(", ")}`);
    if (data.active_triggers?.length) console.log(`${chalk.bold("Active Triggers:")} ${chalk.red(data.active_triggers.join(", "))}`);
    if (data.resolved_triggers?.length) console.log(`${chalk.bold("Resolved:")} ${chalk.green(data.resolved_triggers.join(", "))}`);
    return;
  }

  // History output
  if (data.datapoints !== undefined) {
    console.log(`${chalk.bold("Session:")} ${data.session_id}`);
    console.log(`${chalk.bold("Trend:")} ${data.trend}`);
    console.log(`${chalk.bold("Datapoints:")} ${data.datapoints.length}`);
    for (const dp of data.datapoints.slice(-5)) {
      console.log(`  ${chalk.dim(dp.timestamp)} ${dp.state} (${dp.stress_score})`);
    }
    return;
  }

  // Trigger output
  if (data.triggers !== undefined) {
    console.log(`${chalk.bold("Subject:")} ${data.subject_id}`);
    if (data.active?.length) console.log(`${chalk.bold("Active:")} ${chalk.red(data.active.join(", "))}`);
    if (data.resolved?.length) console.log(`${chalk.bold("Resolved:")} ${chalk.green(data.resolved.join(", "))}`);
    for (const [topic, info] of Object.entries(data.triggers)) {
      const t = info as any;
      console.log(`  ${chalk.bold(topic)}: ${t.status} (avg: ${t.avg_score}, peak: ${t.peak_score}, seen: ${t.observation_count}x)`);
    }
    return;
  }

  // Delete output
  if (data.deleted !== undefined) {
    console.log(chalk.green(`Deleted: ${data.sessions_deleted} sessions, ${data.trigger_entries_deleted} triggers`));
    return;
  }

  // Fallback: print as-is
  console.log(data);
}

export function error(msg: string): void {
  console.error(chalk.red(`Error: ${msg}`));
  process.exit(1);
}

export function success(msg: string): void {
  console.log(chalk.green(msg));
}
