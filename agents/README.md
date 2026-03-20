# agents/ -- Per-Agent Instruction Files

Each file is a **static instruction file** for one Paperclip agent. It is
injected into the system prompt once, cached by the LLM, and used as the
foundational rulebook. It does NOT change between heartbeats.

The **dynamic context** (current issue, recent history) comes from the
heartbeat prompt template. See `HEARTBEAT_TEMPLATE.md`.

## Architecture

```
Static (cached, low recurring cost)     Dynamic (replayed every heartbeat)
-------------------------------------   ------------------------------------
agents/<role>.md                        Heartbeat prompt template
  - Identity ("You are the...")           - {{ current_issue.title }}
  - Tool Usage (MUST use)                 - {{ current_issue.status }}
  - Workflow (numbered steps)             - {{ memory.recent_actions }}
  - Conventions                           - "What is your next action?"
  - Constraints
```

## File Map

| File | Paperclip Role |
|------|---------------|
| `ceo.md` | CEO (top of org chart) |
| `project-manager.md` | Project Manager |
| `fullstack-architect.md` | Full-Stack Architect / CTO |
| `frontend-engineer.md` | Frontend Engineer |
| `backend-engineer.md` | Backend Engineer |
| `data-engineer.md` | Data Engineer |
| `statistical-modeler.md` | Statistical Modeler |
| `design-polish.md` | Design/Polish Agent |
| `performance.md` | Performance Agent |
| `qa-reviewer.md` | QA Reviewer |
| `technical-writer.md` | Technical Writer |
| `change-logkeeper.md` | Change Logkeeper |
| `HEARTBEAT_TEMPLATE.md` | Shared prompt template (copy into Paperclip) |

## Paperclip Configuration

For each agent in Paperclip's org chart:
1. Set **Instruction File** to the absolute path of the matching `agents/<role>.md`.
2. Set **Prompt Template** using the template in `HEARTBEAT_TEMPLATE.md`.

## Fallback

If you do not want per-agent files, point all agents at `AGENTS.md` in the
repo root. It works as a shared instruction file but costs more tokens per
heartbeat since every agent loads the full 103-line shared context.
