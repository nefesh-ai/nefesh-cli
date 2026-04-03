# @nefesh/cli

Official CLI for the [Nefesh API](https://nefesh.ai). Ingest biometric signals, query human state, manage API keys, and auto-setup MCP for AI agents.

## Install

```bash
npm install -g @nefesh/cli
```

Or run without installing:

```bash
npx @nefesh/cli state my-session --json
```

## Quick start

```bash
# Save your API key
nefesh auth login --key nfsh_free_...

# Send a signal
nefesh ingest --session test-001 --heart-rate 72 --tone calm

# Get the state
nefesh state test-001
# State: relaxed | Score: 34 | Action: maintain_engagement

# JSON output (for AI agents)
nefesh state test-001 --json
```

## Commands

| Command | Description |
|---|---|
| `nefesh auth login --key KEY` | Save API key |
| `nefesh auth status` | Show current key |
| `nefesh auth logout` | Remove saved key |
| `nefesh ingest --session ID --heart-rate 72` | Send biometric signals |
| `nefesh state SESSION_ID` | Get current state |
| `nefesh history SESSION_ID` | Get state history with trend |
| `nefesh triggers SUBJECT_ID` | Get trigger memory profile |
| `nefesh delete SUBJECT_ID --confirm` | GDPR cascading deletion |
| `nefesh simulate --scenario stressed` | Stream test data for 2 minutes |
| `nefesh setup cursor` | Auto-configure MCP for Cursor |
| `nefesh setup claude-code` | Auto-configure MCP for Claude Code |
| `nefesh setup vscode` | Auto-configure MCP for VS Code |

## JSON output

Every command supports `--json` for machine-readable output. AI agents running in the terminal use this:

```bash
nefesh state test-001 --json
# {"state":"stressed","stress_score":68,"suggested_action":"de-escalate_and_shorten",...}
```

## Simulate

Stream realistic test data without real sensors:

```bash
nefesh simulate --scenario stressed --session demo
# [0s]  stressed      █████████████░░░░░░░ 68
# [2s]  stressed      ██████████████░░░░░░ 72
# [4s]  stressed      █████████████░░░░░░░ 65
```

Scenarios: `calm`, `relaxed`, `focused`, `stressed`, `acute_stress`.

## MCP setup

Auto-configure Nefesh for any MCP-compatible AI agent:

```bash
nefesh setup cursor            # ~/.cursor/mcp.json
nefesh setup claude-desktop    # ~/Library/.../Claude/claude_desktop_config.json
nefesh setup claude-code       # .mcp.json
nefesh setup vscode            # .vscode/mcp.json
nefesh setup windsurf          # ~/.codeium/windsurf/mcp_config.json
nefesh setup kiro              # ~/.kiro/mcp.json
nefesh setup openclaw          # ~/.config/openclaw/mcp.json
nefesh setup cline             # ~/.cline/cline_mcp_settings.json
nefesh setup roo-code          # .roo/mcp.json
nefesh setup claude-desktop-win # (Windows) ~/AppData/Roaming/Claude/...
```

## Environment variables

| Variable | Description |
|---|---|
| `NEFESH_API_KEY` | API key (overrides saved key) |
| `NEFESH_API_URL` | Custom API URL (default: https://api.nefesh.ai) |

## Get an API key

Free tier: 1,000 calls/month, no credit card.

```bash
# Option A: Sign up
open https://nefesh.ai/signup

# Option B: Your AI agent gets one automatically
nefesh setup cursor  # Connect without key, agent uses request_api_key tool
```

## License

MIT
