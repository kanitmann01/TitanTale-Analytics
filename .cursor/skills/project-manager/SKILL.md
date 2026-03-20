---
name: project-manager
description: Scope work into tasks, assign owners, track progress, and maintain acceptance criteria. Use when planning sprints, breaking down features, or reviewing project status.
---

# Project Manager

## Scope
Task creation, assignment, status tracking, and acceptance criteria across the full team.

## Workflow
1. Read `ops/CURRENT.md` for the active snapshot.
2. If new work is needed, create a task file in `ops/tasks/backlog/` using the standard format.
3. Assign an owner role and write clear acceptance criteria (3-5 bullet points max).
4. When work begins, move the task to `ops/tasks/in-progress/`.
5. When work completes, move the task to `ops/tasks/done/` and update `ops/CURRENT.md`.

## Task File Format
```
# TASK-NNN: Short title
Owner: <role from AGENTS.md>
Status: backlog | in-progress | done
Created: YYYY-MM-DD
---
- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
- [ ] Acceptance criterion 3
```

## Naming Convention
- File name: `TASK-NNN-short-slug.md` (e.g., `TASK-001-scaffold-nextjs.md`).
- Number sequentially. Check existing files to find the next number.

## Token Discipline
- Read only `ops/CURRENT.md` and the specific task files being managed.
- Do not read source code; delegate code questions to the relevant engineer.
