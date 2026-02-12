---
title: "DYNIQ Infrastructure Architecture"
sidebar_label: "DYNIQ Infrastructure Architecture"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# DYNIQ Infrastructure Architecture

Production infrastructure for all DYNIQ services on Contabo VPS.

## Quick Reference

| Domain | Service | Port | Network |
|--------|---------|------|---------|
| voice.dyniq.ai | LiveKit | 7880 | voice-net |
| ruben-api.dyniq.ai | Ruben Voice API | 8080 | voice-net |
| agents-api.dyniq.ai | FastAPI Agents | 8000 | voice-net |
| automation.dyniq.ai | n8n | 5678 | n8n_default |
| crm.dyniq.ai | NocoDB | 8080 | nocodb_default |
| langfuse.dyniq.ai | Langfuse | 3100 | langfuse_default |
| analytics.dyniq.ai | Metabase | 3001 | metabase_metabase-net |

### API Endpoint Clarification (CRITICAL)

| API | Domain | Port | Container | Use For |
|-----|--------|------|-----------|---------|
| Ruben Voice | ruben-api.dyniq.ai | 8080 | docker-ruben-api-1 | `/api/dispatch` for calls |
| Agents API | agents-api.dyniq.ai | 8000 | docker-agents-api-1 | `/api/board-meeting/*`, `/api/content/*`, `/api/hitl/*` |

**IMPORTANT:** These are SEPARATE containers. Starting one does NOT start the other.

```bash
# Start both APIs
docker compose up -d ruben-api agents-api

# Verify both running
docker ps | grep -E 'ruben-api|agents-api'
```

**Incident (2026-01-29):** S5 HITL took 15+ debugging iterations using wrong API.
**Incident (2026-01-30):** Board Meeting status endpoint 404 - agents-api container wasn't running.

### Database Ownership (CRITICAL - 2x Incidents 2026-02-02)

**Two separate Supabase projects - NEVER confuse them:**

| Database | Purpose | Repo | Env Variable |
|----------|---------|------|--------------|
| **Walker-OS** | Personal freedom system, timeblocks, scorecards | walker-os | `NEXT_PUBLIC_SUPABASE_URL` |
| **DYNIQ** | Leads, content, board meetings, agent training | dyniq-ai-agents | `DYNIQ_SUPABASE_URL` |

**Note:** Project IDs are in `.env` files only - never commit to docs.

**Data Routing Rules:**

| Data Type | Target Database | Why |
|-----------|-----------------|-----|
| Board meetings | **DYNIQ** | Agent training data, business decisions |
| Leads, quiz responses | **DYNIQ** | Sales/marketing data |
| Timeblocks, scorecards | **Walker-OS** | Personal productivity data |
| Net worth, cashflow | **Walker-OS** | Personal financial data |

**Pre-Deploy Database Checklist:**
```bash
# 1. Identify target database from data type
# 2. Verify table exists in target (use env var, not hardcoded ID)
curl -s "$SUPABASE_URL/rest/v1/[TABLE]?limit=1" -H "apikey: $SUPABASE_KEY"

# 3. Verify env vars match target project
ssh contabo "grep SUPABASE /opt/dyniq-voice/.env | cut -d'=' -f1"  # Show names only
```

**Incident (2026-02-02):** P1 initially persisted board meetings to Contabo postgres instead of DYNIQ Supabase. Root cause: plan didn't specify target database.

### Cloudflare Timeout Limit

**Cloudflare enforces 100s timeout** on all proxied requests. Board meetings now handle this automatically:

| Level | Mode | Behavior |
|-------|------|----------|
| 0-2 | Sync | Returns full result (completes within 100s) |
| 3+ | Async | Returns immediately with `status="processing"` |

**SAC-024 Fix (2026-02-02):** Level 3+ meetings now run asynchronously to avoid Cloudflare timeout.

**For Level 3+ board meetings:** POST `/analyze` returns immediately with `thread_id` + `status: "processing"`. Poll `/status/{id}` until `awaiting_decision`. CLI: `/resume-board-meeting bm-xxxxx`

**R&D Research Latency:** Kimi web search adds 30s+ latency. Use `skip_research: true` for faster results.

**E2E Test Timing Baseline (verified 2026-02-02):**

| Level | Agents | Measured Time | Timeout Risk |
|-------|--------|---------------|--------------|
| 0 | 6-8 | 25.71s | Low |
| 1 | 6-8 | ~30s | Low |
| 2 | 20-26 | 58.93s | Low |
| 3 | 40-50 | 114.55s | Medium (>100s) |
| 4 | 40-65 | ~135s | HIGH (Cloudflare limit) |

**Note:** Level 3 now exceeds Cloudflare 100s timeout. Use `skip_research: true` for faster execution.

**Incident (2026-01-30):** 43-agent board meeting took 134s, causing Cloudflare 524 timeout. Worked around with status endpoint polling.

**Style Transfer Analysis Timeouts (api/routes/style_transfer.py):**

| Level | API Timeout | Measured E2E | Notes |
|-------|------------|-------------|-------|
| 0-2 | 240s | 159s (verified) | 8 Kimi K2.5 agents, ~173s baseline |
| 3 | 300s | ~200s est. | 48 agents |
| 4 | 360s | ~250s est. | Full swarm |
| 5 | 420s | ~300s est. | Maximum capacity |

**Rule:** Style transfer uses board meeting internally. Timeout must exceed `swarm_agents * agent_latency + aggregation_overhead`.

**Incident (2026-02-05):** Style transfer hung at 120s timeout. Kimi K2.5 8-agent swarm takes ~173s. Fixed to 240s.

**Server:** 83.171.248.35 (Contabo VPS) | **SSH:** `ssh contabo`

### Directory Naming Note

The `dyniq-ai-agents` repo lives in `/opt/dyniq-voice/` on the server. This is historical - the directory was created for "Sophie voice AI" but now contains all DYNIQ agents (board meeting, content API, HITL, etc.). Renaming would require 50+ path updates with medium breakage risk. The naming discrepancy is cosmetic; all services work correctly.

---

## Architecture Overview

```
Internet → Cloudflare (SSL, 100s timeout) → Caddy (:80/:443) → Containers
Phone → Twilio SIP → LiveKit → Ruben Voice Agent
GitHub Actions → GHCR → agents-api (baked images)
```

**Stacks:** Voice (voice-net), n8n (n8n_default), NocoDB (nocodb_default), Langfuse (langfuse_default), Metabase (metabase_metabase-net)
**External:** Supabase (2 projects), ElevenLabs TTS, Deepgram STT, OpenRouter LLM
**Critical:** Caddy MUST be connected to ALL networks to proxy services.

---

## Docker Compose Stacks

| Stack | Location | Network | Key Services |
|-------|----------|---------|--------------|
| dyniq-ai-agents | `/opt/dyniq-voice/docker/` | voice-net | livekit, sip, ruben, ruben-api, redis, postgres, caddy |
| dyniq-n8n | `/opt/n8n/` | n8n_default | n8n, postgres |

### Deactivated n8n Workflows

| Workflow | ID | Deactivated | Replaced By |
|----------|-----|-------------|-------------|
| 9.3 - Daily Intelligence Briefing | `KKLwfxPbO0dEo9b2` | 2026-02-06 | Claude Code inline WebSearch in `/begin-timeblock` Phase 3c |
| dyniq-crm | `/opt/nocodb/` | nocodb_default | nocodb, postgres |
| langfuse | `/opt/langfuse/` | langfuse_default | postgres, clickhouse, redis, minio, worker, web |

---

## Caddy Configuration

**File:** `/opt/dyniq-voice/docker/Caddyfile`

| Domain | Upstream | Notes |
|--------|----------|-------|
| voice.dyniq.ai | livekit:7880 | WebSocket support required |
| ruben-api.dyniq.ai | ruben-api:8080 | Health check: `/health` |
| automation.dyniq.ai | n8n-n8n-1:5678 | Cross-stack: use full container name |
| crm.dyniq.ai | nocodb-nocodb-1:8080 | Cross-stack: use full container name |
| langfuse.dyniq.ai | langfuse-web:3100 | After connecting network |

**Container naming:** Same-stack = service name (`ruben-api`), Cross-stack = full name (`n8n-n8n-1`)

---

## Deployment & Routing

**Full deployment guide:** @deploy-guide.md

**Quick reference:**

| Environment | Script | Time |
|-------------|--------|------|
| Development | `ssh contabo "/opt/dyniq-voice/docker/deploy-dev.sh"` | 2-5s |
| Production | `ssh contabo "/opt/dyniq-voice/docker/deploy-prod.sh"` | ~15s |

---

## Health Checks

```bash
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}'"
curl https://ruben-api.dyniq.ai/health
curl https://automation.dyniq.ai/healthz
curl https://crm.dyniq.ai/api/v1/health
curl https://langfuse.dyniq.ai/api/public/health
curl https://agents-api.dyniq.ai/health
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 502 Bad Gateway | Caddy lost network connections | `docker network connect [network] docker-caddy-1 && docker restart docker-caddy-1` |
| Ruben can't connect to LiveKit | Wrong LIVEKIT_URL | Use `ws://livekit:7880` (not localhost) |
| SIP calls not connecting | Wrong SIP_TRUNK_ID format | Use LiveKit format `ST_xxx`, not Twilio `TK_xxx` |
| Environment not updating | Used `restart` instead of `--force-recreate` | `docker compose up -d --force-recreate <service>` |
| Database "invalid port" error | Special chars in password | Use alphanumeric only: `tr -dc 'a-zA-Z0-9' < /dev/urandom \| head -c 32` |
| FastAPI 401 from n8n | Missing X-API-Key header | Add `X-API-Key: {{ $credentials.agentsApiKey }}` |
| Langfuse SSL 525 | langfuse.dyniq.ai not in Caddyfile | Add Langfuse route to Caddyfile, connect network, restart Caddy |
| agents-api blocking | Langfuse unreachable | Fix Langfuse SSL first - telemetry exports block main thread |
| LiveKit crash loop | Missing `env_file` for `.env` at parent dir | Add `env_file: - ../.env` to livekit/sip services in docker-compose.yml |
| Code changes not applied (baked image) | Service uses `build:` not volume mount | `docker compose build <svc> && up -d <svc> --force-recreate` |
| Stale DNS after dependency restart | Long-running container cached old IP | `docker compose restart <consumer>` after restarting dependency |
| Ruben silent on calls | LiveKit `.on()` callbacks were async | Use sync `def` (not `async def`) for `.on()` handlers |
| Deploy fails: divergent branches | Server has local hotfixes not in git | Pre-deploy state check (see below) |

---

## Pre-Deploy Server State Check (5x pattern - MANDATORY)

**Before ANY deploy, verify server is clean:**

```bash
# 1. Check for uncommitted changes
ssh contabo "cd /opt/dyniq-voice && git status --short"

# 2. Check if server matches remote
ssh contabo "cd /opt/dyniq-voice && git log --oneline -1 && echo '---' && git log --oneline origin/main -1"
```

**If dirty (modified files):**
```bash
# Stash local changes, then pull
ssh contabo "cd /opt/dyniq-voice && git stash && git pull origin main"
# OR if divergent:
ssh contabo "cd /opt/dyniq-voice && git stash && git reset --hard origin/main"
```

**If clean:** Proceed with normal deploy.

**Incident history (5x):** STORY-06, STORY-09, 2026-02-10 self-correcting deploy, + 2 more. Each required manual intervention. Pattern exceeds 3x automation threshold.

---

## Caddy Route Verification

After starting ANY new service:

```bash
ssh contabo "grep 'service.dyniq.ai' /opt/dyniq-voice/docker/Caddyfile"  # 1. In Caddyfile?
ssh contabo "docker network inspect [network] | grep caddy"              # 2. Caddy connected?
curl -s https://service.dyniq.ai/health                                  # 3. Public URL works?
```

**502/503?** Check: container name matches Caddyfile, Caddy on same network, correct internal port.

---

## Environment Variables (Voice Stack)

| Variable | Required | Purpose |
|----------|----------|---------|
| `AGENTS_API_KEY` | Prod | API auth for `/api/process-lead` |
| `LIVEKIT_URL` | Yes | `ws://livekit:7880` internal |
| `LIVEKIT_API_KEY` / `SECRET` | Yes | LiveKit credentials |
| `SIP_TRUNK_ID` | Yes | LiveKit format `ST_xxx` |
| `ELEVENLAB_API_KEY` | Yes | ElevenLabs TTS |
| `DEEPGRAM_API_KEY` | Yes | Deepgram STT |
| `OPENROUTER_API_KEY` | Yes | LLM API |
| `SUPABASE_URL` / `SERVICE_KEY` | Yes | Supabase connection |

### Pre-Deploy Env Checklist (agents-api)

**Pattern (2x):** Features fail silently due to missing env vars in prod.

```bash
ssh contabo "grep -E 'SUPABASE_URL|OPENROUTER_API_KEY|LANGFUSE' /opt/dyniq-voice/.env"  # Check
ssh contabo "cd /opt/dyniq-voice/docker && docker compose up -d --force-recreate agents-api"  # Recreate (restart doesn't reload env!)
ssh contabo "docker exec docker-agents-api-1 env | grep NEW_VAR"  # Verify
```

---

## Port Assignment

| Port | Service | Exposed To |
|------|---------|------------|
| 80/443 | Caddy HTTP/S | Public |
| 5060 | SIP | Public |
| 5678 | n8n | Caddy only |
| 7880-7882 | LiveKit WS/RTC/TURN | Public + Caddy |
| 8080 | Ruben API, NocoDB | Caddy only |
| 10000-10100 | SIP RTP | Public |
| 50000-50100 | WebRTC Media | Public |

---

## Data Flow: Lead to Call

```
Quiz → n8n (webhook) → Generate playbook → POST /api/dispatch
→ LiveKit (create SIP participant) → SIP → Twilio → Phone rings
→ Answer → Audio stream → Ruben agent handles call
```

---

## Langfuse OpenTelemetry Attributes

**Cost tracking requires exact attribute names.** Langfuse uses OpenTelemetry semantic conventions.

| Attribute | Langfuse Expects | Common Mistake |
|-----------|------------------|----------------|
| Cost | `gen_ai.usage.cost` | `gen_ai.usage.cost_usd` ❌ |
| Prompt tokens | `gen_ai.usage.prompt_tokens` | ✅ Correct |
| Completion tokens | `gen_ai.usage.completion_tokens` | ✅ Correct |
| Total tokens | `gen_ai.usage.total_tokens` | ✅ Correct |
| Model | `gen_ai.response.model` | ✅ Correct |

**Reference:** [GitHub Issue #11030](https://github.com/langfuse/langfuse/issues/11030)

**Incident (2026-01-30):** Langfuse showed $0 for all Kimi K2.5 calls. Root cause: Code used `gen_ai.usage.cost_usd` but Langfuse expects `gen_ai.usage.cost`. Fix applied to `openrouter_client.py` line 194.

**Verification:**
```bash
# Check trace has cost attribute
# In Langfuse UI: Tracing → Click trace → Metadata → Look for gen_ai.usage.cost
# Should show actual cost (e.g., "0.003646"), not "0" or missing
```

---

## Langfuse v3 Stack

**Location:** `/opt/langfuse/` | **Network:** `langfuse_default` | **Full guide:** `langfuse-gotchas.md`

### CRITICAL: Langfuse MUST be in Caddyfile

Without Caddy route: SSL 525, agents-api blocks on telemetry exports, health checks timeout.
**Verify:** `curl -s https://langfuse.dyniq.ai/api/public/health` → `{"status":"OK"}`
**Incident:** 2x recurrence (2026-01-23, 2026-01-30) because fix wasn't documented first time.

**OpenRouter model IDs, image generation models:** @openrouter-reference.md

---

## Metabase Analytics

**Location:** `/opt/metabase/` | **Network:** `metabase_metabase-net`
**URL:** https://analytics.dyniq.ai

| Dashboard | Database | Purpose |
|-----------|----------|---------|
| Business Performance | Walker-OS | Revenue, buckets, net worth |
| Agent Performance | Walker-OS | Board meetings, Langfuse metrics |
| Productivity Patterns | Walker-OS | Timeblocks, scorecards, energy |
| Command Usage | Walker-OS | Command executions |
| Lead Funnel | DYNIQ | Lead lifecycle |
| Content Performance | DYNIQ | Post engagement |
| Voice Call Analytics | Walker-OS (Langfuse sync) | Call metrics |

**Daily Sync:** Langfuse traces → `langfuse_traces_daily` table (2 AM cron)

**Sync Script:** `/opt/metabase/scripts/sync-langfuse.py`

**Tables Created:**
- `command_executions` - Tracks /command usage
- `langfuse_traces_daily` - Aggregated Langfuse traces

---

*Last updated: 2026-02-06 (trimmed 416→335, OpenRouter sections → openrouter-reference.md)*
*Reference this doc before ANY infrastructure changes.*
