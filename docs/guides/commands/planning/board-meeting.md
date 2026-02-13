---
title: "Board Meeting Command"
sidebar_label: "Board Meeting Command"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# Board Meeting Command

**Command:** `/board-meeting`
**Owner:** CEO-WALKER
**Purpose:** Structured C-suite agent council meeting for strategic decisions with institutional memory, domain-weighted voting, and adaptive complexity scaling.

---

## Phase 0: Mode Selection

### Pre-Flight Check (Required for Modes 2 & 3)

Before selecting Kimi Swarm or Hybrid mode, verify environment:

```bash
# Check AGENTS_API_KEY is set
[[ -z "$AGENTS_API_KEY" ]] && echo "❌ ERROR: AGENTS_API_KEY not set. See infrastructure-architecture.md → Local Development Setup" && return 1

# Verify API connectivity
curl -s "https://agents-api.dyniq.ai/health" -H "X-API-Key: $AGENTS_API_KEY" | grep -q "ok" && echo "✅ agents-api connected" || echo "⚠️ WARNING: agents-api not reachable"
```

**If pre-flight fails:** Use Mode 1 (Interactive) or run `/infrastructure:setup-agents-api`

---

**FIRST:** Ask the user which execution mode to use:

```
Which board meeting mode would you like to use?

1. **Interactive** (Recommended) - Local Claude CLI with Task agents
   - Full control, real-time interaction
   - Best for nuanced decisions requiring iteration
   - Duration: As specified by complexity level

2. **Kimi Swarm** - API dispatch to agents-api.dyniq.ai
   - 6+ parallel agents via LangGraph + Kimi K2.5
   - Faster execution, async processing
   - HITL decisions via Telegram

3. **Hybrid** - Start local, dispatch complex analysis to Kimi
   - Phase 1-2 local (framing + initial analysis)
   - Phase 3-5 via Kimi Swarm (parallel synthesis)
   - Phase 6-7 local (CEO decision + action plan)

Enter mode [1/2/3]:
```

### Mode 1: Interactive (Default)

Continue with standard command execution using local Claude CLI.
- Uses Task agents for parallel research
- Full control over each phase
- Real-time clarification and iteration
- **Proceed to Phase 1 below**

### Mode 2: Kimi Swarm

**API Dispatch to agents-api.dyniq.ai**

```bash
# Submit analysis request
curl -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -d '{
    "topic": "{topic}",
    "level": {level},
    "options": ["{option_1}", "{option_2}"],
    "context": "{additional_context}",
    "voting_weights": "domain"
  }'
```

**HITL via Telegram:** When status returns `hitl_required`, check Telegram for voting buttons (`bm_adopt`, `bm_pass`, `bm_defer`, `bm_experiment`).

### Mode 3: Hybrid

- **Local:** Phase 1-2 (framing + initial analysis)
- **Kimi:** Phase 3-5 (parallel synthesis via API)
- **Local:** Phase 6-7 (CEO decision + action plan)

---

## Quick Reference

```bash
# Full strategic decision (Level 3 - 120 min)
/board-meeting \
  --topic "Strategic tool evaluation: MoltBot vs Current Stack" \
  --level 3 \
  --research "moltbot/moltbot"

# Quick tactical decision (Level 1 - 45 min)
/board-meeting \
  --topic "Approve €500 tool subscription" \
  --level 1

# Critical company decision (Level 4 - 165 min)
/board-meeting \
  --topic "Path A vs Path B prioritization for Q2" \
  --level 4 \
  --research "market-trends,competitor-analysis"

# Force Kimi mode
/board-meeting \
  --topic "Evaluate new CRM options" \
  --level 3 \
  --mode kimi

# Force Hybrid mode
/board-meeting \
  --topic "Architecture redesign" \
  --level 4 \
  --mode hybrid
```

---

## Complexity Levels

| Level | Duration | Agents | Use Cases |
|-------|----------|--------|-----------|
| **0** | 10 min | CEO only | Instant tactical (yes/no, approve expense) |
| **1** | 45 min | CEO + 2 relevant | Quick decisions (tool selection, vendor) |
| **2** | 80 min | CEO + 3 core (CFO, COO, CTO) | Standard decisions (process, features) |
| **3** | 120 min | Full C-suite (5-6 agents) | **Strategic decisions** (architecture, roadmap) ← Default |
| **4** | 165 min | Full C-suite + spawned | Critical decisions (company direction, major investments) |

---

## Command Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--topic` | Yes | - | Decision topic or strategic question |
| `--level` | No | 3 | Complexity level (0-4) |
| `--mode` | No | `interactive` | `interactive`, `kimi`, or `hybrid` |
| `--research` | No | - | Comma-separated Context7 library IDs or topics |
| `--agents` | No | `auto` | `auto` (system selects) or specific agent list |
| `--voting-weights` | No | `domain` | `domain` (expertise-weighted) or `equal` |
| `--matrix-format` | No | `hybrid` | `hybrid` (qual+quant) or `qualitative` |
| `--reviews` | No | `milestone` | Review schedule: `milestone` or `fixed` (T+7/T+30 only) |

---

## The 7 Phases

### Phase 1: Frame & Load (15 min @ Level 3)

**CEO WALKER frames the problem:**
- Problem statement
- Success criteria
- Options to evaluate (2-4 options)
- Constraints (time, budget, risk tolerance)

**Head of Data loads context:**
- Historical decisions (similar topics from database)
- Context7 research (if --research provided)
- Current system state
- Path A/B alignment

**Output:**
- Framed problem with clear options
- Historical context loaded
- Research summarized
- All agents have shared context

---

### Phase 2: Agent Analysis (35 min @ Level 3)

**Each C-suite agent analyzes in parallel:**

| Agent | Focus Areas |
|-------|-------------|
| **CFO** | Cost-benefit, ROI, cashflow impact, Profit First buckets |
| **CTO** | Architecture fit, technical debt, security, maintenance |
| **COO** | Implementation complexity, process fit, delegation opportunities |
| **Head of Data** | Historical patterns, metrics validation, success measurement |
| **Marketing/Sales** | Market positioning, revenue opportunity, customer impact |

**Each agent provides:**
- Qualitative analysis (pros/cons)
- Quantitative scores (1-10) per criterion: cost, time, risk, freedom, strategic
- Recommendation: ADOPT / EXPERIMENT / PASS / DEFER
- Confidence level (1-10)

**Detailed scoring criteria:** @board-meeting-internals.md (Hybrid Scoring Matrix section)

---

### Phase 3: Synthesis Presentation (30 min @ Level 3)

Each agent presents findings (6 min × 5 agents):
- Summary of analysis
- Key risks and opportunities
- Quantitative scores
- Recommendation with rationale
- Confidence level

CEO asks clarifying questions.

---

### Phase 4: Capability Gap Check (10 min @ Level 3)

**Vote:** Do we have the right expertise for this decision?

All agents vote: YES / UNCERTAIN / NO

**If 2+ agents vote NO or UNCERTAIN:**
- CEO identifies missing domain (Legal, Brand Strategy, Integration, HR, Security, etc.)
- Spawn new agent mid-meeting
- Specialist provides compressed 10-min analysis
- Specialist participates in Phase 5 voting

**Dynamic spawning logic:** @board-meeting-internals.md (Phase 4 section)

---

### Phase 5: Options Matrix (15 min @ Level 3)

**For each option, generate hybrid scoring matrix:**

**Qualitative** (Pros/Cons) + **Quantitative** (Criterion scores 1-10)

**Domain-weighted agent votes:**
- Technical decision → CTO vote gets 2.0x weight
- Financial decision → CFO vote gets 2.0x weight
- Operational decision → COO vote gets 2.0x weight
- Strategic decision → All executives get 1.5x weight
- Market decision → Marketing vote gets 2.0x weight
- Data Executive always gets 1.5x weight (universal)

**Weighted vote calculation:**
```
Total weighted votes / Total weight multipliers = Final score
```

**Confidence level:** Based on vote spread (0-2 pts = High, 2-4 pts = Medium, 4+ pts = Low)

**Complete voting matrix:** @board-meeting-internals.md (Domain-Weighted Voting section)

---

### Phase 6: CEO Decision (10 min @ Level 3)

**CEO WALKER reviews:**
1. Hybrid scoring matrix
2. Domain-weighted votes
3. Agent confidence levels
4. Historical outcomes from similar decisions

**CEO makes final decision:**
- Selects: ADOPT / EXPERIMENT / PASS / DEFER
- Provides decision rationale
- Can override agents (with justification)
- Assigns action owners + deadlines

---

### Phase 7: Action Plan & Persistence (5 min @ Level 3)

**Generate action plan:**

| Action | Owner | Deadline | Success Metric |
|--------|-------|----------|----------------|
| {action_1} | {agent} | {date} | {metric} |
| {action_2} | {agent} | {date} | {metric} |

**Review schedule:**
- T+7 Quick Check (15 min)
- Milestone reviews (10 min each)
- T+30 Comprehensive Review (30 min)

**Persist to database:**
- Insert decision record to `board_meeting_decisions` table
- Create markdown log in `.agents/logs/board-meetings/`
- Trigger Executive Assistant to generate review prompts

**Database schema:** @board-meeting-reference.md (Database Schema section)
**Review system:** @board-meeting-internals.md (Review System section)

---

### Phase 7.5: Automation Trigger (2 min @ Level 3+)

**If CEO decision is ADOPT:**

1. **Create automation event:**
   ```sql
   INSERT INTO automation_events (
     event_type,
     project_id,
     triggered_by,
     event_data,
     next_command,
     status
   ) VALUES (
     'board_meeting_complete',
     'BM-{decision_id}',
     'CEO',
     '{"decision": "ADOPT", "topic": "{topic}", "meeting_date": "{date}"}',
     '/create-business-case',
     'pending'
   );
   ```

2. **Notify Business Analyst:**
   - Send Telegram notification to BA
   - BA will be auto-invoked within 5 minutes
   - Message: "Board meeting approved {topic}. Creating business case..."

**Automation chain triggered:**
```
/board-meeting (CEO ADOPT)
  → automation_events: board_meeting_complete
  → /create-business-case (BA, auto-invoked within 5 min)
  → /create-pid (PM, auto-invoked after BC)
  → /create-epic (PO, if >20h)
  → /sprint-planning (SM)
  → /plan-feature (Developer, awaits approval)
```

**Test mode:** If `AGENT_MODE=test`, log event but don't trigger automation

---

## Phase Duration Scaling

| Phase | L0 | L1 | L2 | L3 | L4 |
|-------|----|----|----|----|-----|
| **1. Frame & Load** | 2 | 10 | 12 | 15 | 20 |
| **2. Agent Analysis** | - | 15 | 25 | 35 | 45 |
| **3. Synthesis** | - | 10 | 15 | 30 | 40 |
| **4. Capability Gap** | - | - | 5 | 10 | 15 |
| **5. Options Matrix** | 5 | 5 | 10 | 15 | 20 |
| **6. CEO Decision** | 3 | 5 | 8 | 10 | 15 |
| **7. Action Plan** | - | - | 5 | 5 | 10 |
| **TOTAL** | **10** | **45** | **80** | **120** | **165** |

---

## Kimi Swarm API Reference

### Endpoints

| Action | Method | URL |
|--------|--------|-----|
| Start meeting | POST | `agents-api.dyniq.ai/api/board-meeting/analyze` |
| Check status | GET | `agents-api.dyniq.ai/api/board-meeting/status/{id}` |
| Resume after HITL | POST | `agents-api.dyniq.ai/api/board-meeting/resume` |

### Status Response Schema

```json
{
  "meeting_id": "bm_abc123",
  "status": "processing|hitl_required|complete|failed",
  "current_phase": "1_frame|2_analysis|3_synthesis|4_gap|5_matrix|6_decision|7_action",
  "progress_percent": 65,
  "agents_complete": ["CFO", "CTO", "COO"],
  "agents_pending": ["Data", "Marketing"],
  "estimated_remaining_minutes": 8
}
```

### HITL Telegram Buttons

Callback prefixes for board meeting decisions:
- `bm_adopt` - Proceed with recommended option
- `bm_pass` - Reject all options
- `bm_defer` - Postpone for more research
- `bm_experiment` - Limited trial first

**Handler workflow:** 6.2 - HITL Button Handler (ID: `03DAx8GwCPLWnVUV`)

---

## Context7 Integration

When `--research` is provided, Phase 1 automatically fetches external documentation:

```bash
# Single library
/board-meeting \
  --topic "Evaluate Next.js 15 vs 14" \
  --research "/vercel/next.js" \
  --level 3

# Multiple libraries
/board-meeting \
  --topic "Choose ORM: Prisma vs Drizzle" \
  --research "/prisma/prisma,/drizzle-team/drizzle-orm" \
  --level 2
```

**Head of Data agent:**
- Resolves library IDs
- Fetches relevant documentation
- Summarizes key points
- Caches results (7-day cache)

---

## Historical Decision Search

Phase 1 automatically loads similar past decisions using PostgreSQL full-text search:

```sql
SELECT topic, decision_summary, outcome_status, actual_impact
FROM board_meeting_decisions
WHERE to_tsvector('english', topic) @@ plainto_tsquery('english', $current_topic)
ORDER BY meeting_date DESC
LIMIT 5;
```

Future: RAG-based semantic search with embeddings (Sprint 3)

---

## Examples

### Level 0: Instant Tactical

```bash
/board-meeting --topic "Approve €50 API subscription" --level 0
```

**Output:** CEO decision only, 10 min

---

### Level 1: Quick Decision

```bash
/board-meeting --topic "Subscribe to Cursor Pro (€20/mo)" --level 1
```

**Agents:** CEO + CFO + Data (financial decision)
**Duration:** 45 min
**Output:** Hybrid matrix with 3 agent votes

---

### Level 3: Strategic (Default)

```bash
/board-meeting --topic "MoltBot vs Current Stack" --level 3
```

**Agents:** Full C-suite (6 agents)
**Duration:** 120 min
**Output:** Complete 7-phase analysis with database persistence

---

### Level 4: Critical Company Decision

```bash
/board-meeting \
  --topic "Path A vs Path B prioritization for Q2" \
  --level 4 \
  --research "market-trends,competitor-analysis"
```

**Agents:** Full C-suite + spawned specialists if gaps detected
**Duration:** 165 min
**Output:** Extended analysis with historical comparison

---

## Integration with Other Commands

| After Board Meeting | Run This | Auto-Invoke |
|---------------------|----------|-------------|
| **ADOPT decision** | `/create-business-case` | ✅ Auto (within 5 min) |
| Business case approved | `/create-pid` | ✅ Auto |
| PID complete (>20h) | `/create-epic` | ✅ Auto |
| Epic ready | `/create-prd` | Manual |
| PRD ready | `/sprint-planning` | ✅ Auto |
| Action items generated | `/execute` | Manual |
| Database persistence | Phase 7 | ✅ Auto |
| T+7 review | Executive Assistant | ✅ Auto |
| T+30 review | Executive Assistant | ✅ Auto |

### Chain Tracing Validation

**Before documenting integration table:**

1. Start at trigger command (e.g., /board-meeting)
2. For each step, ask: "What command MUST run next?"
3. Continue until reaching terminal command (e.g., /commit)
4. Verify ALL steps documented in integration table
5. Check: Are there any conditional branches? (e.g., >20h → create-epic)

**Full chain template:**
```
/[trigger-command]
    ↓ [trigger condition]
/[next-command]
    ↓ [trigger condition]
...continues until terminal...
/commit or /deploy
```

**Why:** On 2026-01-27, chain was initially documented as board-meeting → sprint-planning → execute, missing 5 intermediate steps. Always trace START to END.

---

## Files Created

**Board meeting log:**
`.agents/logs/board-meetings/YYYY-MM-DD-topic.md`

**Review prompts (via Executive Assistant):**
`.agents/logs/board-meetings/reviews/YYYY-MM-DD-topic-review.md`

**Follow-up dashboard:**
`.agents/logs/board-meetings/YYYY-MM-DD-topic-followup.md`

---

## Reference Documentation

**Comprehensive reference (loaded on-demand):**

- **Process Guide:** @board-meeting-internals.md (phases, voting, scoring, reviews, workflows)
- **Technical Reference:** @board-meeting-reference.md (architecture, API, database, hierarchy)
- **Agent Orchestration:** @agent-orchestration.md (C-suite hierarchy, parallel patterns)

---

*Command created: 2026-01-26 | Updated: 2026-01-29 (mode selection + Kimi API) | Owner: CEO-WALKER | Sprint: Board Meeting Sprint 1*
