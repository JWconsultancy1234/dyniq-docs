---
title: "SOP: Database Table Archival"
sidebar_label: "SOP: Database Table Archival"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# SOP: Database Table Archival

**Owner:** Head of Data
**Approver:** CEO
**Last Updated:** 2026-W06

---

## Purpose

Define consistent rules for archiving unused database tables, columns, views, and functions across Walker-OS and DYNIQ databases.

---

## Triggering Criteria

A database object is a candidate for archival when ALL of the following are met:

| Criterion | Threshold | Verification |
|-----------|-----------|--------------|
| Last activity | 90+ days | Query `MAX(updated_at)` |
| Zero code references | 0 matches | `grep -r "object_name"` in codebase |
| Zero workflow references | 0 matches | Search n8n workflows |
| Zero row count (tables) | 0 rows | Query `COUNT(*)` |
| Marked DEPRECATED | In audit log | Check `.agents/logs/db-audit/` |

---

## Pre-Archive Checklist

Before archiving any object:

- [ ] Object unused for 90+ days (verified via audit)
- [ ] Zero codebase references (`grep -r "name" apps/`)
- [ ] Zero workflow references (n8n API search)
- [ ] Zero TypeScript type references (excluding `database.types.ts`)
- [ ] 2-week observation period completed
- [ ] CEO approval obtained
- [ ] Backup created (if table)
- [ ] Documented in archive log

---

## Archive Execution

### Tables

```sql
-- 1. Create backup of table data (if any rows)
CREATE TABLE _backup_20260201_table_name AS SELECT * FROM table_name;

-- 2. Rename with archive prefix
ALTER TABLE table_name RENAME TO _archive_20260201_table_name;

-- 3. Update archive log (manual step)
-- Add entry to .agents/logs/db-archive-log.md
```

### Columns

```sql
-- 1. Document current values (if needed for recovery)
SELECT DISTINCT column_name FROM table_name LIMIT 100;

-- 2. Remove column
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;

-- 3. Regenerate types
-- Run: npx supabase gen types typescript --project-id PROJECT_ID > database.types.ts
```

### Views

```sql
-- 1. Document view definition
SELECT pg_get_viewdef('view_name', true);
-- Save output to archive log

-- 2. Drop view
DROP VIEW IF EXISTS view_name;
```

### Functions

```sql
-- 1. Document function definition
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'function_name';
-- Save output to archive log

-- 2. Drop function
DROP FUNCTION IF EXISTS function_name();
```

---

## Documentation

Add entry to `.agents/logs/db-archive-log.md`:

```markdown
## Archive Entry: YYYY-MM-DD

| Date | Object | Type | Database | Reason | Approver | Rollback |
|------|--------|------|----------|--------|----------|----------|
| 2026-02-01 | old_table | table | walker-os | Unused 90d | CEO | _archive_20260201_old_table |

### Definition Backup

<details>
<summary>Click to expand</summary>

```sql
-- Original definition here
CREATE TABLE old_table (...);
```

</details>
```

---

## Rollback Procedure

### Tables

```sql
-- Rename back
ALTER TABLE _archive_20260201_table_name RENAME TO table_name;

-- Verify
SELECT COUNT(*) FROM table_name;
```

### Columns

```sql
-- Add column back
ALTER TABLE table_name ADD COLUMN column_name TYPE;

-- Restore data from backup if available
UPDATE table_name SET column_name = backup.column_name FROM _backup... backup WHERE ...;
```

### Views

```sql
-- Recreate from archived definition
CREATE VIEW view_name AS ...;
```

### Functions

```sql
-- Recreate from archived definition
CREATE OR REPLACE FUNCTION function_name() RETURNS ...;
```

---

## Retention Policy

| Stage | Duration | Action |
|-------|----------|--------|
| Archive prefix | 90 days minimum | Object renamed, data preserved |
| After 90 days | CEO approval required | Can permanently delete |
| Never delete without | Backup verification | Must have recovery option |

---

## Type Regeneration

After any schema change:

```bash
# Walker-OS
npx supabase gen types typescript --project-id uzvknwwrfknsqqacbogn > apps/web/src/lib/supabase/database.types.ts
pnpm type-check

# DYNIQ (if types needed)
npx supabase gen types typescript --project-id ahseakobsxrtzkikbtxi > path/to/types.ts
```

---

## Quarterly Audit Schedule

| Month | Action |
|-------|--------|
| Q1 (Jan) | Full audit, mark candidates |
| Q2 (Apr) | Review candidates, execute approved |
| Q3 (Jul) | Full audit, mark candidates |
| Q4 (Oct) | Review candidates, execute approved |

**Next scheduled audit:** 2026-Q2 (April 2026)

---

## Approval Matrix

| Object Type | Impact | Approver |
|-------------|--------|----------|
| Unused column | Low | Head of Data |
| Active column | High | CEO |
| Table (no data) | Medium | Head of Data |
| Table (with data) | High | CEO |
| View | Low | Head of Data |
| Function | Medium | CTO |

---

## Related Documents

- `.agents/logs/db-audit/` - Audit reports
- `.agents/logs/db-archive-log.md` - Archive history
- `dyniq-integrations.md` - DYNIQ schema docs

---

*Freedom Filter: This SOP enables delegation of database maintenance tasks (WHO not HOW).*
