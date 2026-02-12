---
title: "DYNIQ Deployment Guide"
sidebar_label: "DYNIQ Deployment Guide"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# DYNIQ Deployment Guide

Deployment commands, CI/CD, and operational procedures.
For architecture overview, see @infrastructure-architecture.md

---

## Docker Deployment Strategy (CRITICAL)

| Scenario | Command | Time | Notes |
|----------|---------|------|-------|
| **Code change (baked image)** | `docker compose build service && docker compose up -d service` | ~45s | Must rebuild to pick up code changes |
| **Code change (volume mount)** | `docker compose restart service` | ~2s | Only if volumes configured |
| **Env file change** | `docker compose up -d --force-recreate service` | ~5s | Restart doesn't reload env! |
| **Dependency change** | `docker compose build --no-cache service && docker compose up -d service` | ~90s | Force fresh pip install |
| **Full redeploy** | `docker compose down && docker compose up -d --build` | ~2min | Nuclear option |

**CRITICAL:**
- `docker compose restart` does **NOT** reload baked code changes!
- `docker compose restart` does **NOT** reload env_file changes!
- Always use `--build` or `--force-recreate` when in doubt

---

## Standard Deployment Commands

```bash
# Deploy voice agent changes (baked images)
ssh contabo "cd /opt/dyniq-voice && git pull && cd docker && docker compose build ruben ruben-api && docker compose up -d ruben ruben-api"
curl https://ruben-api.dyniq.ai/health

# Deploy agents-api changes
ssh contabo "cd /opt/dyniq-voice && git pull && cd docker && docker compose build agents-api && docker compose up -d agents-api"
curl https://agents-api.dyniq.ai/health

# Env file change only (no code change)
docker compose up -d --force-recreate ruben ruben-api

# Full stack redeploy
ssh contabo "cd /opt/dyniq-voice/docker && docker compose down && docker compose up -d --build"

# Reconnect Caddy to networks after redeploy
docker network connect n8n_default docker-caddy-1
docker network connect nocodb_default docker-caddy-1
docker restart docker-caddy-1
```

---

## Development Deployment (Volume Mounts)

**Purpose:** Rapid code iteration without Docker rebuilds (45s -> 2-5s).

**Config:** `/opt/dyniq-voice/docker/docker-compose.dev.yml`

```yaml
services:
  agents-api:
    volumes:
      - /opt/dyniq-voice/agents:/app/agents:ro
      - /opt/dyniq-voice/api:/app/api:ro
      - /opt/dyniq-voice/shared:/app/shared:ro
```

| Scenario | Strategy | Command | Time |
|----------|----------|---------|------|
| Code change only | Volume mount restart | `ssh contabo "/opt/dyniq-voice/docker/deploy-dev.sh"` | 2-5s |
| Dependency change | Full rebuild | `docker compose build && up -d` | ~45s |
| Dockerfile change | Full rebuild | `docker compose build && up -d` | ~45s |

**Quick Deploy:** `ssh contabo "/opt/dyniq-voice/docker/deploy-dev.sh"`

**Key rules:**
- Volume mounts are **read-only** (`:ro`) for security
- Always `git pull` before restart (enforced by deploy-dev.sh)
- **Python modules require container restart** - file changes alone are NOT enough
- New files require `--force-recreate` (not just restart)

**New files command:**
```bash
ssh contabo "cd /opt/dyniq-voice && git pull && cd docker && docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --force-recreate agents-api"
```

**Health check timing:** `deploy-dev.sh` may report failure before container fully starts (~10-15s). Always verify: `curl https://agents-api.dyniq.ai/health`

---

## Production Deployment (CI/CD)

**Pipeline:** GitHub Actions builds and pushes to GHCR on push to `main`.

**Config files:**
- GitHub Actions: `dyniq-ai-agents/.github/workflows/build-push.yml`
- Docker override: `/opt/dyniq-voice/docker/docker-compose.prod.yml`
- Deploy script: `/opt/dyniq-voice/docker/deploy-prod.sh`

**Image Registry:** `ghcr.io/jwconsultancy1234/dyniq-ai-agents/agents-api`

```bash
# Standard production deploy (pulls latest)
ssh contabo "/opt/dyniq-voice/docker/deploy-prod.sh"

# Deploy specific version (by commit SHA)
ssh contabo "cd /opt/dyniq-voice/docker && \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml pull agents-api:abc1234 && \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d agents-api"

# Rollback to previous version
ssh contabo "cd /opt/dyniq-voice/docker && \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml pull agents-api:def5678 && \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d agents-api"
```

**CI/CD Triggers:** Automatic on push to `main` (paths: agents/, api/, shared/, Dockerfile, requirements.txt). Manual via GitHub Actions UI.

| Environment | Script | Time | Image Source |
|-------------|--------|------|--------------|
| Development | `deploy-dev.sh` | 2-5s | Volume mounts |
| Production | `deploy-prod.sh` | ~15s | GHCR baked image |

---

## Pre-Deploy Server State Check (5x pattern - MANDATORY)

**Before ANY deploy, verify server git state is clean:**

```bash
# Check for local modifications or divergent branches
ssh contabo "cd /opt/dyniq-voice && git status --short && git log --oneline -1"
```

| Server State | Action |
|-------------|--------|
| Clean, matches remote | Proceed with `git pull` |
| Modified files | `git stash && git pull origin main` |
| Divergent branches | `git stash && git reset --hard origin/main` |

**Why:** Server accumulates hotfixes applied directly. 5 incidents where `git pull` failed due to divergent branches, requiring manual `git reset --hard`.

---

## Pre-Deploy Env Checklist

Before deploying features that require new env vars:

```bash
# 1. Check required vars exist in prod
ssh contabo "grep -E 'SUPABASE_URL|SUPABASE_SERVICE_KEY|OPENROUTER_API_KEY|LANGFUSE' /opt/dyniq-voice/.env"

# 2. If missing, add to prod .env
ssh contabo "cat >> /opt/dyniq-voice/.env << 'EOF'
NEW_VAR=value
EOF"

# 3. Recreate container (restart doesn't reload env!)
ssh contabo "cd /opt/dyniq-voice/docker && docker compose up -d --force-recreate agents-api"

# 4. Verify inside container
ssh contabo "docker exec docker-agents-api-1 env | grep NEW_VAR"
```

---

## Next.js NEXT_PUBLIC_* Variables

**CRITICAL:** `NEXT_PUBLIC_*` variables are baked at BUILD time, not runtime.

| Variable Type | When Set | Container Restart Picks Up? |
|---------------|----------|----------------------------|
| `NEXT_PUBLIC_*` | Build time | **NO** - requires rebuild |
| Server-side env | Runtime | Yes |

```bash
# WRONG - won't work for NEXT_PUBLIC_* vars
docker compose restart demo-app

# CORRECT - rebuild required
docker build --no-cache --build-arg NEXT_PUBLIC_AGENTS_API_KEY="$KEY" -t demo-app .
docker compose up -d demo-app
```

**Security:** `NEXT_PUBLIC_*` vars are exposed in client JS bundle. For API keys, use BFF pattern (Next.js API routes that proxy server-side).

---

## Caddyfile Routing Best Practices

**Always use container names, never hardcoded IPs:**

| Pattern | Example | Works Across Networks |
|---------|---------|----------------------|
| **Container name** | `nocodb-nocodb-1:8080` | Yes |
| **Service name (same stack)** | `agents-api:8000` | Yes |
| **Bridge IP** | `172.17.0.1:8080` | No |
| **Host IP** | `127.0.0.1:8080` | No |

**Cross-Stack Container Names:**

| Service | Stack | Container Name | Port |
|---------|-------|----------------|------|
| n8n | n8n_default | `n8n-n8n-1` | 5678 |
| NocoDB | nocodb_default | `nocodb-nocodb-1` | 8080 |
| Langfuse | langfuse_default | `langfuse-langfuse-web-1` | 3000 |
| agents-api | voice-net | `agents-api` | 8000 |
| ruben-api | voice-net | `ruben-api` | 8080 |

**Rule:** Cross-stack uses full name (`stack-service-1`), same-stack uses service name.

**Caddy route verification after starting any new service:**
```bash
ssh contabo "grep 'service.dyniq.ai' /opt/dyniq-voice/docker/Caddyfile"  # 1. In Caddyfile?
ssh contabo "docker network inspect [network] | grep caddy"              # 2. Caddy connected?
curl -s https://service.dyniq.ai/health                                  # 3. Public URL works?
```

---

## Local Development Setup

To call agents-api from local machine:

Add to `~/.zshrc`:
```bash
[[ -f ~/Desktop/Code/walker-os/apps/api/.env ]] && export $(grep -E '^AGENTS_API_KEY=' ~/Desktop/Code/walker-os/apps/api/.env | xargs)
```

**Verify:** `echo $AGENTS_API_KEY && curl -s "https://agents-api.dyniq.ai/health" -H "X-API-Key: $AGENTS_API_KEY"`

| Issue | Cause | Fix |
|-------|-------|-----|
| "Missing API key" | AGENTS_API_KEY not in shell | `source ~/.zshrc` or restart terminal |
| 401 Unauthorized | Key mismatch | Verify: `ssh contabo "grep AGENTS_API_KEY /opt/dyniq-voice/.env"` |

---

## Orphaned Claude Process Detection

```bash
# Check for orphaned processes (should match open terminal count)
ps aux | grep -E '^walker.*claude' | grep -v grep

# Kill specific orphans (safer than pkill -f claude)
kill [PID1] [PID2]
```

---

## Backup & Recovery

```bash
# Database backups
ssh contabo "docker exec voice-postgres-1 pg_dump -U dyniq dyniq > /backup/voice-$(date +%Y%m%d).sql"
ssh contabo "docker exec n8n-postgres-1 pg_dump -U n8n n8n > /backup/n8n-$(date +%Y%m%d).sql"

# Quick rollback
ssh contabo "cd /opt/dyniq-voice && git checkout HEAD~1 . && cd docker && docker compose up -d --build"
```

---

*Reference this doc for ALL deployment operations.*
