---
description: End current timeblock with session review, metrics capture, and smart carry-over
---

# End Timeblock: Session Review & Handoff

## Objective

Close the current time block with a structured review that:
1. **AUTO-SCANS all active repos** for git activity
2. Creates **comprehensive A-Z summary** of all work done
3. Updates **daily-plan file as SINGLE SOURCE OF TRUTH**
4. Generates smart carry-over for /begin-timeblock context
5. Saves to Supabase for pattern learning

## Reference Docs


---

## CRITICAL: Auto-Scan All Repos

**ALWAYS scan ALL these repos automatically - DO NOT ask:**

```bash
REPOS=(
  "/Users/walker/Desktop/Code/dyniq-ai-agents"
  "/Users/walker/Desktop/Code/dyniq-n8n"
  "/Users/walker/Desktop/Code/dyniq-crm"
  "/Users/walker/Desktop/Code/dyniq-app"
  "/Users/walker/Desktop/Code/walker-os"
  "/Users/walker/Desktop/Code/bolscout-app"
)
```

---

## Pre-Flight Checklist

- [ ] Block type confirmed with user (Phase 0)
- [ ] Timestamp checked: `date +%H:%M` - NEVER assume time
- [ ] FastAPI running? `curl http://localhost:8000/health`
- [ ] Daily plan file exists for today?
- [ ] You will ASK (not assume) energy, focus, wins, learnings, SOP candidates?

---

## Process Overview

### Phase 0: Block Type Confirmation (MANDATORY FIRST STEP)

**NEVER assume block type. ALWAYS ask:**

```
Which timeblock are you ending?
- First 90 (4:15-5:45 AM)
- Deep Work 2 (5:55-6:45 AM)
- Midday B (12:00-14:00)
- Afternoon B (16:00-17:30)
- Saturday Path A / Sunday Path B
- Custom/Extended block
```

| Block Type | ID |
|------------|-----|
| First 90 | `first_90` |
| Deep Work 2 | `deep_work_2` |
| Midday B | `midday_b` |
| Afternoon B | `afternoon_b` |
| Custom | `custom` |

---

### Phase 1-2: Load Context & Scan Repos

1. Read today's daily plan
2. Auto-scan ALL repos for git activity (commits, uncommitted changes)
3. Ask about server-side work (Contabo) and external APIs

---

### Phase 3: Collect Session Data (MANDATORY PROMPTS)

**ALWAYS ASK - NEVER ASSUME these values:**

#### 3.1 Task Review (REQUIRED)
For each planned task:
- Status: Completed / Partially done / Not started / Cut
- If completed: Actual time?
- If incomplete: What blocked it?

#### 3.2 Additional Work (REQUIRED)
- Did you complete any unplanned tasks?

#### 3.3 Energy & Focus (REQUIRED - ALWAYS ASK)
```
Energy level (1-10):
  1-3: Drained | 4-6: Moderate | 7-10: Strong

Focus score (1-10):
  1-3: Distracted | 4-6: Some interruptions | 7-10: Deep focus

Interruptions count: [number]
```

#### 3.4 Blockers (REQUIRED)
```
Type:
  1. Technical (bugs, deployment, dependencies)
  2. External (meetings, waiting on others)
  3. Internal (energy, motivation, unclear requirements)
  4. Resource (missing info, access, tools)

Resolved: Yes/No
```

#### 3.5 Wins & Learnings (REQUIRED - ASK USER)
- What went well?
- Key learning or insight?

#### 3.6 SOP Candidates (REQUIRED)
- Any tasks done 2+ times that should become SOPs?
- Any tasks that took >45 min that could be delegated?

---

### Phase 4-5: Generate Summary

Calculate metrics and generate A-Z summary.
**See:** @end-timeblock-templates.md for full template.

---

### Phase 6-7: Carry-Over & Daily Plan Update

Apply smart carry-over logic (see templates doc) and append session to daily plan.

---

### Phase 7.5: Confirm Data with User (REQUIRED)

**Before saving to Supabase:**

```
Please confirm this data is correct:
- Energy: X/10
- Focus: X/10
- Wins: [list]
- Learnings: [text]
- Blockers: [list]
- SOP Candidates: [list or "none"]

Correct? (yes/no)
```

---

### Phase 7.6: Executive Assistant Check

**EA scans for pending action items:**
- Check daily plan for board meeting follow-ups
- Flag any overdue T+7 or T+30 reviews
- Surface action items assigned to CEO from past decisions
- Include in session summary: "Pending Reviews: [list]"

**Output example:**
```
📋 EA Note: T+30 Review due tomorrow for "MoltBot Adoption Decision"
📋 EA Note: 2 action items from Jan 24 board meeting still pending
```

---

### Phase 7.7: CEO Dashboard Update (AUTOMATIC WRITE - MANUAL COMMIT)

**CRITICAL:** This phase writes automatically. Commit requires user action.

**Purpose:** Maintain discipline by auto-documenting every timeblock.

**Auto-calculate:**
1. **Actual time:** Start time (from /begin-timeblock) → Now
2. **Completed work:** Git commits, files modified, tasks marked done
3. **Time variance:** Planned vs Actual (with ±X min delta)
4. **Deliverables:** Count and list what was created
5. **Strategic value:** ROI, time saved, automation impact

**Auto-update CEO Dashboard section in daily plan:**

```markdown
### Timeblock Update: {block_name} - {timestamp}

| Task | Planned | Actual | Status |
|------|---------|--------|--------|
| {task1} | {X min} | {Y min} | ✅ Complete |
| {task2} | {X min} | {Y min} | ⏳ In Progress |

**Deliverables:** {count} items
- {deliverable 1}
- {deliverable 2}

**Strategic Value:**
- Time saved: {X min}
- ROI: {Y}%
- Automation: {impact}

**Next:** {next task from plan}
```

**SECURITY: NO AUTO-COMMIT**

```bash
# Stage files (automatic)
git add .agents/logs/daily-plan/

# DO NOT auto-commit or auto-push!
# User must run /commit which includes security scan
```

**Output to user:**
```
✅ Timeblock complete
✅ CEO Dashboard updated (staged)
⚠️ Run /commit to commit changes (includes security scan)
```

**NEVER:**
- ❌ Ask "Should I update the dashboard?" (updating is automatic)
- ❌ Skip this step due to "time pressure"
- ❌ AUTO-COMMIT without security scan
- ❌ AUTO-PUSH without user confirmation

**Discipline Rule:** Dashboard update is automatic, but commit requires `/commit` for security.

---

### Phase 8-10: Automation

**Save to Supabase, detect SOPs, update patterns, check for follow-ups.**
**See:** @end-timeblock-automation.md for API calls.

---

## Quality Criteria

**Mandatory Prompts (must ask user):**
- [ ] Block type confirmed
- [ ] Energy level asked (not assumed)
- [ ] Focus score asked (not assumed)
- [ ] Wins asked from user (not generated)
- [ ] Learnings asked from user (not generated)
- [ ] SOP candidates question asked
- [ ] Blockers question asked

**Data Completeness:**
- [ ] All planned tasks accounted for
- [ ] Blockers documented with type
- [ ] Carry-over tasks have destination
- [ ] Data confirmed before save

**Database (CRITICAL for /review):**
- [ ] Session saved to Supabase via API
- [ ] User warned if save failed

---

## Single Source of Truth

**ALL session data written to:**
```
/Users/walker/Desktop/Code/walker-os/.agents/logs/daily-plan/daily-plan-YYYY-MM-DD.md
```

---

## Usage

```bash
claude /end-timeblock
# Or with block type:
claude /end-timeblock first_90
```

---

## Notes

- Minimum viable: tasks completed + energy level
- Patterns require 10+ sessions for confident insights
- Sessions auto-refresh patterns after save

---

*See reference docs for templates and automation details.*
