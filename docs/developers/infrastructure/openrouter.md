---
sidebar_position: 6
title: OpenRouter Reference
description: Model IDs, pricing, and usage patterns for OpenRouter LLM API
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# OpenRouter Reference

Model IDs, pricing, and usage patterns for OpenRouter API integration.

## Model IDs

:::danger Use Correct Model IDs
OpenRouter uses simplified model IDs. Date suffixes cause `400 Bad Request`.
:::

### Board Meeting Cascade

| Complexity | Model | Correct ID | Cost (1M tokens) |
|------------|-------|------------|------------------|
| Simple | Claude Haiku 4.5 | `anthropic/claude-haiku-4.5` | $1 / $5 |
| Medium | Claude Sonnet 4.5 | `anthropic/claude-sonnet-4.5` | $3 / $15 |
| Complex | Kimi K2.5 | `moonshotai/kimi-k2.5` | $0.60 / $2.40 |

### Common Mistakes

| Wrong ID | Correct ID |
|----------|------------|
| `anthropic/claude-3.5-haiku-20241022` | `anthropic/claude-haiku-4.5` |
| `anthropic/claude-sonnet-4-20250514` | `anthropic/claude-sonnet-4.5` |

### Claude JSON Mode

Claude models do **not** support `response_format: { type: "json_object" }`. Use robust JSON parsing with fallback extraction from markdown code blocks.

### Kimi K2.5 Reasoning Field

Kimi K2.5 sometimes returns content in the `reasoning` field instead of `content`. The OpenRouter client handles this automatically:

```python
message = choices[0].get("message", {})
content = message.get("content", "")
if not content:
    reasoning = message.get("reasoning", "")
    if reasoning:
        content = reasoning
```

## Image Generation Models

| Model | ID | Output | Cost | Latency |
|-------|-----|--------|------|---------|
| FLUX.2 Max | `black-forest-labs/flux.2-max` | Image only | $0.16/img | ~58s |
| Gemini 3 Pro Image | `google/gemini-3-pro-image-preview` | Image + text | ~$0.14/img | ~26s |
| FLUX.1 Schnell | `black-forest-labs/flux-schnell` | Image only | ~$0.01/img | ~10s |

:::warning FLUX Modalities
FLUX models use `modalities: ["image"]` only. Using `["image", "text"]` causes 404.
:::

### Gemini 3 Pro Image Response Format

Images are in `message.images[]`, not `message.content`:

```python
data = response.json()
images = data['choices'][0]['message']['images']
url = images[0]['image_url']['url']  # "data:image/jpeg;base64,..."
header, b64 = url.split(',', 1)
img_bytes = base64.b64decode(b64)
```

Key behaviors:
- Returns 2 nearly identical variants per request (use `images[0]`)
- `message.content` is empty string when images are returned
- Output format is JPEG
- Struggles with exact hex color codes - use descriptive language instead
