---
description: Generate tomorrow's task plan using Martell framework across all repos
---

# Daily Plan: Tomorrow's Battle Schedule

## Objective

Generate a focused, prioritized plan for tomorrow's time blocks by scanning all repos for tasks, applying Dan Martell's framework, and outputting a ready-to-execute schedule.

## Context

**Days to Freedom:** Calculate from today to July 2026
**Hourly Rate:** EUR 72/hr
**Schedule Blocks:**
- 4:15-5:45 AM: First 90 (PRODUCTION only - #1 task)
- 5:55-6:45 AM: Deep Work Block 2
- 12:00-14:00: Midday B Quadrant
- 16:00-17:30: Afternoon B Quadrant

## Detailed Procedures


## Process Summary

### Step 0: Date Verification (MANDATORY)

```bash
date +"%Y-%m-%d"           # Today
date -v+1d +"%Y-%m-%d"     # Tomorrow (macOS)
```

**Never calculate dates mentally.**

### Step 1: Pre-Generation Context

Ask user about scheduled commitments and check yesterday's plan for late activity (recovery schedule trigger).

### Step 2: Scan Repositories

Scan all 6 repos for PRD items, git status, TODOs, and incomplete tasks.

### Step 2.5: Include Active Sprint Tasks

**Query active sprints from database:**

```sql
-- Get active sprint tasks from automation_events
SELECT
  project_id,
  event_type,
  next_command,
  created_at,
  retry_count
FROM automation_events
WHERE status = 'pending'
  AND project_id LIKE 'EPIC-%' OR project_id LIKE 'PRD-%'
ORDER BY created_at ASC;

-- Get pending quality gates (awaiting approval)
SELECT
  project_id,
  gate_name,
  gate_type,
  criteria,
  created_at
FROM quality_gates
WHERE status = 'PENDING'
ORDER BY created_at ASC;

-- Get ETC updates needed (Friday approaching)
SELECT
  project_id,
  resource_name,
  variance_percent,
  last_update := updated_at
FROM project_tracking
WHERE
  status = 'ACTIVE'
  AND EXTRACT(DOW FROM CURRENT_DATE) >= 4  -- Thursday or Friday
  AND (updated_at < DATE_TRUNC('week', CURRENT_DATE) OR updated_at IS NULL);
```

**Use this data to:**
- **Pending automation events** → Priority tasks (unblock automation chain)
- **Quality gates pending** → Review and approve plans
- **ETC updates overdue** → Schedule `/update-etc` before Friday 5 PM
- **High variance projects** → Allocate more time to recover

**Integration with daily plan:**
- Pending events become First 90 or Deep Work tasks
- Quality gate approvals scheduled in morning blocks
- ETC updates scheduled for Friday afternoon

### Step 3: Apply Martell Filter

| Step | Question | Outcome |
|------|----------|---------|
| 1 | EUR 72/hr test | DELEGATE if fails |
| 2 | WHO not HOW | DELEGATE if someone else can own |
| 3 | Path Alignment | CUT if neither Path A nor B |
| 4 | Freedom Impact | DO_NOW / SCHEDULE / DEPRIORITIZE |

### Step 4: Map to DRIP Quadrant

Production → First 90, Investment → Schedule, Replacement → Systematize, Delegation → Cut

### Step 5: Generate Schedule

Output format in reference doc. Save to daily-plan file.

## Quality Criteria

- [ ] #1 Task clearly defined from Production quadrant
- [ ] All tasks aligned to Path A or Path B
- [ ] No $10 tasks on schedule (delegated or cut)
- [ ] Max 5-6 tasks per day
- [ ] Success criteria are measurable

## Usage

```bash
claude /daily-plan  # Run during 9 PM shutdown ritual
```
