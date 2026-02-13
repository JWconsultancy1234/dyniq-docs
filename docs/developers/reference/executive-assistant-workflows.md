---
title: "Executive Assistant Workflows Reference"
sidebar_label: "Executive Assistant Workflows Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Executive Assistant Workflows Reference

Detailed templates and procedures for EA agent. See `.claude/agents/exec-assistant.md` for overview.

---

## Review Templates

### 30-Day Review

**Location:** `.agents/logs/board-meetings/reviews/YYYY-MM-DD-{topic}-review.md`

```markdown
## 30-Day Review: [Decision Topic]

**Decision:** {ceo_decision} | **Date:** {meeting_date} | **Due:** +30 days

### Context
- Problem: {problem_statement}
- Options: {list with scores}
- Predicted Impact: Time: {X} | Cost: {Y} | Freedom: {Z}

### Review Checklist
- [ ] Implemented? (YES/NO/PARTIAL)
- [ ] Actual vs predicted impact match? (accuracy %)
- [ ] Same decision again? (YES/NO)
- [ ] Outcome: CONFIRMED_GOOD / NEEDS_ADJUSTMENT / FAILED_PIVOT

### Agent Accuracy
| Agent | Predicted | Actual | Accuracy |
|-------|-----------|--------|----------|
| CFO/CTO/COO/Data | {pred} | {actual} | {%} |
```

### T+7 Quick Check

**Location:** `.agents/logs/board-meetings/reviews/YYYY-MM-DD-{topic}-t7-check.md`

```markdown
## T+7 Check: [Topic]

**Decision:** {ceo_decision} | **Status:** ON_TRACK / MINOR_ISSUES / BLOCKED

### Quick Status
- [ ] Implementation started?
- [ ] Blockers? (None / Technical / Resource / External)
- Progress: ___%

**If BLOCKED:** CEO reviews immediately, consider pivot/rollback.
```

---

## Dashboard Templates

### Follow-Up Tracking

**Location:** `.agents/logs/board-meetings/{topic}-followup.md`

```markdown
## Follow-Up: {topic}

**Decision Date:** {date} | **Updated:** {timestamp}

### Actions
| # | Action | Owner | Deadline | Status | Progress |
|---|--------|-------|----------|--------|----------|
| 1 | {action} | {owner} | {date} | ⬜/🔄/✅/❌ | {%} |

### Reviews
| Type | Date | Status |
|------|------|--------|
| T+7 | {date} | PENDING/COMPLETED |
| T+30 | {date} | PENDING/COMPLETED |

### Links
- Decision: `.agents/logs/board-meetings/{file}.md`
- Review: `.agents/logs/board-meetings/reviews/{file}-review.md`
```

### Meeting Prep Context

```markdown
## Prep: [Topic]

**Type:** Board Meeting | **Level:** {0-4} | **Duration:** {est}

### Historical Context
| Date | Topic | Decision | Outcome |
|------|-------|----------|---------|
| {prev} | {topic} | {decision} | {status} |

### Current Metrics
- Path A: {status} | Path B: €{revenue}/€10k target
- Days to freedom: {X}/170 | B-hours: {Y}/5.5h

### Pending Actions
| Decision | Action | Owner | Status |
|----------|--------|-------|--------|
| {topic} | {action} | {owner} | {status} |
```

---

## Manual Workflow (Step-by-Step)

### When Board Meeting Completes

1. **Generate review prompt** - Create `.agents/logs/board-meetings/reviews/YYYY-MM-DD-{topic}-review.md`
2. **Create follow-up dashboard** - Create `.agents/logs/board-meetings/{topic}-followup.md`
3. **Notify CEO:**

```markdown
## EA Notification

**Complete:** {topic} | **Decision:** {ceo_decision}

**Action (2 min):**
1. Calendar: {+30 days}, 09:00, 15 min - "Review: {topic}"
2. Reminder: T+7 quick check ({+7 days})

**Files:** Review prompt + Follow-up dashboard created.
```

---

## Database Queries

### Core Queries

```sql
-- Fetch decision for review
SELECT id, meeting_date, topic, decision_summary, ceo_decision,
       ceo_rationale, predicted_impact, option_scores, file_path
FROM board_meeting_decisions WHERE id = '{decision_id}';

-- Check review completion rate
SELECT
  COUNT(*) FILTER (WHERE review_date IS NOT NULL) * 100.0 / COUNT(*) as review_pct,
  COUNT(*) FILTER (WHERE review_t7_status IS NOT NULL) * 100.0 / COUNT(*) as t7_pct
FROM board_meeting_decisions WHERE meeting_date > NOW() - INTERVAL '90 days';

-- Fetch pending reviews (overdue)
SELECT topic, meeting_date,
       NOW()::date - (meeting_date + INTERVAL '30 days')::date as days_overdue
FROM board_meeting_decisions
WHERE review_date IS NULL AND meeting_date + INTERVAL '30 days' < NOW();

-- Open action items due within 7 days
SELECT decision_id, action_description, owner, deadline, status
FROM action_items
WHERE status IN ('not_started', 'in_progress') AND deadline < NOW() + INTERVAL '7 days';
```

### Update Queries

```sql
-- T+7 status update
UPDATE board_meeting_decisions
SET review_t7_status = '{ON_TRACK|MINOR_ISSUES|BLOCKED}', review_date = NOW()
WHERE id = '{decision_id}';

-- T+30 completion
UPDATE board_meeting_decisions
SET actual_impact = '{"time": "{X}", "cost": "{Y}", "freedom": "{Z}"}'::jsonb,
    outcome_status = '{CONFIRMED_GOOD|NEEDS_ADJUSTMENT|FAILED_PIVOT}',
    review_date = NOW(), review_t30_status = 'completed'
WHERE id = '{decision_id}';
```

---

## Calendar Entry Template

```markdown
## Calendar: 30-Day Review - [Topic]

**Date:** {+30 days} | **Time:** 09:00 | **Duration:** 15 min

**Agenda:**
1. Review original context (5 min)
2. Compare predicted vs actual (5 min)
3. Update outcome + lessons (5 min)

**Prep:** Read decision log + review prompt
**Link:** `.agents/logs/board-meetings/reviews/{file}-review.md`
```

---

## Automation Roadmap

### Phase 2: MoltBot Integration (Future)

- Daily cron at 09:00 checks T+7 and T+30 reviews due
- Auto-triggers EA agent for review generation
- Sends Telegram notification with context link

### Phase 3: Calendar API (Future)

- Cal.com integration for auto-scheduling
- T+30 review: 15 min at 09:00
- T+7 quick check: 5 min at 09:00

---

## Success Metrics

### Time Buyback ROI

| Process | Before EA | With EA | Savings |
|---------|-----------|---------|---------|
| Schedule review | 5 min | 2 min | 3 min |
| Load context | 15 min | 3 min | 12 min |
| Track follow-ups | 10 min | 0 min | 10 min |
| **Total** | **30 min** | **5 min** | **25 min** |

**Annual Impact:** 150-250 decisions/year x 25 min = 62-104 hours saved = **€4,500-€7,500** (@€72/hr)

**Phase 2+3 Future:** 27 min saved/decision = **€6,500-€10,800** annual value

---

*Reference for `.claude/agents/exec-assistant.md`*
