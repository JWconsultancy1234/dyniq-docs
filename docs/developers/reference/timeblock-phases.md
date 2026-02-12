---
title: "Timeblock Phases Reference"
sidebar_label: "Timeblock Phases Reference"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Timeblock Phases Reference

Detailed phase procedures for `/begin-timeblock` command.

---

## Block Types

| Block Type | Time Window | ID |
|------------|-------------|-----|
| First 90 | 4:15-5:45 AM | `first_90` |
| Deep Work 2 | 5:55-6:45 AM | `deep_work_2` |
| Midday B | 12:00-14:00 | `midday_b` |
| Afternoon B | 16:00-17:30 | `afternoon_b` |
| Saturday Path A | Sat AM | `saturday_path_a` |
| Sunday Path B | Sun AM | `sunday_path_b` |
| Custom | Any | `custom` |

---

## Phase 2: Daily Plan Loading

**Single source of truth:**
```bash
cat /Users/walker/Desktop/Code/walker-os/.agents/logs/daily-plan/daily-plan-$(date +%Y-%m-%d).md
```

**Extract:**
1. Today's #1 Priority
2. Planned tasks for this specific block
3. Previous session summaries
4. Carry-over tasks
5. Unresolved blockers
6. Commands/references

---

## Phase 3: Pending Items Check

### Uncommitted Work Scan

```bash
for repo in dyniq-ai-agents dyniq-n8n dyniq-crm dyniq-app walker-os bolscout-app; do
  REPO_PATH="/Users/walker/Desktop/Code/$repo"
  if [ -d "$REPO_PATH/.git" ]; then
    STATUS=$(git -C "$REPO_PATH" status --short)
    if [ -n "$STATUS" ]; then
      echo "=== $repo: uncommitted changes ==="
      echo "$STATUS"
    fi
  fi
done
```

### External Items to Check

- Template approvals (Twilio/WhatsApp)
- Deployment status
- Webhook configurations

---

## Phase 3.5: North Star Progress

```bash
curl -s http://localhost:8000/api/north-star 2>/dev/null || echo "API not running"
```

**Warning thresholds:**
```
IF path_b_revenue < expected_for_this_month:
  ⚠️ "Path B behind schedule"

IF days_to_freedom < 100 AND path_b_revenue < 5000:
  🚨 "Critical: 100 days left, need to accelerate"
```

---

## Phase 3.6: Blocker Age Check

```bash
grep -A2 "BLOCKERS\|Blocker" /Users/walker/Desktop/Code/walker-os/.agents/logs/daily-plan/daily-plan-*.md | grep -v "Resolved"
```

**Alert format:**
```
⚠️ PERSISTENT BLOCKERS (>2 days):
- [Blocker description] - X days pending
  → Suggested action: Escalate or find workaround
```

---

## Phase 3c: Daily Intelligence Briefing (Live via WebSearch)

**Run 6 parallel WebSearch queries on business-relevant topics:**

| # | Topic | Query Template |
|---|-------|---------------|
| 1 | AI Trends + Models | `newest AI models tools breakthroughs {month} {year}` |
| 2 | Lead Gen Flemish Trades | `lead generation HVAC plumbing installer Belgium Flanders {year}` |
| 3 | Belgian Subsidies + Grants | `VLAIO KMO-portefeuille digitalisering subsidie renovation premium Belgium {year}` |
| 4 | Voice AI Competitors | `AI voice agent Belgium Netherlands VoiceGenie MyAutoPilot {year}` |
| 5 | Bol.com Changes | `bol.com seller API marketplace policy changes {year}` |
| 6 | Installer Market Belgium | `HVAC installer capacity Belgium oil burner replacement trade show {year}` |

**Filter:** Only include items that affect Path A (BolScout) or Path B (DYNIQ €10k/mo). Max 5 items. Each needs "so what?" + action.

**Architecture:** Claude WebSearch (€0, subscription) → Opus inline analysis → output in context briefing.

**Skip days with <3 actionable items** → "No urgent signals today."

---

## Phase 4: Context Briefing Template

```markdown
## TIMEBLOCK START: [Block Type]

**Date:** [YYYY-MM-DD]
**Time:** [HH:MM - HH:MM]
**Days to Freedom:** [X]/170
**North Star:** €[X]/€10k monthly (X% to goal)

---

### ⚠️ ALERTS (if any)

[North star warnings or persistent blockers]

---

### TODAY'S #1 PRIORITY

> [Priority from daily plan]

---

### THIS BLOCK'S PLANNED TASKS

| Task | Value | Est. Time |
|------|-------|-----------|
| [Task 1] | $X | X min |

---

### CARRY-OVER FROM PREVIOUS BLOCKS

| Task | Context | Priority |
|------|---------|----------|
| [Task] | [Why it matters] | HIGH/MEDIUM |

---

### PENDING ITEMS TO CHECK

**External APIs:**
- [ ] Check Twilio template approval
- [ ] Verify webhook responding

**Commands:**
```bash
# [command from previous session]
```

---

### INTELLIGENCE HIGHLIGHTS (live WebSearch)

| # | Signal | So What? | Action |
|---|--------|----------|--------|
| 1 | [finding from search] | [impact on Path A/B] | [what to do] |
| 2 | [finding] | [impact] | [action] |
| 3 | [finding] | [impact] | [action] |

*6 topics searched: LLM pricing, Lead gen, VLAIO subsidies, Competitors, Bol.com, Grants*
*Internal: Pipeline {status} | Agents API: {status}*

---

### UNCOMMITTED WORK

**Repos with pending changes:**
- `repo-name`: X files

---

### BLOCKERS TO RESOLVE

| Blocker | Status | Action |
|---------|--------|--------|
| [Issue] | Pending | [What to do] |

---

### QUICK REFERENCE

**SSH:** `ssh contabo`
**Ruben API:** `curl https://ruben-api.dyniq.ai/health`
**n8n:** https://automation.dyniq.ai

---

**Ready to start. Focus on: [Main objective]**
```

---

## Integration with /end-timeblock

```
/end-timeblock writes → daily-plan-YYYY-MM-DD.md
                              ↓
/begin-timeblock reads ← daily-plan-YYYY-MM-DD.md
```

**Key sections to extract:**
- `### H. CARRY-OVER TO NEXT BLOCK`
- `### E. BLOCKERS DISCOVERED`
- `### G. COMMANDS/REFERENCES`

---

*Reference doc for /begin-timeblock command.*
