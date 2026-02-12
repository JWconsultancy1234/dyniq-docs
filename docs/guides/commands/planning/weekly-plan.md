---
description: Generate weekly plan by scanning repos and applying Martell framework
---

# Weekly Plan: The Perfect Week

## Objective

Generate a comprehensive weekly plan by scanning all repos for tasks, applying Dan Martell's Perfect Week framework, and mapping work to the full week schedule.

## Context

**Days to Freedom:** Calculate from today to July 2026
**Hourly Rate:** EUR 72/hr
**Weekly B Quadrant Target:** 42 hours

**Weekly Schedule Template:**
| Day | Morning (4:15-6:45) | Midday (12:00-14:00) | Afternoon (16:00-17:30) |
|-----|---------------------|----------------------|-------------------------|
| Mon | First 90 + Block 2 | B Quadrant | B Quadrant |
| Tue | First 90 + Block 2 | B Quadrant | B Quadrant |
| Wed | First 90 + Block 2 | B Quadrant | B Quadrant |
| Thu | First 90 + Block 2 | B Quadrant | B Quadrant |
| Fri | First 90 + Block 2 | B Quadrant | B Quadrant |
| Sat | Path A Focus (4 hrs) | - | - |
| Sun | Path B Focus (4 hrs) | - | - |

## Process

### Phase 1: Review Last Week

Check last week's daily plans and scorecard:
```bash
ls -la .agents/logs/daily-plan/
```

Analyze:
- Completion rate of planned tasks
- B Quadrant hours logged vs target (42 hrs)
- Habit score vs target (55/64)
- What worked, what didn't

### Phase 2: Scan All Repositories

**Repos to scan:**
- `/Users/walker/Desktop/Code/Bolscout 2026/bolscout-app` (Path A)
- `/Users/walker/Desktop/Code/walker-os` (Path B)
- `/Users/walker/Desktop/Code/dyniq-app` (Path B)
- `/Users/walker/Desktop/Code/dyniq-ai-agents` (Path B)
- `/Users/walker/Desktop/Code/dyniq-crm` (Path B)
- `/Users/walker/Desktop/Code/dyniq-n8n` (Path B)

For each repo:
1. PRD unchecked items
2. Active plan files
3. Git status (WIP)
4. Code TODOs
5. Linear tickets (if available)

### Phase 2.5: Load Project Tracking Data

**Query active projects from database:**

```sql
SELECT
  project_id,
  resource_name,
  initial_estimate_hours,
  cumulative_actuals,
  etc_hours,
  re_forecast_hours,
  variance_percent
FROM vw_project_etc_summary
WHERE status = 'ACTIVE'
ORDER BY variance_percent DESC;
```

**Use this data to:**
- Identify projects with high variance (>10%) → prioritize
- Calculate hours spent vs remaining
- Adjust weekly capacity based on actuals
- Flag projects needing `/update-etc`

**Integration with planning:**
- Projects with `variance_percent > 10%` → Add to "Watch" list
- Projects with `etc_hours = 0` → Ready for completion, schedule final tasks
- Projects with `cumulative_actuals > initial_estimate` → Review scope or cut features

### Phase 3: Identify Week's #1 Priority

Apply the "ONE Thing" principle:
> "What's the ONE thing I can do this week such that by doing it everything else becomes easier or unnecessary?"

Evaluate candidates:
- Highest $ value task
- Removes biggest blocker
- Creates most leverage
- Moves freedom needle most

### Phase 4: Balance Path A / Path B

**Weekly Split Target:**
- Path A (BolScout): 40% (~17 hrs)
- Path B (Freedom): 60% (~25 hrs)

Map to days:
- Mon/Wed/Fri: Path A focus
- Tue/Thu: Path B focus
- Sat AM: Path A deep work
- Sun AM: Path B deep work

### Phase 5: Apply Martell Decision Filter

For each task:
1. EUR 72/hr Test
2. WHO Not HOW
3. Path Alignment
4. Freedom Impact

Categorize:
- $5000 tasks → First 90 slots
- $500 tasks → Deep Work blocks
- $100 tasks → Midday/Afternoon
- $10 tasks → DELEGATE or CUT

### Phase 6: Map to DRIP Quadrant

| Quadrant | Tasks |
|----------|-------|
| Production | First 90 + Critical features |
| Investment | Learning, systems, automation |
| Replacement | Tasks to systematize |
| Delegation | Tasks to delegate |

### Phase 7: Generate Weekly Plan

**Output Format:**

```markdown
# WEEKLY PLAN: Week [ISO Week Number], [Year]

**Week of:** [Monday Date] - [Sunday Date]
**Days to Freedom:** X/170
**Week's #1 Priority:** [Single most important outcome]

---

## WEEK OVERVIEW

| Day | Focus | #1 Task |
|-----|-------|---------|
| Mon | Path A | [task] |
| Tue | Path B | [task] |
| Wed | Path A | [task] |
| Thu | Path B | [task] |
| Fri | Path A | [task] |
| Sat | Path A | [task] |
| Sun | Path B | [task] |

---

## PATH A: BOLSCOUT (17 hrs target)

### Week Goals
- [ ] [Goal 1]
- [ ] [Goal 2]

### Tasks by Priority
| Task | Value | Day | Block |
|------|-------|-----|-------|
| [task] | $5000 | Mon | First 90 |

---

## PATH B: FREEDOM (25 hrs target)

### Week Goals
- [ ] [Goal 1]
- [ ] [Goal 2]

### Tasks by Priority
| Task | Value | Day | Block |
|------|-------|-----|-------|
| [task] | $5000 | Tue | First 90 |

---

## WEEKLY SCORECARD TARGETS

| Metric | Target | Track |
|--------|--------|-------|
| Habit Score | 55+/64 | /64 |
| B Quadrant Hours | 42 hrs | hrs |
| $5000 Task Hours | 20+ hrs | hrs |
| First 90 Protected | 7/7 | /7 |

---

## DELEGATION CANDIDATES

| Task | Delegate To | Why |
|------|-------------|-----|
| [task] | [who] | < EUR 72/hr |

---

## BLOCKED / WAITING

| Item | Blocked By | Action |
|------|------------|--------|
| [task] | [blocker] | [action] |

---

## WEEKLY REFLECTION PROMPTS

At end of week, answer:
1. What moved the freedom needle most?
2. What should I do MORE of?
3. What should I STOP doing?
4. What's next week's #1 priority?

---

Generated: [timestamp]
Saved to: .agents/logs/weekly-plan/weekly-plan-[year]-W[week].md
```

### Phase 8: Save Output

Save the plan to:
```bash
.agents/logs/weekly-plan/weekly-plan-$(date +%Y)-W$(date +%V).md
```

## Quality Criteria

- [ ] Week's #1 Priority is clearly defined
- [ ] Path A/B split is balanced (40/60)
- [ ] All First 90 slots have $5000 tasks
- [ ] No $10 tasks on my schedule
- [ ] Delegation candidates identified
- [ ] Blockers flagged with actions

## Usage

Run Sunday evening during shutdown ritual:
```bash
claude /weekly-plan
```

## Notes

- Weekly plan informs daily plans
- Adjust mid-week if priorities shift
- Review and reflect every Sunday
- Keep it simple: max 3 goals per path
