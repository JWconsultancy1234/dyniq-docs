---
title: "Voice & Content Integration Reference"
sidebar_label: "Voice & Content Integration Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Voice & Content Integration Reference

Voice AI, image generation, video, social media APIs, and content tracking for DYNIQ.

---

## LiveKit Voice (Ruben Agent)

| Property | Value |
|----------|-------|
| Server | voice.dyniq.ai (Contabo VPS) |
| API | ruben-api.dyniq.ai |
| Env File | `/opt/dyniq-voice/.env` |

### SIP Trunk Configuration

**CRITICAL:** `SIP_TRUNK_ID` must be **LiveKit format** (ST_xxx), NOT Twilio format (TK_xxx)!

| Format | Example | Use |
|--------|---------|-----|
| LiveKit | `ST_adYu999ZU4s4` | Use this in .env |
| Twilio | `TK935a0d...` | Do NOT use |

**Available Trunks:**

| Trunk ID | Region | Number | SIP Address |
|----------|--------|--------|-------------|
| ST_adYu999ZU4s4 | Belgium | +3233760183 | dyniq-ruben.pstn.twilio.com |
| ST_6tWDM3ZgcLfs | US | +14243830928 | dyniq.pstn.twilio.com |

**List trunks:**
```bash
lk sip outbound-trunk list --url ws://localhost:7880 --api-key $LIVEKIT_API_KEY --api-secret $LIVEKIT_API_SECRET
```

### Docker Deployment

**CRITICAL:** `docker compose restart` does NOT reload env_file!

```bash
# After changing .env, ALWAYS use:
docker compose up -d --force-recreate ruben ruben-api

# Verify env inside container:
docker exec docker-ruben-1 env | grep SIP_TRUNK
```

### LiveKit SDK Callback Rules

**CRITICAL:** LiveKit Agents SDK `.on()` requires **synchronous** callbacks.

```python
# WRONG - causes silent failure, agent won't respond
@self.session.on("user_state_changed")
async def on_state(ev):           # async = BROKEN
    await self.session.say(...)   # say() returns SpeechHandle, not coroutine

# CORRECT - synchronous callback, synchronous call
@self.session.on("user_state_changed")
def on_state(ev):                 # sync = WORKS
    self.session.say(...)         # returns SpeechHandle directly
```

| Method | Returns | Awaitable? |
|--------|---------|------------|
| `session.say()` | `SpeechHandle` | No |
| `session.generate_reply()` | `SpeechHandle` | No |
| `.on()` callbacks | N/A | Must be sync `def` |

**Incident (2026-02-07):** Ruben was silent on all calls because `.on("user_state_changed")` and `.on("agent_state_changed")` were `async def`. Changed to `def` and calls worked immediately.

### LiveKit Plugin Gotchas

**LiveKit plugins wrap raw provider APIs with different param names.**

| Raw API Param | LiveKit Plugin Param | Plugin | Notes |
|---------------|---------------------|--------|-------|
| `endpointing` | `endpointing_ms` | deepgram | TypeError if wrong name |
| `interim_results` | Default `True` (omit) | deepgram | Redundant to specify |
| `>=1.0` version | Latest is `0.2.5` | noise-cancellation | Check PyPI before pinning |

**Always check plugin source, not raw provider docs.**

**Incident (2026-02-12):** `endpointing=500` crashed with `TypeError: unexpected keyword argument`. Correct: `endpointing_ms=500`.
**Incident (2026-02-12):** Plan specified NC `>=1.0` but package maxes at `0.2.5`. Docker build failed.

### Health Checks

```bash
# API health
curl https://ruben-api.dyniq.ai/health

# Agent registered (check logs)
docker compose logs ruben --tail=20 | grep "registered worker"
```

---

## ElevenLabs Text to Dialogue (Demo Audio)

| Property | Value |
|----------|-------|
| Endpoint | `POST https://api.elevenlabs.io/v1/text-to-dialogue` |
| Model | `eleven_v3` |
| API Key | `dyniq-ai-agents/.env` → `ELEVENLAB_API_KEY` |
| Pricing | ~€0.05/generation |

### Voice Library

| Voice | ID | Accent | Role |
|-------|-----|--------|------|
| Eric Pro | `DUhjXXCXHQWckglMUnOv` | Standard Dutch | Ruben (AI agent) |
| Petra Vlaams | `ANHrhmaFeVN0QJaa0PhL` | Flemish | Lead/client |
| Ruth | `YUdpWWny7k5yb4QCeweX` | Standard Dutch | Alternative female |

**WARNING:** Basic "Eric" (`cjVigY5qzO86Huf0OWal`) is English/American — NOT Dutch. Always use "Eric Pro".

### Audio Tags (v3 model)

| Tag | Effect |
|-----|--------|
| `[laughing]` | Natural laugh |
| `[sighs]` | Sigh/exhale |
| `[excited]` | Energetic delivery |

### CRITICAL: Script Language Influences Voice Accent

ElevenLabs v3 output is influenced by BOTH the voice profile AND the script text. Writing Flemish words ("ge", "da", "hé") in a Standard Dutch voice's script makes it sound Flemish.

**Rule:** Keep Ruben's script in clean Standard Dutch ("u", "dat", "heeft u"). Keep client's script in Flemish ("da", "merci hé", "euh"). This contrast (Standard Dutch AI + Flemish client) is authentic and builds trust.

### Usage Pattern

```bash
# Write JSON to temp file (inline curl fails >1350 bytes)
cat > /tmp/dialogue.json << 'EOF'
{
  "model_id": "eleven_v3",
  "language_code": "nl",
  "inputs": [
    {"text": "Standard Dutch text for Ruben", "voice_id": "DUhjXXCXHQWckglMUnOv"},
    {"text": "Flemish text voor de klant", "voice_id": "ANHrhmaFeVN0QJaa0PhL"}
  ]
}
EOF

curl -X POST "https://api.elevenlabs.io/v1/text-to-dialogue" \
  -H "xi-api-key: $ELEVENLAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/dialogue.json --output output.mp3
```

### Adding Shared Voices to Account

```bash
# 1. Find voice in shared library
curl -s "https://api.elevenlabs.io/v1/shared-voices?search=Petra+Vlaams&language=nl" \
  -H "xi-api-key: $KEY" | jq '.voices[0] | {voice_id, public_owner_id}'

# 2. Add to account
curl -X POST "https://api.elevenlabs.io/v1/voices/add/{public_user_id}/{voice_id}" \
  -H "xi-api-key: $KEY" -H "Content-Type: application/json" \
  -d '{"new_name": "Petra Vlaams"}'
```

### Flemish Accent = Trust Signal (Belgian B2B)

Kantar Belgium 2026 research confirms Flemish accent builds trust with Belgian ICP. The Standard Dutch AI + Flemish client contrast in demo audio signals: "Ruben understands local business."

---

## OpenRouter Image Generation

| Property | Value |
|----------|-------|
| Endpoint | `POST /api/v1/chat/completions` |
| Models | `google/gemini-3-pro-image-preview`, `black-forest-labs/flux.2-pro` |
| Pricing | ~€0.12/image (Gemini), ~€0.05/image (FLUX) |

### Usage

```javascript
// n8n HTTP Request node
{
  "model": "google/gemini-3-pro-image-preview",
  "messages": [{ "role": "user", "content": "Create a professional LinkedIn post image about [topic]" }],
  "modalities": ["image", "text"],  // REQUIRED for image output
  "stream": false
}
```

**Response:** Base64-encoded image in `choices[0].message.images[].imageUrl.url`

**Important:** Gemini 3 Pro Preview can ANALYZE video but CANNOT GENERATE video.

---

## Video Generation

### fal.ai (Kling 3.0 Pro) — Preferred for Image-to-Video

| Property | Value |
|----------|-------|
| URL | https://fal.ai |
| SDK | `pip install fal-client` (Python) |
| Model | `fal-ai/kling-video/v1.6/pro/image-to-video` |
| Pricing | ~$2.24/10s video |

**CRITICAL:** Use Python SDK, NOT REST API. REST status endpoint returns `405 Method Not Allowed`.

```python
import fal_client

result = fal_client.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", arguments={
    "prompt": "Description of motion",
    "image_url": "https://...",
    "duration": "10",
    "aspect_ratio": "1:1"
})
video_url = result["video"]["url"]
```

**Post-processing with ffmpeg:**
```bash
# Crop to 16:9 + compress
ffmpeg -i raw.mp4 -vf "crop=680:384:(iw-680)/2:(ih-384)/2" -c:v libvpx-vp9 -b:v 500k out.webm
ffmpeg -i raw.mp4 -vf "crop=680:384:(iw-680)/2:(ih-384)/2" -c:v libx264 -crf 28 -preset slow out.mp4
```

**Incident (2026-02-12):** Background polling script ran 10 min on REST 405 before timeout. Python SDK works immediately.

### WaveSpeedAI (Alternative)

| Property | Value |
|----------|-------|
| URL | https://wavespeed.ai |
| Models | Kling, Runway Gen-3, Hailuo, Pika |
| Pricing | $0.02-0.12/second depending on model |

| Use Case | Model | Duration | Cost |
|----------|-------|----------|------|
| Fast iteration | Hailuo | 6s | $0.02-0.05/video |
| High quality | Kling | 5-10s | $0.05-0.10/sec |
| Professional/4K | Runway Gen-3 | 10-30s | $0.05-0.12/sec |
| Quick prototypes | Pika | 3-5s | $0.03/gen |

---

## Social Media Platform APIs

### Rate Limits Summary

| Platform | Auth | Rate Limit | Key Constraint |
|----------|------|------------|----------------|
| LinkedIn | OAuth 2.0, 60-day tokens | Partner tier | `w_member_social` scope |
| Instagram | Business account + FB App | 25 posts/24h | Container workflow |
| Facebook | Long-lived page token | 200×users/hr | Page admin required |
| X/Twitter | OAuth 2.0 | 500/mo free, $200/mo for 10K | Expensive at scale |
| YouTube | OAuth 2.0 | 6 videos/day | 1,600 quota units/upload |

**Note:** Full platform API details in `PRD-social-media-ai-army.md`

---

## Content Tracking

### Adding a New Post

```sql
INSERT INTO content_posts (platform, post_url, post_date, hook, topic, content_type, status)
VALUES ('linkedin', 'https://linkedin.com/...', CURRENT_DATE, 'Hook text', 'Topic', 'text', 'published')
RETURNING id;
```

### Updating Daily Metrics

```sql
INSERT INTO content_metrics (post_id, metric_date, likes, comments, shares, impressions)
VALUES ('POST_UUID', CURRENT_DATE, X, X, X, X)
ON CONFLICT (post_id, metric_date)
DO UPDATE SET likes = EXCLUDED.likes, comments = EXCLUDED.comments,
              shares = EXCLUDED.shares, impressions = EXCLUDED.impressions;
```

### Views Available

| View | Purpose |
|------|---------|
| `content_post_performance` | Latest metrics per post with days live |
| `content_platform_summary` | Aggregated stats by platform |
| `content_weekly_trend` | Weekly performance trends |
| `lead_funnel_metrics` | Full conversion funnel |
| `lead_source_performance` | By acquisition source |

---

*Last updated: 2026-02-12 (added ElevenLabs Text to Dialogue, voice IDs, accent discovery)*
