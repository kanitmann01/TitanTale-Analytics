# Paperclip Agent Setup Guide

Copy-paste reference for the "New Agent" form in Paperclip.
All paths assume your repo is at `D:\TWorkshop\Dev Tools\TTL Stats`.

---

## Shared Prompt Template (same for all agents)

Paste this into the **Prompt Template** field for every agent:

```
You are {{ agent.name }}, the {{ agent.title }}.

Current State:
- Active Issue: {{ current_issue.title }}
- Issue Status: {{ current_issue.status }}
- Project: TTL Stats

Recent History:
{{ memory.recent_actions_and_observations }}

Task: Based on your core instructions and the recent history above, what is your next immediate action? Use your tools to execute it now.
```

---

## Agent 1: CEO

| Field | Value |
|-------|-------|
| **Agent name** | `CEO` |
| **Title** | `CEO` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\ceo.md` |
| **Command** | `opencode` |
| **Model** | `glm-5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | ON -- every 30 minutes |
| **Reports to** | (none -- top of chain, you are the board) |

---

## Agent 2: Project Manager

| Field | Value |
|-------|-------|
| **Agent name** | `Project Manager` |
| **Title** | `Project Manager` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\project-manager.md` |
| **Command** | `opencode` |
| **Model** | `minimax-m2.7` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | ON -- every 20 minutes |
| **Reports to** | CEO |

---

## Agent 3: Full-Stack Architect

| Field | Value |
|-------|-------|
| **Agent name** | `Full-Stack Architect` |
| **Title** | `CTO / Full-Stack Architect` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\fullstack-architect.md` |
| **Command** | `opencode` |
| **Model** | `glm-5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | CEO |

---

## Agent 4: Frontend Engineer

| Field | Value |
|-------|-------|
| **Agent name** | `Frontend Engineer` |
| **Title** | `Frontend Engineer` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\frontend-engineer.md` |
| **Command** | `opencode` |
| **Model** | `kimi-k2.5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | Full-Stack Architect |

---

## Agent 5: Backend Engineer

| Field | Value |
|-------|-------|
| **Agent name** | `Backend Engineer` |
| **Title** | `Backend Engineer` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\backend-engineer.md` |
| **Command** | `opencode` |
| **Model** | `kimi-k2.5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | Full-Stack Architect |

---

## Agent 6: Data Engineer

| Field | Value |
|-------|-------|
| **Agent name** | `Data Engineer` |
| **Title** | `Data Engineer` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\data-engineer.md` |
| **Command** | `opencode` |
| **Model** | `minimax-m2.7` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | Full-Stack Architect |

---

## Agent 7: Statistical Modeler

| Field | Value |
|-------|-------|
| **Agent name** | `Statistical Modeler` |
| **Title** | `Statistical Modeler` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\statistical-modeler.md` |
| **Command** | `opencode` |
| **Model** | `glm-5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | Full-Stack Architect |

---

## Agent 8: Design/Polish

| Field | Value |
|-------|-------|
| **Agent name** | `Design Polish` |
| **Title** | `Design/Polish Agent` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\design-polish.md` |
| **Command** | `opencode` |
| **Model** | `kimi-k2.5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | Frontend Engineer |

---

## Agent 9: Performance

| Field | Value |
|-------|-------|
| **Agent name** | `Performance` |
| **Title** | `Performance Agent` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\performance.md` |
| **Command** | `opencode` |
| **Model** | `minimax-m2.7` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | Full-Stack Architect |

---

## Agent 10: QA Reviewer

| Field | Value |
|-------|-------|
| **Agent name** | `QA Reviewer` |
| **Title** | `QA Reviewer` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\qa-reviewer.md` |
| **Command** | `opencode` |
| **Model** | `glm-5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | Full-Stack Architect |

---

## Agent 11: Technical Writer

| Field | Value |
|-------|-------|
| **Agent name** | `Technical Writer` |
| **Title** | `Technical Writer` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\technical-writer.md` |
| **Command** | `opencode` |
| **Model** | `minimax-m2.5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | OFF (on-demand via task assignment) |
| **Reports to** | CEO |

---

## Agent 12: Change Logkeeper

| Field | Value |
|-------|-------|
| **Agent name** | `Change Logkeeper` |
| **Title** | `Change Logkeeper` |
| **Adapter type** | OpenCode (local) |
| **Working directory** | `D:\TWorkshop\Dev Tools\TTL Stats` |
| **Prompt Template** | (shared template above) |
| **Agent instructions file** | `D:\TWorkshop\Dev Tools\TTL Stats\agents\change-logkeeper.md` |
| **Command** | `opencode` |
| **Model** | `minimax-m2.5` |
| **Thinking effort** | Auto |
| **Extra args** | (leave empty) |
| **Environment variables** | (none needed) |
| **Heartbeat on interval** | ON -- every 60 minutes |
| **Reports to** | CEO |

---

## Org Chart

```
YOU (the board)
  |
  CEO  [glm-5, heartbeat 30m]
  |-- Project Manager  [minimax-m2.7, heartbeat 20m]
  |-- Full-Stack Architect  [glm-5, on-demand]
  |     |-- Frontend Engineer  [kimi-k2.5, on-demand]
  |     |     |-- Design/Polish  [kimi-k2.5, on-demand]
  |     |-- Backend Engineer  [kimi-k2.5, on-demand]
  |     |-- Data Engineer  [minimax-m2.7, on-demand]
  |     |-- Statistical Modeler  [glm-5, on-demand]
  |     |-- Performance  [minimax-m2.7, on-demand]
  |     |-- QA Reviewer  [glm-5, on-demand]
  |-- Technical Writer  [minimax-m2.5, on-demand]
  |-- Change Logkeeper  [minimax-m2.5, heartbeat 60m]
```

## Quick Reference: Model Assignments

| Model | Agents | Why |
|-------|--------|-----|
| `kimi-k2.5` | Frontend, Backend, Design/Polish | Strong coding and long-context -- best for writing and reviewing UI/API code |
| `glm-5` | CEO, Architect, Statistical Modeler, QA | Strong general reasoning -- best for strategy, architecture, stats, and review |
| `minimax-m2.7` | Project Manager, Data Engineer, Performance | Capable and efficient -- good for planning, ETL, and measurable optimizations |
| `minimax-m2.5` | Technical Writer, Change Logkeeper | Lightest workload -- docs and bookkeeping do not need heavy reasoning |

## Quick Reference: Heartbeat Policy

| Setting | Agents | Why |
|---------|--------|-----|
| ON (30 min) | CEO | Strategic check-ins, reviews team progress, sets priorities |
| ON (20 min) | Project Manager | Task tracking, moves work through the pipeline |
| ON (60 min) | Change Logkeeper | Periodic cleanup of task statuses and changelog |
| OFF | All others | On-demand only -- wake when assigned a task or @-mentioned |

## Windows: UTF-8 vs WIN1252

If an adapter or database step fails with a message like `character with byte sequence 0xe2 ... has no equivalent in encoding "WIN1252"`, the payload contains UTF-8 characters (for example U+25B2) but the store or connection is using WIN1252.

**Fix:** Use a UTF-8 database and set the client to UTF-8 (for PostgreSQL, `PGCLIENTENCODING=UTF8` or `client_encoding=UTF8` in the connection string). Full steps: `ops/runbooks/WINDOWS_ENCODING.md`.

**Workaround:** Keep issue bodies and pasted logs ASCII-only (matches this repo's markdown rule).

## Field Notes

- **Thinking effort**: left on `Auto` for all. Override to `High` for CEO/Architect if you want deeper reasoning, or `Low` for Logkeeper to save cost.
- **Extra args**: leave empty. Add `--verbose` for debugging if needed.
- **Environment variables**: none needed now. Set API keys here later with `Seal` for secrets.
- **Working directory**: all agents share the repo root. Instruction files handle scoping.
- **Reports to**: sets Paperclip's delegation chain. CEO delegates down, never up.
