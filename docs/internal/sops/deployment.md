---
sidebar_position: 5
title: Deployment Guide
description: SOP for deploying DYNIQ services to Contabo VPS
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Deployment SOP

How to deploy DYNIQ services to Contabo VPS (83.171.248.35).

## Quick Reference

| Environment | Script | Time |
|-------------|--------|------|
| Development | `ssh contabo "/opt/dyniq-voice/docker/deploy-dev.sh"` | 2-5s |
| Production | `ssh contabo "/opt/dyniq-voice/docker/deploy-prod.sh"` | ~15s |

## Pre-Deploy Checklist

:::danger Mandatory
Run these checks before EVERY deploy. 5 incidents caused by skipping this step.
:::

### 1. Verify Server is Clean

```bash
# Check for uncommitted changes
ssh contabo "cd /opt/dyniq-voice && git status --short"

# Check server matches remote
ssh contabo "cd /opt/dyniq-voice && git log --oneline -1 && echo '---' && git log --oneline origin/main -1"
```

### 2. If Server is Dirty

```bash
# Stash local changes, then pull
ssh contabo "cd /opt/dyniq-voice && git stash && git pull origin main"

# OR if divergent:
ssh contabo "cd /opt/dyniq-voice && git stash && git reset --hard origin/main"
```

### 3. Verify Env Vars

```bash
# Check critical env vars exist (names only, never values)
ssh contabo "grep -E 'SUPABASE_URL|OPENROUTER_API_KEY|LANGFUSE' /opt/dyniq-voice/.env | cut -d'=' -f1"
```

## Service Deployment Types

| Service | Type | Code Change Method |
|---------|------|-------------------|
| agents-api | **Baked image** | `docker compose build agents-api && up -d agents-api --force-recreate` |
| ruben | Baked image | `docker compose build ruben && up -d ruben --force-recreate` |
| ruben-api | Baked image | `docker compose build ruben-api && up -d ruben-api --force-recreate` |
| livekit | Pre-built + config mount | `docker compose up -d livekit --force-recreate` |

:::warning Critical
`agents-api` is BAKED (0 volume mounts). `docker compose restart` does NOT pick up code changes. You MUST `build` + `force-recreate`.
:::

## Deploy agents-api (Most Common)

```bash
ssh contabo "cd /opt/dyniq-voice/docker && \
  docker compose build agents-api && \
  docker compose up -d agents-api --force-recreate"
```

### Post-Deploy Verification

```bash
# Check container is running
ssh contabo "docker ps | grep agents-api"

# Check health
curl -sf https://agents-api.dyniq.ai/health

# Check recent logs
ssh contabo "docker logs docker-agents-api-1 --tail=20"

# Verify new env var (if added)
ssh contabo "docker exec docker-agents-api-1 env | grep NEW_VAR"
```

## Deploy Ruben Voice Agent

```bash
ssh contabo "cd /opt/dyniq-voice/docker && \
  docker compose build ruben && \
  docker compose up -d ruben --force-recreate"
```

## Restart After Dependency Change

After restarting a dependency (e.g., LiveKit), restart consumers for DNS refresh:

```bash
ssh contabo "cd /opt/dyniq-voice/docker && \
  docker compose restart ruben sip"
```

## Caddy Route Verification

After starting any new service:

```bash
# 1. Is it in Caddyfile?
ssh contabo "grep 'service.dyniq.ai' /opt/dyniq-voice/docker/Caddyfile"

# 2. Is Caddy connected to the network?
ssh contabo "docker network inspect [network] | grep caddy"

# 3. Does the public URL work?
curl -sf https://service.dyniq.ai/health
```

**502/503?** Check: container name matches Caddyfile, Caddy on same network, correct internal port.

## Health Check All Services

```bash
curl -sf https://agents-api.dyniq.ai/health && echo "Agents API: OK"
curl -sf https://ruben-api.dyniq.ai/health && echo "Ruben API: OK"
curl -sf https://automation.dyniq.ai/healthz && echo "n8n: OK"
curl -sf https://langfuse.dyniq.ai/api/public/health && echo "Langfuse: OK"
curl -sf https://analytics.dyniq.ai/api/health && echo "Metabase: OK"
```

## Rollback

```bash
# Find previous image
ssh contabo "docker images | grep agents-api | head -5"

# Rollback to previous git commit
ssh contabo "cd /opt/dyniq-voice && git log --oneline -5"
ssh contabo "cd /opt/dyniq-voice && git checkout [previous-sha]"
ssh contabo "cd /opt/dyniq-voice/docker && \
  docker compose build agents-api && \
  docker compose up -d agents-api --force-recreate"
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Code changes not applied | Used `restart` instead of `build` | Rebuild + force-recreate |
| Env vars not loading | Used `restart` instead of `recreate` | `up -d --force-recreate` |
| 502 Bad Gateway | Caddy lost network | `docker network connect [net] docker-caddy-1` |
| Deploy fails: divergent | Server has local hotfixes | Stash + pull or reset |
| Stale DNS | Dependency restarted | Restart consumer containers |
