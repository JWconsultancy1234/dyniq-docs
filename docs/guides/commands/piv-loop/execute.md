---
description: Execute a development plan with systematic task tracking
argument-hint: [plan-file-path]
---

# Execute Development Plan

Execute a comprehensive development plan with systematic task tracking.

## Critical Requirements

- **NEVER** skip task tracking
- **ONE** task in progress at a time
- **VALIDATE** after each task
- **COMPLETE** before moving to next

---

## Step 0: Verify Current State (CRITICAL - NEW)

**BEFORE reading the plan, verify what's actually done:**

### If Installation/Setup Task

1. Check if verification script exists:
   ```bash
   ls -la .agents/scripts/verify-*.sh 2>/dev/null
   ```

2. Run verification if exists:
   ```bash
   bash .agents/scripts/verify-[feature].sh
   ```

3. Check filesystem for expected outputs:
   ```bash
   # For folder creation
   ls -la [expected-output-dir] 2>/dev/null

   # For file creation
   ls -la [expected-files] 2>/dev/null
   ```

### Verification Outcomes

| Status | Action |
|--------|--------|
| 100% complete | Notify user, skip execution, update tracking only |
| Partially complete | Identify remaining tasks, adjust plan |
| 0% complete | Proceed with full execution |

**Why this matters:** User may have already completed work. Proposing work already done causes frustration and breaks trust.

**Pattern:** "Verify first, plan second"

---

## Step 1: Read and Parse the Plan

Read the plan file: $ARGUMENTS

The plan contains:
- Walker-OS alignment (Path A/B, freedom impact)
- Tasks to implement
- Context references
- Validation commands

---

## Step 2: Create Todo List

Use TodoWrite to create all tasks from the plan BEFORE starting:

```yaml
todos:
  - content: "Task 1: {description}"
    status: "pending"
    activeForm: "Implementing task 1"
  - content: "Task 2: {description}"
    status: "pending"
    activeForm: "Implementing task 2"
  # ... all tasks from plan
```

---

## Step 3: Codebase Preparation

Before implementation:
1. Read ALL context reference files from the plan
2. Understand existing patterns
3. Identify where changes go
4. Verify patterns match plan expectations

---

## Step 4: Implementation Cycle

For EACH task in sequence:

### 4.1 Start Task
- Update todo status to "in_progress"
- Read any additional context needed

### 4.2 Implement
- Execute implementation per plan
- Follow patterns from context references
- Write clean, simple code (KISS, YAGNI)

### 4.3 Validate
- Run validation command from plan
- Fix any issues before proceeding

### 4.4 Complete Task
- Update todo status to "completed"
- Proceed to next task

**CRITICAL**: Only ONE task in "in_progress" at a time.

---

## Step 5: Validation Phase

After ALL tasks complete, run full validation per @validation-checklist.md

### Level 1: Lint & Format
```bash
# Python
ruff format .
ruff check --fix .

# TypeScript/JavaScript
npm run lint
npm run format
```

### Level 2: Type Check
```bash
# Python
mypy . --strict

# TypeScript
npm run type-check
```

### Level 3: Tests
```bash
# Python
pytest -v --cov

# TypeScript/JavaScript
npm test
```

### Level 4: Build
```bash
# If applicable
npm run build
# or
python -m build
```

---

## Step 6: Final Report

Provide summary:

```yaml
execution_report:
  plan_file: "{path}"
  walker_os_alignment:
    path: "A" | "B" | "BOTH"
    freedom_impact: "high" | "medium" | "low"
  tasks:
    total: X
    completed: X
    failed: 0
  validation:
    lint: "pass"
    type_check: "pass"
    tests: "pass"
    coverage: "X%"
  ready_for_commit: true | false
  notes: "{any issues or observations}"
```

---

## Step 7: Update Actuals & Trigger Validation

**After completing all tasks:**

### 1. Update Project Tracking

```sql
UPDATE project_tracking
SET
  actuals_this_week = actuals_this_week + {hours_spent},
  cumulative_actuals = cumulative_actuals + {hours_spent},
  updated_at = NOW()
WHERE
  project_id = '{project_id}'
  AND resource_name = 'Developer'
  AND week_start_date = (
    SELECT DATE_TRUNC('week', CURRENT_DATE)::DATE
  );

-- If no record exists for this week, insert
INSERT INTO project_tracking (
  project_id,
  week_number,
  week_start_date,
  resource_name,
  initial_estimate_hours,
  actuals_this_week,
  cumulative_actuals,
  etc_hours
) VALUES (
  '{project_id}',
  EXTRACT(WEEK FROM CURRENT_DATE),
  DATE_TRUNC('week', CURRENT_DATE)::DATE,
  'Developer',
  {initial_estimate},
  {hours_spent},
  {hours_spent},
  {remaining_estimate}
)
ON CONFLICT DO NOTHING;
```

### 2. Auto-Trigger Validation

```sql
INSERT INTO automation_events (
  event_type,
  project_id,
  triggered_by,
  event_data,
  next_command,
  status
) VALUES (
  'execution_complete',
  '{project_id}',
  'Developer',
  '{"tasks_completed": {count}, "hours_spent": {hours}}',
  '/validate',
  'pending'
);
```

### 3. Notify Reviewer

Send Telegram notification:
```
✅ Execution Complete: {project_id}

Tasks: {completed}/{total}
Hours: {hours_spent}h

Running /validate automatically...
```

**Test mode:** If `AGENT_MODE=test`, log updates but don't modify database or trigger events

---

## Workflow Rules

1. **CREATE** all tasks in TodoWrite before starting
2. **MAINTAIN** one task in progress at a time
3. **VALIDATE** after each task completion
4. **TRACK** progress through todo status updates
5. **ANALYZE** codebase before implementation
6. **TEST** everything before final completion

---

## Error Handling

If a task fails:
1. Document the failure
2. Attempt to fix
3. If unfixable, note blocker and continue
4. Report all failures in final summary

---

## Ready for Commit

After successful execution:
- All tasks completed
- All validations pass
- Ready for `/commit` command
