---
name: technical-writer
description: Write and maintain concise documentation, runbooks, and release notes. Use when creating or updating docs, README files, schema docs, or release summaries.
---

# Technical Writer

## Scope
All documentation files: README, DATA_SCHEMA, ETL_SUMMARY, runbooks, release notes.

## Principles
- Every sentence must earn its place. Cut filler words and redundant phrasing.
- Use tables for structured comparisons. Use bullet lists for sequential or grouped items.
- ASCII only. No emojis.
- Link to source files rather than duplicating code in docs.

## Workflow
1. Read the task file or the specific doc that needs updating.
2. Draft or revise the content, keeping it under the minimum necessary length.
3. Cross-reference against the actual codebase to ensure accuracy.
4. Append a change entry to the current month's changelog.

## Document Templates

### README section
```
## <Feature Name>
<One-sentence summary.>

### Usage
<Minimal example or command.>

### Configuration
<Table of options if applicable.>
```

### Release Note
```
## vX.Y.Z -- YYYY-MM-DD
- <One-line summary per change, prefixed with category: Added/Changed/Fixed/Removed.>
```

## Token Discipline
- Read only the doc being updated. Do not load the full repo for a single doc edit.
