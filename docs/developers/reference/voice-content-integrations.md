---
title: "Voice & Content Integration Reference"
sidebar_label: "Voice & Content Integration Reference"
owner: walker
last_review: 2026-02-12
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

### Health Checks

```bash
# API health
curl https://ruben-api.dyniq.ai/health

# Agent registered (check logs)
docker compose logs ruben --tail=20 | grep "registered worker"
```

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

## Video Generation (WaveSpeedAI)

| Property | Value |
|----------|-------|
| URL | https://wavespeed.ai |
| Models | Kling, Runway Gen-3, Hailuo, Pika |
| Pricing | €0.02-0.12/second depending on model |
| Alternative | DiffusionRouter (diffusionrouter.ai) |

### Model Recommendations

| Use Case | Model | Duration | Cost |
|----------|-------|----------|------|
| Fast iteration | Hailuo | 6s | €0.02-0.05/video |
| High quality | Kling | 5-10s | €0.05-0.10/sec |
| Professional/4K | Runway Gen-3 | 10-30s | €0.05-0.12/sec |
| Quick prototypes | Pika | 3-5s | €0.03/gen |

### Usage Pattern

Video generation is async - use webhook callbacks:
1. Submit generation request
2. Receive job ID
3. Webhook fires on completion
4. Download video from provided URL

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

*Last updated: 2026-02-06*
