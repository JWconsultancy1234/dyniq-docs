---
sidebar_position: 4
title: Langfuse Integration
description: Self-hosted Langfuse v3 integration with OpenTelemetry tracing
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Langfuse Integration

Reference for self-hosted Langfuse v3 integration with Pydantic AI and OpenTelemetry.

## Quick Reference

| Property | Value |
|----------|-------|
| URL | `https://langfuse.dyniq.ai` |
| Network | `langfuse_default` |
| Location | `/opt/langfuse/` |
| Health Check | `curl https://langfuse.dyniq.ai/api/public/health` |

## OTLP TracerProvider Setup

Langfuse v3 uses OpenTelemetry for trace ingestion. Pydantic AI requires explicit TracerProvider setup.

```python
"""Langfuse OTLP integration for Pydantic AI."""
import base64
import os
from functools import lru_cache

@lru_cache(maxsize=1)
def init_langfuse() -> bool:
    """Initialize Langfuse OTLP export for Pydantic AI."""
    public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY")
    host = os.getenv("LANGFUSE_HOST", "https://langfuse.dyniq.ai")

    if not public_key or not secret_key:
        return False

    auth_string = base64.b64encode(
        f"{public_key}:{secret_key}".encode()
    ).decode()
    os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = f"{host}/api/public/otel"
    os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = f"Authorization=Basic {auth_string}"

    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

    trace_provider = TracerProvider()
    trace_provider.add_span_processor(SimpleSpanProcessor(OTLPSpanExporter()))
    trace.set_tracer_provider(trace_provider)

    from pydantic_ai import Agent
    Agent.instrument_all()
    return True
```

### Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| No TracerProvider | Traces not exported | Add TracerProvider setup |
| Just env vars | Init succeeds, no traces | Must call `trace.set_tracer_provider()` |
| Missing `instrument_all()` | Agent runs, no traces | Call `Agent.instrument_all()` after TracerProvider |

## Required Dependencies

```bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-http
```

## Environment Variables

```bash
LANGFUSE_PUBLIC_KEY=pk-xxx
LANGFUSE_SECRET_KEY=sk-xxx
LANGFUSE_HOST=https://langfuse.dyniq.ai
```

## MinIO Bucket Creation

:::warning Critical Setup Step
Langfuse does NOT auto-create the storage bucket. You must create it manually after deployment.
:::

```bash
ssh contabo 'docker exec langfuse-langfuse-minio-1 sh -c \
  "mc alias set local http://localhost:9000 minio \$MINIO_ROOT_PASSWORD && mc mb local/langfuse"'
```

**Symptoms without bucket:** `Failed to upload JSON to S3` errors, 500 from OTLP endpoint, traces not persisted.

## S3 Region Configuration

MinIO requires region configuration even for local deployments:

```yaml
# docker-compose.yml
langfuse-worker:
  environment:
    LANGFUSE_S3_EVENT_UPLOAD_REGION: us-east-1
    LANGFUSE_S3_MEDIA_UPLOAD_REGION: us-east-1
```

## Caddy Route (Required)

:::danger SSL 525 Without Caddy Route
If `langfuse.dyniq.ai` is not routed through Caddy, Cloudflare SSL handshake fails (525). This causes agents-api to block on telemetry export retries. **Incident recurred 2x** before being properly documented.
:::

Required Caddyfile entry:

```
langfuse.dyniq.ai {
    reverse_proxy langfuse-langfuse-web-1:3000 {
        health_uri /api/public/health
        health_interval 30s
    }
}
```

If SSL 525 occurs:
1. Check Caddyfile includes `langfuse.dyniq.ai`
2. Verify Caddy connected to langfuse network
3. Restart Caddy: `docker restart docker-caddy-1`

## OpenRouter Token Tracking

The `OpenRouterClient` automatically sets these span attributes:

| Attribute | Purpose |
|-----------|---------|
| `gen_ai.usage.prompt_tokens` | Input tokens |
| `gen_ai.usage.completion_tokens` | Output tokens |
| `gen_ai.usage.total_tokens` | Total tokens |
| `gen_ai.usage.cost` | Actual cost from OpenRouter |
| `gen_ai.openrouter.generation_id` | Cross-reference with OpenRouter dashboard |

:::tip Cost Attribute Name
Use `gen_ai.usage.cost` (not `gen_ai.usage.cost_usd`). Langfuse expects the former.
:::

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| 500 Internal Server Error | Bucket doesn't exist | Create bucket with `mc mb` |
| Region is missing | S3 region not configured | Add region env vars |
| Init succeeds but no traces | TracerProvider not set up | Add full TracerProvider setup |
| Traces in MinIO but not in UI | Worker not processing | Restart worker container |
| SSL 525 handshake failed | Not in Caddyfile | Add Langfuse route to Caddyfile |
| agents-api blocking/hanging | Langfuse unreachable | Fix Langfuse SSL first |
