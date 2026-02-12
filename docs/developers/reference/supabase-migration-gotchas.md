---
title: "Supabase Migration Best Practices (DYNIQ)"
sidebar_label: "Supabase Migration Best Practices (DYNIQ)"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Supabase Migration Best Practices (DYNIQ)

Quick reference for avoiding common Supabase migration errors.

---

## Statement Execution Order

**Always split migrations into separate statements:**

```sql
-- Step 1: ALTER TABLE statements (one per column)
ALTER TABLE my_table ADD COLUMN IF NOT EXISTS col1 TEXT;
ALTER TABLE my_table ADD COLUMN IF NOT EXISTS col2 INTEGER;

-- Step 2: CREATE INDEX statements (after columns exist)
CREATE INDEX IF NOT EXISTS idx_col1 ON my_table(col1);

-- Step 3: DROP VIEW before CREATE VIEW (if changing columns)
DROP VIEW IF EXISTS my_view;
CREATE VIEW my_view AS SELECT * FROM my_table;

-- Step 4: COMMENT statements (last)
COMMENT ON COLUMN my_table.col1 IS 'Description';
```

**Why:** Supabase SQL editor doesn't handle statement dependencies in single block.

---

## Partial Index Limitations

**Cannot use non-IMMUTABLE functions in partial index predicates:**

```sql
-- ❌ WRONG: NOW() is not IMMUTABLE
CREATE INDEX idx_pending ON board_meetings(created_at)
WHERE created_at < NOW() - INTERVAL '7 days';

-- ERROR: functions in index predicate must be marked IMMUTABLE
```

```sql
-- ✅ CORRECT: Use simple predicate, filter by date at query time
CREATE INDEX idx_pending ON board_meetings(created_at)
WHERE status = 'pending';

-- Then in queries:
SELECT * FROM board_meetings
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '7 days';
```

**Rule:** Partial index predicates can only use:
- Column comparisons with literals
- IMMUTABLE functions (e.g., `lower()`, `upper()`)
- NOT: `NOW()`, `CURRENT_TIMESTAMP`, `random()`

---

## View Updates

```sql
-- When changing view columns, always DROP then CREATE
DROP VIEW IF EXISTS recent_board_meetings;

CREATE VIEW recent_board_meetings AS
SELECT id, topic, status FROM board_meetings;
```

**Why:** `CREATE OR REPLACE VIEW` cannot change column names or types.

---

## DYNIQ Supabase Access

| Property | Value |
|----------|-------|
| Dashboard | `supabase.com/dashboard/project/ahseakobsxrtzkikbtxi` |
| SQL Editor | Run statements one at a time |
| Migrations | Manual via SQL Editor (no CLI access) |

---

## Pre-Migration Checklist

Before running any migration:

- [ ] Split into separate runnable statements
- [ ] Check for `NOW()` or other volatile functions in indexes
- [ ] If updating views, add `DROP VIEW` before `CREATE VIEW`
- [ ] Test column existence before creating indexes
- [ ] Run statements one at a time in SQL Editor

---

## Incident History

| Date | Error | Root Cause | Fix |
|------|-------|------------|-----|
| 2026-02-02 | column not found | Index created before column | Split statements |
| 2026-02-02 | cannot change view column | Used CREATE OR REPLACE | DROP VIEW first |
| 2026-02-02 | IMMUTABLE function required | NOW() in partial index | Remove date comparison |

---

## Quick Fix Patterns

### "column X does not exist"
```sql
-- Run ALTER TABLE first, then CREATE INDEX
ALTER TABLE t ADD COLUMN IF NOT EXISTS x TEXT;
-- Then run:
CREATE INDEX idx_x ON t(x);
```

### "cannot change name of view column"
```sql
DROP VIEW IF EXISTS v;
CREATE VIEW v AS ...;
```

### "functions in index predicate must be marked IMMUTABLE"
```sql
-- Remove volatile function from WHERE clause
CREATE INDEX idx ON t(col) WHERE status = 'pending';
-- Filter by date in application queries instead
```

---

*Pattern detected 3x (2026-02-02) - automation threshold met, doc created.*
*Reference: `.agents/logs/system-reviews/phase3-feedback-loop-review-2026-02-02.md`*
