---
title: "DailyScorecard Field Addition Checklist"
sidebar_label: "DailyScorecard Field Addition Checklist"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# DailyScorecard Field Addition Checklist

When adding a new field to DailyScorecard, follow this 8-step checklist.

## Steps

1. [ ] **Create migration**
   ```sql
   -- apps/api/supabase/migrations/XXX_add_[field].sql
   ALTER TABLE daily_scorecard
   ADD COLUMN IF NOT EXISTS [field_name] [TYPE] DEFAULT [value];
   ```

2. [ ] **Update TypeScript types**
   - File: `apps/web/src/lib/supabase/types.ts`
   - Add field to `DailyScorecard` interface

3. [ ] **Update scorecard utils** (if habit)
   - File: `apps/web/src/lib/scorecard-utils.ts`
   - Add to `HABIT_KEYS` array
   - Add to `HABITS` array with label, icon, weekday/weekend flags

4. [ ] **Update scorecard actions**
   - File: `apps/web/src/lib/actions/scorecard.ts`
   - Add to default payload in `updateHabit()`
   - Add to `UpdateHoursData` interface if B-hours field

5. [ ] **Update review UI**
   - File: `apps/web/src/app/(dashboard)/review/review-client.tsx`
   - Add to `blockTypeToHabit` mapping if auto-checked
   - Add placeholder value in `handleHabitToggle` fallback object
   - Add UI row if B-hours field

6. [ ] **Apply migration**
   ```bash
   npx supabase db push
   ```

7. [ ] **Regenerate types**
   ```bash
   npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > apps/web/src/lib/supabase/database.types.ts
   # Note: Get project ID from apps/web/.env.local (NEXT_PUBLIC_SUPABASE_URL)
   ```

8. [ ] **Run validation**
   ```bash
   pnpm type-check && pnpm build
   ```

## Verification

After all steps, verify via REST API:
```bash
curl -s "$SUPABASE_URL/rest/v1/daily_scorecard?select=[new_field]&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_KEY"
# Note: Use env vars from apps/web/.env.local
```

## Common Mistakes

- Forgetting step 5 (placeholder in handleHabitToggle) → TypeScript error
- Forgetting step 3 (HABITS array) → Habit doesn't appear in UI
- Forgetting step 7 (regenerate types) → `never` type errors

---

*Missing any step causes TypeScript errors or runtime issues.*
