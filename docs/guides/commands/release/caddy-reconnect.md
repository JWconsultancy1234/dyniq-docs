---
title: "Caddy Reconnect"
sidebar_label: "Caddy Reconnect"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [commands, auto-synced]
---

# Caddy Reconnect

Quick fix for 502 errors after redeploying the voice stack.

## When to Use

- Getting 502 Bad Gateway on `automation.dyniq.ai` or `crm.dyniq.ai`
- Just ran `docker compose up -d` or `docker compose down && up`
- Caddy is running but can't reach n8n or NocoDB

## Root Cause

Caddy needs to be connected to multiple Docker networks:
- `docker_voice-net` - for LiveKit, Ruben
- `n8n_default` - for n8n
- `nocodb_default` - for NocoDB

When you redeploy the voice stack, Caddy may lose connections to external networks.

## Fix

```bash
ssh contabo "docker network connect n8n_default docker-caddy-1 2>/dev/null; \
             docker network connect nocodb_default docker-caddy-1 2>/dev/null; \
             docker restart docker-caddy-1"
```

## Verify

```bash
# Check networks
ssh contabo "docker inspect docker-caddy-1 --format '{{json .NetworkSettings.Networks}}' | jq 'keys'"

# Expected: ["docker_voice-net", "n8n_default", "nocodb_default", ...]

# Check endpoints
curl -s https://automation.dyniq.ai/healthz && echo " ✅ n8n"
curl -s https://crm.dyniq.ai/api/v1/health && echo " ✅ NocoDB"
```

## Prevention

The `docker-compose.yml` in dyniq-ai-agents now includes external network declarations:

```yaml
caddy:
  networks:
    - voice-net
    - n8n_default
    - nocodb_default

networks:
  n8n_default:
    external: true
  nocodb_default:
    external: true
```

This should auto-connect on redeploy. Use this command only if issues persist.

## Reference

Full infrastructure docs: @infrastructure-architecture.md
