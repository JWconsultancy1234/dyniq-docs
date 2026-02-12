---
sidebar_position: 5
title: Board Meeting Internals
description: Implementation details for the Kimi Swarm board meeting system
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Board Meeting Internals

Implementation details for the Kimi Swarm board meeting system: calibration, spawning, voting, hierarchy, and scoring.

## Agent Hierarchy (82 agents)

```
Level 0-1: 8 C-Suite agents (quick decisions)
Level 2:   24 agents (C-Suite + 16 VPs)
Level 3:   48 agents (+ 24 Directors)
Level 4:   63 agents (+ 15 Industry Advisors)
Level 5:   81 agents (+ 18 Specialists) + Task Force on-demand
```

### C-Suite (Tier 1)

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
| VPs | 16 | C-Suite | VP Finance, VP Engineering Platform |
| Directors | 24 | VPs | Director Infrastructure, Director FP&A |
| Industry Advisors | 15 | CDO | HVAC Advisor, SaaS Advisor |
| Specialists | 18 | C-Suite (3 per exec) | Financial Analyst, Security Expert, ML Specialist |

Specialists inherit 0.8x of parent's domain weight. Scores averaged into C-suite parent, boosting confidence if aligned.

## Domain-Weighted Voting

### Weight Matrix

| Agent | Financial | Technical | Operational | Strategic | Market |
|-------|-----------|-----------|-------------|-----------|--------|
| CFO | 2.0x | 1.0x | 1.0x | 1.5x | 1.0x |
| CTO | 1.0x | 2.0x | 1.0x | 1.5x | 1.0x |
| COO | 1.0x | 1.0x | 2.0x | 1.5x | 1.0x |
| Head of Data | 1.5x | 1.5x | 1.5x | 1.5x | 1.5x |
| Marketing | 1.0x | 1.0x | 1.0x | 1.0x | 2.0x |

**Data Executive** gets 1.5x universal weight (data drives everything). If no keywords match, default to "strategic" (all 1.5x).

### Decision Type Keywords

| Type | Keywords | Primary Agent |
|------|----------|---------------|
| Financial | budget, cost, ROI, pricing, investment | CFO (2.0x) |
| Technical | architecture, API, database, tech debt | CTO (2.0x) |
| Operational | process, workflow, delegation, SOPs | COO (2.0x) |
| Strategic | direction, vision, priorities, roadmap | All (1.5x) |
| Market | customers, positioning, competition, leads | Marketing (2.0x) |

### Confidence Levels

| Vote Spread | Confidence | Action |
|-------------|------------|--------|
| 0-2 pts | High (8-10) | Strong consensus |
| 2-4 pts | Medium (5-7) | Moderate agreement |
| 4+ pts | Low (1-4) | Consider spawning specialist |

## Scoring Criteria (1-10 scale)

| Criterion | 10 | 7-9 | 4-6 | 1-3 |
|-----------|-----|------|------|------|
| Cost | Free / < EUR 100 | EUR 100-500 | EUR 500-2K | EUR 2K+ |
| Time | < 1 day | 1-3 days | 1-2 weeks | 2+ weeks |
| Risk | Reversible | Some deps | Core systems | Hard to reverse |
| Freedom | 10+ hrs/wk saved | 5-10 hrs | 1-5 hrs | Increases workload |
| Strategic | Perfect Path A/B fit | Strong | Neutral | Misaligned |

## Agent Calibration (ECE/ACE)

### Tier-Specific Thresholds

| Tier | ECE Good | ECE Warning | Min Predictions |
|------|----------|-------------|-----------------|
| C-Suite | < 0.03 | < 0.07 | 10 |
| VP | < 0.05 | < 0.10 | 10 |
| Director | < 0.07 | < 0.12 | 10 |
| Industry Advisor | < 0.08 | < 0.15 | 5 |
| Task Force | < 0.10 | < 0.18 | 5 |

## Dynamic Task Force Spawning

### Budget by Level

| Level | Max Spawns | Use Case |
|-------|------------|----------|
| 0-1 | 0 | Quick decisions |
| 2 | 2 | Moderate complexity |
| 3 | 4 | Strategic decisions |
| 4 | 6 | Critical decisions |
| 5 | 12 | War Room |

**Trigger**: 2+ agents vote NO/UNCERTAIN on "Do we have the right expertise?" then spawn missing domain specialist mid-meeting.

## Model Cascade

| Complexity | Model | Cost (1M tokens) |
|------------|-------|-------------------|
| SIMPLE | Claude Haiku 4.5 | $1 / $5 |
| MEDIUM | Claude Sonnet 4.5 | $3 / $15 |
| COMPLEX | Kimi K2.5 | $0.60 / $2.40 |

## Timing Baseline (Production)

| Level | Agent Count | Processing Time | Timeout Risk |
|-------|-------------|-----------------|--------------|
| 0-1 | 6-8 | 30-60s | Low |
| 2 | 24 | 60-90s | Low |
| 3 | 48 | 90-120s | Medium |
| 4 | 63 | ~135s | HIGH (> 100s Cloudflare) |
| 5 | 81 | 200s+ | Certain timeout |

:::warning Cloudflare Timeout
Cloudflare enforces a 100s timeout. Level 3+ meetings use async polling via `/status/{id}` endpoint.
:::
