---
title: "Test Ruben Locally"
sidebar_label: "Test Ruben Locally"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [commands, auto-synced]
---

# Test Ruben Locally

Build and test Ruben voice agent in local Docker before production deployment.

## When to Use

- Before deploying any voice agent changes
- After modifying session.py, agent.py, or prompts
- After updating dependencies in pyproject.toml

## Steps

### 1. Ensure Environment

```bash
cd /Users/walker/Desktop/Code/dyniq-ai-agents
cp .env.production .env  # Use production secrets locally
```

### 2. Build and Start

```bash
cd docker && docker compose up --build
```

### 3. Watch for Errors

Check logs for:
- Import errors (missing dependencies)
- API parameter errors (version drift)
- Connection errors (Redis, LiveKit)

```bash
docker compose logs -f ruben
```

### 4. Verify Health

```bash
curl http://localhost:8080/health
```

Expected: `{"status": "ok", "agent": "ruben-voice"}`

### 5. Test Call (Optional)

```bash
curl -X POST http://localhost:8080/api/dispatch \
  -H "Authorization: Bearer ruben_dispatch_secret_2026" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+32XXXXXXXXX", "lead_data": {"firstName": "Test"}}'
```

## Success Criteria

- [ ] No import errors in logs
- [ ] Health endpoint returns OK
- [ ] No API parameter errors
- [ ] Agent connects to LiveKit

## If Tests Pass

Proceed with production deployment:
```bash
./deploy.sh
```

## Common Issues

| Error | Fix |
|-------|-----|
| `ImportError: cannot import` | Add dependency to requirements.txt, rebuild |
| `TypeError: unexpected keyword` | Check API gotchas in CLAUDE.md |
| `Connection refused redis` | Ensure Redis container is running |
| `TURN domain required` | Set `turn: enabled: false` in livekit.yaml |
