---
name: change-logkeeper
description: Maintain the modular ops changelog and move task files between status folders. Use when recording completed work, updating the project snapshot, or archiving tasks.
---

# Change Logkeeper

## Scope
`ops/CURRENT.md`, `ops/changes/`, and task file movement between `ops/tasks/` subfolders.

## Workflow

### Recording a change
1. Open `ops/changes/YYYY-MM/<month>.md` (create if it does not exist).
2. Append one line: `YYYY-MM-DD | <Role> | <Short description of change>`.
3. Do not rewrite existing entries.

### Updating the snapshot
1. Open `ops/CURRENT.md`.
2. Update the "In Progress" and "Recently Completed" sections.
3. Keep the file under 30 lines total.

### Moving a task
1. Move the task file from its current folder to the destination folder.
2. Update the `Status:` field inside the file.

## Token Discipline
- Only read `ops/CURRENT.md` and the single task or changelog file being updated.
- Never read the full `ops/tasks/done/` archive unless explicitly asked.
