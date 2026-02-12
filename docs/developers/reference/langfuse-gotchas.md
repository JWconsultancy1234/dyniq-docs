---
title: "Langfuse Integration Gotchas"
sidebar_label: "Langfuse Integration Gotchas"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Langfuse Integration Gotchas

Reference for self-hosted Langfuse v3 integration with Pydantic AI.

## MinIO Bucket Creation

**CRITICAL:** Langfuse does NOT auto-create the storage bucket.

After deploying Langfuse v3 stack, manually create the bucket:

```bash
# Connect to MinIO inside container
ssh contabo 'docker exec langfuse-langfuse-minio-1 sh -c "mc alias set local http://localhost:9000 minio \$MINIO_ROOT_PASSWORD && mc mb local/langfuse"'

# Verify bucket exists
ssh contabo 'docker exec langfuse-langfuse-minio-1 sh -c "mc alias set local http://localhost:9000 minio \$MINIO_ROOT_PASSWORD && mc ls local/"'
```

**Symptoms without bucket:**
- `Failed to upload JSON to S3` errors in trace export
- 500 Internal Server Error from Langfuse OTLP endpoint
- Traces accepted but not persisted

---

## OTLP TracerProvider Setup

Langfuse v3 uses OpenTelemetry for trace ingestion. Pydantic AI requires explicit TracerProvider setup.

### Correct Pattern

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

    # Configure OTLP exporter environment
    auth_string = base64.b64encode(f"{public_key}:{secret_key}".encode()).decode()
    os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = f"{host}/api/public/otel"
    os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = f"Authorization=Basic {auth_string}"

    # Set up TracerProvider with OTLP exporter
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

    trace_provider = TracerProvider()
    trace_provider.add_span_processor(SimpleSpanProcessor(OTLPSpanExporter()))
    trace.set_tracer_provider(trace_provider)

    # Instrument all Pydantic AI agents
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

---

## S3 Region Configuration

MinIO requires region configuration even for local deployments.

**In docker-compose.yml:**

```yaml
langfuse-worker:
  environment:
    LANGFUSE_S3_EVENT_UPLOAD_REGION: us-east-1
    LANGFUSE_S3_MEDIA_UPLOAD_REGION: us-east-1
```

**Symptom without region:**
- `Region is missing` error in Langfuse logs
- S3 upload failures despite correct credentials

---

## Required Environment Variables

```bash
# Langfuse credentials (from Langfuse Settings → API Keys)
LANGFUSE_PUBLIC_KEY=pk-xxx
LANGFUSE_SECRET_KEY=sk-xxx
LANGFUSE_HOST=https://langfuse.dyniq.ai
```

---

## Required Dependencies

```bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-http
```

Or in requirements.txt:
```
opentelemetry-api>=1.20.0
opentelemetry-sdk>=1.20.0
opentelemetry-exporter-otlp-proto-http>=1.20.0
```

---

## Verification Steps

After integration, verify traces are working:

```bash
# 1. Run test that uses agents
python3 -m agents.pydantic_ai.test_agent

# 2. Check MinIO for trace files
ssh contabo 'docker exec langfuse-langfuse-minio-1 sh -c "mc alias set local http://localhost:9000 minio \$MINIO_ROOT_PASSWORD >/dev/null && mc ls local/langfuse/ --recursive | wc -l"'

# 3. Check Langfuse UI
# Open https://langfuse.dyniq.ai and look for new traces
```

**Trace count should increase after each test run.**

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| 500 Internal Server Error | Bucket doesn't exist | Create bucket with `mc mb` |
| Region is missing | S3 region not configured | Add region env vars to docker-compose |
| Init succeeds but no traces | TracerProvider not set up | Add full TracerProvider setup |
| Traces in MinIO but not in UI | Worker not processing | Check worker logs, restart |
| **SSL 525 handshake failed** | langfuse.dyniq.ai not in Caddyfile | Add Langfuse route to Caddyfile (see below) |
| **agents-api blocking/hanging** | Langfuse unreachable | Fix Langfuse SSL first - telemetry exports block main thread |

---

## ⚠️ CRITICAL: Langfuse MUST be in Caddyfile

**Incident History:**
- 2026-01-23: SSL 525 error, added Caddy route (not documented → recurred)
- 2026-01-30: SSL 525 RECURRED (same fix, now documented)

**If langfuse.dyniq.ai is NOT routed through Caddy:**
- Cloudflare → Origin SSL handshake fails (525)
- agents-api blocks on telemetry export retries
- Health checks timeout
- API requests hang

**Required Caddyfile entry:**
```
langfuse.dyniq.ai {
    reverse_proxy langfuse-langfuse-web-1:3000 {
        health_uri /api/public/health
        health_interval 30s
    }
}
```

**Verification after ANY Caddy change:**
```bash
curl -s https://langfuse.dyniq.ai/api/public/health
# Must return: {"status":"OK"}
```

**If SSL 525 occurs:**
1. Check Caddyfile includes langfuse.dyniq.ai
2. Verify Caddy connected to langfuse network: `docker network inspect langfuse_langfuse_default | grep caddy`
3. Restart Caddy: `docker restart docker-caddy-1`

---

## OpenRouter Token Tracking Attributes

When using `OpenRouterClient` from `agents.pydantic_ai.shared.openrouter_client`, these span attributes are automatically set:

| Attribute | Purpose | Source |
|-----------|---------|--------|
| `gen_ai.usage.prompt_tokens` | Input tokens | OpenRouter `usage.prompt_tokens` |
| `gen_ai.usage.completion_tokens` | Output tokens | OpenRouter `usage.completion_tokens` |
| `gen_ai.usage.total_tokens` | Total tokens | Calculated sum |
| `gen_ai.usage.cost_usd` | Actual cost | OpenRouter `usage.cost` |
| `gen_ai.openrouter.generation_id` | Cross-reference ID | OpenRouter response `id` |

**Usage pattern:**

```python
from agents.pydantic_ai.shared.openrouter_client import OpenRouterClient

client = OpenRouterClient(
    api_key=deps.openrouter_api_key,
    app_name="Your Feature Name",  # Shows in OpenRouter dashboard
)

result, response = await client.chat_completion_json(
    messages=[{"role": "user", "content": prompt}],
    model="moonshotai/kimi-k2.5",
    span_name="your_feature.action",
    span_attributes={"custom_key": "value"},
)

# response.total_tokens, response.prompt_tokens, etc. available
```

**Cross-referencing:**
- Use `gen_ai.openrouter.generation_id` to find the same request in OpenRouter dashboard
- Cost values come directly from OpenRouter (not estimated)

---

*Last updated: 2026-01-30 (OpenRouter client centralization)*
