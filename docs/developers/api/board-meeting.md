---
sidebar_position: 3
title: Board Meeting API
description: Multi-agent decision analysis endpoints with async support for large swarms
---

# Board Meeting API

The board meeting endpoints orchestrate multi-agent decision analysis with 3-100 agents depending on complexity level.

## Analyze Decision

Start a new board meeting analysis.

```
POST /api/board-meeting/analyze
```

### Request Body

```json
{
  "topic": "Should we expand to the German market?",
  "context": "Current revenue is EUR 50k MRR, 80% from Belgium/Netherlands",
  "decision_type": "strategic",
  "level": 2,
  "skip_research": false
}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `topic` | string | Yes | - | The decision to analyze |
| `context` | string | No | `""` | Additional context for agents |
| `decision_type` | string | Yes | - | `financial`, `technical`, `operational`, `strategic`, `market` |
| `level` | int | No | `2` | Complexity level (0-6), controls agent count |
| `skip_research` | bool | No | `true` for L0-1 | Skip R&D web search (saves ~30s) |

### Response (Level 0-2, Sync)

```json
{
  "thread_id": "bm-abc123",
  "status": "awaiting_decision",
  "recommendation": "ADOPT",
  "confidence": 0.87,
  "agent_count": 20,
  "cost_usd": 1.85,
  "analysis": {
    "summary": "Market expansion is recommended with phased approach...",
    "domain_scores": {
      "financial": 0.82,
      "technical": 0.90,
      "operational": 0.75,
      "strategic": 0.91
    },
    "dissenting_views": ["CFO recommends deferring 1 quarter for cash reserves"],
    "risk_factors": ["Regulatory compliance in Germany", "Localization costs"]
  }
}
```

### Response (Level 3+, Async)

```json
{
  "thread_id": "bm-xyz789",
  "status": "processing",
  "message": "Analysis started with 50 agents. Poll /status for results."
}
```

:::info Cloudflare Timeout
Level 3+ meetings exceed Cloudflare's 100-second proxy timeout, so they automatically switch to async mode. Poll the status endpoint for results.
:::

## Check Status

```
GET /api/board-meeting/status/{thread_id}
```

### Response

```json
{
  "thread_id": "bm-xyz789",
  "status": "awaiting_decision",
  "progress": {
    "agents_completed": 48,
    "agents_total": 50,
    "elapsed_seconds": 87
  },
  "result": { ... }
}
```

| Status | Meaning |
|--------|---------|
| `processing` | Agents still analyzing |
| `awaiting_decision` | Analysis complete, human review needed |
| `decided` | Human has made a decision |
| `error` | Analysis failed |

## Resume After HITL

Submit a human decision after reviewing the recommendation.

```
POST /api/board-meeting/resume
```

### Request Body

```json
{
  "thread_id": "bm-abc123",
  "decision": "ADOPT",
  "human_notes": "Approved with Q2 timeline, budget capped at EUR 50k"
}
```

## Agent Calibration

### Single Agent Calibration

```
GET /api/board-meeting/agent-calibration/{agent_name}
```

Returns ECE (Expected Calibration Error) and ACE (Average Calibration Error) for a specific agent.

### Full Calibration Report

```
GET /api/board-meeting/calibration-report
```

Returns calibration metrics for all agents, grouped by tier.

## Decision Types

| Type | Typical Agents Focus | Example Topics |
|------|---------------------|----------------|
| `financial` | CFO, VP Finance, FP&A Director | Budget allocation, investment decisions |
| `technical` | CTO, VP Engineering, Infrastructure Director | Architecture changes, tech stack decisions |
| `operational` | COO, VP Operations, Process Director | Workflow changes, hiring, capacity planning |
| `strategic` | Full C-Suite + Industry Advisors | Market expansion, product pivots, M&A |
| `market` | CMO, VP Marketing, Industry Advisors | Pricing changes, positioning, GTM strategy |
