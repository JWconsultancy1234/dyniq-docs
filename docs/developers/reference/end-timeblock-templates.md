---
title: "End Timeblock Templates"
sidebar_label: "End Timeblock Templates"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# End Timeblock Templates

> Reference doc for end-timeblock session summary templates and examples.

---

## A-Z Session Summary Template

**Output Format:**

```markdown
## SESSION: [Block Type] (Completed [HH:MM])

**Block:** [Block Type]
**Date:** [YYYY-MM-DD]
**Duration:** [Planned] planned | [Actual] actual
**Completion:** XX% | **Energy:** X/10 | **Focus:** X/10

---

### A. INITIAL OBJECTIVES (from daily plan)

What was planned for this block:
| Task | Status | Notes |
|------|--------|-------|
| [Task 1] | Done/Partial/Skipped | [outcome] |

---

### B. GIT ACTIVITY BY REPO

**Repos with commits:**
- `repo-name`: X commits
  - `abc123` message

**Repos with uncommitted changes:**
- `repo-name`: X files modified
  - path/to/file.py

---

### C. SERVER-SIDE CHANGES (Contabo/SSH)

Files modified on server:
1. `/opt/dyniq-voice/path/file.py` - [what changed]

---

### D. EXTERNAL API CHANGES

Services configured:
| Service | What Was Done | Reference |
|---------|---------------|-----------|
| Twilio | Created 8 templates | HX... SIDs |
| n8n | Updated workflow 1.3 | FsPIGVnMZKJ9wMqh |

---

### E. BLOCKERS DISCOVERED

| Blocker | Root Cause | Resolution |
|---------|------------|------------|
| [Issue] | [Why] | [How fixed / still pending] |

---

### F. KEY LEARNINGS

1. [Technical insight]
2. [Process insight]

---

### G. COMMANDS/REFERENCES FOR NEXT SESSION

```bash
# Commands to check status
[relevant commands]
```

---

### H. CARRY-OVER TO NEXT BLOCK

| Task | Context | Priority |
|------|---------|----------|
| [Task] | [What needs doing] | HIGH/MEDIUM |

---

### METRICS

| Metric | Value |
|--------|-------|
| Completion Rate | XX% |
| Energy Level | X/10 |
| Focus Score | X/10 |
| Blockers Found | X |
| Blockers Resolved | X |

---

**Block Summary:** [One-line summary of main achievement]
```

**Why A-Z format:** Ensures nothing is missed. Each section is a checklist.

---

## Smart Carry-Over Logic

Determine where incomplete tasks should go:

```
IF task.blocked_by == 'technical' AND !resolved:
    carry_to = 'next_block'
    suggestion = "Consider pairing or breaking into smaller steps"

IF task.blocked_by == 'external':
    carry_to = 'tomorrow'
    suggestion = "Set reminder to follow up"

IF task.blocked_by == 'energy' AND energy_level < 5:
    carry_to = 'tomorrow_first_90'
    suggestion = "Tackle when energy is highest"

IF task.blocked_by == 'time' AND progress > 50%:
    carry_to = 'next_block'
    suggestion = "Continue momentum"

IF task.blocked_by == 'time' AND progress < 50%:
    carry_to = 'backlog'
    suggestion = "Consider splitting or delegating"
```

---

## Daily Plan Update Format

Append to daily plan file:

```markdown
---

## SESSION: [Block Type] (Completed [HH:MM])

**Completion:** XX% | **Energy:** X/10 | **Focus:** X/10

**Completed:** [Task list]

**Carried to [Next Block/Tomorrow]:**
- [Task with context]

**Key Learning:** [Insight]

---
```

---

## Example Session

```
/end-timeblock

> Which block are you ending?
First 90

> Let's review your planned tasks:

Task: Deploy Ruben n8n workflow
Status? Completed
Actual time? 45 min (planned: 60)

Task: Test webhook endpoint
Status? Partially done
What blocked it? Technical - endpoint returning 500
Carry to? Next block

> Additional work this block?
Yes - Fixed docker compose config (15 min)

> Energy level (1-10)? 7
> Focus score (1-10)? 8
> Interruptions? 1

> Any wins?
- Ruben API responding healthy
- Workflow imported successfully

> Key learning?
Always check docker logs before assuming code issue

[Generates summary, saves to Supabase, updates daily plan]
```

---

## Metrics Calculation

```javascript
// Completion rate
completion_rate = (completed_tasks / planned_tasks) * 100

// Time estimation accuracy
estimation_accuracy = (actual_total_minutes / planned_total_minutes) * 100

// Productivity score (composite)
productivity_score = (completion_rate * 0.4) + (energy * 10 * 0.3) + (focus * 10 * 0.3)
```

---

*Reference doc for end-timeblock. Main command: `.claude/commands/1-timeblock/end-timeblock.md`*
