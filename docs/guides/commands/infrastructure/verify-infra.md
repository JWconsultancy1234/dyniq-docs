---
description: "Quick infrastructure state check before planning"
argument-hint: "[keyword] (optional - filter by feature keyword)"
---

# Verify Infrastructure

Quick check of deployed infrastructure before planning. Run this BEFORE `/plan-feature`, `/create-story`, or `/sprint-planning`.

## Why This Exists

On 2026-01-27, 13 stories were created before discovering an existing morning brief workflow was already running (ID: `5eEX4BgpXY1tGasd`). This caused rework. **4 occurrences** of this pattern triggered automation.

## Checks

### 1. n8n Workflows

```bash
# List all workflows with status
N8N_KEY=$(grep -E "^N8N_API_KEY=" ~/Desktop/Code/dyniq-app/.env | cut -d'=' -f2)
curl -s "https://automation.dyniq.ai/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data[] | {id, name, active}'
```

**If keyword provided:**
```bash
# Filter by keyword (e.g., "morning", "brief", "lead")
curl -s "https://automation.dyniq.ai/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq --arg kw "$ARGUMENTS" '.data[] | select(.name | test($kw; "i")) | {id, name, active}'
```

### 2. Contabo Services

```bash
# Docker container status
ssh contabo "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# Health endpoints
curl -s https://ruben-api.dyniq.ai/health
curl -s https://automation.dyniq.ai/healthz
curl -s https://crm.dyniq.ai/api/v1/health
```

### 3. FastAPI Endpoints

```bash
# List available endpoints
curl -s https://ruben-api.dyniq.ai/openapi.json | jq '.paths | keys'

# Check specific endpoint health
curl -s https://ruben-api.dyniq.ai/health
```

### 4. Recent n8n Executions (for existing workflows)

```bash
# Check if workflow has recent executions
curl -s "https://automation.dyniq.ai/api/v1/executions?workflowId={WORKFLOW_ID}&limit=5" \
  -H "X-N8N-API-KEY: $N8N_KEY" | jq '.data[] | {id, finished, status}'
```

## Output Format

Generate summary for context file:

```markdown
## Existing Infrastructure (verified YYYY-MM-DD)

### n8n Workflows
| ID | Name | Active | Last Run |
|----|------|--------|----------|
| 5eEX4BgpXY1tGasd | Morning Briefing | ✅ | 2026-01-27 |

### Contabo Services
| Service | Status | Health |
|---------|--------|--------|
| ruben-api | Up 3 days | ✅ |
| n8n | Up 5 days | ✅ |

### Overlap with Planned Work
- [x] Morning brief workflow EXISTS - enhance, don't create
- [ ] OAuth endpoints - need creation
```

## Integration with Planning Commands

This command should be run automatically by:
- `/plan-feature` (Level 1 and 2)
- `/create-story`
- `/sprint-planning`
- `/audit-plans`

## Quick Reference

| Service | Check Command |
|---------|--------------|
| n8n workflows | `curl automation.dyniq.ai/api/v1/workflows` |
| Contabo docker | `ssh contabo "docker ps"` |
| FastAPI health | `curl ruben-api.dyniq.ai/health` |
| n8n executions | `curl automation.dyniq.ai/api/v1/executions?workflowId=X` |

---

*Created 2026-01-27 after 4th occurrence of infrastructure verification gap.*
