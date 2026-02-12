---
description: "Quick smoke test for deployed services before major operations"
argument-hint: "[service] (optional - agents-api, ruben-api, n8n, langfuse)"
---

# Smoke Test

Quick health check for deployed services. Run BEFORE `/full-planning-cycle`, `/board-meeting`, or any major operation.

## Why This Exists

On 2026-01-31, a P0 board meeting bug burned tokens because:
1. Model IDs were wrong (OpenRouter 400 errors)
2. JSON parsing failed (Claude doesn't support json_mode)
3. No pre-flight check caught these before full execution

**Pattern detected 3+ times** → automation triggered.

---

## Quick Check (Default)

```bash
# All critical services
curl -s https://agents-api.dyniq.ai/health && echo "✅ agents-api"
curl -s https://ruben-api.dyniq.ai/health && echo "✅ ruben-api"
curl -s https://automation.dyniq.ai/healthz && echo "✅ n8n"
curl -s https://langfuse.dyniq.ai/api/public/health && echo "✅ langfuse"
```

---

## Board Meeting Smoke Test

**Critical for `/full-planning-cycle` and `/board-meeting`:**

```bash
# 1. Health check
curl -s https://agents-api.dyniq.ai/health | jq .

# 2. Quick board meeting test (single agent, simple task)
curl -s -X POST "https://agents-api.dyniq.ai/api/board-meeting/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $AGENTS_API_KEY" \
  -d '{"topic": "smoke test", "level": 0, "dry_run": true}' | jq '.status'
```

**Expected:** `{"status": "ok"}` or `{"status": "processing", "thread_id": "..."}`

**If this fails:** Don't run full planning cycle. Debug first with `/n8n-debug` or check docker logs.

---

## Service-Specific Tests

### agents-api (Board Meeting, Content, HITL)

```bash
# Health
curl -s https://agents-api.dyniq.ai/health

# Docker container status
ssh contabo "docker ps --filter name=agents-api --format '{{.Status}}'"

# Recent logs (errors only)
ssh contabo "docker logs docker-agents-api-1 --tail 50 2>&1 | grep -i error"
```

### ruben-api (Voice Agent)

```bash
# Health
curl -s https://ruben-api.dyniq.ai/health

# Container status
ssh contabo "docker ps --filter name=ruben-api --format '{{.Status}}'"
```

### n8n (Automation)

```bash
# Health
curl -s https://automation.dyniq.ai/healthz

# Workflow count (sanity check)
N8N_KEY=$(grep -E "^N8N_API_KEY=" ~/Desktop/Code/dyniq-app/.env | cut -d'=' -f2)
curl -s "https://automation.dyniq.ai/api/v1/workflows" -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data | length'
```

### Langfuse (Observability)

```bash
# Health
curl -s https://langfuse.dyniq.ai/api/public/health

# Recent traces (requires LANGFUSE credentials)
# Check in UI: langfuse.dyniq.ai
```

---

## Failure Matrix

| Service | Symptom | Quick Fix |
|---------|---------|-----------|
| agents-api 502 | Container down | `ssh contabo "cd /opt/dyniq-voice/docker && docker compose up -d agents-api"` |
| agents-api 401 | Missing API key | `export AGENTS_API_KEY=...` or check container env |
| agents-api 400 | Bad request | Check request format, model IDs |
| ruben-api 502 | Container down | `ssh contabo "cd /opt/dyniq-voice/docker && docker compose up -d ruben-api"` |
| n8n 502 | Container down | `ssh contabo "cd /opt/n8n && docker compose up -d"` |
| langfuse 525 | SSL error | Check Caddy routes, reconnect networks |

---

## Integration

This command is called automatically by:
- `/full-planning-cycle` (Phase 0)
- `/board-meeting` (pre-flight)
- `/begin-timeblock` (morning health check)

---

## Output Format

```markdown
## Smoke Test Results (YYYY-MM-DD HH:MM)

| Service | Status | Latency |
|---------|--------|---------|
| agents-api | ✅ | 120ms |
| ruben-api | ✅ | 85ms |
| n8n | ✅ | 200ms |
| langfuse | ✅ | 150ms |

**Ready for:** /full-planning-cycle, /board-meeting
```

---

*Created: 2026-01-31 | Trigger: P0 board meeting bug wasted tokens*
*"Smoke test before you burn tokens."*
