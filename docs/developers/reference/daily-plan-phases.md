---
title: "Daily Plan Phases Reference"
sidebar_label: "Daily Plan Phases Reference"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Daily Plan Phases Reference

Detailed phase procedures for `/daily-plan` command.

---

## Phase 0: Pre-Generation Context

### 0.1 Known Commitments

Ask the user:
```
Do you have any scheduled commitments tomorrow?
- Courses, training, workshops
- Meetings (internal or external)
- Appointments, travel

If yes: What time? (e.g., "PM course 9:00-15:30")
```

**If commitments exist:**
- Block that time as unavailable
- Adjust B-hour targets accordingly
- Note in plan header

### 0.2 Previous Day Late Activity Check

```bash
# Check if yesterday had activity past 22:00
grep -i "21:00\|22:00\|23:00" /Users/walker/Desktop/Code/walker-os/.agents/logs/daily-plan/daily-plan-$(date -v-1d +%Y-%m-%d).md
```

**If late activity found (past 22:00):**
- Suggest "Recovery Schedule"
- Don't plan 4 AM wake
- Skip First 90 and Deep Work 2 blocks
- Start B-work at midday

### 0.3 Recovery Schedule Template

| Block | Normal | Recovery |
|-------|--------|----------|
| Wake | 4:00 AM | 7:00-8:00 AM |
| First 90 | 4:15-5:45 | SKIP |
| Deep Work 2 | 5:55-6:45 | SKIP |
| Midday B | 12:00-14:00 | First B-block |
| Afternoon B | 16:00-17:30 | Normal |

**Adjusted B-hour target:** Reduce by 2.3h (morning blocks skipped)

---

## Phase 1-2: Repository Scanning

**Primary repos:**
```bash
# Path A (BolScout)
/Users/walker/Desktop/Code/Bolscout 2026/bolscout-app

# Path B (Freedom Products)
/Users/walker/Desktop/Code/walker-os
/Users/walker/Desktop/Code/dyniq-app
/Users/walker/Desktop/Code/dyniq-ai-agents
/Users/walker/Desktop/Code/dyniq-crm
/Users/walker/Desktop/Code/dyniq-n8n
```

**Extract from each:**
1. PRD unchecked items: `- [ ]`
2. Plan files incomplete tasks
3. Git status uncommitted work
4. Code TODOs/FIXMEs
5. README/ROADMAP tasks

---

## Phase 3: Martell Decision Filter

| Step | Question | Outcome |
|------|----------|---------|
| 1 | EUR 72/hr test | DELEGATE if no + drains energy |
| 2 | WHO not HOW | DELEGATE if someone else can own |
| 3 | Path Alignment | CUT if neither Path A nor B |
| 4 | Freedom Impact | DO_NOW / SCHEDULE / DEPRIORITIZE |

---

## Phase 4-5: Task Value & DRIP Quadrant

### Task Values

| Value | Type | Examples |
|-------|------|----------|
| $5000 | Strategy | Vision, 10X moves, key partnerships |
| $500 | Management | Leading, reviewing, deciding |
| $100 | Execution | Building features, writing code |
| $10 | Admin | Email, scheduling (DELEGATE) |

### DRIP Quadrant Mapping

| Quadrant | Money | Energy | Action |
|----------|-------|--------|--------|
| Production | High | High | First 90 + Deep Work |
| Investment | Low now | High | Schedule strategically |
| Replacement | High | Low | Systematize or delegate |
| Delegation | Low | Low | Delegate or cut |

---

## Phase 6: Output Template

```markdown
# DAILY PLAN: [Date]

**Days to Freedom:** X/170
**Focus:** Path A / Path B / Split

---

## FIRST 90 (4:15-5:45 AM) - #1 Task

**Task:** [Single most important task]
**Project:** [Repo/Project name]
**Value:** $5000
**Why First:** [Brief justification]

**Success Criteria:**
- [ ] [Specific outcome 1]
- [ ] [Specific outcome 2]

---

## DEEP WORK BLOCK 2 (5:55-6:45 AM)

**Task:** [Second priority or continue #1]
**Value:** $[value]

---

## MIDDAY B QUADRANT (12:00-14:00)

| Task | Project | Value | Est. Time |
|------|---------|-------|-----------|
| [Task 1] | [Project] | $[value] | [time] |

---

## AFTERNOON B QUADRANT (16:00-17:30)

| Task | Project | Value | Est. Time |
|------|---------|-------|-----------|
| [Task 1] | [Project] | $[value] | [time] |

---

## DELEGATION CANDIDATES

| Task | Delegate To | Why |
|------|-------------|-----|
| [Task] | [Suggestion] | < EUR 72/hr |

---

## TASKS CUT

- [Task]: [Why cut]

---

## SCORECARD TARGETS

- [ ] 4:00 AM Wake
- [ ] First 90 completed
- [ ] Fajr + Mind
- [ ] Body movement (10 min)
- [ ] B Quadrant Hours: [X]h target
- [ ] Shutdown Ritual at 9 PM
- [ ] 10 PM Bedtime
- [ ] No Screens 9:30+

---

## BEDTIME TRACKING

| Field | Value |
|-------|-------|
| **Target Bedtime** | 22:00 |
| **Actual Bedtime** | _____ |

**Rule:** If bedtime >22:30, trigger recovery schedule.
```

---

*Reference doc for /daily-plan command.*
