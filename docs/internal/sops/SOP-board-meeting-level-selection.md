---
title: "SOP: Board Meeting Level Selection"
sidebar_label: "SOP: Board Meeting Level Selection"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# SOP: Board Meeting Level Selection

## Purpose

Guide for selecting appropriate complexity level for board meeting decisions.

## Quick Decision Tree

1. **Is this a simple yes/no question?** → Level 0 (3 agents)
2. **Standard business decision?** → Level 1 (8 C-Suite)
3. **Requires implementation planning?** → Level 2 (+ VPs)
4. **Multi-department impact?** → Level 3 (+ Specialists)
5. **Full org-wide impact?** → Level 4 (Full Council)
6. **Critical/complex with research needed?** → Level 5 (War Room)

## Level Reference

| Level | Name | Agents | Timeout | Budget | Use Case |
|-------|------|--------|---------|--------|----------|
| 0 | Quick Pulse | 3 | 2 min | $0.30 | Tool purchase, simple vendor selection |
| 1 | Core Team | 8 | 2 min | $0.50 | Contractor hire, process change |
| 2 | Leadership | 24 | 3 min | $1.00 | Market expansion, new feature |
| 3 | Extended | 42 | 5 min | $3.00 | Product pivot, major investment |
| 4 | Full Council | 61 | 8 min | $5.00 | Industry entry, partnership |
| 5 | War Room | 75 | 10 min | $8.00 | Acquisition, critical pivot |

## Who Owns Level Selection

| Role | Authority |
|------|-----------|
| CEO | Any level (0-5) |
| C-Suite | Up to Level 3 |
| VP | Up to Level 2 |
| Manager | Request through VP/C-Suite |

## Decision Examples

| Decision | Level | Rationale |
|----------|-------|-----------|
| "Should we use Notion or Confluence?" | 0 | Simple tool comparison |
| "Should we hire a marketing contractor?" | 1 | Standard C-Suite decision |
| "Should we expand to Germany?" | 2 | Needs VP-level implementation detail |
| "Should we pivot from B2B to B2C?" | 3 | Multi-department strategic change |
| "Should we enter the HVAC market?" | 4 | Needs industry expertise |
| "Should we acquire competitor X?" | 5 | Critical, needs full research |

## Cloudflare Timeout Note

**Important:** Cloudflare enforces 100s timeout on synchronous requests.

| Level | Expected Time | Action |
|-------|---------------|--------|
| 0-2 | < 100s | Direct response OK |
| 3 | ~90-120s | May timeout, use async if needed |
| 4-5 | 130-200s | **Must use async polling** |

For Level 4+, use `/resume-board-meeting {thread_id}` after timeout.

## Override Protocol

If uncertain, default to one level higher. Better to over-analyze than under-analyze strategic decisions.

## API Usage

```bash
# Level 0 - Quick decision
curl -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "X-API-Key: $AGENTS_API_KEY" -H "Content-Type: application/json" \
  -d '{"topic": "Tool selection", "level": 0, "decision_type": "operational", "options": ["A", "B"]}'

# Level 2 - Standard strategic
curl -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "X-API-Key: $AGENTS_API_KEY" -H "Content-Type: application/json" \
  -d '{"topic": "Market expansion", "level": 2, "decision_type": "strategic", "options": ["Expand", "Wait"]}'
```

---

*SOP created: 2026-02-01 | SAC-003*
