---
title: "n8n Development Gotchas"
sidebar_label: "n8n Development Gotchas"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# n8n Development Gotchas

Platform-specific patterns for n8n Code nodes. Historical incident context: `.agents/docs/archive/n8n-incident-history.md`

---

## Core Rules

### Data Flow After HTTP Request Nodes

**Rule:** After ANY HTTP Request node, `$json` contains the RESPONSE, not the original input.

```javascript
// WRONG - after HTTP Request, $json is the response
if ($json.decision === 'edit') { ... }

// CORRECT - reference the upstream node explicitly
if ($('Parse Callback').item.json.decision === 'edit') { ... }
```

### Node Data Access Rules

Nodes can ONLY access data from nodes in their connected upstream path.

```
[Webhook] -> [Format] -> [Tavily 1] -+
                      -> [Tavily 2] -+-> [Merge] -> [Model Selector]
                                     |
                                     +-> [Update Lead] <- CAN'T access [Model Selector]
```

**Key Rules:**
1. Parallel branches create data isolation
2. Use Merge node to combine parallel outputs BEFORE downstream processing
3. `$('Node Name').item.json.X` only works if Node Name is upstream AND connected

---

## Pre-Deploy Checklist

**1. API Configuration:**
- [ ] Voice calls -> `ruben-api.dyniq.ai` (port 8080)
- [ ] Content/HITL/Leads -> `agents-api.dyniq.ai` (port 8000)
- [ ] API keys are production values (not `dev-key`)

**2. Data Flow:**
- [ ] Map what `$json` contains at EVERY node
- [ ] After HTTP Request: use `$('Node Name').item.json.field`
- [ ] No orphaned `$json.field` references

**3. Node References:**
- [ ] All `$('Node Name')` references are upstream AND connected
- [ ] Node names match exactly (case-sensitive)

**4. Testing:**
- [ ] Test each branch with actual webhook payload
- [ ] Check error paths don't break on missing data

---

## Workflow IDs Reference

| Workflow | ID |
|----------|-----|
| Quiz -> Ruben Call | `tGtoHKGRgykshaf7` |
| Voiceflow Lead | `DP0wfYBh8SJK33Ue` |
| HITL Content Review | `Vkhmtd3Uy32VaXeK` |
| HITL Button Handler | `03DAx8GwCPLWnVUV` |
| Board Meeting Review | `AdbE5UmMQJKY28PD` |
| Board Meeting Feedback Scheduler | `6SXN3LwgSzdtMuQV` |

---

## Code Node Runtime

n8n Code nodes use a custom JavaScript runtime, NOT standard Node.js.

### HTTP Requests

```javascript
// WRONG - fetch is not defined
const response = await fetch(url, { headers });

// CORRECT - use built-in helper
const response = await this.helpers.httpRequest({
  method: "GET",
  url: url,
  headers: { "Authorization": "Bearer token" },
  body: JSON.stringify(data)  // for POST/PUT
});
```

### Return Format

```javascript
// CORRECT - returns array of {json: ...} objects
return [{ json: { data: "value" } }];

// Multiple items
return [
  { json: { id: 1, name: "First" } },
  { json: { id: 2, name: "Second" } }
];
```

### Accessing Input Data

```javascript
const items = $input.all();                    // All items from previous node
const data = $input.first().json;              // First item's JSON
const webhookData = $('Webhook').first().json; // Specific node by name
const name = $json.body?.name || $json.name;   // Handle nested/flat
```

### Credentials

**Credentials CANNOT be accessed directly in Code nodes.**

Workarounds:
1. Use HTTP Request nodes with n8n credential UI
2. Pass credentials through workflow: HTTP Request -> Set Node -> Code Node
3. Environment variables: `process.env.VAR_NAME`

---

## Telegram Inline Keyboards

Native n8n Telegram node does NOT support `reply_markup`. Use Code node:

```javascript
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const inlineKeyboard = {
  inline_keyboard: [
    [{ text: 'Approve', callback_data: 'approve_' + $json.thread_id }],
    [{ text: 'Edit', callback_data: 'edit_' + $json.thread_id }]
  ]
};

const response = await this.helpers.httpRequest({
  method: 'POST',
  url: `https://api.telegram.org/bot${botToken}/sendMessage`,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: chatId,
    text: messageText,
    parse_mode: 'Markdown',
    reply_markup: inlineKeyboard
  })
});
return [{ json: { success: true, response } }];
```

**Note:** `callback_data` is limited to 64 bytes. Board Meeting buttons use prefix `bm_`.

---

## Workflow API

### Update Workflow

```bash
# Get workflow (only fields: name, nodes, connections, settings)
curl -s "https://automation.dyniq.ai/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_KEY" > workflow.json

# Update (extra fields cause "must NOT have additional properties" error)
curl -X PUT "https://automation.dyniq.ai/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_KEY" -H "Content-Type: application/json" \
  -d '{"name":"...", "nodes":[...], "connections":{}, "settings":{}}'

# Activate
curl -X POST "https://automation.dyniq.ai/api/v1/workflows/{id}/activate" \
  -H "X-N8N-API-KEY: $N8N_KEY"

# VERIFY after PUT (caching may ignore changes)
curl -s "https://automation.dyniq.ai/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.nodes[] | select(.name == "Changed Node")'
```

### Debug Execution

```bash
# Get failed execution
curl -s "https://automation.dyniq.ai/api/v1/executions/{id}?includeData=true" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data.resultData.error'

# Check node input/output
jq '.data.resultData.runData["Node Name"][0].data.main[0]'
```

---

## API Keys in HTTP Request Nodes

**CRITICAL:** `{{ $env.VARIABLE }}` expressions are BLOCKED by default in n8n!

```
Error: [ERROR: access to env vars denied]
```

**Options for API key handling:**

| Method | Where | Pros | Cons |
|--------|-------|------|------|
| n8n Credentials UI | n8n settings | Encrypted, secure | Requires manual setup |
| Code node `process.env.X` | Code nodes only | Works | Not available in HTTP Request |
| Hardcoded in workflow | Header parameters | Works immediately | In workflow JSON |

**Recommended pattern:**
1. Store actual API key directly in n8n workflow (via UI)
2. In repo JSON files, use placeholder: `"value": "REPLACE_WITH_API_KEY"`
3. When importing workflow, replace placeholder in n8n UI

**Code nodes CAN access env vars:**
```javascript
const apiKey = process.env.AGENTS_API_KEY;  // Works in Code node
```

**HTTP Request nodes CANNOT use $env expressions** - use credentials or hardcode.

**Incident log (3 occurrences — pattern confirmed):**

| Date | Workflow | Variable | Fix |
|------|----------|----------|-----|
| 2026-02-02 | Board Meeting Feedback Scheduler | `$env.AGENTS_API_KEY` | Hardcoded in n8n UI |
| 2026-02-08 | Call Completed Handler | `$env.DYNIQ_SUPABASE_KEY` | Hardcoded via API |
| 2026-02-08 | Sophie WhatsApp Callbacks | `$env.DYNIQ_TELEGRAM_BOT_TOKEN`, `$env.NOCODB_URL` | Hardcoded via API |

### Env Var Scope (CRITICAL — 2 separate `.env` files)

n8n and dyniq-voice use **different** `.env` files:

| Stack | Env File | Contains |
|-------|----------|----------|
| n8n | `/opt/n8n/.env` | `N8N_API_KEY`, `NOCODB_API_KEY`, `TELEGRAM_BOT_TOKEN` |
| dyniq-voice | `/opt/dyniq-voice/.env` | `DYNIQ_SUPABASE_KEY`, `AGENTS_API_KEY`, `LIVEKIT_*` |

**Even if `$env` worked in HTTP Request nodes, variables from the wrong `.env` file won't resolve.**

Before adding env vars to n8n workflows, check which `.env` file contains them.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "No path back to referenced node" | Cross-branch reference | Reorganize workflow or remove reference |
| "22P02 invalid input syntax" | Wrong data type | Check column type, convert data |
| "23514 check constraint" | Empty string where not allowed | Use `null` instead of `""` |
| "401 Unauthorized" | Missing/wrong API key | Add `X-API-Key` header |
| "access to env vars denied" | `$env.X` in HTTP Request | Use Code node or hardcode key |

---

## Webhook Data Handling

Voiceflow sends flat JSON, some systems send nested. Handle both:

```javascript
{{ $json.body?.name || $json.name || "Unknown" }}
```

---

## Storage Uploads

Always include upsert header:

```javascript
headers: {
  'Authorization': 'Bearer {key}',
  'Content-Type': 'text/html',
  'x-upsert': 'true'  // REQUIRED - prevents duplicate key errors
}
```

---

## Quick Reference Tables

### Language Choice

| Use Case | Language |
|----------|----------|
| API calls, HTTP requests | JavaScript |
| Data transformation | JavaScript |
| Credential access | JavaScript |
| Heavy numerical (pandas/numpy) | Python |

### FastAPI Endpoints

| Service | URL | Auth Header |
|---------|-----|-------------|
| Voice Agent | ruben-api.dyniq.ai | `X-API-Key` |
| Agents API | agents-api.dyniq.ai | `X-API-Key` |

---

## Workflow Import & Automation via API (3x pattern - 2026-02-09)

**Default to API automation for ALL n8n changes. Never flag n8n work as "manual".**

### Import Workflow from JSON

```bash
N8N_KEY=$(grep "^N8N_API_KEY=" /Users/walker/Desktop/Code/dyniq-app/.env | cut -d'=' -f2-)

# Import (creates inactive workflow)
curl -X POST "https://automation.dyniq.ai/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_KEY" -H "Content-Type: application/json" \
  -d @workflow.json

# Returns: {"id": "SzGpWv7FWGrBvpNS", "active": false, ...}
```

### Inject Credentials (Replace Placeholders)

```bash
# 1. GET workflow JSON
WF=$(curl -s "https://automation.dyniq.ai/api/v1/workflows/{id}" -H "X-N8N-API-KEY: $N8N_KEY")

# 2. Replace placeholder with real key (Python)
UPDATED=$(echo "$WF" | python3 -c "
import sys, json
wf = json.load(sys.stdin)
body = json.dumps(wf)
body = body.replace('REPLACE_WITH_KEY', 'actual_key_value')
data = json.loads(body)
print(json.dumps({'name': data['name'], 'nodes': data['nodes'], 'connections': data['connections'], 'settings': data['settings']}))
")

# 3. PUT back (ONLY name, nodes, connections, settings)
curl -X PUT "https://automation.dyniq.ai/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_KEY" -H "Content-Type: application/json" -d "$UPDATED"
```

### Add Nodes to Existing Workflow

```bash
# 1. GET workflow, 2. Append nodes to nodes array, 3. Add connections, 4. PUT back
# Keep ONLY: name, nodes, connections, settings (extra fields cause 400 error)
```

### Activate

```bash
curl -X POST "https://automation.dyniq.ai/api/v1/workflows/{id}/activate" \
  -H "X-N8N-API-KEY: $N8N_KEY"
```

---

*Last updated: 2026-02-09 (added workflow import API pattern - 3rd occurrence)*
