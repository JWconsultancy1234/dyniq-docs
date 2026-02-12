---
sidebar_position: 1
title: API Reference
description: DYNIQ agents-api endpoints - board meetings, content, vision, HITL, and more
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# API Reference

The DYNIQ Agents API is a FastAPI application providing multi-agent decision-making, content generation, and vision capabilities.

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

See [Authentication](./authentication) for details on key management and rate limits.

## Endpoint Groups

| Group | Endpoints | Description | Docs |
|-------|-----------|-------------|------|
| Board Meeting | 6 | Multi-agent decision analysis | [Board Meeting API](./board-meeting) |
| Style Transfer | 7 | Brand voice extraction and content generation | [Style Transfer API](./style-transfer) |
| Vision | 3 | UI-to-code generation | [Vision API](./vision) |
| Content | 1 | AI content creation | [Content API](./content) |
| HITL | 2 | Human-in-the-loop approvals | [Content API](./content) |
| Health | 1 | Service health check | Below |

## Health Check

```bash
curl https://agents-api.dyniq.ai/health
```

```json
{
  "status": "healthy",
  "version": "3.1.0"
}
```

## Common Response Format

All endpoints return JSON with consistent error handling:

### Success

```json
{
  "status": "success",
  "data": { ... }
}
```

### Error

```json
{
  "detail": "Error description",
  "status_code": 400
}
```

## Rate Limits

| Endpoint Group | Limit |
|----------------|-------|
| Board Meeting | 10/min |
| Content | 20/min |
| Style Transfer | 10/min |
| Vision | 10/min |
| Health | Unlimited |

## CORS

The API allows cross-origin requests from all origins (`*`) for development. Production deployments should restrict this via Caddy proxy rules.

## OpenAPI Spec

The interactive API documentation is available at:

- **Swagger UI**: `https://agents-api.dyniq.ai/docs`
- **ReDoc**: `https://agents-api.dyniq.ai/redoc`
