---
sidebar_position: 1
title: API Reference
description: DYNIQ agents-api endpoints - board meetings, content, vision, HITL, and more
---

# API Reference

The DYNIQ Agents API provides 28 endpoints across 7 route groups.

## Base URL

```
https://agents-api.dyniq.ai
```

## Authentication

All endpoints require an API key via the `X-API-Key` header:

```bash
curl -X GET https://agents-api.dyniq.ai/health \
  -H "X-API-Key: your-api-key"
```

## Endpoint Groups

| Group | Endpoints | Description |
|-------|-----------|-------------|
| Board Meeting | 13 | Multi-agent decision analysis |
| Style Transfer | 8 | Brand voice extraction and content generation |
| Vision | 3 | UI-to-code generation |
| Content | 1 | AI content creation |
| HITL | 2 | Human-in-the-loop approvals |
| Vector Search | 1 | Semantic search |
| Leads | 1 | Lead processing |

## Health Check

```bash
curl https://agents-api.dyniq.ai/health
# {"status": "healthy"}
```

:::info Content Coming Soon
Full endpoint documentation with request/response schemas is being generated from the FastAPI OpenAPI spec.
:::
