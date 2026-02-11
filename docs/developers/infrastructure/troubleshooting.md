---
sidebar_position: 3
title: Troubleshooting
description: Common issues, diagnostic commands, and fixes for DYNIQ infrastructure
---

# Troubleshooting

Common issues and their resolutions for DYNIQ infrastructure.

## Quick Diagnostics

```bash
# Check all container statuses
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# Check specific service logs (last 20 lines)
ssh contabo "docker logs docker-agents-api-1 --tail=20"

# Check Caddy logs for routing issues
ssh contabo "docker logs docker-caddy-1 --tail=20"
```

## Common Issues

### 502 Bad Gateway

**Symptom**: Browser shows 502 when accessing `*.dyniq.ai`

**Causes & Fixes**:

| Cause | Diagnostic | Fix |
|-------|-----------|-----|
| Caddy lost network connection | `docker network inspect [network] \| grep caddy` | `docker network connect [network] docker-caddy-1 && docker restart docker-caddy-1` |
| Target container not running | `docker ps \| grep [service]` | `docker compose up -d [service]` |
| Wrong container name in Caddyfile | Check Caddyfile upstream name | Same-stack: service name. Cross-stack: full container name (e.g., `n8n-n8n-1`) |
| Wrong internal port | Check service port mapping | Verify port matches container's exposed port |

### 401/403 on API Calls

**Symptom**: API returns unauthorized error

```bash
# Verify API key header is correct
curl -v https://agents-api.dyniq.ai/health -H "X-API-Key: test"

# Check if targeting correct API
# agents-api.dyniq.ai:8000 != ruben-api.dyniq.ai:8080
```

### Code Changes Not Taking Effect

**Symptom**: Deployed code but behavior unchanged

**Root cause**: Service uses baked Docker image, not volume mount.

```bash
# WRONG - restart doesn't rebuild image
docker compose restart agents-api

# CORRECT - rebuild and recreate
docker compose build agents-api && docker compose up -d agents-api --force-recreate
```

### Environment Variables Not Loading

**Symptom**: Features fail silently, 500 errors

```bash
# Check env var exists in container
ssh contabo "docker exec docker-agents-api-1 env | grep VARIABLE_NAME"

# Env vars only reload on container recreate, not restart
ssh contabo "cd /opt/dyniq-voice/docker && docker compose up -d --force-recreate agents-api"
```

### Cloudflare Timeout (524 Error)

**Symptom**: Long-running requests return 524

Cloudflare has a hard 100-second proxy timeout. Requests exceeding this limit are terminated.

**Affected operations**:
- Board meetings at Level 3+ (40+ agents, ~115-135s)
- Style transfer analysis (8-agent swarm, ~160s)

**Solution**: Use async mode - the API returns immediately with a `thread_id`, poll `/status/{id}` for results.

### LiveKit Connection Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Ruben can't connect | Wrong LIVEKIT_URL | Use `ws://livekit:7880` (internal), not localhost |
| SIP calls not connecting | Wrong trunk ID format | Use LiveKit format `ST_xxx`, not Twilio `TK_xxx` |
| Ruben silent on calls | Async callbacks | Use `def` (not `async def`) for LiveKit `.on()` handlers |

### Database Connection Errors

```bash
# "invalid port" error
# Cause: Special characters in database password
# Fix: Use alphanumeric only
tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 32
```

### Langfuse SSL 525

**Symptom**: `langfuse.dyniq.ai` returns SSL error

**Cause**: Langfuse route missing from Caddyfile, or Caddy not connected to langfuse network.

```bash
# Verify Caddy has Langfuse route
ssh contabo "grep 'langfuse.dyniq.ai' /opt/dyniq-voice/docker/Caddyfile"

# Connect Caddy to Langfuse network
ssh contabo "docker network connect langfuse_default docker-caddy-1 && docker restart docker-caddy-1"

# Verify
curl -sf https://langfuse.dyniq.ai/api/public/health
```

:::warning Cascading Failure
When Langfuse is unreachable, `agents-api` can block on telemetry exports. Always fix Langfuse connectivity before debugging agents-api slowness.
:::

## Health Check URLs

```bash
# All services
curl -sf https://agents-api.dyniq.ai/health && echo "Agents API: OK"
curl -sf https://ruben-api.dyniq.ai/health && echo "Ruben API: OK"
curl -sf https://automation.dyniq.ai/healthz && echo "n8n: OK"
curl -sf https://langfuse.dyniq.ai/api/public/health && echo "Langfuse: OK"
curl -sf https://analytics.dyniq.ai/api/health && echo "Metabase: OK"
curl -sf https://docs.dyniq.ai/ && echo "Docs: OK"
```

## Log Locations

| Service | Command |
|---------|---------|
| Agents API | `docker logs docker-agents-api-1 --tail=50` |
| Ruben | `docker logs docker-ruben-1 --tail=50` |
| Caddy | `docker logs docker-caddy-1 --tail=50` |
| LiveKit | `docker logs docker-livekit-1 --tail=50` |
| n8n | `docker logs n8n-n8n-1 --tail=50` |
