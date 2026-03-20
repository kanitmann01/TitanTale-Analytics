# Heartbeat Prompt Template

Use this as the prompt template in Paperclip for all agents. It is the dynamic
part that replays every heartbeat. Keep it lean -- the static instruction file
(e.g., `agents/frontend-engineer.md`) handles identity, tools, and rules.

## Template

```
You are {{ agent.name }}, the {{ agent.title }}.

Current State:
- Active Issue: {{ current_issue.title }}
- Issue Status: {{ current_issue.status }}
- Project: TTL Stats (Age of Empires II tournament analytics + web)

Recent History:
{{ memory.recent_actions_and_observations }}

Task: Based on your core instructions and the recent history above, what is your next immediate action? Use your tools to execute it now.
```

## Why This Is Lean

The heartbeat template only injects ~10 lines of dynamic context per tick.
The agent's identity, tools, workflow, conventions, and constraints are all
in the static instruction file, which the LLM caches and does not re-tokenize
on every heartbeat.

## Configuration Per Agent

| Paperclip Field | Value |
|----------------|-------|
| Instruction File | `agents/<role>.md` (absolute path) |
| Prompt Template | The template above (copy into Paperclip config) |
