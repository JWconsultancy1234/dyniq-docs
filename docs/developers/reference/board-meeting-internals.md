---
title: "Board Meeting Internals"
sidebar_label: "Board Meeting Internals"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Board Meeting Internals

> Implementation details for the Kimi Swarm board meeting system: calibration, spawning, voting, hierarchy, and scoring.

---

## Agent Hierarchy (81 agents, post-Worker sunset)

```
Level 0-1: 8 C-Suite agents (quick decisions)
Level 2:   24 agents (C-Suite + 16 VPs)
Level 3:   48 agents (+ 24 Directors)
Level 4:   63 agents (+ 15 Industry Advisors)
Level 5:   81 agents (+ 18 Specialists) + Task Force on-demand
```

### C-Suite (Tier 1 - 8 agents)

| Agent | Role | Reports To |
|-------|------|------------|
| CEO WALKER | Master orchestrator, final decisions | - |
| CFO | Financial analysis, Profit First | CEO |
| COO | Project delivery, operations | CEO |
| CTO | Technical architecture, DevOps | CEO |
| CDO (Head of Data) | Analytics, ML, metrics validation | CEO |
| CMO (Marketing) | Revenue generation, positioning | CEO |
| CHRO | People, hiring, team structure | CEO |
| GC | Legal, compliance, contracts | CEO |

### Management & Specialist Tiers

| Tier | Count | Reports To | Examples |
|------|-------|------------|----------|
| Management | 4 | COO | BA, PM, PO, SM |
| Strategic Product | 1 | COO | Product Manager |
| Technical | 4 | CTO | Tech Arch, DevOps, Security, Integration |
| Delivery | 4 | Mixed | QA, Data Engineer, Legal, Brand |

### Specialist Hierarchy (18 agents, 3 per C-Suite)

| C-Suite | Specialists |
|---------|-------------|
| CFO | Financial Analyst, Tax Advisor, Budget Analyst |
| CTO | Security Expert, DevOps Engineer, ML Engineer |
| COO | Process Analyst, Supply Chain, QA Lead |
| CDO | ML Specialist, Analytics Expert, BI Analyst |
| CMO | Brand Strategist, Content Expert, SEO Specialist |
| CEO | Strategy Consultant, M&A Advisor, Risk Analyst |

Specialists inherit 0.8x of parent's domain weight. Scores averaged into C-suite parent, boosting confidence if aligned.

---

## Domain-Weighted Voting System

### Weight Matrix

| Agent | Financial | Technical | Operational | Strategic | Market |
|-------|-----------|-----------|-------------|-----------|--------|
| CFO | 2.0x | 1.0x | 1.0x | 1.5x | 1.0x |
| CTO | 1.0x | 2.0x | 1.0x | 1.5x | 1.0x |
| COO | 1.0x | 1.0x | 2.0x | 1.5x | 1.0x |
| Head of Data | 1.5x | 1.5x | 1.5x | 1.5x | 1.5x |
| Marketing | 1.0x | 1.0x | 1.0x | 1.0x | 2.0x |

**Data Executive:** 1.5x universal (data drives everything).
**Fallback:** If no keywords match, default to "strategic" (all 1.5x).

### Decision Type Keywords

| Type | Keywords | Primary Agent |
|------|----------|---------------|
| Financial | budget, cost, ROI, pricing, investment, revenue | CFO (2.0x) |
| Technical | architecture, API, database, tech debt, framework | CTO (2.0x) |
| Operational | process, workflow, delegation, SOPs, hiring | COO (2.0x) |
| Strategic | direction, vision, priorities, roadmap, pivot | All (1.5x) |
| Market | customers, positioning, competition, leads, growth | Marketing (2.0x) |

### Vote Calculation Example (Technical Decision)

```
CFO: 8 x 1.0 = 8.0 | CTO: 9 x 2.0 = 18.0 | COO: 7 x 1.0 = 7.0
Data: 8 x 1.5 = 12.0 | Marketing: 6 x 1.0 = 6.0
Total: 51 / 6.5 weights = 7.85/10
```

### Confidence (from vote spread)

| Spread | Confidence | Action |
|--------|------------|--------|
| 0-2 pts | High (8-10) | Strong consensus |
| 2-4 pts | Medium (5-7) | Moderate agreement |
| 4+ pts | Low (1-4) | Consider spawning specialist |

---

## Scoring Criteria (1-10 scale)

| Criterion | 10 | 7-9 | 4-6 | 1-3 |
|-----------|-----|------|------|------|
| Cost | Free/<EUR100 | EUR100-500 | EUR500-2K | EUR2K+ |
| Time | <1 day | 1-3 days | 1-2 weeks | 2+ weeks |
| Risk | Reversible | Some deps | Core systems | Hard to reverse |
| Freedom | 10+ hrs/wk saved | 5-10 hrs | 1-5 hrs | Increases workload |
| Strategic | Perfect Path A/B fit | Strong | Neutral | Misaligned |

### Criterion Weighting by Decision Type

| Type | Cost | Time | Risk | Freedom | Strategic |
|------|------|------|------|---------|-----------|
| Financial | 40% | 15% | 20% | 15% | 10% |
| Technical | 20% | 20% | 25% | 15% | 20% |
| Strategic | 15% | 10% | 15% | 30% | 30% |
| Operational | 20% | 30% | 15% | 20% | 15% |
| Market | 15% | 15% | 20% | 20% | 30% |

---

## Agent Calibration (ECE/ACE)

### Global Thresholds

| Metric | Good | Warning | Poor | Source |
|--------|------|---------|------|--------|
| ECE | < 0.05 | 0.05-0.10 | > 0.10 | arXiv 2404.11350 |
| ACE | < 0.05 | 0.05-0.10 | > 0.10 | Nixon et al. (2019) |

### Tier-Specific Thresholds (SAC-018)

| Tier | Good | Warning | Min Predictions |
|------|------|---------|-----------------|
| C-Suite | < 0.03 | < 0.07 | 10 |
| VP | < 0.05 | < 0.10 | 10 |
| Director | < 0.07 | < 0.12 | 10 |
| Industry Advisor | < 0.08 | < 0.15 | 5 |
| Task Force | < 0.10 | < 0.18 | 5 |

**Implementation:** `calibration/constants.py` -> `TIER_CALIBRATION_THRESHOLDS`

---

## Bayesian Accuracy Tracking (SW-014)

Domain-specific accuracy priors (updated from outcomes):

| Agent | Financial | Technical | Operational | Strategic |
|-------|-----------|-----------|-------------|-----------|
| CFO | 0.85 | 0.40 | 0.60 | 0.70 |
| CTO | 0.40 | 0.90 | 0.60 | 0.65 |
| COO | 0.50 | 0.50 | 0.85 | 0.60 |
| CEO | 0.65 | 0.60 | 0.70 | 0.90 |
| Data | 0.55 | 0.75 | 0.60 | 0.60 |
| Marketing | 0.50 | 0.35 | 0.50 | 0.70 |

**Implementation:** `bayesian_tracking.py`. Quarterly weight adjustment in monitor-only mode until July 2026.

---

## Dynamic Spawning (SAC-012, SAC-025)

### Task Force Budget by Level

| Level | Max Spawns | Use Case |
|-------|------------|----------|
| 0-1 | 0 | Quick decisions |
| 2 | 2 | Moderate |
| 3 | 4 | Strategic |
| 4 | 6 | Critical |
| 5 | 12 | War Room |

### C-Suite Spawn Permissions

| C-Suite | Allowed Task Types |
|---------|-------------------|
| CFO | financial_modeling, data_collection, report_generation |
| CTO | technical_research, data_collection, technical_writing |
| COO | market_research, sop_writing, report_generation |
| GC | compliance_check, data_collection |

### Capability Gap Spawning

Trigger: 2+ agents vote NO/UNCERTAIN on "Do we have the right expertise?"
1. Identify missing domain (Legal, Brand, Security, Integration, HR, Performance, Framework)
2. Spawn specialist mid-meeting with full context
3. Specialist delivers compressed 10-min analysis
4. Specialist participates in Phase 5 voting (usually 2.0x weight)

**When NOT to spawn:** Only 1 vote NO, all YES, specialist slower than meeting, Level 0-1.

### Graph Integration (Level 4+)

```
load_context -> parallel_analysis -> aggregate -> capability_gap_check
    -> task_force_spawn -> confidence_router -> END
```

**State fields:** `spawned_task_force[]`, `task_force_results{}`, `spawn_summary{}`

---

## Model Cascade Logic

```python
1. Check AGENT_COMPLEXITY_MAP for known agents (PRIMARY, confidence 0.9)
2. UNKNOWN agents only -> pattern matching (SIMPLE/COMPLEX patterns)
3. Web access requirement -> ALWAYS complex (Kimi K2.5)
```

| Complexity | Model | Cost (1M tokens) |
|------------|-------|-------------------|
| SIMPLE | Claude Haiku 4.5 | $1/$5 |
| MEDIUM | Claude Sonnet 4.5 | $3/$15 |
| COMPLEX | Kimi K2.5 | $0.60/$2.40 |

---

## Decision Type Extensions (Phase 6)

| Type | Agent Subset | Use Case |
|------|--------------|----------|
| `financial` | CFO-weighted | Budget, investment |
| `technical` | CTO-weighted | Architecture |
| `creative` | Marketing + Brand (2-10) | Style transfer |

**Implementation:** `get_creative_agents(level)` in `agent_registry.py`.

---

## LLM Landscape Monitor (SAC-017)

| Benchmark | Threshold | Action |
|-----------|-----------|--------|
| SWE-Bench | >80% | Evaluate for coding |
| GPQA | >92% | Evaluate for reasoning |
| BrowseComp | >65% | Evaluate for research |
| DeepSeek price | <$0.40/M | Investigate cheaper |

**Implementation:** `llm_monitor.py`, `llm_monitor_config.py`

---

## Specialist Auto-Assignment Tags

| Tag | Agent | Gate |
|-----|-------|------|
| `#oauth` | Security Agent | BLOCKING |
| `#multi-service` | Integration Architect | BLOCKING |
| `#database` | Data Engineer | BLOCKING |
| `#deployment` | DevOps Agent | PARALLEL |
| `#testing` | QA Agent | PARALLEL |

---

## Implementation Files

| File | Purpose |
|------|---------|
| `agent_registry.py` | 81 agent definitions with prompts/weights |
| `agent_factory.py` | Agent analysis coroutines |
| `hierarchical_aggregation.py` | Specialist rollup logic |
| `supervisor.py` | Level-based dynamic spawning |
| `spawn_manager.py` | Task Force budget/permissions |
| `early_termination.py` | 85% confidence threshold |
| `model_cascade.py` | Haiku -> Sonnet -> Kimi K2.5 routing |
| `costs.py` | Per-agent cost tracking to Langfuse |
| `bayesian_tracking.py` | Domain accuracy priors |
| `calibration/` | ECE/ACE metrics |

---

## Timing Baseline (Production)

| Level | Agent Count | Processing Time | Timeout Risk |
|-------|-------------|-----------------|--------------|
| 0-1 | 6-8 | 30-60s | Low |
| 2 | 24 | 60-90s | Low |
| 3 | 48 | 90-120s | Medium |
| 4 | 63 | ~135s | HIGH (>100s Cloudflare) |
| 5 | 81 | 200s+ | Certain timeout |

**Cloudflare limit:** 100s. Level 3+ uses async polling.

---

*Process guide: @board-meeting-handbook.md*
*Technical reference: @board-meeting-reference.md*
*Parent: @agent-orchestration.md*
