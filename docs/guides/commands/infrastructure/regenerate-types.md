---
title: "Regenerate Supabase Types"
sidebar_label: "Regenerate Supabase Types"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# Regenerate Supabase Types

Regenerate TypeScript types from the Supabase database schema.

## When to Use

Run this command after:
- Creating new database tables
- Adding columns to existing tables
- Modifying column types or constraints
- Seeing `never` type errors for table names
- Needing `as any` workarounds for Supabase queries

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Environment variable set: `SUPABASE_PROJECT_ID` or `NEXT_PUBLIC_SUPABASE_URL`
3. Logged in to Supabase: `npx supabase login`

## Execution Steps

### Step 1: Check Current State

First, identify what's broken:

```bash
# Run type-check to see errors
pnpm type-check 2>&1 | grep -E "(never|any)" | head -20
```

### Step 2: Generate Types

```bash
# Navigate to API directory (has supabase config)
cd apps/api

# Generate types from remote database
npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > ../web/src/lib/supabase/database.types.ts

# Or if using local Supabase
npx supabase gen types typescript --local > ../web/src/lib/supabase/database.types.ts
```

### Step 3: Update Custom Types

The generated `database.types.ts` is auto-generated. Our custom types in `types.ts` extend it.

Check if new tables need interfaces in `apps/web/src/lib/supabase/types.ts`:

1. Read generated file to see new table structures
2. Add any custom interfaces needed (e.g., `TimeblockInsight`)
3. Update the `Database` interface's `Tables` section if needed

### Step 4: Verify

```bash
# Run type-check - should pass now
pnpm type-check

# Run lint to check for any `any` workarounds that can be removed
pnpm lint 2>&1 | grep -E "no-explicit-any"
```

### Step 5: Clean Up Workarounds

If you previously used `as any` workarounds, remove them now:

```typescript
// BEFORE (workaround)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { error } = await (supabase as any)
  .from("new_table")
  .select("*")

// AFTER (proper typing)
const { error } = await supabase
  .from("new_table")
  .select("*")
```

## Troubleshooting

### "Project not found" error
- Verify project ID: `echo $SUPABASE_PROJECT_ID`
- Check Supabase dashboard for correct project ID
- Ensure you're logged in: `npx supabase login`

### Generated types don't include new table
- Migration may not have run on remote DB
- Run: `npx supabase db push` to apply migrations
- Then regenerate types

### Types generated but still get errors
- Custom `types.ts` may need updating to match generated types
- Check if `Database` interface needs new table entry

## Output

After successful execution:
- `apps/web/src/lib/supabase/database.types.ts` - Updated with latest schema
- All `never` type errors resolved
- `as any` workarounds can be removed

---

*This command prevents technical debt from accumulating when adding new database tables.*
