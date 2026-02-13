---
title: "SOP: n8n Workflow Debugging"
sidebar_label: "SOP: n8n Workflow Debugging"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# SOP: n8n Workflow Debugging

**Created:** 2026-01-19

---

## Pre-Debug Checklist (Do This FIRST)

Before diving into code, verify basics:

### 1. Check Workflow Status (2 min)

```bash
N8N_KEY=$(grep N8N_API_KEY /path/to/.env | cut -d'=' -f2 | tr -d '"')
WORKFLOW_ID="your-workflow-id"

# Is workflow active?
curl -s "https://automation.dyniq.ai/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Active: {d.get(\"active\")}')"
```

### 2. Check Recent Executions (2 min)

```bash
curl -s "https://automation.dyniq.ai/api/v1/executions?workflowId=$WORKFLOW_ID&limit=3" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -m json.tool
```

### 3. Time-Box Investigation

- **20 minutes max** per issue
- If still stuck → check reference doc `n8n-gotchas.md`
- If still stuck after 30 min → document and escalate

---

## Common Issues & Solutions

### Issue: Code Node `fetch is not defined`

**Root Cause:** n8n uses custom JS runtime, not Node.js.

**Fix:**
```javascript
// WRONG
const response = await fetch(url, { headers });

// CORRECT
const response = await this.helpers.httpRequest({
  method: "GET",
  url: url,
  headers: { "Authorization": "Bearer " + token }
});
```

### Issue: Regex Not Matching

**Root Cause:** Double-escaping from shell → API → n8n.

**Diagnosis:**
```javascript
// Test what your regex actually contains
console.log(/\d+/.toString());  // Should show /\d+/ not /\\d+/
```

**Fix:**
```javascript
// WRONG (double-escaped)
const pattern = /\\d{1,2}/;

// CORRECT (single escape)
const pattern = /\d{1,2}/;
```

**Prevention:** Test regex at regex101.com first.

### Issue: Code Node Returns Nothing

**Root Cause:** Wrong return format.

**Fix:**
```javascript
// WRONG
return { data: "value" };

// CORRECT
return [{ json: { data: "value" } }];
```

### Issue: Webhook Returns 404

**Root Causes:**
1. Workflow not active
2. Wrong webhook path
3. Production vs Test URL

**Diagnosis:**
```bash
# Check workflow active status
curl -s "https://automation.dyniq.ai/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_KEY" | grep '"active"'
```

**Fix:**
```bash
# Activate workflow
curl -X POST "https://automation.dyniq.ai/api/v1/workflows/$WORKFLOW_ID/activate" \
  -H "X-N8N-API-KEY: $N8N_KEY"
```

### Issue: Workflow API Update Fails

**Root Cause:** Including extra fields like `id`, `active`, `createdAt`.

**Fix:** Only include these 4 fields:
```json
{
  "name": "...",
  "nodes": [...],
  "connections": {...},
  "settings": {}
}
```

---

## Debugging Procedure

### Step 1: Get Execution Details

```bash
EXEC_ID="123"
curl -s "https://automation.dyniq.ai/api/v1/executions/$EXEC_ID?includeData=true" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
data = d.get('data', {}).get('resultData', {}).get('runData', {})
for node, runs in data.items():
    if runs:
        status = runs[0].get('executionStatus', 'unknown')
        print(f'{node}: {status}')
"
```

### Step 2: Identify Failed Node

Look for `error` status in output above.

### Step 3: Get Node Output

```bash
curl -s "https://automation.dyniq.ai/api/v1/executions/$EXEC_ID?includeData=true" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
node_data = d.get('data', {}).get('resultData', {}).get('runData', {}).get('YOUR_NODE_NAME', [])
if node_data:
    print(json.dumps(node_data[0].get('data', {}), indent=2))
"
```

### Step 4: Test Fix Locally

For Code nodes, test your JavaScript logic separately before deploying.

---

## Environment Variables

```bash
# Store in .env (never commit)
N8N_API_KEY=your-key
N8N_WORKFLOW_ID=DP0wfYBh8SJK33Ue
```

---

## Quick Reference

| Check | Command |
|-------|---------|
| Workflow active? | `curl .../workflows/{id}` → `active: true/false` |
| Recent executions | `curl .../executions?workflowId={id}&limit=5` |
| Execution details | `curl .../executions/{id}?includeData=true` |
| Activate workflow | `POST .../workflows/{id}/activate` |

---

## Related Docs

- `n8n-gotchas.md` - Full technical reference
- `.agents/sops/voiceflow-debugging.md` - Voiceflow issues

---

*Key lesson: Check execution data to see actual node input/output.*
