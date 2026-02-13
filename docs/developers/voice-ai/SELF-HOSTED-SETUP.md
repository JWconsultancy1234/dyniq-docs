---
title: "Self-Hosted Voice AI System for DYNIQ"
sidebar_label: "Self-Hosted Voice AI System for DYNIQ"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [voice-ai, auto-synced]
---

# Self-Hosted Voice AI System for DYNIQ

> **Note**: This document was migrated from `dyniq-app/docs/16-SELF-HOSTED-VOICE-AI.md` on January 8, 2026.
> It now lives with the code it documents.

**Version**: 1.1
**Created**: January 2026
**Migrated**: January 8, 2026
**Purpose**: NotebookLM-quality voice AI for lead qualification
**Stack**: LiveKit + Chatterbox TTS + Faster-Whisper STT + OpenAI GPT-4o

---

## Executive Summary

This guide provides a complete A-to-Z setup for a **self-hosted voice AI system** that rivals NotebookLM's natural conversation quality. The system handles:

- **Natural Dutch/Flemish voice** with human-like prosody
- **Barge-in support** (interrupt mid-sentence, <100ms response)
- **Real-time STT** with 4x faster inference
- **Telephony integration** for outbound lead calls

### Why Self-Host?

| Aspect | Managed (Vapi/Retell) | Self-Hosted (This Guide) |
|--------|----------------------|--------------------------|
| Voice Quality | Good | Exceptional (Chatterbox beats ElevenLabs) |
| Latency | 300-500ms | <100ms (local inference) |
| Cost per Call | $0.15-0.30/min | $0.01-0.02/min (compute only) |
| Barge-in | Limited | Full control |
| Data Privacy | 3rd party | 100% on-premise |
| Dutch Quality | Acceptable | Native-level (Chatterbox Multilingual) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SELF-HOSTED VOICE AI STACK                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │   Phone     │───▶│   LiveKit   │───▶│   Agent     │                  │
│  │   (SIP)     │◀───│   Server    │◀───│  (Python)   │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
│         │                                     │                         │
│         │                                     ▼                         │
│         │           ┌─────────────────────────────────────┐             │
│         │           │         VOICE PIPELINE              │             │
│         │           │  ┌───────┐  ┌───────┐  ┌─────────┐  │             │
│         │           │  │ STT   │─▶│  LLM  │─▶│   TTS   │  │             │
│         │           │  │Whisper│  │GPT-4o │  │Chatterbox│ │             │
│         │           │  └───────┘  └───────┘  └─────────┘  │             │
│         │           └─────────────────────────────────────┘             │
│         │                                     │                         │
│         ▼                                     ▼                         │
│  ┌─────────────┐                       ┌─────────────┐                  │
│  │   Twilio    │                       │    n8n      │                  │
│  │  SIP Trunk  │                       │  Webhooks   │                  │
│  └─────────────┘                       └─────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Server Requirements

### Minimum (1-5 concurrent calls)

| Resource | Requirement | Your Contabo |
|----------|-------------|--------------|
| CPU | 4+ cores (x86-64) | 6 vCPU ✅ |
| RAM | 8GB minimum | 12GB ✅ |
| Storage | 50GB SSD | ✅ |
| Network | 100Mbps | ✅ |
| OS | Ubuntu 22.04+ | ✅ |

### GPU Optional
- **With GPU**: Real-time inference, higher concurrency
- **Without GPU (CPU)**: Slightly slower but still excellent with int8 quantization

---

## Part 1: Base Server Setup

### 1.1 Connect to Your Contabo VPS

```bash
ssh root@your-contabo-ip
```

### 1.2 Update System & Install Docker

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Add your user to docker group (if not root)
usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 1.3 Create Project Directory

```bash
mkdir -p /opt/dyniq-voice
cd /opt/dyniq-voice
```

---

## Part 2: LiveKit Server Setup

LiveKit is the real-time communication backbone. It handles WebRTC, SIP, and room management.

### 2.1 Generate LiveKit Configuration

```bash
# Run the official generator
docker run --rm -it -v$PWD:/output livekit/generate

# Follow prompts:
# - Domain: voice.dyniq.ai (or your domain)
# - SSL: Yes (Caddy handles it)
# - TURN: Yes (for NAT traversal)
```

This creates:
- `docker-compose.yaml` - Main compose file
- `livekit.yaml` - Server configuration
- `caddy.yaml` - SSL/TLS reverse proxy
- API Key & Secret (SAVE THESE!)

### 2.2 Manual LiveKit Configuration

If you prefer manual setup, create these files:

**`/opt/dyniq-voice/livekit.yaml`**:

```yaml
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true
  tcp_port: 7881

redis:
  address: redis:6379

keys:
  # Generate with: openssl rand -base64 32
  DYNIQ_API_KEY: YOUR_API_SECRET_HERE

logging:
  level: info
  pion_level: warn

turn:
  enabled: true
  domain: voice.dyniq.ai
  tls_port: 5349
  udp_port: 3478
```

**`/opt/dyniq-voice/docker-compose.yaml`** (base):

```yaml
version: "3.9"

services:
  # Redis for LiveKit
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # LiveKit Server
  livekit:
    image: livekit/livekit-server:latest
    restart: unless-stopped
    ports:
      - "7880:7880"       # HTTP/WebSocket
      - "7881:7881"       # TCP for WebRTC
      - "50000-60000:50000-60000/udp"  # UDP for WebRTC
    volumes:
      - ./livekit.yaml:/livekit.yaml
    command: --config /livekit.yaml
    depends_on:
      redis:
        condition: service_healthy

  # Caddy for SSL (optional if behind existing proxy)
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
    depends_on:
      - livekit

volumes:
  redis-data:
  caddy-data:
  caddy-config:
```

**`/opt/dyniq-voice/Caddyfile`**:

```
voice.dyniq.ai {
    reverse_proxy livekit:7880

    # WebSocket support
    @websocket {
        header Connection *Upgrade*
        header Upgrade websocket
    }
    reverse_proxy @websocket livekit:7880
}
```

### 2.3 Start LiveKit

```bash
cd /opt/dyniq-voice
docker compose up -d

# Check logs
docker compose logs -f livekit
```

---

## Part 3: Faster-Whisper STT (Speech-to-Text)

Faster-Whisper provides 4x faster transcription with int8 quantization on CPU.

### 3.1 Add Faster-Whisper to Docker Compose

Add to `/opt/dyniq-voice/docker-compose.yaml`:

```yaml
  # Faster-Whisper STT
  whisper:
    image: lscr.io/linuxserver/faster-whisper:latest
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Brussels
      - WHISPER_MODEL=large-v3
      - WHISPER_BEAM=5
      - WHISPER_LANG=nl
    volumes:
      - whisper-data:/config
    ports:
      - "10300:10300"
    deploy:
      resources:
        limits:
          memory: 4G

volumes:
  whisper-data:
```

### 3.2 Alternative: Custom Faster-Whisper with int8

For maximum CPU performance, create a custom service:

**`/opt/dyniq-voice/whisper/Dockerfile`**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install faster-whisper uvicorn fastapi

# Download model on first run
COPY server.py .

ENV WHISPER_MODEL=large-v3
ENV WHISPER_DEVICE=cpu
ENV WHISPER_COMPUTE=int8

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**`/opt/dyniq-voice/whisper/server.py`**:

```python
import os
from fastapi import FastAPI, UploadFile
from faster_whisper import WhisperModel
import tempfile

app = FastAPI()

# Load model with int8 quantization for CPU
model = WhisperModel(
    os.getenv("WHISPER_MODEL", "large-v3"),
    device=os.getenv("WHISPER_DEVICE", "cpu"),
    compute_type=os.getenv("WHISPER_COMPUTE", "int8")
)

@app.post("/transcribe")
async def transcribe(audio: UploadFile):
    """Transcribe audio file to text."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp.flush()

        segments, info = model.transcribe(
            tmp.name,
            language="nl",
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=300,
                speech_pad_ms=200
            )
        )

        text = " ".join([segment.text for segment in segments])

        return {
            "text": text,
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration
        }

@app.get("/health")
def health():
    return {"status": "ok", "model": os.getenv("WHISPER_MODEL")}
```

---

## Part 4: Chatterbox TTS (Text-to-Speech)

Chatterbox Multilingual provides exceptional Dutch voice quality.

### 4.1 Add Chatterbox to Docker Compose

Add to `/opt/dyniq-voice/docker-compose.yaml`:

```yaml
  # Chatterbox TTS
  chatterbox:
    build:
      context: ./chatterbox
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "8100:8000"
    environment:
      - DEVICE=cpu
      - MODEL=chatterbox-multilingual
    volumes:
      - chatterbox-models:/app/models
      - chatterbox-voices:/app/voices
    deploy:
      resources:
        limits:
          memory: 4G

volumes:
  chatterbox-models:
  chatterbox-voices:
```

### 4.2 Create Chatterbox Service

**`/opt/dyniq-voice/chatterbox/Dockerfile`**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install \
    torch --index-url https://download.pytorch.org/whl/cpu \
    torchaudio --index-url https://download.pytorch.org/whl/cpu \
    chatterbox-tts \
    fastapi \
    uvicorn \
    python-multipart

COPY server.py .
COPY voices/ /app/voices/

ENV MODEL=chatterbox-multilingual
ENV DEVICE=cpu

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**`/opt/dyniq-voice/chatterbox/server.py`**:

```python
import os
import io
import torch
import torchaudio
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from chatterbox.tts import ChatterboxMultilingualTTS

app = FastAPI(title="Chatterbox TTS API")

# Load model
device = os.getenv("DEVICE", "cpu")
model = ChatterboxMultilingualTTS.from_pretrained(device=device)

# DYNIQ Ruben voice (clone from reference audio)
VOICE_REFERENCE = "/app/voices/ruben_reference.wav"

class TTSRequest(BaseModel):
    text: str
    language: str = "nl"  # Dutch
    exaggeration: float = 0.5  # Emotion intensity

@app.post("/synthesize")
async def synthesize(request: TTSRequest):
    """Generate speech from text in Dutch."""
    try:
        # Load reference voice
        audio_prompt, sr = torchaudio.load(VOICE_REFERENCE)

        # Generate speech
        wav = model.generate(
            text=request.text,
            audio_prompt=audio_prompt,
            language_id=request.language,
            exaggeration=request.exaggeration
        )

        # Convert to bytes
        buffer = io.BytesIO()
        torchaudio.save(buffer, wav.unsqueeze(0), 24000, format="wav")
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "device": device}
```

### 4.3 Add Reference Voice

Create a 10-30 second reference audio of your ideal voice:

```bash
mkdir -p /opt/dyniq-voice/chatterbox/voices

# Option 1: Record your own
# Option 2: Use a professional voice sample
# Option 3: Generate with another TTS and save

# Place the file at:
# /opt/dyniq-voice/chatterbox/voices/ruben_reference.wav
```

---

## Part 5: LiveKit Voice Agent

The agent connects all components: VAD → STT → LLM → TTS.

### 5.1 Create Agent Project

```bash
mkdir -p /opt/dyniq-voice/agent
cd /opt/dyniq-voice/agent
```

**`/opt/dyniq-voice/agent/requirements.txt`**:

```
livekit-agents[silero,turn-detector]~=1.3
livekit-plugins-openai~=0.10
python-dotenv
httpx
```

**`/opt/dyniq-voice/agent/Dockerfile`**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1

CMD ["python", "agent.py", "start"]
```

### 5.2 Create the Voice Agent

**`/opt/dyniq-voice/agent/agent.py`**:

```python
#!/usr/bin/env python3
"""
DYNIQ Voice Agent - NotebookLM Quality
Handles lead qualification calls with natural conversation flow.
"""

import os
import json
import httpx
from dotenv import load_dotenv

from livekit import agents, api
from livekit.agents import AgentSession, Agent, AgentServer
from livekit.plugins import silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()

# ============================================================================
# Custom STT Plugin (Faster-Whisper)
# ============================================================================

class FasterWhisperSTT:
    """Custom STT using self-hosted Faster-Whisper."""

    def __init__(self, url: str = "http://whisper:8000"):
        self.url = url
        self.client = httpx.AsyncClient()

    async def transcribe(self, audio_bytes: bytes) -> str:
        """Transcribe audio to text."""
        files = {"audio": ("audio.wav", audio_bytes, "audio/wav")}
        response = await self.client.post(f"{self.url}/transcribe", files=files)
        result = response.json()
        return result["text"]


# ============================================================================
# Custom TTS Plugin (Chatterbox)
# ============================================================================

class ChatterboxTTS:
    """Custom TTS using self-hosted Chatterbox."""

    def __init__(self, url: str = "http://chatterbox:8000"):
        self.url = url
        self.client = httpx.AsyncClient()

    async def synthesize(self, text: str, language: str = "nl") -> bytes:
        """Convert text to speech."""
        response = await self.client.post(
            f"{self.url}/synthesize",
            json={"text": text, "language": language, "exaggeration": 0.5}
        )
        return response.content


# ============================================================================
# DYNIQ Ruben Agent
# ============================================================================

SYSTEM_PROMPT = """Je bent Ruben, de AI-assistent van DYNIQ. Je klinkt als een echte Vlaamse vrouw, warm en natuurlijk.

## BELANGRIJKSTE REGELS
1. Spreek ALTIJD kort. Max 1-2 zinnen per keer.
2. Laat de klant praten - jij luistert.
3. Wees warm, niet zakelijk.

## Vlaamse Spreekstijl
- Gebruik: "eh", "euhm", "ja kijk", "amai", "allez", "goe bezig"
- Twijfel soms: "hmm, laat me even denken..."
- Bevestig actief: "ja", "oké", "juist", "snap ik", "absoluut"
- Wees warm: "super", "top", "fijn"

## Context
- Lead naam: {firstName}
- Bedrijf: {companyName}
- Quiz score: {quizScore} punten
- Email: {email}

## Opening (max 15 seconden)
"Hallo {firstName}... eh, je spreekt met Ruben van DYNIQ. Je hebt net onze quiz gedaan - {quizScore} punten, niet slecht! Mag ik je resultaten even kort overlopen?"

## Resultaten (kort!)
Als ze ja zeggen:
"Ja kijk, wat ik zie is... euhm... je website zet te weinig bezoekers om naar echte leads. Dat is precies waar we andere installateurs mee helpen. Zij krijgen nu 10 tot 20 leads per maand. Klinkt dat interessant?"

## Afsluiten
"Top! Dan kan Walker je in 15 minuten uitleggen hoe. Zal ik je een link sturen?"

Bij ja: "Perfect, komt eraan. Bedankt {firstName}, fijne dag nog!"
Bij nee: "Helemaal goed, succes met je bedrijf!"

## Objection Handling
- "Hoeveel kost dit?" → "De prijzen beginnen vanaf 497 euro per maand. Walker kan exact vertellen wat past bij jouw situatie."
- "Geen tijd" → "Het gesprek duurt maar 15 minuten en je kiest zelf een moment."
- "Stuur maar email" → "Doe ik! Je ontvangt binnen 5 minuten meer info. Bedankt!"
"""


class DYNIQAgent(Agent):
    """DYNIQ Voice Agent with natural Dutch conversation."""

    def __init__(self, lead_data: dict = None):
        self.lead_data = lead_data or {}

        # Format system prompt with lead data
        instructions = SYSTEM_PROMPT.format(
            firstName=self.lead_data.get("firstName", "daar"),
            companyName=self.lead_data.get("companyName", "je bedrijf"),
            quizScore=self.lead_data.get("quizScore", "70"),
            email=self.lead_data.get("email", "")
        )

        super().__init__(instructions=instructions)


# ============================================================================
# Main Agent Server
# ============================================================================

server = AgentServer()

@server.rtc_session()
async def voice_session(ctx: agents.JobContext):
    """Handle a voice call session."""

    # Parse lead data from job metadata
    lead_data = {}
    if ctx.job.metadata:
        try:
            lead_data = json.loads(ctx.job.metadata)
        except json.JSONDecodeError:
            pass

    # Initialize custom plugins
    stt = FasterWhisperSTT(url=os.getenv("STT_URL", "http://whisper:8000"))
    tts = ChatterboxTTS(url=os.getenv("TTS_URL", "http://chatterbox:8000"))

    # Create session with pipeline
    session = AgentSession(
        stt=stt,
        llm="openai/gpt-4o-mini",  # Or self-host with Ollama
        tts=tts,
        vad=silero.VAD.load(
            min_speech_duration=0.1,
            min_silence_duration=0.3,
            speech_pad_ms=100
        ),
        turn_detection=MultilingualModel(),
    )

    # Start session
    await session.start(
        room=ctx.room,
        agent=DYNIQAgent(lead_data=lead_data),
    )

    # Generate initial greeting
    first_name = lead_data.get("firstName", "daar")
    quiz_score = lead_data.get("quizScore", "70")

    await session.generate_reply(
        instructions=f"Begroet {first_name} en vermeld hun quiz score van {quiz_score} punten."
    )


# ============================================================================
# Outbound Call Handler
# ============================================================================

async def make_outbound_call(phone_number: str, lead_data: dict):
    """Initiate an outbound call to a lead."""

    lkapi = api.LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET")
    )

    import random
    room_name = f"outbound-{''.join(str(random.randint(0, 9)) for _ in range(10))}"

    # Dispatch agent with lead data
    await lkapi.agent_dispatch.create_dispatch(
        api.CreateAgentDispatchRequest(
            agent_name="dyniq-ruben",
            room=room_name,
            metadata=json.dumps(lead_data)
        )
    )

    # Create SIP participant (make the call)
    await lkapi.sip.create_sip_participant(
        api.CreateSIPParticipantRequest(
            room_name=room_name,
            sip_trunk_id=os.getenv("SIP_TRUNK_ID"),
            sip_call_to=phone_number,
            participant_identity=phone_number,
            wait_until_answered=True
        )
    )

    return room_name


if __name__ == "__main__":
    agents.cli.run_app(server)
```

### 5.3 Add Agent to Docker Compose

Add to `/opt/dyniq-voice/docker-compose.yaml`:

```yaml
  # DYNIQ Voice Agent
  agent:
    build:
      context: ./agent
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - LIVEKIT_URL=ws://livekit:7880
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - STT_URL=http://whisper:8000
      - TTS_URL=http://chatterbox:8000
      - SIP_TRUNK_ID=${SIP_TRUNK_ID}
    depends_on:
      - livekit
      - whisper
      - chatterbox
```

---

## Part 6: SIP/Telephony Integration

Connect phone calls via Twilio SIP trunk.

### 6.1 Add SIP Server to Docker Compose

```yaml
  # LiveKit SIP Server
  sip:
    image: livekit/sip:latest
    restart: unless-stopped
    ports:
      - "5060:5060/udp"    # SIP UDP
      - "5060:5060/tcp"    # SIP TCP
    environment:
      - LIVEKIT_URL=ws://livekit:7880
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
    volumes:
      - ./sip-config.yaml:/etc/livekit-sip/config.yaml
    depends_on:
      - livekit
```

### 6.2 Configure Twilio SIP Trunk

**`/opt/dyniq-voice/sip-config.yaml`**:

```yaml
sip:
  # Trunk configuration
  trunks:
    - id: twilio-trunk
      name: "Twilio Belgium"
      # Inbound
      inbound:
        addresses:
          - "*.pstn.twilio.com"
        auth_username: ""
        auth_password: ""
      # Outbound
      outbound:
        address: "your-sip-domain.pstn.twilio.com"
        auth_username: "${TWILIO_SIP_USERNAME}"
        auth_password: "${TWILIO_SIP_PASSWORD}"
        from: "+32460953396"

  # Dispatch rules
  dispatch_rules:
    - name: "all-inbound"
      trunk_ids: ["twilio-trunk"]
      dispatch:
        agent_name: "dyniq-ruben"
```

### 6.3 Twilio Configuration

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Elastic SIP Trunking** → **Create Trunk**
3. Under **Origination**:
   - URI: `sip:voice.dyniq.ai:5060;transport=udp`
4. Under **Termination**:
   - Create credentials
   - Note the SIP domain

---

## Part 7: n8n Integration

Connect ScoreApp → n8n → Voice Agent.

### 7.1 n8n Webhook for Outbound Calls

Create workflow in n8n:

```json
{
  "name": "Voice AI Trigger",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "voice-call-trigger",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Extract Lead Data",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {"name": "firstName", "value": "={{$json.first_name}}"},
            {"name": "companyName", "value": "={{$json.company}}"},
            {"name": "phone", "value": "={{$json.phone}}"},
            {"name": "quizScore", "value": "={{$json.score}}"},
            {"name": "email", "value": "={{$json.email}}"}
          ]
        }
      }
    },
    {
      "name": "Trigger Voice Call",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://agent:8000/call",
        "method": "POST",
        "body": {
          "phone_number": "={{$json.phone}}",
          "lead_data": {
            "firstName": "={{$json.firstName}}",
            "companyName": "={{$json.companyName}}",
            "quizScore": "={{$json.quizScore}}",
            "email": "={{$json.email}}"
          }
        }
      }
    },
    {
      "name": "Log to NocoDB",
      "type": "n8n-nodes-base.nocoDb",
      "parameters": {
        "operation": "create",
        "table": "voice_calls"
      }
    }
  ]
}
```

### 7.2 Add API Endpoint to Agent

Add to `/opt/dyniq-voice/agent/agent.py`:

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

api = FastAPI()

class CallRequest(BaseModel):
    phone_number: str
    lead_data: dict

@api.post("/call")
async def trigger_call(request: CallRequest, background_tasks: BackgroundTasks):
    """Trigger an outbound voice call."""
    background_tasks.add_task(
        make_outbound_call,
        request.phone_number,
        request.lead_data
    )
    return {"status": "call_initiated", "phone": request.phone_number}

@api.get("/health")
def health():
    return {"status": "ok"}
```

Update Dockerfile to run both:

```dockerfile
CMD ["sh", "-c", "uvicorn agent:api --host 0.0.0.0 --port 8000 & python agent.py start"]
```

---

## Part 8: Complete Docker Compose

**`/opt/dyniq-voice/docker-compose.yaml`** (final):

```yaml
version: "3.9"

services:
  # Redis for LiveKit
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # LiveKit Server
  livekit:
    image: livekit/livekit-server:latest
    restart: unless-stopped
    ports:
      - "7880:7880"
      - "7881:7881"
      - "50000-60000:50000-60000/udp"
    volumes:
      - ./livekit.yaml:/livekit.yaml
    command: --config /livekit.yaml
    depends_on:
      redis:
        condition: service_healthy

  # LiveKit SIP Server
  sip:
    image: livekit/sip:latest
    restart: unless-stopped
    ports:
      - "5060:5060/udp"
      - "5060:5060/tcp"
    environment:
      - LIVEKIT_URL=ws://livekit:7880
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
    volumes:
      - ./sip-config.yaml:/etc/livekit-sip/config.yaml
    depends_on:
      - livekit

  # Faster-Whisper STT (CPU with int8)
  whisper:
    build:
      context: ./whisper
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "10300:8000"
    environment:
      - WHISPER_MODEL=large-v3
      - WHISPER_DEVICE=cpu
      - WHISPER_COMPUTE=int8
    volumes:
      - whisper-models:/root/.cache/huggingface
    deploy:
      resources:
        limits:
          memory: 4G

  # Chatterbox TTS (CPU)
  chatterbox:
    build:
      context: ./chatterbox
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "8100:8000"
    environment:
      - DEVICE=cpu
    volumes:
      - chatterbox-models:/root/.cache/huggingface
      - ./chatterbox/voices:/app/voices
    deploy:
      resources:
        limits:
          memory: 4G

  # DYNIQ Voice Agent
  agent:
    build:
      context: ./agent
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "8200:8000"
    environment:
      - LIVEKIT_URL=ws://livekit:7880
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - STT_URL=http://whisper:8000
      - TTS_URL=http://chatterbox:8000
      - SIP_TRUNK_ID=${SIP_TRUNK_ID}
    depends_on:
      - livekit
      - whisper
      - chatterbox

  # Caddy Reverse Proxy
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
    depends_on:
      - livekit
      - agent

volumes:
  redis-data:
  whisper-models:
  chatterbox-models:
  caddy-data:
  caddy-config:
```

---

## Part 9: Environment Variables

**`/opt/dyniq-voice/.env`**:

```bash
# LiveKit (generated or from livekit/generate)
LIVEKIT_API_KEY=DYNIQ_API_KEY
LIVEKIT_API_SECRET=your-32-char-secret-here
LIVEKIT_URL=wss://voice.dyniq.ai

# OpenAI (for GPT-4o LLM)
OPENAI_API_KEY=sk-xxx

# Twilio SIP
TWILIO_SIP_USERNAME=your-sip-username
TWILIO_SIP_PASSWORD=your-sip-password
SIP_TRUNK_ID=twilio-trunk

# n8n Webhook
N8N_WEBHOOK_URL=https://automation.dyniq.ai/webhook
```

---

## Part 10: Deployment Steps

### 10.1 Full Deployment

```bash
cd /opt/dyniq-voice

# Create directory structure
mkdir -p whisper chatterbox/voices agent

# Create all files as shown above
# (livekit.yaml, docker-compose.yaml, Caddyfile, etc.)

# Copy reference voice
# cp /path/to/ruben_reference.wav chatterbox/voices/

# Set environment variables
cp .env.example .env
nano .env  # Edit with your values

# Build and start
docker compose build
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

### 10.2 DNS Configuration

Add A records:

```
voice.dyniq.ai    →    YOUR_CONTABO_IP
sip.dyniq.ai      →    YOUR_CONTABO_IP
```

### 10.3 Firewall Rules

```bash
# UFW (if enabled)
ufw allow 80/tcp     # HTTP (Caddy)
ufw allow 443/tcp    # HTTPS (Caddy)
ufw allow 7880/tcp   # LiveKit HTTP
ufw allow 7881/tcp   # LiveKit TCP
ufw allow 5060/udp   # SIP UDP
ufw allow 5060/tcp   # SIP TCP
ufw allow 50000:60000/udp  # WebRTC UDP
```

---

## Part 11: Testing

### 11.1 Test STT

```bash
# Record a test audio
curl -X POST "http://localhost:10300/transcribe" \
  -F "audio=@test.wav"
```

### 11.2 Test TTS

```bash
curl -X POST "http://localhost:8100/synthesize" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hallo, dit is een test van Chatterbox.", "language": "nl"}' \
  --output test_output.wav

# Play the audio
aplay test_output.wav
```

### 11.3 Test Voice Call

```bash
# Trigger via n8n webhook
curl -X POST "https://automation.dyniq.ai/webhook/voice-call-trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jan",
    "company": "Test Bedrijf",
    "phone": "+32470123456",
    "score": "75",
    "email": "jan@test.be"
  }'
```

---

## Part 12: Optimization Tips

### 12.1 CPU Performance

For your 6 vCPU Contabo:

```yaml
# whisper service
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G

# chatterbox service
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G

# agent service
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 2G
```

### 12.2 Use Turbo Models

For faster inference:
- **Whisper**: Use `small` or `medium` instead of `large-v3`
- **Chatterbox**: Use `chatterbox-turbo` (350M params vs 500M)

### 12.3 Concurrent Calls

With 12GB RAM + 6 vCPU:
- **Conservative**: 1-2 concurrent calls
- **Optimized**: 3-5 concurrent calls

---

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| High latency | Use smaller Whisper model, enable VAD |
| Poor voice quality | Increase Chatterbox exaggeration, use better reference audio |
| Calls not connecting | Check SIP firewall rules, verify Twilio trunk config |
| Out of memory | Reduce model sizes, add swap space |
| No transcription | Check Whisper logs, verify audio format |

### Check Logs

```bash
docker compose logs whisper
docker compose logs chatterbox
docker compose logs agent
docker compose logs livekit
docker compose logs sip
```

---

## Cost Analysis

| Component | Monthly Cost |
|-----------|-------------|
| Contabo VPS (existing) | €15 |
| Twilio SIP Trunk | €5 |
| Twilio Minutes (~100 calls) | €10-15 |
| OpenAI API (GPT-4o-mini) | €5-10 |
| **Total** | **~€35-45/month** |

**Compared to managed solutions**: €150-300/month for same volume

---

## Next Steps

1. [ ] Set up Contabo VPS with Docker
2. [ ] Deploy LiveKit + STT + TTS stack
3. [ ] Configure Twilio SIP trunk
4. [ ] Record Ruben reference voice
5. [ ] Connect n8n webhook
6. [ ] Test full call flow
7. [ ] Fine-tune VAD thresholds
8. [ ] Monitor and optimize

---

## Resources

- [LiveKit Docs](https://docs.livekit.io)
- [LiveKit Agents](https://github.com/livekit/agents)
- [Chatterbox TTS](https://github.com/resemble-ai/chatterbox)
- [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper)
- [Twilio SIP Trunking](https://www.twilio.com/docs/sip-trunking)

---

*Created: January 2026*
*For: DYNIQ.AI Self-Hosted Voice AI*
*Quality Level: NotebookLM-equivalent*
