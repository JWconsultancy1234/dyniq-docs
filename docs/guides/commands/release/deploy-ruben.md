---
title: "Deploy Ruben to Production"
sidebar_label: "Deploy Ruben to Production"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [commands, auto-synced]
---

# Deploy Ruben to Production

Full deployment workflow with validation and rollback.

## Pre-Flight Checklist

- [ ] Local test passed (`/test-ruben-local`)
- [ ] `.env.production` updated if config changed
- [ ] Git changes committed (optional but recommended)

## Deploy

```bash
cd /Users/walker/Desktop/Code/dyniq-ai-agents
./deploy.sh
```

This will:
1. Copy `.env.production` to `.env`
2. Rsync files to Contabo (`83.171.248.35:/opt/dyniq-voice/`)
3. Rebuild and restart Docker containers
4. Show last 20 lines of Ruben logs

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
