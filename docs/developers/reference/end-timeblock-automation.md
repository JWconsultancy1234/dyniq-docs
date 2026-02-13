---
title: "End Timeblock Automation"
sidebar_label: "End Timeblock Automation"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# End Timeblock Automation

> Technical reference for Supabase saves, SOP detection, and ML pattern updates.

---

## Phase 8: Save to Supabase (MANDATORY)

**Without this step:**
- Data won't appear in `/review`
- Patterns won't be learned
- Metrics won't be tracked

### API Call

```bash
curl -X POST http://localhost:8000/api/timeblock \
  -H "Content-Type: application/json" \
  -H "x-api-key: $WALKER_OS_API_KEY" \
  -d '{
    "block_type": "[first_90|deep_work_2|midday_b|afternoon_b|custom]",
    "block_date": "YYYY-MM-DD",
    "actual_duration_minutes": [minutes],
    "completion_rate": [0-100],
    "energy_level": [1-10],
    "focus_score": [1-10],
    "interruptions_count": [number],
    "completed_tasks": ["Task 1 - 30 min", "Task 2 - 20 min"],
    "incomplete_tasks": ["Task 3 (blocked by X)"],
    "blockers": ["WhatsApp approval - 3 days (external)", "API issue (technical, resolved)"],
    "wins": ["Win 1", "Win 2"],
    "learnings": "Key insight from this block",
    "carry_over_tasks": ["Task for next block (HIGH)", "Another task (MEDIUM)"],
    "primary_path": "path_a|path_b|both"
  }'
```

### If FastAPI Not Running

1. Check health: `curl http://localhost:8000/health`
2. Start it: `cd /Users/walker/Desktop/Code/walker-os/apps/api && docker compose up -d`
3. Wait 10 seconds
4. Retry the API call
5. If still failing: Add "Save session to Supabase" as HIGH priority carry-over
6. Warn user: "Session not saved to database - won't appear in /review until saved"

### Success Response

```json
{"success": true, "session_id": "uuid", "message": "Session saved to Supabase. ML patterns refreshed."}
```

---

## Phase 8.5: Blocker Age & Escalation

### Check Persistent Blockers

```bash
grep -h "Blocker\|BLOCKED\|blocked by" \
  /Users/walker/Desktop/Code/walker-os/.agents/logs/daily-plan/daily-plan-*.md \
  | grep -v "Resolved" | sort -u
```

### Age Calculation

```python
blocker_age = today - first_seen_date

if blocker_age >= 2:
    alert = "PERSISTENT BLOCKER"
    suggestion = "Consider escalation or workaround"

if blocker_age >= 5:
    alert = "CRITICAL BLOCKER"
    suggestion = "This is blocking progress. Escalate immediately or cut the task."
```

### Output Format

```markdown
### BLOCKER HEALTH CHECK

| Blocker | Days Pending | Suggestion |
|---------|--------------|------------|
| WhatsApp template approval | 3 days | Escalate to Meta support |
| API integration issue | 1 day | OK - continue troubleshooting |

**Action Required:**
- [ ] Escalate: [Blocker name] - Contact [who]
```

---

## Phase 9: Auto-Detect SOP Candidates

### API Call

```bash
curl -X POST http://localhost:3000/api/sops/suggest \
  -H "Content-Type: application/json" \
  -d "{
    \"tasks\": $TASKS,
    \"session_id\": \"$SESSION_ID\",
    \"block_type\": \"$BLOCK_TYPE\"
  }"
```

### Detection Sources

| Source | Trigger | Confidence |
|--------|---------|------------|
| `explicit_flag` | Task starts with "SOP:", "DELEGATE:", or "[SOP]" | 95% |
| `timeblock_repeat` | Task appears 2+ times in history | 50-90% |
| `low_value_detected` | Matches admin/low-value patterns | 65-70% |
| `time_sink` | Task took >45 minutes | 60-85% |

### Response Format

```json
{
  "success": true,
  "suggestions_created": 2,
  "candidates": [...],
  "message": "Created 2 SOP suggestion(s). Review at /sops/suggestions"
}
```

### User Display

```markdown
**SOP Candidates Detected:**

1. **Weekly report preparation** (repeated 3x) - Confidence: 80%
2. **Email inbox triage** (low-value pattern) - Confidence: 70%

Review at: http://localhost:3000/sops/suggestions
```

**Pro tip:** Prefix any task with "SOP:" to force-create a suggestion.

---

## Phase 10: ML Pattern Updates

Patterns auto-refresh when session is saved. The API detects:
- SOP candidates (tasks repeated 2+ times)
- Habit streaks (from daily_scorecard)
- Energy patterns by time of day
- Blocker frequency patterns

### Pattern Summary Display

```markdown
## Patterns Refreshed

**Detected this session:**
- SOP Candidates: X new (view at /insights)
- Energy: X/10 (your 05:00 avg is Y)
- Habit streaks: First 90 (day X)

**New Insights Generated:**
- [insight title if any]

View all patterns at `/insights`
```

### Manual Verification

```bash
curl -s http://localhost:8000/api/patterns/summary \
  -H "x-api-key: $WALKER_OS_API_KEY" | jq '.sop_candidates, .habit_streaks'
```

---

## Self-Learning Queries

After 10+ sessions:

```sql
-- Best block for high completion
SELECT block_type, avg_completion_rate
FROM v_timeblock_performance
WHERE user_id = '[user_id]'
ORDER BY avg_completion_rate DESC
LIMIT 1;

-- Energy pattern
SELECT pattern_data
FROM timeblock_patterns
WHERE user_id = '[user_id]'
AND pattern_type = 'energy_by_time';

-- Most common blocker
SELECT pattern_data
FROM timeblock_patterns
WHERE user_id = '[user_id]'
AND pattern_type = 'blocker_frequency';
```

---

## Output Files

| File | Purpose |
|------|---------|
| Supabase: `timeblock_sessions` | Primary data (via API) |
| Supabase: `sop_suggestions` | Auto-detected SOPs |
| Daily Plan markdown | Backup session summary |
| `timeblock_patterns` | Auto-updated via stored procedures |

---

## Integration Points

| System | How Connected |
|--------|---------------|
| Daily Plan | Reads planned tasks, appends summary |
| Daily Scorecard | Updates completion flags |
| Recommendation Engine | Insights feed into recommendations |
| Telegram Bot | Future - auto-reminder 5 min before block end |

---

*Technical reference for end-timeblock. Main command: `.claude/commands/1-timeblock/end-timeblock.md`*
