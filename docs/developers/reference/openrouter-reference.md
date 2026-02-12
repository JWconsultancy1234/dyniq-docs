---
title: "OpenRouter Reference"
sidebar_label: "OpenRouter Reference"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# OpenRouter Reference

Model IDs, pricing, and usage patterns for OpenRouter API integration.

---

## Model ID Reference

**CRITICAL:** OpenRouter uses simplified model IDs. Date suffixes cause 400 Bad Request.

### Correct Model IDs (Board Meeting Cascade)

| Complexity | Model | Correct ID | Cost (1M tokens) |
|------------|-------|------------|------------------|
| Simple | Claude Haiku 4.5 | `anthropic/claude-haiku-4.5` | $1/$5 |
| Medium | Claude Sonnet 4.5 | `anthropic/claude-sonnet-4.5` | $3/$15 |
| Complex | Kimi K2.5 | `moonshotai/kimi-k2.5` | $0.60/$2.40 |

### Common Mistakes

| Wrong ID | Correct ID |
|----------|------------|
| `anthropic/claude-3.5-haiku-20241022` | `anthropic/claude-haiku-4.5` |
| `anthropic/claude-sonnet-4-20250514` | `anthropic/claude-sonnet-4.5` |
| `anthropic/claude-3-5-sonnet` | `anthropic/claude-sonnet-4.5` |

**Incident (2026-01-31):** Board meeting failed with 400 Bad Request due to incorrect model IDs with date suffixes.

### Claude JSON Mode Note

Claude models do NOT support `response_format: { type: "json_object" }`. Always use robust JSON parsing:

```python
# In openrouter_client.py
def _parse_json_response(self, content: str) -> dict:
    # Remove ```json...``` blocks
    # Find JSON object boundaries
    # Parse with fallback
```

**Reference:** `agents/pydantic_ai/shared/openrouter_client.py`

### Kimi K2.5 Reasoning Field (P0 Fix 2026-02-04)

**CRITICAL:** Kimi K2.5 sometimes returns content in `reasoning` field instead of `content`.

```python
# OpenRouter client handles this automatically (P0 fix 2026-02-04)
message = choices[0].get("message", {})
content = message.get("content", "")

# Fall back to reasoning if content is empty
if not content:
    reasoning = message.get("reasoning", "")
    if reasoning:
        content = reasoning
```

**Symptoms:** Board meeting or style analysis returns empty/times out despite successful API call.

**Reference:** `agents/pydantic_ai/shared/openrouter_client.py` lines 205-211

---

## Image Generation Models (OpenRouter)

| Model | ID | Modalities | Cost | Latency |
|-------|-----|-----------|------|---------|
| **FLUX.2 Max** | `black-forest-labs/flux.2-max` | `["image"]` only | $0.16/img | ~58s |
| **Gemini 3 Pro Image** | `google/gemini-3-pro-image-preview` | `["image", "text"]` | ~$0.14/img | ~26s |
| FLUX.1 Schnell | `black-forest-labs/flux-schnell` | `["image"]` only | ~$0.01/img | ~10s |

**CRITICAL:** FLUX models use `modalities: ["image"]` only. Using `["image", "text"]` causes 404.
**Incident (2026-02-03):** E2E test 404 until modalities fixed.

### Gemini 3 Pro Image (Verified 2026-02-10)

**Response format:** Images are in `message.images[]` (NOT `message.content`):

```python
data = response.json()
images = data['choices'][0]['message']['images']  # NOT message.content
url = images[0]['image_url']['url']  # "data:image/jpeg;base64,..."
header, b64 = url.split(',', 1)
img_bytes = base64.b64decode(b64)
```

**Key behaviors:**
- Returns 2 nearly identical variants per request (use `images[0]`)
- `message.content` is empty string when images are returned
- `reasoning_details` field contains large encrypted data (ignore)
- Output format is JPEG (not PNG)

**Color control (CRITICAL):** Struggles with exact hex background codes. Use descriptive language + negative prompts:

| Do | Don't |
|----|-------|
| "pure near-black background" | "#0A0A0F background" |
| "NOT navy blue, NOT dark blue" | (omit negative prompts) |
| "cyan #00D4FF accents" | "use these exact colors" |

**Cost:** ~$0.14/image at 1080x1080. Total for 5-slide carousel (cover + CTA with 3 iterations): ~$0.56

**Proven use case:** LinkedIn carousel cover + CTA slides (E3-006, 2026-02-10)

---

*Last updated: 2026-02-06*
*Extracted from infrastructure-architecture.md for improved maintainability.*
