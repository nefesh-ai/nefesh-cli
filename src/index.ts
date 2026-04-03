#!/usr/bin/env node

import { Command } from "commander";
import { authCommand } from "./commands/auth";
import { ingestCommand } from "./commands/ingest";
import { stateCommand } from "./commands/state";
import { historyCommand } from "./commands/history";
import { triggersCommand } from "./commands/triggers";
import { deleteCommand } from "./commands/delete";
import { simulateCommand } from "./commands/simulate";
import { setupCommand } from "./commands/setup";

const program = new Command();

program
  .name("nefesh")
  .description("Nefesh CLI — Real-time human state awareness for AI. https://nefesh.ai")
  .version("1.1.0");

authCommand(program);
ingestCommand(program);
stateCommand(program);
historyCommand(program);
triggersCommand(program);
deleteCommand(program);
simulateCommand(program);
setupCommand(program);

program.parse();
