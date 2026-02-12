---
sidebar_position: 3
title: Troubleshooting
description: Comprehensive error patterns, diagnostic commands, and fixes for DYNIQ infrastructure
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Troubleshooting

Consolidated error patterns from across the DYNIQ platform. 50+ patterns from production incidents.

## Quick Diagnostics

```bash
# All container statuses
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# Service logs (last 20 lines)
ssh contabo "docker logs docker-agents-api-1 --tail=20"

# Caddy logs for routing issues
ssh contabo "docker logs docker-caddy-1 --tail=20"

# Full health check
curl -sf https://agents-api.dyniq.ai/health && echo "Agents: OK"
curl -sf https://ruben-api.dyniq.ai/health && echo "Ruben: OK"
curl -sf https://automation.dyniq.ai/healthz && echo "n8n: OK"
curl -sf https://langfuse.dyniq.ai/api/public/health && echo "Langfuse: OK"
curl -sf https://analytics.dyniq.ai/api/health && echo "Metabase: OK"
curl -sf https://docs.dyniq.ai/ && echo "Docs: OK"
```

## HTTP Errors

### 502 Bad Gateway

| Cause | Diagnostic | Fix |
|-------|-----------|-----|
| Caddy lost network connection | `docker network inspect [network] \| grep caddy` | `docker network connect [network] docker-caddy-1 && docker restart docker-caddy-1` |
| Target container not running | `docker ps \| grep [service]` | `docker compose up -d [service]` |
| Wrong container name in Caddyfile | Check Caddyfile upstream | Same-stack: service name. Cross-stack: full name (e.g., `n8n-n8n-1`) |
| Wrong internal port | Check port mapping | Verify port matches container's exposed port |

### 401/403 Unauthorized

```bash
# Verify API key header
curl -v https://agents-api.dyniq.ai/health -H "X-API-Key: test"

# Common mistake: wrong API endpoint
# agents-api.dyniq.ai:8000 != ruben-api.dyniq.ai:8080
```

### 524 Cloudflare Timeout

**Symptom**: Long-running requests return 524 after ~100 seconds.

**Affected operations**:
- Board meetings Level 3+ (40+ agents, ~115-135s)
- Style transfer analysis (8-agent swarm, ~160s)

**Fix**: Use async mode - API returns `thread_id`, poll `/status/{id}` for results.

### 525 SSL Error

**Symptom**: `*.dyniq.ai` returns SSL handshake failure.

**Most common cause**: Service missing from Caddyfile or Caddy not connected to service network.

```bash
# Check Caddyfile has the route
ssh contabo "grep 'service.dyniq.ai' /opt/dyniq-voice/docker/Caddyfile"

# Connect Caddy to network
ssh contabo "docker network connect [network] docker-caddy-1 && docker restart docker-caddy-1"
```

## Docker Issues

### Code Changes Not Taking Effect

**Root cause**: Service uses baked Docker image, not volume mount.

```bash
# WRONG - restart doesn't rebuild image
docker compose restart agents-api

# CORRECT - rebuild and recreate
docker compose build agents-api && docker compose up -d agents-api --force-recreate
```

| Service | Deploy Type |
|---------|------------|
| agents-api | Baked (MUST build) |
| ruben | Baked (MUST build) |
| ruben-api | Baked (MUST build) |
| livekit | Pre-built + config mount |

### Environment Variables Not Loading

```bash
# Check env var in container
ssh contabo "docker exec docker-agents-api-1 env | grep VARIABLE_NAME"

# Env vars only reload on recreate, NOT restart
ssh contabo "cd /opt/dyniq-voice/docker && docker compose up -d --force-recreate agents-api"
```

### Stale DNS After Dependency Restart

**Symptom**: Consumer can't connect to restarted dependency.

```bash
# After restarting LiveKit, restart consumers
ssh contabo "cd /opt/dyniq-voice/docker && docker compose restart ruben sip"
```

### Deploy Fails: Divergent Branches

**Symptom**: `git pull` fails with "divergent branches" error.

```bash
ssh contabo "cd /opt/dyniq-voice && git stash && git pull origin main"
# OR
ssh contabo "cd /opt/dyniq-voice && git stash && git reset --hard origin/main"
```

## LiveKit / Voice Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Ruben can't connect to LiveKit | Wrong `LIVEKIT_URL` | Use `ws://livekit:7880` (internal) |
| SIP calls not connecting | Wrong trunk ID format | Use LiveKit format `ST_xxx`, not Twilio `TK_xxx` |
| Ruben silent on calls | Async `.on()` callbacks | Use `def` (not `async def`) for LiveKit `.on()` handlers |
| LiveKit crash loop | Missing `env_file` | Add `env_file: - ../.env` to livekit/sip services |

## n8n Issues

| Error | Cause | Fix |
|-------|-------|-----|
| "No path back to referenced node" | Cross-branch `$('Node')` reference | Use Merge node or reorganize |
| "22P02 invalid input syntax" | Wrong data type for DB column | Check column type, cast data |
| "23514 check constraint" | Empty string where CHECK exists | Use `null` instead of `""` |
| "access to env vars denied" | `$env.X` in HTTP Request node | Use Code node with `process.env.X` |
| Data lost after HTTP Request | `$json` is now the response | Use `$('NodeName').item.json.field` |

### n8n Env Var Scope

| Stack | Env File | Contains |
|-------|----------|----------|
| n8n | `/opt/n8n/.env` | `N8N_API_KEY`, `NOCODB_API_KEY` |
| dyniq-voice | `/opt/dyniq-voice/.env` | `AGENTS_API_KEY`, `SUPABASE_*` |

## Database Issues

### "invalid port" Error

Special characters in database password. Fix:
```bash
tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 32
```

### Wrong Supabase Project

:::danger Two Separate Databases
DYNIQ data goes to DYNIQ Supabase. Walker-OS data goes to Walker-OS Supabase. Never mix them.
:::

| Data Type | Target |
|-----------|--------|
| Leads, board meetings | DYNIQ |
| Timeblocks, scorecards | Walker-OS |

### UUID Type Mismatch

**Symptom**: Insert fails with "invalid input syntax for type uuid".

**Cause**: Passing string where UUID expected.

```python
import uuid
# Convert string to deterministic UUID
source_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, thread_id)
```

## Langfuse Issues

### SSL 525 on langfuse.dyniq.ai

```bash
# Connect Caddy to Langfuse network
ssh contabo "docker network connect langfuse_default docker-caddy-1 && docker restart docker-caddy-1"
curl -sf https://langfuse.dyniq.ai/api/public/health
```

:::warning Cascading Failure
When Langfuse is unreachable, `agents-api` blocks on telemetry exports. Fix Langfuse before debugging agents-api slowness.
:::

### Cost Showing $0

Langfuse expects `gen_ai.usage.cost` attribute, not `gen_ai.usage.cost_usd`.

### Traces Missing Input/Output

Set BOTH attribute formats:
- `langfuse.observation.input` / `langfuse.observation.output`
- `input.value` / `output.value`

Set input at SPAN START (not end) so it appears even on timeout.

## Metabase Issues

| Error | Cause | Fix |
|-------|-------|-----|
| "visualization_settings required" | Missing field in card creation | Add `visualization_settings: {}` |
| "An error occurred" in picker | EE feature limitation | Use direct URLs (`/dashboard/2`) |
| Connection timeout | Supabase pooler needed | Use port 6543 instead of 5432 |

## Log Locations

| Service | Command |
|---------|---------|
| Agents API | `docker logs docker-agents-api-1 --tail=50` |
| Ruben | `docker logs docker-ruben-1 --tail=50` |
| Caddy | `docker logs docker-caddy-1 --tail=50` |
| LiveKit | `docker logs docker-livekit-1 --tail=50` |
| n8n | `docker logs n8n-n8n-1 --tail=50` |
| Langfuse | `docker logs langfuse-web --tail=50` |
| Metabase | `docker logs metabase --tail=50` |
