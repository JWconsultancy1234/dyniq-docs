---
sidebar_position: 5
title: On-Call Reference
description: Quick reference card for on-call operations and common fixes
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# On-Call Reference

Quick reference card for common operational tasks and fixes.

## Connection Details

| Resource | Access |
|----------|--------|
| Server | `ssh contabo` (83.171.248.35) |
| Voice stack | `/opt/dyniq-voice/docker/` |
| n8n stack | `/opt/n8n/` |
| Langfuse stack | `/opt/langfuse/` |
| Metabase | `/opt/metabase/` |

## Common Fixes (Copy-Paste Ready)

### Restart a Single Service

```bash
# agents-api (BAKED - must rebuild)
ssh contabo "cd /opt/dyniq-voice/docker && docker compose build agents-api && docker compose up -d agents-api --force-recreate"

# ruben voice agent
ssh contabo "cd /opt/dyniq-voice/docker && docker compose build ruben && docker compose up -d ruben --force-recreate"

# n8n
ssh contabo "cd /opt/n8n && docker compose restart n8n"

# Langfuse
ssh contabo "cd /opt/langfuse && docker compose restart langfuse-web langfuse-worker"
```

### Fix 502 Bad Gateway

```bash
ssh contabo "docker network connect n8n_default docker-caddy-1 2>/dev/null; \
docker network connect nocodb_default docker-caddy-1 2>/dev/null; \
docker network connect langfuse_default docker-caddy-1 2>/dev/null; \
docker restart docker-caddy-1"
```

### Deploy Latest Code

```bash
# Development (fast, volume mounts)
ssh contabo "/opt/dyniq-voice/docker/deploy-dev.sh"

# Production (GHCR image)
ssh contabo "/opt/dyniq-voice/docker/deploy-prod.sh"
```

### Check Why Service Is Down

```bash
# Container status
ssh contabo "docker ps -a | grep SERVICE_NAME"

# Last 50 log lines
ssh contabo "docker logs CONTAINER_NAME --tail=50"

# Resource usage
ssh contabo "docker stats --no-stream"
```

## Service Dependencies

```
Caddy ──> agents-api ──> PostgreSQL, Redis, OpenRouter, Langfuse
      ──> ruben-api  ──> LiveKit ──> Redis
      ──> n8n        ──> PostgreSQL (n8n)
      ──> Langfuse   ──> PostgreSQL, ClickHouse, MinIO, Redis
```

**Key dependency rules:**
- If LiveKit restarts, also restart `ruben` and `sip` (DNS cache)
- If Langfuse is down, agents-api may hang on telemetry export
- If Redis is down, LiveKit loses room state

## Docker Network Map

| Network | Services |
|---------|----------|
| voice-net | agents-api, ruben, ruben-api, livekit, sip, redis, postgres, caddy |
| n8n_default | n8n, n8n-postgres |
| nocodb_default | nocodb, nocodb-postgres |
| langfuse_default | langfuse-web, langfuse-worker, clickhouse, minio, postgres, redis |
| metabase_metabase-net | metabase |

**Caddy must be connected to ALL networks** to proxy cross-stack services.

## Backup Commands

```bash
# Database backup
ssh contabo "docker exec voice-postgres-1 pg_dump -U dyniq dyniq > /backup/voice-$(date +%Y%m%d).sql"
ssh contabo "docker exec n8n-postgres-1 pg_dump -U n8n n8n > /backup/n8n-$(date +%Y%m%d).sql"
```

## Escalation

| Time Spent | Action |
|-----------|--------|
| 15 min | Documented blocker, trying alternatives |
| 30 min | Escalate to team lead |
| 1 hour | Consider rollback |
