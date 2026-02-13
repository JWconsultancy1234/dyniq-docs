---
title: "/n8n-update - Structured n8n Workflow Modification"
sidebar_label: "/n8n-update - Structured n8n Workflow Modification"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# /n8n-update - Structured n8n Workflow Modification

**Purpose**: Safe n8n workflow updates with backup/verify pattern to prevent silent failures.

## When to Use

- Modifying production n8n workflows
- Adding/removing nodes or connections
- Updating Code node logic
- Fixing data flow issues

---

## Pre-Update: Identify Workflow

**CRITICAL:** Multiple similar workflows exist. Always confirm workflow ID.

| Workflow | ID | Webhook |
|----------|-----|---------|
| Quiz to Ruben Call | tGtoHKGRgykshaf7 | /webhook/scoreapp-quiz-complete |
| Voiceflow Lead | DP0wfYBh8SJK33Ue | /webhook/voiceflow-lead |
| HITL Content Review | Vkhmtd3Uy32VaXeK | /webhook/content-review |
| HITL Button Handler | 03DAx8GwCPLWnVUV | Telegram callback |
| Board Meeting Review | AdbE5UmMQJKY28PD | /webhook/board-meeting-review |

---

## Step 1: Set API Key

```bash
N8N_KEY=$(grep N8N_API_KEY ~/Desktop/Code/dyniq-app/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
```

---

## Step 2: Backup Current Workflow

**Always backup before any modification.**

```bash
WORKFLOW_ID="{WORKFLOW_ID}"
BACKUP_FILE="/tmp/n8n-backup-${WORKFLOW_ID}-$(date +%Y%m%d-%H%M).json"

curl -s "https://automation.dyniq.ai/api/v1/workflows/${WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: $N8N_KEY" > "$BACKUP_FILE"

# Verify backup
jq '.name' "$BACKUP_FILE"
echo "Backup saved to: $BACKUP_FILE"
```

---

## Step 3: Make Modifications

### Option A: Python Script (Complex Changes)

```python
# /tmp/update-workflow.py
import json

with open('/tmp/workflow.json', 'r') as f:
    workflow = json.load(f)

# Example: Update a node's parameters
for node in workflow['nodes']:
    if node['name'] == 'Target Node':
        node['parameters']['someField'] = 'new_value'

# ONLY include these 4 fields in output
with open('/tmp/workflow-updated.json', 'w') as f:
    json.dump({
        'name': workflow['name'],
        'nodes': workflow['nodes'],
        'connections': workflow['connections'],
        'settings': workflow.get('settings', {})
    }, f, indent=2)
```

### Option B: jq (Simple Changes)

```bash
# Example: Update a specific field
jq '.nodes |= map(if .name == "Node Name" then .parameters.field = "new_value" else . end)' \
  /tmp/workflow.json > /tmp/workflow-updated.json
```

---

## Step 4: Push Changes

```bash
# Upload modified workflow
curl -X PUT "https://automation.dyniq.ai/api/v1/workflows/${WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: $N8N_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/workflow-updated.json

# Activate workflow
curl -X POST "https://automation.dyniq.ai/api/v1/workflows/${WORKFLOW_ID}/activate" \
  -H "X-N8N-API-KEY: $N8N_KEY"
```

---

## Step 5: Verify Changes Were Applied

**CRITICAL:** n8n may return 200 success but NOT apply changes (caching behavior).

```bash
# Re-download and verify specific change
curl -s "https://automation.dyniq.ai/api/v1/workflows/${WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: $N8N_KEY" | \
  jq '.nodes[] | select(.name == "Changed Node") | .parameters'

# Compare with expected value
# If value unchanged, re-download fresh backup and repeat steps 3-5
```

---

## Step 6: Test Execution

```bash
# Trigger test (adjust webhook path and payload)
curl -s -X POST "https://automation.dyniq.ai/webhook/{PATH}" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Wait and check execution
sleep 30
curl -s "https://automation.dyniq.ai/api/v1/executions?workflowId=${WORKFLOW_ID}&limit=1" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data[0] | {id, status, finished}'
```

---

## Pre-Deploy Checklist

**Mandatory checks before activating:**

### 1. API Configuration
- [ ] API URLs point to correct service:
  - Voice calls: `ruben-api.dyniq.ai` (port 8080)
  - Content/HITL/Leads: `agents-api.dyniq.ai` (port 8000)
- [ ] API keys are production values (not `dev-key`)

### 2. Data Flow After HTTP Request Nodes
- [ ] After ANY HTTP Request node, `$json` is the RESPONSE, not input
- [ ] All downstream references use `$('Node Name').item.json.field`
- [ ] No orphaned `$json.field` references

```javascript
// WRONG - after HTTP Request, $json is the response
if ($json.decision === 'edit') { ... }

// CORRECT - reference the upstream node explicitly
if ($('Parse Callback').item.json.decision === 'edit') { ... }
```

### 3. Credential Expressions
- [ ] Credentials in Code nodes use workaround (HTTP Request node first)
- [ ] No `$credentials.X` in Code node (doesn't work)

### 4. Node References
- [ ] All `$('Node Name')` references point to upstream connected nodes
- [ ] No cross-branch data access without Merge node

```bash
# Find all node references
jq -r '.. | strings | select(contains("$("))' /tmp/workflow.json | sort -u
```

### 5. Testing
- [ ] Each branch tested with actual webhook payload
- [ ] Error paths verified

---

## Rollback Procedure

If issues discovered after deployment:

```bash
# Restore from backup
curl -X PUT "https://automation.dyniq.ai/api/v1/workflows/${WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: $N8N_KEY" \
  -H "Content-Type: application/json" \
  -d @"$BACKUP_FILE"

# Reactivate
curl -X POST "https://automation.dyniq.ai/api/v1/workflows/${WORKFLOW_ID}/activate" \
  -H "X-N8N-API-KEY: $N8N_KEY"
```

---

## Common Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| Changes not applied | n8n caching | Re-download fresh, repeat update |
| `$json` wrong data | After HTTP Request | Use `$('Node Name').item.json` |
| "No path back" | Cross-branch reference | Use Merge node or remove reference |
| Credentials undefined | Code node limitation | Use HTTP Request node instead |
| 401 Unauthorized | Missing X-API-Key header | Add header to HTTP Request node |

---

## Key Workflows Reference

See: @n8n-gotchas.md for full Code node patterns and debugging tips.

---

*Created: 2026-01-29*
*Source: ADR-2026-01-29 (S5 HITL incident - 15+ debugging iterations)*
