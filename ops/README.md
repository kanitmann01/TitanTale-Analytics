# ops/ -- Project Operations

Last audited: 2026-03-20

Lightweight task tracking and changelog system designed for multi-agent workflows
with minimal token overhead.

## Structure

```
ops/
  CURRENT.md              <-- Start here. Active snapshot (keep under 30 lines).
  README.md               <-- This file. How the system works.
  tasks/
    backlog/*.md           <-- One file per queued task.
    in-progress/*.md       <-- Tasks currently being worked on.
    done/*.md              <-- Completed tasks (archive).
  changes/
    YYYY-MM/<month>.md     <-- Append-only monthly changelog.
  decisions/
    ADR-NNN.md             <-- Architecture Decision Records.
```

## Rules for Agents

1. **Read `CURRENT.md` first.** It is the only file every agent should open at the start of a session.
2. **Open only the files you need.** Do not read the full `done/` archive or old changelogs unless an explicit audit request requires it.
3. **Append, do not rewrite.** Changelog entries are single-line appends. Task files are small and self-contained.
4. **Move task files** between `backlog/`, `in-progress/`, and `done/` to reflect status changes. Also update the `Status:` field inside the file.
5. **Keep `CURRENT.md` under 30 lines.** It is a snapshot, not a history.

## Task File Convention

File name: `TASK-NNN-short-slug.md`

```
# TASK-NNN: Short title
Owner: <role>
Status: backlog | in-progress | done
Created: YYYY-MM-DD
---
- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

## Changelog Entry Format

One line per change in `changes/YYYY-MM/<month>.md`:

```
YYYY-MM-DD | <Role> | Short description of change
```

## ADR Format

See `.cursor/skills/fullstack-architect/SKILL.md` for the template.
