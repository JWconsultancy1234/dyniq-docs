---
title: "SOP: Voiceflow Debugging"
sidebar_label: "SOP: Voiceflow Debugging"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# SOP: Voiceflow Debugging

**Created:** 2026-01-17

---

## Pre-Debug Checklist (Do This FIRST)

Before attempting any programmatic fix, verify:

### 1. Check API Write Capabilities (5 min max)

```bash
# Test if you can update an agent via API
curl -X PATCH "https://api.voiceflow.com/v2/versions/${VOICEFLOW_VERSION_ID}/agents/${AGENT_ID}" \
  -H "Authorization: ${VOICEFLOW_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'
```

**Expected Result:** 404 or 405 = API is READ-ONLY → Generate UI instructions immediately

### 2. Identify What Requires UI vs API

| Operation | API Support | Notes |
|-----------|-------------|-------|
| Export project | YES | GET /projects/{id}/versions/{id}/export |
| Import project | PARTIAL | Only ADDS new resources, never updates |
| Read agents | YES | GET /versions/{id}/agents |
| Update agents | NO | 404 on PATCH/PUT |
| Read functions | YES | GET /versions/{id}/functions |
| Update functions | NO | 404 on PATCH/PUT |
| Set runtime variables | YES | PATCH to Runtime API |

### 3. Time-Box Investigation

- **30 minutes max** before generating UI instructions
- If still blocked after 30 min → document and escalate

---

## Common Issues & Solutions

### Issue: Agent Sends Literal {variable} Instead of Values

**Root Causes:**
1. Agent instructions reference non-existent function
2. Function code has syntax errors
3. agentFunctionTools.inputVariables is empty
4. Agent doesn't trigger exit path

**Diagnosis:**

```bash
# Export and analyze project
curl -s "https://api.voiceflow.com/v2/projects/${VOICEFLOW_PROJECT_ID}/versions/${VOICEFLOW_VERSION_ID}/export" \
  -H "Authorization: ${VOICEFLOW_API_KEY}" > voiceflow_export.json

# Check agent instructions
cat voiceflow_export.json | jq '.agents[] | {id, name, prompt}'

# Check function code
cat voiceflow_export.json | jq '.functions[] | {id, name, code}'

# Check agentFunctionTools mappings
cat voiceflow_export.json | jq '.agentFunctionTools'
```

**Fix via UI (required):**
1. Open https://creator.voiceflow.com
2. Open the agent node → update instructions
3. Open Functions → fix any syntax errors
4. In agent settings → Tools → configure inputVariables mapping

### Issue: Agent Doesn't Call Function

**Root Cause:** `agentFunctionTools[].inputVariables` is empty - agent can't pass data to function.

**Fix via UI:**
1. Open agent node in Voiceflow
2. Go to Tools section
3. Select the function
4. Configure input variable mappings

### Issue: Agent Doesn't Trigger Exit Path

**Root Cause:** Agent instructions don't specify when to exit.

**Fix via UI:**
Add explicit exit instruction to agent prompt specifying the exit path name.

---

## Voiceflow Runtime API (What DOES Work)

The Runtime API at `general-runtime.voiceflow.com` CAN write variables:

```bash
curl -X PATCH "https://general-runtime.voiceflow.com/state/user/${SESSION_ID}/variables" \
  -H "Authorization: ${VOICEFLOW_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"variable_name": "value"}'
```

**Use Case:** Set variables programmatically during a conversation. Does not fix agent-to-function issues.

---

## Environment Variables

```bash
# Required (store in .env.local or secrets manager)
VOICEFLOW_PROJECT_ID=
VOICEFLOW_VERSION_ID=
VOICEFLOW_API_KEY=

# Get IDs from:
# - Project ID: URL when viewing project in Voiceflow UI
# - Version ID: Export API response
# - Agent/Function IDs: Export JSON
```

---

## Prevention

1. **Check API capabilities FIRST** before attempting programmatic fixes
2. **Time-box to 30 minutes** - if API doesn't work, generate UI instructions
3. **Test direct webhook** to isolate issues (Voiceflow vs downstream)

---

## Related SOPs

- `n8n-workflow-versioning-fix.md` - n8n version sync issues

---

*Key lesson: Check write capabilities FIRST.*
