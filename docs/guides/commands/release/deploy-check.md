---
title: "Deploy Check"
sidebar_label: "Deploy Check"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# Deploy Check

Pre-deployment verification for Contabo services. Run before any infrastructure changes.

## When to Use

- Before deploying Docker changes
- Before modifying .env files
- Before any `docker compose` commands
- When carry-over task says "deploy X"

## Checks

### 1. Service Health

```bash
# All endpoints
curl -s https://ruben-api.dyniq.ai/health && echo ""
curl -s https://automation.dyniq.ai/healthz && echo ""
curl -s https://crm.dyniq.ai/api/v1/health && echo ""
```

### 2. Container Status

```bash
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}'"
```

Expected: All containers "Up" with healthy status.

### 3. Caddy Network Connections

```bash
ssh contabo "docker inspect docker-caddy-1 --format '{{json .NetworkSettings.Networks}}' | jq 'keys'"
```

Expected output:
```json
["docker_voice-net", "dyniq-network", "n8n_default", "nocodb_default"]
```

### 4. Recent Errors

```bash
ssh contabo "docker logs docker-ruben-1 --tail 20 2>&1 | grep -iE 'error|exception|failed' || echo 'No errors found'"
```

### 5. Git Status (Local + Server)

```bash
# Local
cd /Users/walker/Desktop/Code/dyniq-ai-agents && git status --short

# Server (MANDATORY - 6x hotfix divergence pattern)
ssh contabo "cd /opt/dyniq-voice && git status --short && echo '---' && git log --oneline -1"
```

### 6. Supabase Constraint Check (For Schema-Touching Deploys)

**Before deploying code that writes new enum values to Supabase:**

```bash
# Check CHECK constraints on target table columns
ssh contabo "docker exec docker-agents-api-1 python3 -c \"
import os
from supabase import create_client
c = create_client(os.getenv('DYNIQ_SUPABASE_URL'), os.getenv('DYNIQ_SUPABASE_SERVICE_KEY'))
r = c.rpc('get_check_constraints', {'p_table': 'leads'}).execute()
print(r.data)
\""

# Or query directly via REST API
curl -s "${DYNIQ_SUPABASE_URL}/rest/v1/rpc/get_check_constraints" \
  -H "apikey: ${DYNIQ_SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"p_table": "leads"}'
```

**Known constraints:**

| Table | Column | Constraint | Allowed Values |
|-------|--------|-----------|----------------|
| leads | call_outcome | `leads_call_outcome_check` | no_answer, callback_requested, interested, not_interested, converted, invalid_number, voicemail, wrong_number |
| leads | urgency | CHECK | Valid enum values (rejects empty string) |

**Incident (2026-02-12):** `_classify_call_outcome()` returned `"engaged"` but constraint only allows 8 values. Runtime error on INSERT.

## Decision Matrix

| Health | Containers | Networks | Action |
|--------|------------|----------|--------|
| ✅ All OK | ✅ All Up | ✅ All Connected | Safe to deploy |
| ✅ All OK | ✅ All Up | ❌ Missing | Run `/caddy-reconnect` first |
| ❌ Some Down | ❌ Issues | Any | Investigate before deploying |
| ✅ All OK | ✅ All Up | ✅ All Connected | **Ask: Is deployment still needed?** |

## Key Question

Before proceeding with deployment:

> "Production is healthy. Is this change still needed, or was it already applied?"

If production is working and the issue is resolved, **skip deployment**.

## Quick All-in-One Check

```bash
echo "=== Health ===" && \
curl -s https://ruben-api.dyniq.ai/health && echo "" && \
echo "=== Containers ===" && \
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}'" && \
echo "=== Caddy Networks ===" && \
ssh contabo "docker inspect docker-caddy-1 --format '{{json .NetworkSettings.Networks}}' | jq 'keys'"
```

## Reference

Full infrastructure docs: @infrastructure-architecture.md
