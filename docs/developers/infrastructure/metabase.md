---
sidebar_position: 5
title: Metabase Analytics
description: Metabase deployment, API usage, and dashboard management
doc_owner: CDO
review_cycle: 30d
doc_status: published
---

# Metabase Analytics

Deployment reference and API patterns for Metabase analytics dashboards.

## Quick Reference

| Property | Value |
|----------|-------|
| URL | `https://analytics.dyniq.ai` |
| Container | metabase (port 3001 -> 3000) |
| Network | `metabase_metabase-net` |
| Health Check | `curl https://analytics.dyniq.ai/api/health` |

## Dashboard URLs

| Dashboard | URL | Database |
|-----------|-----|----------|
| Business Performance | `/dashboard/2` | Walker-OS |
| Agent Performance | `/dashboard/3` | Walker-OS |
| Productivity Patterns | `/dashboard/4` | Walker-OS |
| Command Usage | `/dashboard/5` | Walker-OS |
| Lead Funnel | `/dashboard/6` | DYNIQ |
| Content Performance | `/dashboard/7` | DYNIQ |
| Voice Call Analytics | `/dashboard/8` | Walker-OS (Langfuse sync) |

## Database Connections

| Database | ID | Key Tables |
|----------|-----|-----------|
| Walker-OS | 2 | weekly_cashflow, daily_scorecard, timeblock_sessions |
| DYNIQ | 3 | leads, board_meetings, content_posts |

:::warning Common Confusion
`board_meetings` is in the **DYNIQ** database, not Walker-OS. `daily_scorecard` is in **Walker-OS**, not DYNIQ.
:::

## API Authentication

Use API key authentication (not session tokens):

```bash
MB_KEY=$(grep "^METABASE_API_KEY=" apps/api/.env | cut -d'=' -f2-)

curl -s "https://analytics.dyniq.ai/api/card" \
  -H "x-api-key: $MB_KEY"
```

## Creating Cards via API

```bash
curl -s -X POST "https://analytics.dyniq.ai/api/card" \
  -H "x-api-key: $MB_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Card Name",
    "display": "bar",
    "visualization_settings": {},
    "dataset_query": {
      "database": 3,
      "type": "native",
      "native": {"query": "SELECT ..."}
    },
    "type": "question"
  }'
```

:::tip visualization_settings Required
The `visualization_settings` field is **required** even if empty. Omitting it causes a validation error.
:::

## Adding Cards to Dashboards

```bash
# 1. GET dashboard with existing dashcards
DASH=$(curl -s "https://analytics.dyniq.ai/api/dashboard/{id}" -H "x-api-key: $MB_KEY")

# 2. Calculate next row position, append new card with id: -1
# 3. PUT updated dashboard (preserves existing cards)
curl -s -X PUT "https://analytics.dyniq.ai/api/dashboard/{id}" \
  -H "x-api-key: $MB_KEY" \
  -H "Content-Type: application/json" \
  -d "$UPDATED_JSON"
```

**JSON parsing note:** Dashboard responses may contain control characters. Use `sys.stdin.buffer.read()` in Python scripts.

## Known Limitations (Open Source)

| Feature | Status | Workaround |
|---------|--------|------------|
| Dashboard picker modal | Shows error | Use direct URLs above |
| Audit logging | Not available | N/A |
| Advanced permissions | Limited | Use Supabase RLS |

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "visualization_settings required" | Missing field | Add `visualization_settings: {}` |
| "An error occurred" in picker | EE feature | Use direct dashboard URLs |
| Connection timeout | Supabase pooler | Use port 6543 instead of 5432 |
