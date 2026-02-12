---
sidebar_position: 8
title: Voice & Content Integrations
description: Voice AI, image generation, video, and social media API integrations
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Voice & Content Integrations

Integration reference for Voice AI, image generation, and content tracking.

## LiveKit Voice (Ruben Agent)

| Property | Value |
|----------|-------|
| Server | `voice.dyniq.ai` |
| API | `ruben-api.dyniq.ai` |
| Framework | LiveKit Agents SDK |

### SIP Trunk Configuration

:::danger Use LiveKit Format
`SIP_TRUNK_ID` must be **LiveKit format** (`ST_xxx`), NOT Twilio format (`TK_xxx`).
:::

| Trunk ID | Region | Number |
|----------|--------|--------|
| ST_adYu999ZU4s4 | Belgium | +3233760183 |
| ST_6tWDM3ZgcLfs | US | +14243830928 |

### LiveKit SDK Callback Rules

LiveKit Agents SDK `.on()` requires **synchronous** callbacks:

```python
# CORRECT - synchronous callback
@self.session.on("user_state_changed")
def on_state(ev):
    self.session.say(...)  # returns SpeechHandle directly

# WRONG - causes silent failure
@self.session.on("user_state_changed")
async def on_state(ev):  # async = BROKEN
    await self.session.say(...)
```

| Method | Returns | Awaitable? |
|--------|---------|------------|
| `session.say()` | `SpeechHandle` | No |
| `session.generate_reply()` | `SpeechHandle` | No |
| `.on()` callbacks | N/A | Must be sync `def` |

### Docker Deployment

```bash
# After changing .env, ALWAYS use force-recreate (not restart)
docker compose up -d --force-recreate ruben ruben-api
```

## Image Generation (OpenRouter)

| Model | ID | Cost | Latency |
|-------|-----|------|---------|
| Gemini 3 Pro Image | `google/gemini-3-pro-image-preview` | ~EUR 0.12/img | ~26s |
| FLUX.2 Pro | `black-forest-labs/flux.2-max` | ~EUR 0.16/img | ~58s |
| FLUX.1 Schnell | `black-forest-labs/flux-schnell` | ~EUR 0.01/img | ~10s |

See [OpenRouter Reference](/docs/developers/infrastructure/openrouter) for response format details.

## Video Generation

| Provider | Models | Cost |
|----------|--------|------|
| WaveSpeedAI | Kling, Runway Gen-3, Hailuo, Pika | EUR 0.02-0.12/sec |

Video generation is async - use webhook callbacks for completion notification.

## Social Media Rate Limits

| Platform | Rate Limit | Key Constraint |
|----------|------------|----------------|
| LinkedIn | Partner tier | `w_member_social` scope, 60-day tokens |
| Instagram | 25 posts/24h | Container workflow via FB App |
| Facebook | 200 x users/hr | Page admin required |
| X/Twitter | 500/mo free | $200/mo for 10K posts |
| YouTube | 6 videos/day | 1,600 quota units/upload |

## Content Tracking

### Recording Posts

```sql
INSERT INTO content_posts (platform, post_url, post_date, hook, topic, content_type, status)
VALUES ('linkedin', 'https://linkedin.com/...', CURRENT_DATE, 'Hook', 'Topic', 'text', 'published');
```

### Updating Metrics

```sql
INSERT INTO content_metrics (post_id, metric_date, likes, comments, shares, impressions)
VALUES ('POST_UUID', CURRENT_DATE, 10, 5, 2, 500)
ON CONFLICT (post_id, metric_date)
DO UPDATE SET likes = EXCLUDED.likes, comments = EXCLUDED.comments;
```

### Analytics Views

| View | Purpose |
|------|---------|
| `content_post_performance` | Latest metrics per post |
| `content_platform_summary` | Aggregated stats by platform |
| `content_weekly_trend` | Weekly performance trends |
| `lead_funnel_metrics` | Full conversion funnel |
