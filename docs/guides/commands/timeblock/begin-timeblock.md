---
description: Start a new timeblock with full context from previous sessions
---

# Begin Timeblock: Context Load & Session Start

## Objective

Start a new time block with COMPLETE context from:
1. Today's daily plan (single source of truth)
2. Previous session summaries and carry-overs
3. All pending tasks across repos
4. Blockers that need resolution

## Detailed Procedures


## CRITICAL: Load Full Context First

```bash
# Single source of truth for today
cat /Users/walker/Desktop/Code/walker-os/.agents/logs/daily-plan/daily-plan-$(date +%Y-%m-%d).md
```

## Process Summary

### Phase 1: Identify Block

| Block Type | Time Window |
|------------|-------------|
| First 90 | 4:15-5:45 AM |
| Deep Work 2 | 5:55-6:45 AM |
| Midday B | 12:00-14:00 |
| Afternoon B | 16:00-17:30 |

### Phase 2: Load Daily Plan & CEO Dashboard (AUTOMATIC)

**Auto-load and display:**
1. Today's daily plan file
2. CEO Dashboard (if exists)
3. Extract: #1 Priority, this block's tasks, carry-overs, blockers, commands

**Display CEO Dashboard to user:**
```
📊 CEO DASHBOARD

Completed Today:
- {X/Y tasks complete}
- {Z min saved via automation}

Current Block: {block_name}
- Planned: {X min}
- Tasks: {list}

Week Progress: Day {X}/7
```

**NEVER skip showing the dashboard.** This maintains visibility and discipline.

### Phase 3: Check Pending Items

- Scan repos for uncommitted work
- Check external API status (Twilio, webhooks)
- Query north star progress
- Alert on persistent blockers (>2 days)

### Phase 3b: Context File Freshness Check (NEW)

**Check if EPIC context files are stale:**

```bash
# Find context files updated more than 2 days ago
find .agents/context/ -name "EPIC-*-context.md" -mtime +2
```

**If stale files found, alert:**
```
⚠️ STALE CONTEXT FILES:
- EPIC-strategic-advisory-council-context.md (last updated 3 days ago)

Run /explore on master execution plan to sync before starting work.
```

**Why:** Prevents context drift that compounds across sessions.

### Phase 3c: Daily Intelligence Briefing (Live)

**Run 6 parallel web searches on business-relevant topics using Claude's WebSearch tool.**

**Topics (search all 6 in parallel):**

1. **AI Trends + Models + Tools:** `"newest AI models tools breakthroughs {month} {year}" OR "OpenRouter pricing new models"`
2. **Lead Gen Flemish Trades:** `"lead generation HVAC plumbing installer Belgium Flanders {year}"`
3. **Belgian Subsidies + Grants:** `"VLAIO KMO-portefeuille digitalisering subsidie renovation premium Belgium {year}"`
4. **Voice AI Competitors:** `"AI voice agent Belgium Netherlands VoiceGenie MyAutoPilot Bland AI Vapi {year}"`
5. **Bol.com Changes (Path A):** `"bol.com seller API marketplace policy changes {year}"`
6. **Installer Market Belgium:** `"HVAC installer capacity Belgium oil burner replacement trade show Flanders {year}"`

**Analysis filter (apply to all results):**
For each result, answer: Does this affect Path A (BolScout) or Path B (DYNIQ €10k/mo)?
- If YES → Include with "so what?" and action item
- If NO → Skip entirely
- Maximum 5 items. If <3 actionable → "No urgent signals today."

**Internal metrics (pull via curl):**
```bash
# Pipeline health
curl -s "https://agents-api.dyniq.ai/health" -H "X-API-Key: $AGENTS_API_KEY"
```

**Output format in context briefing:**
```
INTELLIGENCE HIGHLIGHTS (live search)

| # | Signal | So What? | Action |
|---|--------|----------|--------|
| 1 | [finding] | [business impact] | [what to do] |

Internal: Pipeline ✅ | Agents API: healthy
```

**Why inline:** Uses Claude subscription (€0 cost), Opus-quality analysis, fresh results at block start, zero infrastructure.

### Phase 4: Generate Context Briefing

Output: Alerts, priority, tasks, carry-overs, uncommitted work, blockers, intelligence highlights, quick reference.

### Phase 5: Confirm Start

Ask user to proceed, request more context, or switch blocks.

## Integration with /end-timeblock

```
/end-timeblock writes → daily-plan-YYYY-MM-DD.md
                              ↓
/begin-timeblock reads ← daily-plan-YYYY-MM-DD.md
```

## Usage

```bash
claude /begin-timeblock
claude /begin-timeblock midday_b
```

## Notes

- Always read ENTIRE daily plan for full context
- External API status checks often first priority
- Check uncommitted work across ALL repos
- **Security validation scope:** If working with automation scripts, ensure validation covers ALL file types (`.sh`, `.py`, `.md`, `.sql`), not just source code
