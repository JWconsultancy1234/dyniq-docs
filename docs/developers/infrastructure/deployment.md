---
sidebar_position: 2
title: Deployment
description: Deployment procedures for DYNIQ services on Contabo VPS
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Deployment

All DYNIQ services are deployed on a Contabo VPS using Docker Compose with Caddy reverse proxy.

## Quick Reference

| Environment | Command | Duration |
|-------------|---------|----------|
| Development | `ssh contabo "/opt/dyniq-voice/docker/deploy-dev.sh"` | 2-5s |
| Production | `ssh contabo "/opt/dyniq-voice/docker/deploy-prod.sh"` | ~15s |

## Deployment Types

### Baked Image Services

These services require a full `build` + `recreate` to pick up code changes:

| Service | Build Command |
|---------|---------------|
| agents-api | `docker compose build agents-api && docker compose up -d agents-api --force-recreate` |
| ruben | `docker compose build ruben && docker compose up -d ruben --force-recreate` |
| ruben-api | `docker compose build ruben-api && docker compose up -d ruben-api --force-recreate` |
| docs | `docker compose build docs && docker compose up -d docs --force-recreate` |

:::danger Critical: Baked Images
`docker compose restart` does **NOT** pick up code changes for baked image services. You must `build` then `up --force-recreate` every time.
:::

### Config-Mounted Services

These services pick up config changes with a simple restart:

| Service | Restart Command |
|---------|-----------------|
| livekit | `docker compose up -d livekit --force-recreate` |
| caddy | `docker compose restart caddy` |

## Pre-Deploy Checklist

### 1. Verify Server State

```bash
# Check for uncommitted changes on server
ssh contabo "cd /opt/dyniq-voice && git status --short"

# Check server matches remote
ssh contabo "cd /opt/dyniq-voice && git log --oneline -1 && echo '---' && git log --oneline origin/main -1"
```

If the server has local changes:
```bash
ssh contabo "cd /opt/dyniq-voice && git stash && git pull origin main"
```

### 2. Verify Environment Variables

```bash
# Check required env vars exist (show names only, never values)
ssh contabo "grep -E 'SUPABASE_URL|OPENROUTER_API_KEY|LANGFUSE' /opt/dyniq-voice/.env | cut -d'=' -f1"
```

### 3. Deploy

```bash
# Pull latest code
ssh contabo "cd /opt/dyniq-voice && git pull origin main"

# Build and recreate target service
ssh contabo "cd /opt/dyniq-voice/docker && docker compose build agents-api && docker compose up -d agents-api --force-recreate"
```

### 4. Verify

```bash
# Health check
curl -sf https://agents-api.dyniq.ai/health

# Check container is running
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep agents"
```

## CI/CD Pipeline

The documentation site (`docs.dyniq.ai`) uses GitHub Actions for automated deployment:

```mermaid
graph LR
    Push[Push to main] --> Build[npm run build]
    Build --> SSH[SSH to Contabo]
    SSH --> Pull[git pull]
    Pull --> Docker[docker compose build docs]
    Docker --> Up[docker compose up -d docs]
    Up --> Health[Health check]
```

**Workflow file**: `.github/workflows/deploy-docs.yml`

Required GitHub secrets:
- `CONTABO_HOST` - Server IP
- `CONTABO_USER` - SSH username
- `CONTABO_SSH_KEY` - SSH private key

## DNS Refresh

After restarting a dependency service, restart its consumers to refresh DNS:

```bash
# Example: After restarting LiveKit, restart its consumers
ssh contabo "cd /opt/dyniq-voice/docker && docker compose restart ruben sip"
```

Long-running containers cache DNS records for internal Docker hostnames. When a dependency gets a new IP after restart, consumers may still point to the old IP.

## Caddy Configuration

Caddy is the reverse proxy for all services. After adding a new service:

1. Add route to Caddyfile
2. Connect Caddy to the service's network
3. Restart Caddy

```bash
# Verify route exists
ssh contabo "grep 'service.dyniq.ai' /opt/dyniq-voice/docker/Caddyfile"

# Connect Caddy to network (if needed)
ssh contabo "docker network connect [network] docker-caddy-1"

# Restart Caddy
ssh contabo "cd /opt/dyniq-voice/docker && docker compose restart caddy"

# Verify
curl -sf https://service.dyniq.ai/health
```

## Environment Variables

Environment variables are stored in `/opt/dyniq-voice/.env` (voice stack) and `/opt/n8n/.env` (n8n stack).

:::warning Separate .env Files
n8n and dyniq-voice use **different** `.env` files. Variables from one stack are not available in the other.
:::

| Stack | Env File | Key Variables |
|-------|----------|---------------|
| dyniq-voice | `/opt/dyniq-voice/.env` | `AGENTS_API_KEY`, `SUPABASE_URL`, `OPENROUTER_API_KEY` |
| n8n | `/opt/n8n/.env` | `N8N_API_KEY`, `TELEGRAM_BOT_TOKEN` |
