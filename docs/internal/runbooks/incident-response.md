---
sidebar_position: 2
title: Incident Response
description: Step-by-step incident response procedures for DYNIQ infrastructure
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Incident Response

Step-by-step procedures for responding to production incidents.

## Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|---------------|---------|
| P0 - Critical | Service completely down | 15 min | All APIs unreachable, data loss |
| P1 - Major | Core feature broken | 1 hour | Board meetings failing, voice calls down |
| P2 - Minor | Degraded performance | 4 hours | Slow responses, partial failures |
| P3 - Low | Cosmetic/minor issue | Next business day | UI glitch, non-critical logs |

## Initial Response (All Severities)

### 1. Assess the Impact

```bash
# Check all service health
curl -s https://agents-api.dyniq.ai/health
curl -s https://ruben-api.dyniq.ai/health
curl -s https://langfuse.dyniq.ai/api/public/health
curl -s https://automation.dyniq.ai/healthz

# Check container status
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -v healthy"
```

### 2. Check Recent Changes

```bash
# What changed recently?
ssh contabo "cd /opt/dyniq-voice && git log --oneline -5"
ssh contabo "docker ps --format '{{.Names}}\t{{.CreatedAt}}' | sort -k2 -r | head -10"
```

### 3. Check Logs

```bash
# Service-specific logs
ssh contabo "docker logs docker-agents-api-1 --tail=50 --since=10m"
ssh contabo "docker logs docker-caddy-1 --tail=50 --since=10m"
ssh contabo "docker logs docker-ruben-1 --tail=50 --since=10m"
```

## Common Incident Playbooks

### API Returning 502 Bad Gateway

**Cause:** Caddy lost network connections after restart.

```bash
# Reconnect Caddy to all networks
ssh contabo "docker network connect voice-net docker-caddy-1 2>/dev/null; \
docker network connect n8n_default docker-caddy-1 2>/dev/null; \
docker network connect nocodb_default docker-caddy-1 2>/dev/null; \
docker network connect langfuse_default docker-caddy-1 2>/dev/null; \
docker restart docker-caddy-1"

# Verify
curl -s https://agents-api.dyniq.ai/health
```

### agents-api Not Responding

```bash
# 1. Check if container is running
ssh contabo "docker ps | grep agents-api"

# 2. Check logs for errors
ssh contabo "docker logs docker-agents-api-1 --tail=30"

# 3. Check if Langfuse is blocking (common cause)
curl -s https://langfuse.dyniq.ai/api/public/health

# 4. Restart with rebuild (baked image)
ssh contabo "cd /opt/dyniq-voice/docker && \
docker compose build agents-api && \
docker compose up -d agents-api --force-recreate"
```

### Voice Calls Not Connecting

```bash
# 1. Check LiveKit, SIP, and Ruben are running
ssh contabo "docker ps | grep -E 'livekit|sip|ruben'"

# 2. Check SIP trunk configuration
ssh contabo "docker logs docker-sip-1 --tail=20"

# 3. Restart voice stack
ssh contabo "cd /opt/dyniq-voice/docker && \
docker compose restart livekit sip ruben ruben-api"
```

### Cloudflare 524 Timeout

**Cause:** Request exceeded Cloudflare's 100s timeout limit.

For board meetings Level 3+, this is expected. Use async polling:
1. POST returns immediately with `thread_id`
2. Poll `GET /status/{thread_id}` until complete

## Post-Incident

1. Document what happened and when
2. Document root cause
3. Document fix applied
4. Update runbooks if a new pattern was found
5. Create follow-up issue for permanent fix if needed
