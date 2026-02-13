---
title: "Metabase Development Gotchas"
sidebar_label: "Metabase Development Gotchas"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Metabase Development Gotchas

Platform-specific patterns for Metabase deployment and API usage.

---

## Quick Reference

| Property | Value |
|----------|-------|
| URL | https://analytics.dyniq.ai |
| Container | metabase (port 3001 → 3000) |
| Network | metabase_metabase-net |
| Health Check | `/api/health` |

---

## Dashboard Direct URLs

Dashboard picker modal has EE limitation bug. Use direct URLs:

| Dashboard | URL |
|-----------|-----|
| Business Performance | `/dashboard/2` |
| Agent Performance | `/dashboard/3` |
| Productivity Patterns | `/dashboard/4` |
| Command Usage | `/dashboard/5` |
| Lead Funnel | `/dashboard/6` |
| Content Performance | `/dashboard/7` |
| Voice Call Analytics | `/dashboard/8` |

---

## API Card Creation

**CRITICAL:** `visualization_settings` is REQUIRED even if empty.

```python
# WRONG - fails with validation error
data = {
    "name": "Card Name",
    "display": "bar",
    "dataset_query": {...}
}

# CORRECT - include empty visualization_settings
data = {
    "name": "Card Name",
    "display": "bar",
    "visualization_settings": {},  # REQUIRED
    "dataset_query": {
        "database": 2,
        "type": "native",
        "native": {"query": "SELECT ..."}
    },
    "type": "question"
}
```

### Add Card to Dashboard

```python
# PUT /api/dashboard/{id}
{
    "dashcards": [
        {
            "id": -1,  # Negative ID for new cards
            "card_id": 39,
            "row": 0,
            "col": 0,
            "size_x": 12,
            "size_y": 6,
            "parameter_mappings": []
        }
    ]
}
```

---

## Database Connections

| Database | ID | Tables |
|----------|-----|--------|
| Walker-OS | 2 | weekly_cashflow, daily_scorecard, timeblock_sessions, etc. |
| DYNIQ | 3 | leads, board_meetings, content_posts, etc. |

**Table Ownership (Common Confusion):**

| Table | Database | Notes |
|-------|----------|-------|
| board_meetings | DYNIQ | NOT Walker-OS |
| leads | DYNIQ | 91 columns |
| daily_scorecard | Walker-OS | Personal productivity |
| weekly_cashflow | Walker-OS | Financial tracking |

---

## Known Limitations (Open Source vs Enterprise)

| Feature | Status | Workaround |
|---------|--------|------------|
| Dashboard picker modal | Shows "An error occurred" | Use direct URLs |
| Audit logging | Not available | N/A |
| Advanced permissions | Limited | Use Supabase RLS |

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "visualization_settings required" | Missing field in card creation | Add `visualization_settings: {}` |
| "An error occurred" in picker | EE feature limitation | Use direct dashboard URLs |
| Sidebar error | Browser cache + EE features | Clear browser cache |
| Connection timeout | Supabase pooler needed | Use port 6543 instead of 5432 |

---

## Health Check

```bash
# Container health
ssh contabo "docker ps | grep metabase"

# API health
curl -s https://analytics.dyniq.ai/api/health
# Expected: {"status":"ok"}

# Restart if needed
ssh contabo "docker restart metabase"
```

---

## API Key Authentication (Preferred over Session Auth)

**Use `METABASE_API_KEY` from `walker-os/apps/api/.env` for all API operations.**

```bash
MB_KEY=$(grep "^METABASE_API_KEY=" /Users/walker/Desktop/Code/walker-os/apps/api/.env | cut -d'=' -f2-)

# All requests use x-api-key header (NOT session token)
curl -s "https://analytics.dyniq.ai/api/card" -H "x-api-key: $MB_KEY"
```

### Create Card via API

```bash
curl -s -X POST "https://analytics.dyniq.ai/api/card" \
  -H "x-api-key: $MB_KEY" -H "Content-Type: application/json" \
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

### Append Card to Dashboard (Preserve Existing Cards)

```bash
# 1. GET dashboard with existing dashcards
DASH=$(curl -s "https://analytics.dyniq.ai/api/dashboard/{id}" -H "x-api-key: $MB_KEY")

# 2. Extract existing dashcards, calculate next row, append new card
# Use python3 with sys.stdin.buffer.read() (responses may have control chars)
UPDATED=$(echo "$DASH" | python3 -c "
import sys, json
d = json.loads(sys.stdin.buffer.read())
existing = [{'id':c['id'],'card_id':c.get('card_id'),'row':c['row'],'col':c['col'],
  'size_x':c['size_x'],'size_y':c['size_y'],'parameter_mappings':c.get('parameter_mappings',[])}
  for c in d.get('dashcards',[])]
max_bottom = max([c['row']+c['size_y'] for c in d['dashcards']]) if d['dashcards'] else 0
existing.append({'id':-1,'card_id':NEW_CARD_ID,'row':max_bottom,'col':0,'size_x':12,'size_y':6,'parameter_mappings':[]})
print(json.dumps({'dashcards':existing}))
")

# 3. PUT updated dashboard
curl -s -X PUT "https://analytics.dyniq.ai/api/dashboard/{id}" \
  -H "x-api-key: $MB_KEY" -H "Content-Type: application/json" -d "$UPDATED"
```

**JSON parsing gotcha:** Dashboard responses contain control characters. Always use `sys.stdin.buffer.read()` not `sys.stdin` in Python.

---

*Last updated: 2026-02-09 (added API key auth + card creation + dashboard append patterns)*
