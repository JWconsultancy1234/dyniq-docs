---
sidebar_position: 4
title: Health Checks
description: Service health monitoring and verification procedures
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Health Checks

Monitoring procedures for all DYNIQ services.

## Quick Health Check (All Services)

```bash
# Run all health checks at once
echo "=== Agents API ===" && curl -s https://agents-api.dyniq.ai/health
echo "=== Ruben API ===" && curl -s https://ruben-api.dyniq.ai/health
echo "=== Langfuse ===" && curl -s https://langfuse.dyniq.ai/api/public/health
echo "=== n8n ===" && curl -s https://automation.dyniq.ai/healthz
echo "=== CRM ===" && curl -s https://crm.dyniq.ai/api/v1/health
echo "=== Metabase ===" && curl -s https://analytics.dyniq.ai/api/health
```

## Service Health Endpoints

| Service | URL | Expected Response |
|---------|-----|-------------------|
| Agents API | `agents-api.dyniq.ai/health` | `{"status":"ok"}` |
| Ruben Voice API | `ruben-api.dyniq.ai/health` | `{"status":"ok"}` |
| Langfuse | `langfuse.dyniq.ai/api/public/health` | `{"status":"OK"}` |
| n8n | `automation.dyniq.ai/healthz` | `{"status":"ok"}` |
| NocoDB CRM | `crm.dyniq.ai/api/v1/health` | Health object |
| Metabase | `analytics.dyniq.ai/api/health` | `{"status":"ok"}` |

## Container Health Check

```bash
# Full container status
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# Check for unhealthy containers
ssh contabo "docker ps --filter health=unhealthy --format '{{.Names}}'"

# Check for exited containers
ssh contabo "docker ps -a --filter status=exited --format '{{.Names}}\t{{.Status}}'"
```

## Service-Specific Checks

### Agents API

```bash
# Health
curl -s https://agents-api.dyniq.ai/health

# Container logs (last 20 lines)
ssh contabo "docker logs docker-agents-api-1 --tail=20"

# Memory usage
ssh contabo "docker stats docker-agents-api-1 --no-stream"
```

### Voice Stack (LiveKit + Ruben)

```bash
# LiveKit running
ssh contabo "docker ps | grep livekit"

# SIP service running
ssh contabo "docker ps | grep sip"

# Ruben agent registered
ssh contabo "docker logs docker-ruben-1 --tail=10 | grep 'registered'"

# Voice API health
curl -s https://ruben-api.dyniq.ai/health
```

### Langfuse

```bash
# API health
curl -s https://langfuse.dyniq.ai/api/public/health

# Worker status
ssh contabo "docker logs langfuse-langfuse-worker-1 --tail=10"

# MinIO bucket exists
ssh contabo 'docker exec langfuse-langfuse-minio-1 sh -c "mc alias set local http://localhost:9000 minio \$MINIO_ROOT_PASSWORD >/dev/null && mc ls local/"'
```

### n8n

```bash
# Health check
curl -s https://automation.dyniq.ai/healthz

# Active workflows
N8N_KEY="your-key"
curl -s "https://automation.dyniq.ai/api/v1/workflows?active=true" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "import json,sys; data=json.load(sys.stdin); print(f'{len(data.get(\"data\",[]))} active workflows')"
```

## Server-Level Checks

```bash
# Disk usage
ssh contabo "df -h / | tail -1"

# Memory usage
ssh contabo "free -h | head -2"

# CPU load
ssh contabo "uptime"

# Docker disk usage
ssh contabo "docker system df"
```

## Automated Monitoring

| Check | Frequency | Alert Method |
|-------|-----------|--------------|
| Service health | Every 5 min | Cloudflare monitoring |
| Container status | On demand | Manual SSH |
| Disk usage | Daily | n8n workflow |
| SSL certificates | Caddy auto-renewal | Caddy logs |

## What to Do When a Check Fails

| Failed Check | First Action | Escalation |
|-------------|-------------|------------|
| Health endpoint 5xx | Check container logs | See [Incident Response](./incident-response) |
| Container exited | `docker compose up -d service` | Check logs for crash reason |
| High disk usage | `docker system prune` | Add storage or clean old images |
| SSL errors | Restart Caddy | Check Caddyfile + Cloudflare |
