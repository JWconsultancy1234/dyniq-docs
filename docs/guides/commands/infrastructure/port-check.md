---
description: Check for Docker port conflicts across dyniq repos
---

# Infrastructure: Port Check

Scan all dyniq repositories for Docker port conflicts and generate a port assignment report.

## Scan Locations

Check docker-compose files in:
- `dyniq-app/` (if any)
- `dyniq-ai-agents/docker/`
- `dyniq-crm/docker/`
- `dyniq-n8n/docker/`

## Analysis Steps

### 1. Find All Port Mappings

```bash
# Run from parent directory containing all dyniq repos
grep -rh "ports:" dyniq-*/docker/*.yml -A 5 2>/dev/null | grep -E "^\s+-\s" || echo "No ports found"
```

### 2. Extract Port Numbers

For each docker-compose file found:
- Parse the `ports:` sections
- Extract host:container port mappings
- Note which service uses each port

### 3. Check for Conflicts

A conflict exists when:
- Two services map to the same host port
- Exception: 80/443 should ONLY be in dyniq-ai-agents (unified Caddy)

### 4. Verify Caddy Configuration

Check `dyniq-ai-agents/docker/Caddyfile` has routes for:
- voice.dyniq.ai
- ruben-api.dyniq.ai
- crm.dyniq.ai
- automation.dyniq.ai

## Output Format

### Port Assignment Table

```
| Port | Service | Repo | Status |
|------|---------|------|--------|
| 80 | Caddy | dyniq-ai-agents | OK |
| 443 | Caddy | dyniq-ai-agents | OK |
| 5678 | n8n | dyniq-n8n | OK |
| 7880 | LiveKit | dyniq-ai-agents | OK |
| 8080 | Ruben API | dyniq-ai-agents | OK |
| 8081 | NocoDB | dyniq-crm | OK |
```

### Conflict Report

If conflicts found:
```
CONFLICT: Port 8080 used by:
  - dyniq-ai-agents/docker/docker-compose.yml (ruben-api)
  - dyniq-crm/docker/docker-compose.yml (nocodb)

RESOLUTION: Change NocoDB to port 8081
```

### Missing Routes

If Caddy missing routes:
```
WARNING: crm.dyniq.ai not in Caddyfile
ACTION: Add route to dyniq-ai-agents/docker/Caddyfile
```

## Expected Architecture

Per CLAUDE.md, the correct architecture is:

| Domain | Service | Port | Repo |
|--------|---------|------|------|
| voice.dyniq.ai | LiveKit | 7880 | dyniq-ai-agents |
| ruben-api.dyniq.ai | Ruben API | 8080 | dyniq-ai-agents |
| crm.dyniq.ai | NocoDB | 8081 | dyniq-crm |
| automation.dyniq.ai | n8n | 5678 | dyniq-n8n |

Only `dyniq-ai-agents` should have Caddy (ports 80/443).

## Actions

If issues found, suggest fixes:
1. Port conflicts → Change one service to different port
2. Missing Caddy routes → Add to Caddyfile
3. Extra Caddy instances → Remove from other repos
