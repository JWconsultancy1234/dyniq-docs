---
title: "SOP: n8n Workflow Version Sync Issues"
sidebar_label: "SOP: n8n Workflow Version Sync Issues"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# SOP: n8n Workflow Version Sync Issues

**Created:** 2026-01-17

---

## Problem Summary

When updating n8n workflows via database, changes don't take effect because n8n uses a **versioning system** where the executed workflow comes from `workflow_history`, not `workflow_entity`.

## Root Cause

n8n's architecture:
```
workflow_entity.nodes        → Current/draft version (what you edit)
workflow_entity.activeVersionId → Points to the version being executed
workflow_history.nodes       → Actual executed version (keyed by versionId)
```

**The trap:** Updating `workflow_entity.nodes` does NOTHING if `activeVersionId` points to an old `workflow_history` record.

## Symptoms

1. Workflow updates via SQL don't take effect
2. Telegram/notifications show data, but downstream nodes (NocoDB, Switch) receive empty values
3. `workflow_entity.nodes` differs from what's actually running

## Diagnosis Commands

```bash
# Check version mismatch
ssh ${N8N_SERVER} 'docker exec n8n-postgres-1 psql -U n8n -d n8n -c "
SELECT
  we.id,
  we.\"activeVersionId\",
  length(we.nodes::text) as entity_len,
  length(wh.nodes::text) as history_len
FROM workflow_entity we
LEFT JOIN workflow_history wh ON we.\"activeVersionId\" = wh.\"versionId\"
WHERE we.id = '\''WORKFLOW_ID'\'';"'

# Compare Format Lead expressions between versions
ssh ${N8N_SERVER} 'docker exec n8n-postgres-1 psql -U n8n -d n8n -t -c "
SELECT nodes FROM workflow_entity WHERE id = '\''WORKFLOW_ID'\'';"' | python3 -c "
import sys, json
nodes = json.loads(sys.stdin.read().strip())
for n in nodes:
    if 'Format' in n.get('name', ''):
        print(f\"Entity: {n.get('parameters', {})}\")"
```

## Fix Procedure

### Option A: Sync History to Entity (Recommended)

```bash
ssh ${N8N_SERVER} 'docker exec n8n-postgres-1 psql -U n8n -d n8n -c "
UPDATE workflow_history
SET nodes = (SELECT nodes FROM workflow_entity WHERE id = '\''WORKFLOW_ID'\''),
    connections = (SELECT connections FROM workflow_entity WHERE id = '\''WORKFLOW_ID'\'')
WHERE \"versionId\" = (
  SELECT \"activeVersionId\" FROM workflow_entity WHERE id = '\''WORKFLOW_ID'\''
);"'

# Restart n8n to reload
ssh ${N8N_SERVER} 'docker restart n8n-n8n-1'
```

### Option B: Create New Active Version

```bash
ssh ${N8N_SERVER} 'docker exec n8n-postgres-1 psql -U n8n -d n8n << '\''SQL'\''
-- Generate new version ID
WITH new_version AS (
  SELECT gen_random_uuid()::text as vid
)
INSERT INTO workflow_history ("versionId", "workflowId", nodes, connections, "createdAt")
SELECT
  nv.vid,
  we.id,
  we.nodes,
  we.connections,
  NOW()
FROM workflow_entity we, new_version nv
WHERE we.id = '\''WORKFLOW_ID'\'';

-- Point to new version
UPDATE workflow_entity
SET "activeVersionId" = (
  SELECT "versionId" FROM workflow_history
  WHERE "workflowId" = '\''WORKFLOW_ID'\''
  ORDER BY "createdAt" DESC LIMIT 1
)
WHERE id = '\''WORKFLOW_ID'\'';
SQL'
```

### Option C: Use n8n UI

1. Open your n8n instance URL
2. Edit workflow → Save → Activate
3. n8n handles versioning automatically

## Prevention

1. **Always use n8n UI** for workflow changes when possible
2. **If using SQL**, always update BOTH `workflow_entity` AND the active `workflow_history` record
3. **After SQL updates**, restart n8n: `docker restart n8n-n8n-1`
4. **Verify** with execution test before declaring success

## Related Issues Found

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Webhook 404 "not registered" | Missing `webhook_entity` record | Insert webhook or restart n8n |
| "Active version not found" | NULL `activeVersionId` | Create history record and link |
| Corrupted versionId ("v1 ") | Import bug | Update to UUID format |
| Data empty after Switch node | NocoDB response replaces data | Reorder nodes: Priority before NocoDB |

## Voiceflow Integration Note

If NocoDB shows literal `{name}` instead of values:
- Issue is in **Voiceflow**, not n8n
- Check Voiceflow webhook node uses `{variableName}` syntax correctly
- Variables must be set before the API Request step

---

*This SOP was created after 2+ hours debugging a workflow that appeared updated but wasn't executing the new version.*
