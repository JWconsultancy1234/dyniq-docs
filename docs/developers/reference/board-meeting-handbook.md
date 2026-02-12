---
title: "Board Meeting System Handbook"
sidebar_label: "Board Meeting System Handbook"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Board Meeting System Handbook

> Strategic guide: when to use, how it works, what happens after.

---

## What Board Meetings Are FOR

Board meetings are for **GO/NO-GO decisions** on large initiatives, NOT implementation details.

| Board Meeting Topics | NOT Board Meeting Topics |
|---------------------|------------------------|
| Adopt MoltBot? | Configure OAuth |
| Path A vs Path B priority | Git branch strategy |
| Vendor selection | Task breakdown |
| Q2 roadmap approval | Daily task prioritization |
| Major architecture pivots | Bug fix decisions |

**Rule:** 5+ C-suite perspectives needed AND affects Path A/B strategy = Board Meeting.

---

## When to Call a Board Meeting

| Level | Duration | Agents | Use Case |
|-------|----------|--------|----------|
| **0** | 10 min | CEO only | Tactical calls (<EUR50) |
| **1** | 45 min | CEO + 2 relevant | Quick vendor selection |
| **2** | 80 min | CEO + 3 core | Process changes (default) |
| **3** | 120 min | Full C-suite (6) | Strategic decisions |
| **4** | 165 min | C-suite + specialists | Critical company direction |

---

## The 7-Phase Execution

### Phase Duration Scaling (minutes)

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

### Phase 1: Frame & Load
CEO frames problem (statement, criteria, options, constraints). Data loads historical decisions + research context in parallel.

### Phase 2: Agent Analysis (Parallel)

| Agent | Focus |
|-------|-------|
| CFO | Cost-benefit, ROI, cashflow, Profit First |
| CTO | Architecture fit, tech debt, security |
| COO | Implementation complexity, process fit, delegation |
| Data | Historical patterns, metrics, success measurement |
| Marketing | Market positioning, revenue opportunity |

Each provides: pros/cons, scores (1-10) per criterion, recommendation (ADOPT/EXPERIMENT/PASS/DEFER), confidence (1-10).

### Phase 3: Synthesis
Each agent presents (6 min x 5 agents). CEO asks clarifying questions.

### Phase 4: Capability Gap Check
All agents vote: YES/UNCERTAIN/NO on expertise sufficiency.
- 2+ NO/UNCERTAIN = Spawn specialist mid-meeting
- Specialist gets full context, delivers 10-min analysis, participates in voting (2.0x weight)
- **Don't spawn:** Only 1 NO, all YES, Level 0-1, or specialist slower than meeting

### Phase 5: Options Matrix
Generate hybrid scoring (qualitative + quantitative). Apply domain weights and criterion weights. Calculate confidence from vote spread.

### Phase 6: CEO Decision
Review matrix, weighted votes, confidence, historical outcomes. Select ADOPT/EXPERIMENT/PASS/DEFER. Can override agents with justification.

### Phase 7: Action Plan & Persistence
Generate action plan (owner + deadline + metric per action). Persist to database + markdown log. Schedule T+7 and T+30 reviews.

---

## Voting & Scoring

### Domain Weight Matrix

| Agent | Financial | Technical | Operational | Strategic | Market |
|-------|-----------|-----------|-------------|-----------|--------|
| CFO | 2.0x | 1.0x | 1.0x | 1.5x | 1.0x |
| CTO | 1.0x | 2.0x | 1.0x | 1.5x | 1.0x |
| COO | 1.0x | 1.0x | 2.0x | 1.5x | 1.0x |
| Data | 1.5x | 1.5x | 1.5x | 1.5x | 1.5x |
| Marketing | 1.0x | 1.0x | 1.0x | 1.0x | 2.0x |

**Data = 1.5x universal.** Fallback: "strategic" if no keywords match.

### Scoring Guide (1-10)

| Criterion | 10 | 7-9 | 4-6 | 1-3 |
|-----------|-----|------|------|------|
| Cost | Free/<EUR100 | EUR100-500 | EUR500-2K | EUR2K+ |
| Time | <1 day | 1-3 days | 1-2 weeks | 2+ weeks |
| Risk | Reversible | Some deps | Core systems | Hard to reverse |
| Freedom | 10+ hrs/wk saved | 5-10 hrs | 1-5 hrs | Increases workload |
| Strategic | Perfect Path A/B | Strong | Neutral | Misaligned |

### Criterion Weights by Decision Type

| Type | Cost | Time | Risk | Freedom | Strategic |
|------|------|------|------|---------|-----------|
| Financial | 40% | 15% | 20% | 15% | 10% |
| Technical | 20% | 20% | 25% | 15% | 20% |
| Strategic | 15% | 10% | 15% | 30% | 30% |
| Operational | 20% | 30% | 15% | 20% | 15% |
| Market | 15% | 15% | 20% | 20% | 30% |

### Confidence (vote spread)

| Spread | Confidence | Interpretation |
|--------|------------|----------------|
| 0-2 pts | High (8-10) | Strong consensus |
| 2-4 pts | Medium (5-7) | Moderate agreement |
| 4+ pts | Low (1-4) | Consider spawning specialist |

---

## Post-Meeting Flow

### Delegation Chain

```
Board Meeting ADOPT
  -> COO creates PRD, assigns owner
    -> Route A (>20h, user-facing): PO + SM -> Sprint 0
    -> Route B (technical): Tech Architect -> Developer
  -> Developer: /plan-feature -> /execute
  -> CTO: /validate -> /deploy
  -> EA: T+7, milestones, T+30 reviews (automated)
```

### Who Does What

| Role | Action | Tools |
|------|--------|-------|
| CEO | Final decision | `/board-meeting`, override authority |
| COO | Delegate, create PRDs | `/create-prd`, assign owner |
| PO | Break into stories | `/create-story` |
| SM | Sprint planning | Sprint ceremonies |
| Developer | Implementation | `/plan-feature`, `/execute` |
| CTO | Validate, deploy | `/validate`, `/deploy` |
| EA | Track, automate reviews | T+7/T+30, task creation |

### Quality Gates

| Decision | Meaning |
|----------|---------|
| GO | Proceed to next phase |
| NO-GO | Stop, execute contingency |
| PIVOT | Change approach, update PID |
| FIX | Address issues before continuing |
| DELAY | Extend timeline |

---

## Review System

### T+7 Quick Check (15 min, auto-generated by EA)
1. Implementation on track? YES/NO/PARTIALLY
2. Any surprises? YES/NO
3. Still confident? YES/NO/UNCERTAIN

**Output:** Continue / Adjust course / Consider rollback

### T+30 Comprehensive Review (30-45 min, EA + CEO)
1. **Actual vs Predicted:** Time, Cost, Revenue, Freedom variance
2. **Same decision today?** YES/NO/WITH_MODIFICATIONS
3. **Agent accuracy:** Most/least accurate agent
4. **Outcome rating:** CONFIRMED_GOOD / CONFIRMED_BAD / NEEDS_ADJUSTMENT / TOO_EARLY

### Milestone-Based Reviews
Reviews tied to measurable milestones between T+7 and T+30.
Example (tool adoption): T+7 install check -> M1 first project -> M2 team onboarded -> T+30 ROI validated.

### Quarterly Meta-Review
Analyze decision patterns, agent calibration accuracy, outcome distribution. Feed learnings back into agent weights.

---

## Files & Artifacts

| Output | Location |
|--------|----------|
| Meeting log | `.agents/logs/board-meetings/YYYY-MM-DD-topic.md` |
| Review prompts | `.agents/logs/board-meetings/reviews/` |
| Follow-up dashboard | `.agents/logs/board-meetings/YYYY-MM-DD-topic-followup.md` |
| Database record | `board_meeting_decisions` table (DYNIQ Supabase) |

---

*For architecture, API, database, debugging: @board-meeting-reference.md*
*For calibration, spawning, implementation: @board-meeting-internals.md*
