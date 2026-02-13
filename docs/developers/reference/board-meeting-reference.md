---
title: "Board Meeting Technical Reference"
sidebar_label: "Board Meeting Technical Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Board Meeting Technical Reference

> Architecture, API, database, and configuration for the board meeting system.

---

## Quick Reference

| Property | Value |
|----------|-------|
| API Base | `agents-api.dyniq.ai:8000` (NOT ruben-api:8080) |
| Database | `board_meeting_decisions` in DYNIQ Supabase |
| Langfuse | `langfuse.dyniq.ai` (spans: `board_meeting.agent.{name}`) |
| n8n Review | `AdbE5UmMQJKY28PD` |
| n8n HITL | `03DAx8GwCPLWnVUV` (prefix: `bm_`) |

---

## Execution Modes

```
/board-meeting --topic "X" --level 3 --mode [interactive|kimi|hybrid]
```

| Mode | Best For | Phase 2 Time | HITL Channel |
|------|----------|--------------|--------------|
| Claude CLI | At desk, want control | 35 min (sequential) | Terminal |
| Kimi Swarm | Away, async, mobile | 5 min (parallel) | Telegram |
| Hybrid | Best of both | 5 min (parallel) | Terminal |

---

## Complexity Levels & Agent Counts

| Level | Agents | Duration | Use Case |
|-------|--------|----------|----------|
| 0 | 6-8 | 15-30s | Quick tactical |
| 1 | 6-8 | 30-60s | Simple decisions |
| 2 | 20-26 | 60-90s | Standard (default) |
| 3 | 40-50 | 90-120s | Complex multi-domain |
| 4 | 40-65 | 120-150s | Strategic + industry |
| 5 | 81 | 200s+ | War Room |

**Async:** Level 3+ exceeds 100s Cloudflare limit. Returns `status="processing"`, poll `/status/{id}`.

---

## The 7-Phase Execution

| Phase | L0 | L1 | L2 | L3 | L4 |
|-------|----|----|----|----|-----|
| 1. Frame & Load | 2 | 10 | 12 | 15 | 20 |
| 2. Agent Analysis | - | 15 | 25 | 35 | 45 |
| 3. Synthesis | - | 10 | 15 | 30 | 40 |
| 4. Capability Gap | - | - | 5 | 10 | 15 |
| 5. Options Matrix | 5 | 5 | 10 | 15 | 20 |
| 6. CEO Decision | 3 | 5 | 8 | 10 | 15 |
| 7. Action Plan | - | - | 5 | 5 | 10 |
| **TOTAL** | **10** | **45** | **80** | **120** | **165** |

Phase 2: CFO, CTO, COO, Data, Marketing, CEO analyze in parallel. Each provides qualitative (pros/cons) + quantitative (5 criteria 1-10) + recommendation.

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/board-meeting/analyze` | POST | Start meeting |
| `/api/board-meeting/status/{thread_id}` | GET | Check status |
| `/api/board-meeting/resume` | POST | Resume after HITL |
| `/api/board-meeting/history` | GET | Past decisions |
| `/api/board-meeting/agent-calibration/{agent}` | GET | Agent ECE/ACE |
| `/api/board-meeting/calibration-report` | GET | All agents report |

### Request Schema

```python
class BoardMeetingRequest(BaseModel):
    topic: str
    level: int = 2               # 0-5
    decision_type: str           # financial, technical, operational, strategic, market
    mode: str = "kimi"           # claude | kimi | hybrid
    research_topics: list[str] = []
    options: list[str] = []      # If empty, agents propose
    skip_research: bool = False  # Skip R&D web search (saves 30s+)
```

---

## LangGraph Architecture

```
load_context -> [CFO|CTO|COO|Data|Marketing|CEO] (fan-out)
    -> aggregate_scores (fan-in) -> capability_gap_check
    -> generate_matrix -> hitl_review -> persist_decision -> trigger_automation
```

### State Model

```python
class BoardMeetingState(TypedDict):
    topic: str; level: int; research_topics: list[str]
    historical_decisions: list[dict]; research_context: str
    framed_problem: str; options: list[str]
    agent_analyses: Annotated[list[dict], operator.add]
    capability_gaps: list[str]; spawned_agents: list[str]
    options_matrix: dict; weighted_scores: dict
    confidence_level: str  # HIGH/MEDIUM/LOW
    ceo_decision: str  # ADOPT/EXPERIMENT/PASS/DEFER
    ceo_rationale: str; action_plan: list[dict]
```

---

## HITL & Approval Gates

| Gate | Approver | Kimi Mode | Claude Mode | Timeout |
|------|----------|-----------|-------------|---------|
| Board Meeting | CEO | Telegram | Terminal | 24h |
| Business Case | COO | Telegram | Terminal | 24h |
| PID | COO | Telegram | Terminal | 24h |
| Sprint Planning | SM | Telegram | Terminal | 4h |

Telegram: Options + weighted scores + confidence + inline buttons [ADOPT/EXPERIMENT/PASS/DEFER].

---

## Database Schema (DYNIQ Supabase)

```sql
CREATE TABLE board_meeting_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    meeting_date TIMESTAMPTZ NOT NULL,
    topic TEXT NOT NULL,
    complexity_level INTEGER CHECK (complexity_level BETWEEN 0 AND 5),
    decision_type TEXT CHECK (decision_type IN ('financial','technical','operational','strategic','market')),
    duration_minutes INTEGER,
    decision_summary TEXT NOT NULL,
    ceo_decision TEXT NOT NULL, ceo_rationale TEXT NOT NULL,
    options_considered JSONB NOT NULL, option_scores JSONB NOT NULL,
    voting_weights JSONB NOT NULL, agent_votes JSONB NOT NULL,
    spawned_agents TEXT[],
    file_path TEXT NOT NULL UNIQUE,
    actual_outcome TEXT,
    outcome_rating TEXT CHECK (outcome_rating IN ('confirmed_good','confirmed_bad','needs_adjustment','too_early')),
    outcome_notes TEXT, reviewed_at TIMESTAMPTZ
);
```

### Key Queries

```python
# Find similar decisions
supabase.table("board_meeting_decisions").select("*") \
    .text_search("topic", "keyword OR phrase") \
    .order("meeting_date", desc=True).limit(5).execute()

# Update outcome (T+30 review)
supabase.table("board_meeting_decisions").update({
    "actual_outcome": "...", "outcome_rating": "confirmed_good",
    "reviewed_at": datetime.now().isoformat()
}).eq("id", decision_id).execute()
```

**Logs:** `.agents/logs/board-meetings/YYYY-MM-DD-topic.md`

---

## Review System

**T+7 Quick Check (15 min):** Is implementation on track? Surprises? Still confident? -> Continue / Adjust / Rollback.

**T+30 Comprehensive (30-45 min):** Actual vs predicted outcomes, agent accuracy, outcome rating, recommendations.

**Quarterly Meta-Review:** Decision patterns, outcome distribution, agent calibration across quarter.

**Outcome ratings:** `confirmed_good`, `confirmed_bad`, `needs_adjustment`, `too_early`

---

## Post-ADOPT PM Pipeline

```
ADOPT -> /create-epic (COO) -> /create-prd (PO) -> /create-story (Kimi)
    -> /sprint-planning (SM) -> /plan-feature -> Implementation
```

---

## Timeout & Costs

| Model | Timeout | Cost (1M tokens) |
|-------|---------|------------------|
| Kimi K2.5 | 90s | $0.60/$2.40 |
| Claude Haiku 4.5 | 30s | $1/$5 |
| Claude Sonnet 4.5 | 30s | $3/$15 |

**Cloudflare:** 100s limit. Level 3+ runs async.
**Monthly:** EUR100-180 (Kimi EUR80-150 + Claude EUR20-30).

| Metric | Target |
|--------|--------|
| Phase 2 duration | <5 min |
| Decision quality | >85% confirmed_good |
| HITL response | <2 hours |

---

*Process guide: @board-meeting-handbook.md*
*Implementation: @board-meeting-internals.md*
