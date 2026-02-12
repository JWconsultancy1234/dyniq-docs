---
description: "Setup agents-api environment and verify connectivity"
argument-hint: [--verify-only]
---

# Setup Agents API

**Command:** `/setup-agents-api`
**Owner:** CTO
**Purpose:** Initialize agents-api environment variables and verify connectivity

---

## Quick Reference

```bash
# Full setup (fetch key, verify container, test endpoint)
/setup-agents-api

# Verify only (skip key fetch)
/setup-agents-api --verify-only
```

---

## Why This Command Exists

**3x Pattern Detected (2026-01-30):**
1. S5 HITL review - Wrong API endpoint used
2. Board Meeting EPIC complete - Container not running
3. Full Planning Cycle - API key not in local env

Every agents-api session required manual key retrieval from server.

---

## What It Does

### Step 1: Check Local Environment

```bash
# Check if AGENTS_API_KEY is set
if [ -z "$AGENTS_API_KEY" ]; then
  echo "AGENTS_API_KEY not set locally"
fi
```

### Step 2: Fetch Key from Server (if needed)

```bash
# SSH to Contabo and get key
ssh contabo "grep AGENTS_API_KEY /opt/dyniq-voice/.env | cut -d'=' -f2"
# Returns: 2a1bf2dbd608ad41291e2723dbb9e723
```

### Step 3: Verify Container Running

```bash
ssh contabo "docker ps | grep agents-api"
# Should show: docker-agents-api-1 ... Up X hours
```

### Step 4: Test Health Endpoint

```bash
curl -s https://agents-api.dyniq.ai/health
# Should return: {"status":"healthy","version":"X.X.X"}
```

### Step 5: Output Setup Instructions

If key not in local env:
```bash
# Add to ~/.zshrc or project .envrc:
export AGENTS_API_KEY="2a1bf2dbd608ad41291e2723dbb9e723"

# Then reload:
source ~/.zshrc  # or direnv allow
```

---

## Expected Output

```
Agents API Setup Check
======================

1. Local Environment
   AGENTS_API_KEY: ✅ Set (2a1b...e723)

2. Server Container
   agents-api: ✅ Running (Up 2 hours)

3. Health Check
   https://agents-api.dyniq.ai/health: ✅ Healthy (v1.2.0)

✅ Agents API ready for use
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container not running | `ssh contabo "cd /opt/dyniq-voice/docker && docker compose up -d agents-api"` |
| Health check fails | Check Caddy routing: `docker network inspect voice-net \| grep caddy` |
| 502 Bad Gateway | Reconnect Caddy: `/caddy-reconnect` |

---

## Integration

**Run before:**
- `/board-meeting` (especially Level 4+)
- `/full-planning-cycle`
- Any agents-api dependent workflow

**Called by:**
- Can be auto-invoked at start of board meeting commands

---

## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/board-meeting/analyze` | POST | Start board meeting |
| `/api/board-meeting/status/{id}` | GET | Check meeting status |
| `/api/content/create` | POST | Generate content |
| `/api/hitl/pending` | GET | List pending approvals |

**Auth Header:** `X-API-Key: $AGENTS_API_KEY`

---

*Created: 2026-01-30 | Pattern: 3x manual key retrieval → automation*
