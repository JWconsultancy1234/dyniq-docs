---
title: "n8n Debug: Systematic Workflow Debugging"
sidebar_label: "n8n Debug: Systematic Workflow Debugging"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [commands, auto-synced]
---

# n8n Debug: Systematic Workflow Debugging

Diagnose and fix n8n workflow execution errors systematically.

## When to Use

- Workflow execution failed
- Node throwing errors
- Data not flowing correctly
- "No path back to referenced node" errors

## Pre-Debug Setup

```bash
# Set API key
N8N_KEY=$(grep N8N_API_KEY ~/Desktop/Code/dyniq-app/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
```

## Step 1: Identify Failed Execution

```bash
# List recent executions
curl -s "https://automation.dyniq.ai/api/v1/executions?limit=5" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data[] | {id, workflowId, status, finished}'

# Filter by workflow ID
curl -s "https://automation.dyniq.ai/api/v1/executions?workflowId={WORKFLOW_ID}&limit=5" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data[] | {id, status}'
```

## Step 2: Get Error Details

```bash
# Get execution with full data
curl -s "https://automation.dyniq.ai/api/v1/executions/{EXEC_ID}?includeData=true" \
  -H "X-N8N-API-KEY: $N8N_KEY" > /tmp/execution.json

# Extract error message
jq '.data.resultData.error' /tmp/execution.json

# See which nodes ran
jq '.data.resultData.runData | keys' /tmp/execution.json

# Find the failed node
jq '.data.resultData.lastNodeExecuted' /tmp/execution.json
```

## Step 3: Inspect Node Data

```bash
# See input to specific node
jq '.data.resultData.runData["NODE_NAME"][0].data.main[0]' /tmp/execution.json

# See output from specific node
jq '.data.resultData.runData["NODE_NAME"][0].data.main' /tmp/execution.json
```

## Step 4: Common Error Patterns

### Error: "No path back to referenced node"

**Cause:** Node tries to access data from a node not in its upstream path.

**Diagnosis:**
```bash
# Get workflow to check connections
curl -s "https://automation.dyniq.ai/api/v1/workflows/{WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: $N8N_KEY" > /tmp/workflow.json

# Check connections
jq '.connections' /tmp/workflow.json
```

**Fix:**
- Remove the cross-branch reference
- Or reorganize workflow so data flows through connections
- Or use Merge node to combine parallel branches first

### Error: "22P02 invalid input syntax"

**Cause:** Sending wrong data type to database column.

**Common cases:**
- Sending string to numeric column: `"€1.500"` → integer
- Sending string to array column: `"value"` → `text[]`
- Sending object to string column

**Fix:** Convert data types in Code node or expression.

### Error: "23514 check constraint violation"

**Cause:** Value doesn't match CHECK constraint (e.g., empty string where enum required).

**Fix:** Use `null` instead of empty string:
```javascript
// Instead of
{{ $json.urgency || "" }}

// Use
{{ $json.urgency || null }}
```

### Error: "401 Unauthorized"

**Cause:** Wrong or missing API key in HTTP Request node.

**Diagnosis:**
```bash
# Check all HTTP Request nodes for credentials
jq '.nodes[] | select(.type == "n8n-nodes-base.httpRequest") | {name, parameters}' /tmp/workflow.json
```

**Fix:** Ensure all nodes use same, valid API key.

## Step 5: Fix Workflow

### Option A: Quick Fix via UI
1. Open https://automation.dyniq.ai
2. Navigate to workflow
3. Edit node parameters
4. Save and activate

### Option B: Fix via API (for complex changes)

```python
# /tmp/fix-workflow.py
import json

with open('/tmp/workflow.json', 'r') as f:
    workflow = json.load(f)

# Make changes to workflow['nodes'] or workflow['connections']
# Example: Fix a node's parameters
for i, node in enumerate(workflow['nodes']):
    if node['name'] == 'Problem Node':
        workflow['nodes'][i]['parameters']['jsonBody'] = '={"fixed": "value"}'

with open('/tmp/workflow-fixed.json', 'w') as f:
    json.dump({
        'name': workflow['name'],
        'nodes': workflow['nodes'],
        'connections': workflow['connections'],
        'settings': workflow.get('settings', {})
    }, f, indent=2)
```

```bash
# Upload fixed workflow
curl -X PUT "https://automation.dyniq.ai/api/v1/workflows/{WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: $N8N_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/workflow-fixed.json

# Activate workflow
curl -X POST "https://automation.dyniq.ai/api/v1/workflows/{WORKFLOW_ID}/activate" \
  -H "X-N8N-API-KEY: $N8N_KEY"
```

## Step 6: Test Fix

```bash
# Trigger webhook (adjust URL and payload)
curl -s -X POST "https://automation.dyniq.ai/webhook/{PATH}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Wait and check result
sleep 30
curl -s "https://automation.dyniq.ai/api/v1/executions?limit=1" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data[0] | {id, status}'
```

## Quick Reference: Error → Fix

| Error Message | Likely Cause | Quick Fix |
|---------------|--------------|-----------|
| "No path back to referenced node" | Cross-branch data access | Remove reference or use Merge node |
| "22P02 invalid input syntax" | Wrong data type | Convert in Code node |
| "23514 check constraint" | Empty string / invalid enum | Use null instead |
| "401 Unauthorized" | Bad API key | Verify credentials |
| "ECONNREFUSED" | External service down | Check service status |
| "timeout" | Slow external API | Increase timeout or add retry |

## Data Flow Verification

Before deploying, verify all `$('Node Name')` references:

```bash
# Extract all node references from expressions
jq -r '.. | strings | select(contains("$("))' /tmp/workflow.json | sort -u

# Compare against connection paths
jq '.connections | keys' /tmp/workflow.json
```

**Rule:** Every `$('X')` reference must have X as an upstream connected node.

## Key Workflows Reference

| Workflow ID | Name | Webhook |
|-------------|------|---------|
| tGtoHKGRgykshaf7 | ScoreApp Quiz Pipeline | /webhook/scoreapp-quiz-complete |
| DP0wfYBh8SJK33Ue | Voiceflow Lead Webhook | /webhook/voiceflow-lead |

---

*See also: @n8n-gotchas.md for Code node patterns*
