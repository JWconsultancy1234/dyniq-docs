---
title: "Voice Agent Implementation SOP"
sidebar_label: "Voice Agent Implementation SOP"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [voice-ai, auto-synced]
---

# Voice Agent Implementation SOP

**Standard Operating Procedure for DYNIQ Voice Agent Deployments**

Version: 1.0
Last Updated: January 2026
Based on: LiveKit Agents Framework + Industry Best Practices

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Discovery & Requirements](#phase-1-discovery--requirements)
3. [Phase 2: Infrastructure Setup](#phase-2-infrastructure-setup)
4. [Phase 3: Agent Development](#phase-3-agent-development)
5. [Phase 4: Testing & QA](#phase-4-testing--qa)
6. [Phase 5: Deployment & Handoff](#phase-5-deployment--handoff)
7. [Templates](#templates)
8. [Checklists](#checklists)

---

## Overview

### Purpose

This SOP provides a repeatable process for implementing voice AI agents for DYNIQ customers. Each agent follows the same architecture (Vertical Slice Architecture) and tech stack, enabling rapid deployment and maintainability.

### Tech Stack (Standard)

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | LiveKit Agents | Real-time voice infrastructure |
| **STT** | Deepgram Nova 2 | Speech-to-text (phone-optimized) |
| **TTS** | Cartesia Sonic | Text-to-speech (natural voice) |
| **LLM** | GPT-4o-mini via OpenRouter | Conversational intelligence |
| **Database** | PostgreSQL + PGVector | RAG knowledge base |
| **Telephony** | Twilio/Telnyx SIP Trunk | Inbound/outbound calls |
| **Automation** | n8n | Webhooks, notifications |

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                     VERTICAL SLICE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  agents/{customer}_voice/                                           │
│  ├── agent.py              # Main agent class + function_tools      │
│  ├── config.py             # System prompt + settings               │
│  ├── __main__.py           # CLI entrypoint                         │
│  └── features/             # Feature slices                         │
│      ├── booking/          # Calendar integration                   │
│      ├── knowledge/        # RAG search                             │
│      ├── notifications/    # SMS/WhatsApp/Email                     │
│      ├── qualification/    # Lead scoring                           │
│      └── call_handling/    # Session lifecycle                      │
│                                                                      │
│  shared/                   # Cross-agent utilities                  │
│  ├── providers/            # STT/TTS/LLM wrappers                   │
│  ├── integrations/         # Cal.com, n8n, CRM                      │
│  ├── knowledge/            # RAG infrastructure                     │
│  └── types/                # Shared models                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Discovery & Requirements

**Duration**: 1-2 hours
**Owner**: Project Lead
**Output**: Completed Customer Intake Form

### 1.1 Customer Intake Meeting

Gather all information needed to configure the agent:

#### Business Information
- [ ] Company name
- [ ] Industry/vertical
- [ ] Target market (B2B/B2C)
- [ ] Primary language(s)
- [ ] Operating hours

#### Use Case Definition
- [ ] Agent purpose (lead qualification, support, booking, etc.)
- [ ] Call flow description
- [ ] Success criteria (bookings/day, resolution rate, etc.)
- [ ] Fallback strategy (WhatsApp, email, human handoff)

#### Integration Requirements
- [ ] Calendar system (Cal.com, Calendly, Google Calendar)
- [ ] CRM (HubSpot, NocoDB, Airtable)
- [ ] Notification channels (WhatsApp, SMS, Email)
- [ ] Lead source (ScoreApp, Typeform, website form)

#### Voice & Personality
- [ ] Agent name
- [ ] Voice characteristics (age, gender, accent)
- [ ] Personality traits (professional, friendly, casual)
- [ ] Key phrases/vocabulary
- [ ] Things to avoid saying

#### Knowledge Base
- [ ] FAQ documents
- [ ] Product/service information
- [ ] Pricing details
- [ ] Company policies
- [ ] Common objections & responses

### 1.2 Deliverable: Customer Profile

```yaml
# customer_profile.yaml
customer:
  name: "Example BV"
  industry: "installatie"
  language: "nl-BE"
  timezone: "Europe/Brussels"

agent:
  name: "Ruben"
  purpose: "lead_qualification"
  personality:
    age_range: "35-50"
    traits: ["warm", "professional", "helpful"]
    accent: "Flemish"
  voice_id: "dutch_female_warm"  # Cartesia voice

integrations:
  calendar:
    provider: "calcom"
    event_type_id: 123456
  crm:
    provider: "nocodb"
    webhook_url: "https://..."
  notifications:
    whatsapp: true
    sms: false
    email: true

call_flow:
  trigger: "scoreapp_webhook"
  greeting: "discuss_quiz_results"
  goal: "book_appointment"
  fallback: "send_whatsapp_link"
  max_duration_seconds: 180

success_metrics:
  - "bookings_per_week >= 5"
  - "answer_rate >= 50%"
  - "call_duration_avg <= 3min"
```

---

## Phase 2: Infrastructure Setup

**Duration**: 2-4 hours
**Owner**: DevOps/Developer
**Output**: Working infrastructure ready for agent

### 2.1 LiveKit Setup

#### Cloud (Recommended for Production)
```bash
# Create LiveKit Cloud project at https://cloud.livekit.io
# Get credentials:
# - LIVEKIT_URL (wss://xxx.livekit.cloud)
# - LIVEKIT_API_KEY
# - LIVEKIT_API_SECRET
```

#### Self-Hosted (Cost Optimization)
```yaml
# docker-compose.livekit.yml
services:
  livekit:
    image: livekit/livekit-server:latest
    command: --config /etc/livekit.yaml
    ports:
      - "7880:7880"   # HTTP
      - "7881:7881"   # RTC/UDP
      - "7882:7882"   # TURN/UDP
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml
```

### 2.2 SIP Trunk Configuration

#### Twilio Setup
```bash
# 1. Create Twilio account
# 2. Buy phone number (Belgian: +32)
# 3. Create Elastic SIP Trunk
# 4. Configure termination URI: {customer}.pstn.twilio.com
# 5. Set credentials
```

#### LiveKit SIP Trunk (Outbound)
```json
{
  "trunk": {
    "name": "{customer}-outbound",
    "address": "{customer}.pstn.twilio.com",
    "numbers": ["+32xxxxxxxxx"],
    "authUsername": "<twilio_username>",
    "authPassword": "<twilio_password>"
  }
}
```

#### LiveKit SIP Trunk (Inbound)
```json
{
  "trunk": {
    "name": "{customer}-inbound",
    "numbers": ["+32xxxxxxxxx"],
    "krisp_enabled": true
  },
  "dispatch_rule": {
    "type": "individual",
    "rule_type": "agent_dispatch",
    "room_prefix": "inbound-call-",
    "agent_name": "{customer}-voice-agent"
  }
}
```

### 2.3 Database Setup

#### PostgreSQL with PGVector
```sql
-- docker/init.sql (applied on first boot)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    source_file TEXT,
    chunk_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding
ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Semantic search function
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding vector(1536),
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id INT,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kc.id,
        kc.content,
        kc.metadata,
        1 - (kc.embedding <=> query_embedding) AS similarity
    FROM knowledge_chunks kc
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

### 2.4 Environment Configuration

```bash
# .env.{customer}
# ============================================
# LiveKit
# ============================================
LIVEKIT_URL=wss://voice.dyniq.ai
LIVEKIT_API_KEY=<generated>
LIVEKIT_API_SECRET=<generated>

# ============================================
# AI Providers
# ============================================
OPENROUTER_API_KEY=<from openrouter.ai>
OPENAI_API_KEY=<from openai.com>
DEEPGRAM_API_KEY=<from deepgram.com>
CARTESIA_API_KEY=<from cartesia.ai>

# ============================================
# Integrations
# ============================================
CALCOM_API_KEY=<from cal.com>
CALCOM_EVENT_TYPE_ID=<event_type_id>
N8N_WEBHOOK_URL=https://automation.dyniq.ai/webhook/{customer}

# ============================================
# Database
# ============================================
DATABASE_URL=postgresql://user:pass@host:5432/{customer}_db

# ============================================
# Telephony
# ============================================
SIP_TRUNK_ID={customer}-outbound
TWILIO_ACCOUNT_SID=<from twilio>
TWILIO_AUTH_TOKEN=<from twilio>
```

### 2.5 Infrastructure Checklist

- [ ] LiveKit server accessible (cloud or self-hosted)
- [ ] SIP trunk configured (inbound + outbound)
- [ ] Phone number provisioned
- [ ] PostgreSQL with PGVector extension
- [ ] Knowledge base schema created
- [ ] Environment variables set
- [ ] n8n workflows created
- [ ] Calendar integration tested

---

## Phase 3: Agent Development

**Duration**: 4-8 hours
**Owner**: Developer
**Output**: Functional agent ready for testing

### 3.1 Create Agent Structure

```bash
# Create new agent directory
mkdir -p agents/{customer}_voice/features/{booking,knowledge,notifications,qualification,call_handling}
touch agents/{customer}_voice/__init__.py
touch agents/{customer}_voice/agent.py
touch agents/{customer}_voice/config.py
touch agents/{customer}_voice/__main__.py
```

### 3.2 System Prompt Template

```python
# agents/{customer}_voice/config.py
"""
{Customer} Voice Agent Configuration
"""

SYSTEM_PROMPT = """
# Identity
Je bent {agent_name}, de virtuele assistent van {company_name}.
Je bent {personality_traits}.

# Context
Je belt met {first_name} ({industry}).
Quiz score: {quiz_score} punten.

# Doel
{primary_goal}

# Regels
1. Spreek kort en bondig - max 2 zinnen per keer
2. Wees vriendelijk maar professioneel
3. {custom_rules}

# Tools
Je hebt toegang tot:
- check_available_slots: Bekijk beschikbare tijden
- book_appointment: Boek een afspraak
- send_booking_link: Stuur WhatsApp met booking link
- search_knowledge: Zoek in kennisbank
- end_call_gracefully: Sluit gesprek af

# Call Flow
1. Begroeting + vermeld quiz score
2. Bespreek resultaten kort
3. Bied specifiek tijdstip aan
4. Als JA → book_appointment
5. Als NEE → send_booking_link
6. Bedank en sluit af
"""

# Voice settings
VOICE_CONFIG = {
    "voice_id": "{cartesia_voice_id}",
    "speed": 0.95,  # Slightly slower for phone clarity
    "language": "{language_code}",
}

# STT settings (phone-optimized)
STT_CONFIG = {
    "model": "nova-2-phonecall",
    "language": "{language_code}",
    "smart_format": True,
    "punctuate": True,
}
```

### 3.3 Agent Class Template

```python
# agents/{customer}_voice/agent.py
"""
{Customer} Voice Agent - {Purpose}
"""

from livekit.agents import Agent, function_tool, RunContext

from shared.utils.config import config
from shared.utils.logging import get_logger
from shared.types.lead import Lead
from shared.integrations.calcom import CalcomBooking
from shared.integrations.n8n import N8nWebhooks
from shared.knowledge.rag import KnowledgeBase

from agents.{customer}_voice.config import SYSTEM_PROMPT

logger = get_logger("{customer}-agent")


class {Customer}Agent(Agent):
    """DYNIQ {Customer} - {Purpose} voice agent."""

    def __init__(self, lead: Lead):
        self.lead = lead
        self.booking = CalcomBooking(config.calcom_api_key, config.calcom_event_type_id)
        self.notifications = N8nWebhooks(config.n8n_webhook_url)
        self.knowledge = KnowledgeBase(config.database_url)

        # Format system prompt
        instructions = SYSTEM_PROMPT.format(
            first_name=lead.first_name,
            quiz_score=lead.quiz_score,
            industry=lead.industry,
            # ... other context
        )

        super().__init__(instructions=instructions)

    async def on_enter(self):
        """Called when agent joins session."""
        await self.knowledge.connect()
        await self.session.generate_reply(
            instructions=f"Begroet {self.lead.first_name} en vermeld hun quiz score."
        )

    async def on_exit(self):
        """Cleanup resources."""
        await self.notifications.call_completed(
            self.lead.phone,
            self.lead.first_name
        )
        await self.booking.close()
        await self.notifications.close()
        await self.knowledge.close()
        logger.info(f"Call ended with {self.lead.first_name}")

    # =========================================================================
    # Function Tools - Define based on customer requirements
    # =========================================================================

    @function_tool
    async def check_available_slots(self, context: RunContext) -> str:
        """Check available time slots."""
        slots = await self.booking.get_available_slots()
        if not slots:
            return "Geen slots beschikbaar. Bied WhatsApp link aan."
        return f"Beschikbare tijden: {', '.join(slots[:4])}"

    @function_tool
    async def book_appointment(self, context: RunContext, slot_time: str) -> str:
        """Book appointment at specific time."""
        result = await self.booking.book_slot(
            slot_time,
            self.lead.first_name,
            self.lead.email,
            self.lead.phone
        )
        if result.get("success"):
            return f"Geboekt voor {slot_time}. Bevestig en sluit af."
        return f"Kon niet boeken: {result.get('error')}. Bied WhatsApp aan."

    @function_tool
    async def send_booking_link(self, context: RunContext) -> str:
        """Send WhatsApp with booking link."""
        success = await self.notifications.send_booking_link(
            self.lead.phone,
            self.lead.first_name
        )
        if success:
            return "WhatsApp verstuurd. Bevestig en sluit af."
        return "Kon niet versturen. Vraag of ze email willen."

    @function_tool
    async def search_knowledge(self, context: RunContext, query: str) -> str:
        """Search knowledge base."""
        result = await self.knowledge.search(query)
        return f"Info gevonden:\n{result}\n\nGebruik dit om kort te antwoorden."

    @function_tool
    async def end_call_gracefully(self, context: RunContext) -> str:
        """End call with friendly goodbye."""
        return "Sluit vriendelijk af: 'Bedankt, fijne dag!'"
```

### 3.4 Session Configuration

```python
# agents/{customer}_voice/features/call_handling/session.py
"""
Session configuration for {Customer} voice calls.
Optimized for telephony.
"""

from livekit.agents import AgentSession
from livekit.plugins import silero

from shared.providers.deepgram import create_stt
from shared.providers.cartesia import create_tts
from shared.providers.openai import create_llm


async def create_session() -> AgentSession:
    """Create telephony-optimized AgentSession."""

    # STT: Phone-optimized model
    stt = create_stt(
        model="nova-2-phonecall",
        language="nl",
        smart_format=True,
        punctuate=True,
    )

    # TTS: Slightly slower for phone clarity
    tts = create_tts(speed=0.95)

    # LLM: Fast, conversational
    llm = create_llm(temperature=0.8)

    # VAD: Tuned for phone latency
    vad = silero.VAD.load(
        min_speech_duration=0.1,
        min_silence_duration=0.4,  # Higher for phone
        activation_threshold=0.5,
    )

    return AgentSession(stt=stt, tts=tts, llm=llm, vad=vad)
```

### 3.5 Entrypoint with Noise Cancellation

```python
# agents/{customer}_voice/features/call_handling/entrypoint.py
"""
LiveKit agent entrypoint.
"""

import json
from livekit import agents, rtc
from livekit.agents import RoomInputOptions

from shared.types.lead import Lead
from shared.utils.logging import get_logger

from agents.{customer}_voice.agent import {Customer}Agent
from agents.{customer}_voice.features.call_handling.session import create_session

logger = get_logger("{customer}-entrypoint")


async def entrypoint(ctx: agents.JobContext):
    """Main entrypoint for voice agent."""

    # Parse lead data
    lead_data = {}
    if ctx.job.metadata:
        try:
            lead_data = json.loads(ctx.job.metadata)
        except json.JSONDecodeError:
            logger.warning("Could not parse job metadata")

    lead = Lead.from_dict(lead_data)
    logger.info(f"Starting call with: {lead.first_name}")

    await ctx.connect()

    session = await create_session()
    agent = {Customer}Agent(lead)

    # Configure noise cancellation for telephony
    room_input_options = RoomInputOptions()
    try:
        from livekit.plugins import noise_cancellation
        room_input_options = RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        )
        logger.info("Noise cancellation enabled")
    except ImportError:
        logger.warning("Noise cancellation not available")

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=room_input_options,
    )
```

### 3.6 Ingest Knowledge Base

```bash
# Create knowledge documents
mkdir -p shared/knowledge/documents/{customer}

# Add markdown files with customer knowledge
# - services.md
# - pricing.md
# - faq.md
# - policies.md

# Run ingestion
python -m shared.knowledge.ingest \
    --documents shared/knowledge/documents/{customer} \
    --clean
```

---

## Phase 4: Testing & QA

**Duration**: 2-4 hours
**Owner**: Developer + QA
**Output**: Verified agent ready for production

### 4.1 Console Mode Testing

```bash
# Test without audio (text-based)
python -m agents.{customer}_voice console

# Test scenarios:
# 1. Happy path - customer books immediately
# 2. Hesitant customer - needs WhatsApp fallback
# 3. Questions about pricing/services
# 4. Voicemail detection
# 5. Invalid phone number
```

### 4.2 Audio Testing

```bash
# Test with microphone
python -m agents.{customer}_voice audio

# Check:
# - Voice sounds natural
# - Interruptions work correctly
# - Silence detection appropriate
# - No audio artifacts
```

### 4.3 Integration Testing

| Test | Expected Result | Pass/Fail |
|------|-----------------|-----------|
| Book appointment | Cal.com event created | [ ] |
| Send WhatsApp | n8n webhook triggered | [ ] |
| Search knowledge | Relevant results returned | [ ] |
| End call | Metrics logged to n8n | [ ] |
| Invalid lead | Graceful error handling | [ ] |

### 4.4 Load Testing

```bash
# Simulate multiple concurrent calls
python scripts/load_test.py --calls 5 --concurrent 2
```

### 4.5 QA Checklist

- [ ] Agent introduces itself correctly
- [ ] Quiz score mentioned in greeting
- [ ] Responses are short (max 2 sentences)
- [ ] Booking flow works end-to-end
- [ ] WhatsApp fallback works
- [ ] Knowledge search returns relevant info
- [ ] Voicemail message left correctly
- [ ] Call metrics logged
- [ ] No resource leaks (check memory)
- [ ] Error handling graceful

---

## Phase 5: Deployment & Handoff

**Duration**: 2-4 hours
**Owner**: DevOps + Project Lead
**Output**: Production deployment + customer documentation

### 5.1 Docker Deployment

```yaml
# docker-compose.{customer}.yml
services:
  {customer}-agent:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      - LIVEKIT_URL=${LIVEKIT_URL}
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
      - CARTESIA_API_KEY=${CARTESIA_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - CALCOM_API_KEY=${CALCOM_API_KEY}
      - N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
    env_file:
      - .env.{customer}
    command: python -m agents.{customer}_voice
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import agents.{customer}_voice"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: {customer}_db
      POSTGRES_USER: dyniq
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dyniq"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### 5.2 Deploy Commands

```bash
# SSH to server
ssh root@<server_ip>
cd /opt/dyniq/{customer}

# Pull latest
git pull origin main

# Deploy
docker compose -f docker-compose.{customer}.yml up -d --build

# Verify
docker logs -f {customer}-agent
```

### 5.3 Monitoring Setup

```yaml
# n8n workflow: {customer}-monitoring
triggers:
  - schedule: "*/5 * * * *"  # Every 5 minutes

steps:
  - check_agent_health:
      url: "http://{customer}-agent:8080/health"

  - alert_if_down:
      condition: "status != 200"
      action: "send_slack_alert"
```

### 5.4 Customer Handoff Documentation

```markdown
# {Customer} Voice Agent - Operations Guide

## Overview
- Agent Name: {agent_name}
- Purpose: {purpose}
- Phone Number: +32 XXX XX XX XX

## Daily Operations
- Agent runs 24/7 automatically
- Calls triggered by {trigger_source}
- Bookings appear in {calendar_system}

## Metrics Dashboard
- URL: https://dashboard.dyniq.ai/{customer}
- Metrics tracked:
  - Calls made
  - Answer rate
  - Bookings (live vs WhatsApp)
  - Average call duration

## Troubleshooting
| Issue | Solution |
|-------|----------|
| Agent not calling | Check n8n webhook |
| Calls dropping | Check SIP trunk |
| Wrong information | Update knowledge base |

## Support Contact
- Email: support@dyniq.ai
- Response time: 4 hours
```

### 5.5 Deployment Checklist

- [ ] Docker containers running
- [ ] Health checks passing
- [ ] SIP trunk connected
- [ ] Test call successful
- [ ] Metrics flowing to dashboard
- [ ] Alerts configured
- [ ] Customer documentation delivered
- [ ] Customer trained on dashboard
- [ ] Support handoff complete

---

## Templates

### A. Customer Intake Form

```markdown
# Voice Agent Intake Form

## Business Details
- Company Name: _______________
- Contact Person: _______________
- Email: _______________
- Industry: _______________

## Agent Requirements
- Agent Name: _______________
- Primary Language: _______________
- Use Case: [ ] Lead Qualification [ ] Support [ ] Booking [ ] Other: _____

## Integrations
- Calendar: [ ] Cal.com [ ] Calendly [ ] Google [ ] Other: _____
- CRM: [ ] HubSpot [ ] NocoDB [ ] Airtable [ ] Other: _____
- Notifications: [ ] WhatsApp [ ] SMS [ ] Email

## Call Flow
- Trigger Source: _______________
- Primary Goal: _______________
- Fallback Strategy: _______________

## Knowledge Base
- [ ] FAQ document attached
- [ ] Pricing info attached
- [ ] Service descriptions attached

## Voice Preferences
- Preferred Voice Style: _______________
- Things to SAY: _______________
- Things to AVOID: _______________
```

### B. Call Script Template

```markdown
# {Agent Name} Call Script

## Opening (15 sec)
"Hallo {firstName}... [pause] je spreekt met {Agent Name} van {Company}.
{personalized_opener}
Mag ik je even kort spreken?"

## Main Discussion (30-60 sec)
"{value_proposition}"

## Booking Attempt
"Ik kan je {offer}. {specific_time}, past dat?"

IF YES:
→ book_appointment()
→ "Perfect geboekt! {confirmation}"

IF NO/MAYBE:
→ send_booking_link()
→ "Geen probleem, ik stuur je een link. {closing}"

## Voicemail Script
"Hallo {firstName}, met {Agent Name} van {Company}.
{reason_for_call}
Ik stuur je een bericht met meer info.
Tot snel!"

## Objection Handling
| Objection | Response |
|-----------|----------|
| "Geen interesse" | {response} |
| "Te duur" | {response} |
| "Later bellen" | {response} |
```

### C. Knowledge Document Template

```markdown
# {Topic} - Knowledge Base

## Overview
{brief_description}

## Key Points
- Point 1
- Point 2
- Point 3

## FAQ

### Q: {common_question_1}
A: {answer_1}

### Q: {common_question_2}
A: {answer_2}

## Pricing (if applicable)
| Tier | Price | Includes |
|------|-------|----------|
| Basic | €X/mo | ... |
| Pro | €X/mo | ... |

## Process
1. Step 1
2. Step 2
3. Step 3

## Contact
- Support: {support_info}
- Sales: {sales_info}
```

---

## Checklists

### Pre-Implementation Checklist

- [ ] Customer intake form completed
- [ ] Use case clearly defined
- [ ] Success metrics agreed
- [ ] Integration access confirmed
- [ ] Knowledge documents received
- [ ] Voice preferences documented
- [ ] Timeline agreed

### Infrastructure Checklist

- [ ] LiveKit credentials obtained
- [ ] SIP trunk configured
- [ ] Phone number provisioned
- [ ] PostgreSQL deployed
- [ ] PGVector enabled
- [ ] Environment variables set
- [ ] n8n workflows created

### Development Checklist

- [ ] Agent structure created
- [ ] System prompt written
- [ ] Function tools implemented
- [ ] Session configured
- [ ] Knowledge ingested
- [ ] Console tests passing

### QA Checklist

- [ ] Happy path tested
- [ ] Fallback tested
- [ ] Error handling tested
- [ ] Integration tested
- [ ] Load tested
- [ ] Voice quality verified

### Deployment Checklist

- [ ] Docker containers running
- [ ] Health checks passing
- [ ] Test call successful
- [ ] Monitoring configured
- [ ] Documentation delivered
- [ ] Customer trained

---

## Appendix: Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Agent not responding | Session not started | Check entrypoint logs |
| Poor STT accuracy | Wrong model | Use `nova-2-phonecall` |
| Robotic voice | Speed too high | Set `speed=0.95` |
| Calls dropping | SIP misconfiguration | Check trunk credentials |
| Knowledge not found | Not ingested | Run ingest script |
| WhatsApp not sending | n8n webhook error | Check workflow logs |
| Booking failed | Cal.com API error | Verify API key + event ID |
| High latency | Server location | Use regional deployment |

---

*Document maintained by DYNIQ AI Engineering Team*
*For questions: engineering@dyniq.ai*
