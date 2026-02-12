---
sidebar_position: 2
title: Authentication
description: API key authentication and rate limiting for the DYNIQ Agents API
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Authentication

The DYNIQ Agents API uses API key authentication for all endpoints.

## API Key Header

Include the `X-API-Key` header in every request:

```bash
curl -X POST https://agents-api.dyniq.ai/api/board-meeting/analyze \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Should we expand to Germany?"}'
```

## Error Responses

### Missing API Key

```json
{
  "detail": "X-API-Key header is required"
}
```
**Status**: `401 Unauthorized`

### Invalid API Key

```json
{
  "detail": "Invalid API key"
}
```
**Status**: `403 Forbidden`

## Rate Limiting

Rate limits are applied per API key:

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Board Meeting | 10 requests | 1 minute |
| Content Creation | 20 requests | 1 minute |
| Style Transfer | 10 requests | 1 minute |
| Vision | 10 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1708300800
```

### Rate Limit Exceeded

```json
{
  "detail": "Rate limit exceeded. Try again in 30 seconds."
}
```
**Status**: `429 Too Many Requests`

## Service-to-Service Authentication

Internal services (n8n workflows, Ruben voice agent) use the same API key mechanism. The key is stored in the environment variable `AGENTS_API_KEY` on the Contabo server.

:::warning API Endpoint Confusion
The Agents API (`agents-api.dyniq.ai:8000`) and Ruben Voice API (`ruben-api.dyniq.ai:8080`) are **separate containers** with separate API keys. Ensure you're targeting the correct service.
:::
