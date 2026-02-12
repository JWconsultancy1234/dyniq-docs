---
sidebar_position: 3
title: Rollback Procedures
description: How to roll back deployments and recover from failed releases
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Rollback Procedures

Procedures for reverting deployments when issues are detected in production.

## Quick Rollback Decision Tree

| Situation | Action | Time |
|-----------|--------|------|
| Bad code deploy (agents-api) | Git revert + rebuild | ~60s |
| Bad env change | Restore .env + force-recreate | ~10s |
| Bad Caddyfile change | Restore Caddyfile + restart Caddy | ~5s |
| Database migration issue | Restore from backup | ~5 min |
| Full stack broken | Nuclear redeploy | ~2 min |

## Code Rollback (agents-api)

```bash
# 1. Identify last known good commit
ssh contabo "cd /opt/dyniq-voice && git log --oneline -10"

# 2. Revert to previous commit
ssh contabo "cd /opt/dyniq-voice && git checkout HEAD~1 ."

# 3. Rebuild and restart
ssh contabo "cd /opt/dyniq-voice/docker && \
docker compose build agents-api && \
docker compose up -d agents-api --force-recreate"

# 4. Verify health
curl -s https://agents-api.dyniq.ai/health
```

## Production Image Rollback (GHCR)

```bash
# Deploy specific version by commit SHA
ssh contabo "cd /opt/dyniq-voice/docker && \
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull && \
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d agents-api"
```

## Environment Variable Rollback

```bash
# 1. Edit .env to remove/fix the variable
ssh contabo "nano /opt/dyniq-voice/.env"

# 2. Force recreate (restart doesn't reload env!)
ssh contabo "cd /opt/dyniq-voice/docker && \
docker compose up -d --force-recreate agents-api"

# 3. Verify env inside container
ssh contabo "docker exec docker-agents-api-1 env | grep VARIABLE_NAME"
```

:::warning
`docker compose restart` does **NOT** reload environment variables. Always use `--force-recreate`.
:::

## Caddyfile Rollback

```bash
# 1. Restore previous Caddyfile
ssh contabo "cd /opt/dyniq-voice/docker && git checkout HEAD~1 Caddyfile"

# 2. Restart Caddy
ssh contabo "docker restart docker-caddy-1"

# 3. Verify routing
curl -s https://agents-api.dyniq.ai/health
curl -s https://ruben-api.dyniq.ai/health
```

## Database Rollback

```bash
# Restore from daily backup
ssh contabo "docker exec voice-postgres-1 psql -U dyniq -d dyniq < /backup/voice-YYYYMMDD.sql"

# For n8n database
ssh contabo "docker exec n8n-postgres-1 psql -U n8n -d n8n < /backup/n8n-YYYYMMDD.sql"
```

## Nuclear Option (Full Stack Redeploy)

Use only when individual service restarts fail:

```bash
ssh contabo "cd /opt/dyniq-voice/docker && \
docker compose down && \
docker compose up -d --build"

# Reconnect Caddy to external networks
ssh contabo "docker network connect n8n_default docker-caddy-1; \
docker network connect nocodb_default docker-caddy-1; \
docker network connect langfuse_default docker-caddy-1; \
docker restart docker-caddy-1"
```

## Pre-Rollback Checklist

- [ ] Document current state (what's broken, error messages)
- [ ] Identify the change that caused the issue
- [ ] Verify the rollback target is actually stable
- [ ] Communicate to affected users if applicable
