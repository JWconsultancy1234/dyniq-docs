---
sidebar_position: 7
title: Voice AI Setup
description: Self-hosted voice AI system with LiveKit, STT, and TTS
doc_owner: CTO
review_cycle: 30d
doc_status: published
---

# Self-Hosted Voice AI Setup

Complete guide for deploying the DYNIQ self-hosted voice AI system.

## Why Self-Host?

| Aspect | Managed (Vapi/Retell) | Self-Hosted |
|--------|----------------------|-------------|
| Voice Quality | Good | Exceptional |
| Latency | 300-500ms | < 100ms |
| Cost per Call | $0.15-0.30/min | $0.01-0.02/min |
| Data Privacy | 3rd party | 100% on-premise |

## Architecture

```
┌────────────────────────────────────────────────────┐
│              SELF-HOSTED VOICE AI STACK             │
├────────────────────────────────────────────────────┤
│  Phone (SIP) ──> LiveKit Server ──> Agent (Python) │
│       │                                  │         │
│       │            VOICE PIPELINE        │         │
│       │         STT ──> LLM ──> TTS     │         │
│       │                                  │         │
│       v                                  v         │
│  Twilio SIP Trunk              n8n Webhooks        │
└────────────────────────────────────────────────────┘
```

## Server Requirements

| Resource | Minimum (1-5 calls) |
|----------|---------------------|
| CPU | 4+ cores (x86-64) |
| RAM | 8GB minimum |
| Storage | 50GB SSD |
| Network | 100Mbps |
| OS | Ubuntu 22.04+ |

## Docker Compose Stack

The complete stack includes these services:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| redis | redis:7-alpine | - | LiveKit state |
| livekit | livekit/livekit-server | 7880 | WebRTC/SIP |
| sip | livekit/sip | 5060 | SIP telephony |
| whisper | Custom build | 10300 | Speech-to-text |
| chatterbox | Custom build | 8100 | Text-to-speech |
| agent | Custom build | 8200 | Voice agent |
| caddy | caddy:2-alpine | 80/443 | SSL proxy |

## Step 1: LiveKit Configuration

```yaml
# livekit.yaml
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true
  tcp_port: 7881
redis:
  address: redis:6379
keys:
  DYNIQ_API_KEY: YOUR_API_SECRET_HERE
turn:
  enabled: true
  domain: voice.dyniq.ai
```

## Step 2: Faster-Whisper STT

CPU-optimized speech-to-text with int8 quantization:

```yaml
# docker-compose.yml (excerpt)
whisper:
  build: ./whisper
  environment:
    - WHISPER_MODEL=large-v3
    - WHISPER_DEVICE=cpu
    - WHISPER_COMPUTE=int8
  deploy:
    resources:
      limits:
        memory: 4G
```

## Step 3: TTS Service

Text-to-speech with voice cloning support:

```yaml
chatterbox:
  build: ./chatterbox
  environment:
    - DEVICE=cpu
  volumes:
    - ./chatterbox/voices:/app/voices
  deploy:
    resources:
      limits:
        memory: 4G
```

## Step 4: Voice Agent

The Python agent connects STT -> LLM -> TTS:

```python
session = AgentSession(
    stt=stt,
    llm="openai/gpt-4o-mini",
    tts=tts,
    vad=silero.VAD.load(
        min_speech_duration=0.1,
        min_silence_duration=0.3,
    ),
    turn_detection=MultilingualModel(),
)
```

## Step 5: SIP/Telephony

Configure Twilio SIP trunk for phone connectivity:

1. Create SIP Trunk in Twilio Console
2. Set Origination URI: `sip:voice.dyniq.ai:5060;transport=udp`
3. Configure SIP service in Docker Compose

## Step 6: Environment Variables

```bash
LIVEKIT_API_KEY=DYNIQ_API_KEY
LIVEKIT_API_SECRET=your-secret
LIVEKIT_URL=wss://voice.dyniq.ai
OPENAI_API_KEY=sk-xxx
SIP_TRUNK_ID=ST_xxx  # LiveKit format, NOT Twilio TK_xxx
```

## Step 7: Deploy

```bash
cd /opt/dyniq-voice
docker compose build
docker compose up -d
docker compose ps  # Verify all healthy
```

## Testing

```bash
# Test STT
curl -X POST "http://localhost:10300/transcribe" -F "audio=@test.wav"

# Test TTS
curl -X POST "http://localhost:8100/synthesize" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hallo, dit is een test.", "language": "nl"}' \
  --output test.wav

# Test full call via webhook
curl -X POST "https://automation.dyniq.ai/webhook/voice-call-trigger" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Jan", "phone": "+32470123456", "score": "75"}'
```

## Cost Analysis

| Component | Monthly Cost |
|-----------|-------------|
| Contabo VPS | ~EUR 15 |
| Twilio SIP + Minutes | ~EUR 15-20 |
| OpenAI API | ~EUR 5-10 |
| **Total** | **~EUR 35-45** |

Compared to managed solutions: EUR 150-300/month for same volume.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| High latency | Use smaller Whisper model, enable VAD |
| Poor voice quality | Improve reference audio, adjust exaggeration |
| Calls not connecting | Check SIP firewall rules (5060/udp, 50000-60000/udp) |
| Out of memory | Reduce model sizes, add swap space |

:::tip LiveKit Callback Rule
LiveKit Agents SDK `.on()` callbacks **must be synchronous** (`def`, not `async def`). Using `async def` causes silent failure - the agent won't respond to speech.
:::
