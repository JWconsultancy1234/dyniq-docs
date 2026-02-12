---
sidebar_position: 1
title: Board Meeting Guide
description: How to run multi-agent board meetings for strategic decisions
doc_owner: COO
review_cycle: 60d
doc_status: published
---

# Board Meeting Guide

The board meeting system uses 6-82 AI agents organized in a corporate C-Suite hierarchy to analyze decisions from multiple perspectives simultaneously.

## When to Use a Board Meeting

| Decision Type | Example | Recommended Level |
|--------------|---------|-------------------|
| Quick check | "Should we use Redis or Postgres for caching?" | Level 0 (3 agents) |
| Standard review | "Should we expand to Germany?" | Level 1-2 (8-26 agents) |
| Strategic decision | "New pricing model for DYNIQ" | Level 3 (40-50 agents) |
| Major pivot | "Should we pivot from voice to chat?" | Level 4-5 (60-90 agents) |

## Complexity Levels

| Level | Agents | Est. Cost | Timeout Risk | Use Case |
|-------|--------|-----------|-------------|----------|
| 0 | 3 | $0.30 | Low | Quick single-domain check |
| 1 | 8 | $0.80 | Low | Standard C-Suite review |
| 2 | 20-26 | $2.00 | Low | Full executive analysis |
| 3 | 40-50 | $4.00 | Medium | Cross-functional deep dive |
| 4 | 60-70 | $6.00 | High | Major strategic decisions |
| 5 | 80-90 | $10.00 | High | Full organization review |

:::warning Cloudflare Timeout
Levels 3+ may exceed Cloudflare's 100-second proxy timeout. These run asynchronously - the API returns a `thread_id` for polling.
:::

## Running a Board Meeting

### Option 1: CLI (Interactive)

```bash
claude /board-meeting
```

You'll be prompted for:
- **Topic**: The decision to analyze
- **Decision Type**: financial, technical, operational, strategic, market
- **Level**: 0-5 complexity

### Option 2: API (Programmatic)

```bash
curl -X POST https://agents-api.dyniq.ai/api/board-meeting/analyze \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Should we expand DYNIQ to the German market?",
    "decision_type": "strategic",
    "level": 2,
    "skip_research": false
  }'
```

### Option 3: Hybrid (Local + API)

CLI handles framing and CEO decision; Kimi swarm handles parallel analysis.

## Reading the Results

### Agent Analysis Structure

Each agent provides:
- **Recommendation**: ADOPT / DEFER / REJECT
- **Confidence**: 0-100%
- **Key Arguments**: Bullet points supporting their position
- **Risk Assessment**: What could go wrong
- **Domain Lens**: Perspective from their expertise area

### Voting System

Agents vote with domain-weighted scoring:

| Agent | Weight (Financial) | Weight (Technical) | Weight (Strategic) |
|-------|-------------------|-------------------|-------------------|
| CFO | 1.5x | 0.8x | 1.0x |
| CTO | 0.8x | 1.5x | 1.0x |
| COO | 1.0x | 1.0x | 1.2x |
| Head of Data | 1.0x | 1.2x | 1.0x |
| CMO | 0.8x | 0.7x | 1.3x |

### CEO Decision

After reviewing all analyses, the CEO (you) makes the final call:
- **ADOPT**: Proceed with the recommendation
- **DEFER**: Need more information, revisit later
- **REJECT**: Not pursuing this direction

## Async Board Meetings (Level 3+)

For higher levels that exceed the 100-second timeout:

### 1. Start the Meeting

```bash
curl -X POST https://agents-api.dyniq.ai/api/board-meeting/analyze \
  -H "X-API-Key: your-key" \
  -d '{"topic": "...", "level": 3}'
# Returns: {"thread_id": "bm-xxxxx", "status": "processing"}
```

### 2. Poll for Status

```bash
curl https://agents-api.dyniq.ai/api/board-meeting/status/bm-xxxxx \
  -H "X-API-Key: your-key"
# Returns: {"status": "processing" | "awaiting_decision" | "completed"}
```

### 3. Resume When Ready

```bash
claude /resume-board-meeting bm-xxxxx
```

## From Board Meeting to Action

When a board meeting produces an **ADOPT** decision for a multi-sprint initiative:

1. **Run `/linear-setup`** to create Linear infrastructure
2. Creates: Initiative -> Projects -> Milestones -> Cycles -> Labels -> Issues
3. AI-readable descriptions added to all issues
4. Sprint planning documentation pushed to Linear

See the [Linear PM Setup documentation](https://linear.app/dyniq) for details.

## Agent Calibration

The system tracks agent accuracy using Bayesian calibration:

| Metric | Purpose |
|--------|---------|
| ECE (Expected Calibration Error) | How well-calibrated are confidence scores |
| ACE (Adaptive Calibration Error) | Calibration across different confidence ranges |

### Check Calibration

```bash
# Single agent
curl https://agents-api.dyniq.ai/api/board-meeting/agent-calibration/cfo \
  -H "X-API-Key: your-key"

# Full report
curl https://agents-api.dyniq.ai/api/board-meeting/calibration-report \
  -H "X-API-Key: your-key"
```

### Calibration Thresholds

| Tier | ECE Good | ECE Warning | Min Predictions |
|------|----------|-------------|-----------------|
| C-Suite | 0.03 | 0.07 | 10 |
| VP | 0.05 | 0.10 | 10 |
| Director | 0.07 | 0.12 | 10 |
| Industry Advisor | 0.08 | 0.15 | 5 |

## Tips

- **Skip research** (`skip_research: true`) saves 30+ seconds on Levels 0-1
- **6/8 agents is sufficient** for Level 1 decisions - COO and Marketing most likely to timeout
- **Level 2 is the sweet spot** for most business decisions
- **Always review Langfuse traces** at `langfuse.dyniq.ai` for cost and timing data
