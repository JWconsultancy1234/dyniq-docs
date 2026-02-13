---
title: "Third-Party Integration Patterns"
sidebar_label: "Third-Party Integration Patterns"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Third-Party Integration Patterns

## API Capability Check (Do This FIRST)

Before attempting programmatic fixes on any third-party service:

### Step 1: Test Write Capability (5 min max)

```bash
curl -X PATCH "${API_URL}/resource/${ID}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Step 2: Interpret Response

| Response | Meaning | Action |
|----------|---------|--------|
| 200/201 | API supports writes | Proceed with fix |
| 404 | Endpoint doesn't exist | Generate UI instructions |
| 405 | Method not allowed | Generate UI instructions |
| 403 | Permission denied | Check auth, may need UI |

### Step 3: If Read-Only

1. Stop attempting API fixes immediately
2. Generate `/tmp/[service]_ui_fix.md` with step-by-step UI instructions
3. Share with user and move on

---

## Known API Limitations

| Service | Read | Write | Notes |
|---------|------|-------|-------|
| Voiceflow Designer | YES | NO | Agents/functions require UI |
| Voiceflow Runtime | YES | YES | Can PATCH `/state/user/{id}/variables` |
| n8n | YES | YES | But watch for version sync issues |

---

## Time-Boxing Protocol

| Phase | Time Limit | Action if Exceeded |
|-------|------------|-------------------|
| API capability check | 5 min | Conclude read-only, pivot |
| Programmatic fix attempt | 25 min | Generate UI instructions |
| Total debugging | 30 min | Escalate or document and move on |

---

## Progress Checkpoints

Every 20 minutes during debugging:

```
CHECKPOINT:
- Done: [what's been accomplished]
- Blocked: [current blocker]
- Need: [what's needed from user/external]
- ETA: [when expected to resolve or pivot]
```

---

## SOP Sanitization Checklist

Before committing any SOP or documentation:

- [ ] No API keys or tokens (use `${API_KEY}`)
- [ ] No project/resource IDs (use `${PROJECT_ID}`)
- [ ] No hardcoded URLs (use `${BASE_URL}` or "your instance URL")
- [ ] No server names/aliases (use `${SERVER}`)
- [ ] No user-specific paths (use generic paths)

---

## Voiceflow Specific

### Designer API (api.voiceflow.com)

**Read operations:**
- `GET /projects/{id}/versions/{id}/export` - Export project
- `GET /versions/{id}/agents` - List agents
- `GET /versions/{id}/functions` - List functions

**Write operations:** NONE for agents/functions

### Runtime API (general-runtime.voiceflow.com)

**Write operations:**
- `PATCH /state/user/{session}/variables` - Set conversation variables

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Literal `{name}` in webhook | Agent not calling function | Configure inputVariables in UI |
| Function not triggered | Empty `agentFunctionTools.inputVariables` | Map variables in UI |
| Agent loops forever | No exit instruction | Add explicit exit in agent prompt |

---

## n8n Specific

### Version Sync Issues

n8n uses a versioning system:
- `workflow_entity.nodes` = draft version
- `workflow_history.nodes` = executed version (via `activeVersionId`)

**Symptom:** SQL updates don't take effect
**Fix:** Update `workflow_history` OR use n8n UI

See: `.agents/sops/n8n-workflow-versioning-fix.md`

---

*Created from 2.5-hour debugging session. Follow this to debug in 30 min instead.*
