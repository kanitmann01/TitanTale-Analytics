# Windows: UTF-8 vs WIN1252 errors

## Symptom

PostgreSQL, SQL Server, or another Windows tool reports something like:

```text
character with byte sequence 0xe2 0x96 0xb2 in encoding "UTF8" has no equivalent in encoding "WIN1252"
```

The bytes `e2 96 b2` are UTF-8 for Unicode U+25B2 (black up-pointing triangle). Other common sequences:

- `e2 80 94` -- em dash
- `e2 80 99` -- right single quotation mark

## Cause

Valid UTF-8 text is being written or transcoded into a **WIN1252** (or similar single-byte) channel. That encoding cannot represent many Unicode characters.

This often happens when:

- A database or column uses a non-UTF8 encoding.
- The client connection uses WIN1252 while the payload is UTF-8.
- An orchestration tool stores event JSON in a legacy-encoded table.

## Fixes (pick what matches your stack)

### PostgreSQL

1. Prefer databases created with UTF8, for example:

   ```sql
   CREATE DATABASE yourdb WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE template0;
   ```

2. Force the client to UTF-8 before connecting:

   - PowerShell: `$env:PGCLIENTENCODING = 'UTF8'`
   - Or in the connection string: add `client_encoding=UTF8`.

### SQL Server

Use `NVARCHAR` / `N'...'` for Unicode text. Avoid storing orchestration logs only in `VARCHAR` under a legacy collation if the payload can contain non-ASCII characters.

### Paperclip / local adapters

If the product stores session or step text in a database, align **database encoding**, **connection encoding**, and **application default** on UTF-8. If you cannot change the store, keep pasted content ASCII-only (this repo's markdown convention).

### Console / scripts

For batch tools that assume the system code page, you can use UTF-8 mode where supported:

```text
chcp 65001
```

This does not replace fixing the database client encoding.

## Repo convention

Project rules: **ASCII only** in markdown and terminal-oriented docs under this repo. That reduces the chance of stray Unicode in files that tools ingest.
