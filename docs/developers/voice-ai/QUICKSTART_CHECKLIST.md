---
title: "Voice Agent Quick-Start Checklist"
sidebar_label: "Voice Agent Quick-Start Checklist"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [voice-ai, auto-synced]
---

# Voice Agent Quick-Start Checklist

**Use this for each new customer implementation**

Customer: _______________
Start Date: _______________
Target Go-Live: _______________

---

## Phase 1: Discovery (Day 1)

### Customer Meeting
- [ ] Company name: _______________
- [ ] Industry: _______________
- [ ] Agent name: _______________
- [ ] Primary goal: _______________
- [ ] Language: _______________

### Integrations Needed
- [ ] Calendar: _______________
- [ ] CRM: _______________
- [ ] Notifications: [ ] WhatsApp [ ] SMS [ ] Email

### Documents Received
- [ ] FAQ/Knowledge base
- [ ] Pricing info
- [ ] Services description
- [ ] Call script preferences

---

## Phase 2: Infrastructure (Day 1-2)

### Credentials Obtained
- [ ] LIVEKIT_URL
- [ ] LIVEKIT_API_KEY
- [ ] LIVEKIT_API_SECRET
- [ ] OPENROUTER_API_KEY
- [ ] DEEPGRAM_API_KEY
- [ ] CARTESIA_API_KEY
- [ ] CALCOM_API_KEY
- [ ] CALCOM_EVENT_TYPE_ID

### SIP Trunk
- [ ] Phone number: +_______________
- [ ] Trunk ID: _______________
- [ ] Inbound configured
- [ ] Outbound configured

### Database
- [ ] PostgreSQL deployed
- [ ] PGVector extension enabled
- [ ] Schema created
- [ ] Connection tested

### n8n Workflows
- [ ] Webhook trigger created
- [ ] WhatsApp notification workflow
- [ ] Call completed callback

---

## Phase 3: Development (Day 2-3)

### Agent Structure
```bash
mkdir -p agents/{customer}_voice/features/{booking,knowledge,notifications,qualification,call_handling}
```
- [ ] Directory created
- [ ] `agent.py` written
- [ ] `config.py` with system prompt
- [ ] `session.py` configured
- [ ] `entrypoint.py` with noise cancellation

### Function Tools
- [ ] `check_available_slots`
- [ ] `book_appointment`
- [ ] `send_booking_link`
- [ ] `search_knowledge`
- [ ] `detected_voicemail`
- [ ] `end_call_gracefully`

### Knowledge Base
- [ ] Documents placed in `shared/knowledge/documents/{customer}/`
- [ ] Ingestion run: `python -m shared.knowledge.ingest --documents ...`
- [ ] Search tested

---

## Phase 4: Testing (Day 3-4)

### Console Testing
```bash
python -m agents.{customer}_voice console
```
- [ ] Happy path (books immediately)
- [ ] Hesitant (WhatsApp fallback)
- [ ] Questions (knowledge search)
- [ ] Voicemail detection

### Audio Testing
```bash
python -m agents.{customer}_voice audio
```
- [ ] Voice sounds natural
- [ ] Interruptions work
- [ ] No audio artifacts

### Integration Testing
- [ ] Booking creates Cal.com event
- [ ] WhatsApp actually sends
- [ ] Metrics logged to n8n
- [ ] Errors handled gracefully

### Sign-off
- [ ] DYNIQ internal QA passed
- [ ] Test call recording saved

---

## Phase 5: Deployment (Day 4-5)

### Docker Deployment
```bash
docker compose -f docker-compose.{customer}.yml up -d --build
```
- [ ] Container running
- [ ] Health check passing
- [ ] Logs clean

### Production Testing
- [ ] Outbound call works
- [ ] Inbound call works (if applicable)
- [ ] Full booking flow successful
- [ ] Metrics appearing in dashboard

### Monitoring
- [ ] Health check alerts configured
- [ ] Error notifications enabled
- [ ] Dashboard access given to customer

---

## Phase 6: Handoff (Day 5)

### Documentation
- [ ] Operations guide created
- [ ] Troubleshooting guide included
- [ ] Contact info provided

### Customer Training
- [ ] Dashboard walkthrough
- [ ] How to update knowledge base
- [ ] Escalation process explained

### Final Checklist
- [ ] Customer signed off
- [ ] Support ticket system access
- [ ] First week monitoring scheduled

---

## Notes

_Use this space for customer-specific notes_

```




```

---

## Metrics (First Week)

| Day | Calls | Answered | Booked | WhatsApp |
|-----|-------|----------|--------|----------|
| 1   |       |          |        |          |
| 2   |       |          |        |          |
| 3   |       |          |        |          |
| 4   |       |          |        |          |
| 5   |       |          |        |          |
| 6   |       |          |        |          |
| 7   |       |          |        |          |

**Week 1 Summary:**
- Total calls: ___
- Answer rate: ___%
- Book rate: ___%
- Issues: _______________

---

*Completed by: _______________*
*Date: _______________*
