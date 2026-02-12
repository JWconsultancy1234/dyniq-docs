---
sidebar_position: 6
title: n8n Workflow Debugging
description: SOP for debugging and modifying n8n automation workflows
doc_owner: CTO
review_cycle: 60d
doc_status: published
---

# n8n Workflow Debugging

Systematic approach to debugging n8n workflows in the DYNIQ automation stack.

## Quick Reference

| Property | Value |
|----------|-------|
| URL | https://automation.dyniq.ai |
| Container | `n8n-n8n-1` |
| Network | `n8n_default` |
| Health | `/healthz` |

## Key Workflow IDs

| Workflow | ID |
|----------|-----|
| Quiz -> Ruben Call | `tGtoHKGRgykshaf7` |
| Voiceflow Lead | `DP0wfYBh8SJK33Ue` |
| HITL Content Review | `Vkhmtd3Uy32VaXeK` |
| Board Meeting Review | `AdbE5UmMQJKY28PD` |

## Debugging Steps

### Step 1: Identify the Failing Execution

```bash
N8N_KEY="your-key"

# List recent executions
curl -s "https://automation.dyniq.ai/api/v1/executions?limit=5" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -m json.tool
```

### Step 2: Get Execution Details

```bash
# Get failed execution with data
curl -s "https://automation.dyniq.ai/api/v1/executions/{id}?includeData=true" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
error = data.get('data', {}).get('resultData', {}).get('error', {})
print(json.dumps(error, indent=2))
"
```

### Step 3: Check Node Input/Output

```bash
# Inspect specific node's data
curl -s "https://automation.dyniq.ai/api/v1/executions/{id}?includeData=true" \
  -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
node_data = data['data']['resultData']['runData']['Node Name'][0]['data']['main'][0]
print(json.dumps(node_data, indent=2))
"
```

## Common n8n Gotchas

### Data Flow After HTTP Request

After ANY HTTP Request node, `$json` contains the RESPONSE, not the original input.

```javascript
// WRONG - $json is the HTTP response
if ($json.decision === 'edit') { ... }

// CORRECT - reference upstream node
if ($('Parse Callback').item.json.decision === 'edit') { ... }
```

### Node Data Isolation

Nodes can ONLY access data from nodes in their connected upstream path. Parallel branches create data isolation.

### Environment Variables

:::warning
`{{ $env.VARIABLE }}` is BLOCKED in HTTP Request nodes by default. Use Code nodes with `process.env.VARIABLE` instead.
:::

### Code Node Runtime

n8n Code nodes use a custom runtime, NOT standard Node.js:

```javascript
// WRONG - fetch not available
const response = await fetch(url);

// CORRECT - use built-in helper
const response = await this.helpers.httpRequest({
  method: "GET",
  url: url,
  headers: { "Authorization": "Bearer token" },
});

// Return format
return [{ json: { data: "value" } }];
```

## Workflow Modification via API

### Get Workflow

```bash
curl -s "https://automation.dyniq.ai/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_KEY" > workflow.json
```

### Update Workflow

Only send: `name`, `nodes`, `connections`, `settings`. Extra fields cause 400 errors.

```bash
curl -X PUT "https://automation.dyniq.ai/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"...", "nodes":[...], "connections":{}, "settings":{}}'
```

### Activate

```bash
curl -X POST "https://automation.dyniq.ai/api/v1/workflows/{id}/activate" \
  -H "X-N8N-API-KEY: $N8N_KEY"
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "No path back to referenced node" | Cross-branch `$('Node')` reference | Reorganize or use Merge node |
| "22P02 invalid input syntax" | Wrong data type for DB column | Cast data or check column type |
| "23514 check constraint" | Empty string where not allowed | Use `null` instead of `""` |
| "401 Unauthorized" | Wrong API key | Verify `X-API-Key` header |
| "access to env vars denied" | `$env.X` in HTTP Request | Use Code node instead |
