---
title: "Deploy Ruben to Production"
sidebar_label: "Deploy Ruben to Production"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# Deploy Ruben to Production

Full deployment workflow with validation and rollback.

## Pre-Flight Checklist

- [ ] Local test passed (`/test-ruben-local`)
- [ ] `.env.production` updated if config changed
- [ ] Git changes committed and pushed to origin
- [ ] Server state is clean (see step below)

### Server State Check (MANDATORY - 7x hotfix pattern)

**Before ANY deploy, verify server matches remote:**

```bash
# 0. Verify server branch (NEW - 7x pattern: branch drift)
ssh contabo "cd /opt/dyniq-voice && git branch --show-current"
# Expected: develop (if main → switch: git checkout develop && git pull origin develop)

# 1. Check for uncommitted server changes
ssh contabo "cd /opt/dyniq-voice && git status --short"

# 2. Verify server matches origin
ssh contabo "cd /opt/dyniq-voice && git log --oneline -1 && echo '---' && git log --oneline origin/develop -1"
```

| Server Status | Action |
|---------------|--------|
| Wrong branch (e.g. main) | `ssh contabo "cd /opt/dyniq-voice && git checkout develop && git pull origin develop"` |
| Clean, matches origin | Proceed with deploy |
| Dirty (modified files) | `ssh contabo "cd /opt/dyniq-voice && git stash && git pull origin develop"` |
| Divergent branches | `ssh contabo "cd /opt/dyniq-voice && git stash && git reset --hard origin/develop"` |

**NEVER fix code directly on server.** Always: local edit → commit → push → pull on server → rebuild.

**Incident history (7x):** STORY-06, STORY-09, langfuse-io, self-correcting, voice-wave1 (2x), voice-wave2 (branch drift to main). Each required manual cleanup.

## Deploy

```bash
cd /Users/walker/Desktop/Code/dyniq-ai-agents

# 1. Ensure changes are pushed
git push origin develop

# 2. Pull on server + rebuild
ssh contabo "cd /opt/dyniq-voice && git pull origin develop && cd docker && docker compose build ruben ruben-api && docker compose up -d ruben ruben-api --force-recreate"
```

**Note:** `ruben` and `ruben-api` are baked images. `restart` alone does NOT pick up code changes — must `build` + `force-recreate`.

## Post-Deploy Verification

### 1. Check Health

```bash
curl https://ruben-api.dyniq.ai/health
```

Expected: `{"status": "ok", "agent": "ruben-voice"}`

### 2. Check Logs

```bash
ssh root@83.171.248.35 "docker logs docker-ruben-1 --tail 50"
```

Look for:
- `Ruben session created` - Agent initialized
- `connected to redis` - LiveKit connected
- No error stack traces

### 3. Test Call (Recommended)

```bash
curl -X POST https://ruben-api.dyniq.ai/api/dispatch \
  -H "Authorization: Bearer ruben_dispatch_secret_2026" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+32460953396", "lead_data": {"firstName": "Test"}}'
```

## Rollback

If deployment fails or causes issues:

### Quick Rollback (Restart Previous)

```bash
ssh root@83.171.248.35 "cd /opt/dyniq-voice/docker && docker compose down && docker compose up -d"
```

### Full Rollback (Previous Code)

```bash
ssh root@83.171.248.35 "cd /opt/dyniq-voice && git checkout HEAD~1 . && cd docker && docker compose up -d --build"
```

## Troubleshooting

| Symptom | Check | Fix |
|---------|-------|-----|
| Health returns 502 | Container crashed | Check logs, fix error, redeploy |
| No audio on calls | TTS config | Verify ElevenLabs API key in .env |
| Calls not connecting | SIP trunk | Check SIP_TRUNK_ID in .env |
| SSH permission denied | SSH keys | Run `ssh-copy-id root@83.171.248.35` |

## Server Details

| Property | Value |
|----------|-------|
| IP | 83.171.248.35 |
| Path | /opt/dyniq-voice |
| User | root |
| LiveKit URL | https://voice.dyniq.ai |
| API URL | https://ruben-api.dyniq.ai |
