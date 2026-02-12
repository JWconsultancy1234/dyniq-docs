---
sidebar_position: 2
title: Client Onboarding
description: Complete SOP for onboarding new DYNIQ clients from first contact to first lead
doc_owner: COO
review_cycle: 30d
doc_status: published
---

# Client Onboarding SOP

Complete client onboarding from first contact to first lead delivered. Covers the full DYNIQ AI lead generation pipeline including voice agent.

## What the Client Gets

- Custom website (Framer template)
- AI chatbot with lead scoring (Voiceflow)
- AI voice agent (Ruben) for outbound lead calls
- ScoreApp/Groei-Scan quiz for lead capture
- WhatsApp/Telegram instant notifications
- Automatic callback booking (Cal.com)
- AI-generated sales briefings (Tavily research)
- Metabase analytics dashboard
- Welcome brochure/PDF + visual Day 1-30 roadmap

## Prerequisites

### Paying Customers

- [ ] Contract signed
- [ ] First payment received (setup fee)
- [ ] Kickoff call scheduled
- [ ] Client info + brand assets collected

### Pilot Clients (FREE)

- [ ] Verbal agreement + GDPR consent (no contract/payment)
- [ ] Onboarding call scheduled (60 min, expanded agenda)
- [ ] Client info + brand assets collected
- [ ] WhatsApp group created for daily check-ins

## Day 0: Pre-Onboarding

### Collect Brand Assets

| Field | Required |
|-------|----------|
| Bedrijfsnaam (company name) | YES |
| Contactpersoon (contact person) | YES |
| Telefoonnummer | YES |
| Email | YES |
| BTW/KBO-nummer | For invoice |
| Top 3 diensten (services) | YES |
| Werkgebied (service area) | YES |
| USPs | YES |
| Logo (vector + raster) | YES |
| Brand kleuren (hex codes) | If available |

### Prepare Deliverables

- [ ] Generate welcome brochure/PDF (DYNIQ branded)
- [ ] Generate visual Day 1-30 roadmap
- [ ] Prepare welcome email

### Verify Pipeline

```bash
# Health checks
curl -sf https://ruben-api.dyniq.ai/health && echo "Ruben: OK"
curl -sf https://automation.dyniq.ai/healthz && echo "n8n: OK"
curl -sf https://agents-api.dyniq.ai/health && echo "Agents API: OK"
```

## Day 1: Onboarding Call + Setup

### Pilot Kickoff Agenda (60 min)

| # | Topic | Duration | Goal |
|---|-------|----------|------|
| 1 | Welcome + rapport | 5 min | Build personal connection |
| 2 | The promise | 5 min | "10 leads in 30 dagen" |
| 3 | Demo Ruben | 10 min | Live test call |
| 4 | Quiz walkthrough | 10 min | Fill Groei-Scan together |
| 5 | GDPR consent | 5 min | Written consent for recordings |
| 6 | WhatsApp group | 5 min | Create group, explain cadence |
| 7 | Success metrics | 5 min | Define "success" |
| 8 | Timeline | 5 min | Day 1-30 milestones |
| 9 | First action | 5 min | "In 48 uur eerste lead" |
| 10 | Questions | 5 min | Schedule Day 3 check-in |

**Paying customer:** Abbreviated 30 min (items 1, 3, 5, 8, 10).

### Send Welcome Package

- [ ] Welcome email with brochure + roadmap attached
- [ ] GDPR consent form (if not signed during call)

### Create Client Record

```sql
-- Supabase (leads table - DYNIQ database)
INSERT INTO leads (email, name, phone, company_name, industry, source, status)
VALUES ('[email]', '[name]', '[phone]', '[company]', '[industry]', 'pilot', 'onboarding');
```

### Clone n8n Workflow

1. Duplicate workflow `DP0wfYBh8SJK33Ue` (Voiceflow Lead Pipeline)
2. Rename to `[ClientName]-lead-pipeline`
3. Update Telegram/WhatsApp chat ID
4. Update lead storage client_id filter
5. Update Cal.com booking calendar
6. New webhook: `https://automation.dyniq.ai/webhook/[client-slug]-lead`

## Day 2: Voice Agent + Chatbot + Quiz

### Customize Ruben Prompt

Update agent prompt for client's industry vocabulary:

```bash
# After prompt changes (agents-api is BAKED):
ssh contabo "cd /opt/dyniq-voice/docker && \
  docker compose build agents-api && \
  docker compose up -d agents-api --force-recreate"
```

### Verify Groei-Scan Quiz

- [ ] Quiz accessible at ScoreApp URL
- [ ] Q13 correctly identifies client's trade
- [ ] Quiz completion triggers n8n webhook

### Clone Voiceflow Chatbot

1. Duplicate "DYNIQ Internal Agent" project
2. Update variables: `company_name`, `contact_name`, `phone`, `service_area`
3. Connect webhook to client's n8n workflow
4. Test 5 scenarios (happy path, missing phone, no callback, with callback, edge case)

## Day 3-4: Website + Notifications + Testing

### Website Setup

1. Duplicate industry-specific Framer template
2. Replace company info, logo, services, testimonials
3. Apply brand colors
4. Embed Voiceflow chatbot widget
5. Connect to client's domain or DYNIQ subdomain

### E2E Test (Critical Gate)

:::danger Do NOT go live until this passes
Run the full pipeline test before going live with any client.
:::

- [ ] Trigger test lead through Groei-Scan quiz
- [ ] Verify n8n receives webhook and qualifies lead
- [ ] Verify Tavily researches the company
- [ ] Verify Ruben makes test call with correct vocabulary
- [ ] Verify client receives WhatsApp/Telegram notification
- [ ] Verify Cal.com booking created (if callback time specified)

## Day 5-7: Go-Live

### Pre-Launch Checklist

| # | Check | Status |
|---|-------|--------|
| 1 | Website live and fast (&lt;3s) | [ ] |
| 2 | SSL certificate active | [ ] |
| 3 | Mobile responsive | [ ] |
| 4 | Chatbot working | [ ] |
| 5 | Quiz tested | [ ] |
| 6 | Ruben voice agent tested | [ ] |
| 7 | n8n webhook connected | [ ] |
| 8 | Notifications working | [ ] |
| 9 | Cal.com booking tested | [ ] |
| 10 | GDPR consent documented | [ ] |
| 11 | Client approved content | [ ] |
| 12 | Privacy policy live | [ ] |
| 13 | Cookie consent banner | [ ] |

### Go-Live Steps

1. Publish Voiceflow to production
2. Publish Framer website
3. Activate n8n workflow
4. Send "We're Live!" message to WhatsApp group

## Post-Launch: Days 7-30

| Week | Cadence | Focus |
|------|---------|-------|
| Week 1 | Daily check-ins | Monitor lead quality, adjust Ruben prompt |
| Week 2 | Every 2 days | A/B test quiz, optimize Ruben |
| Week 3 | Weekly | ROI dashboard, video testimonial |
| Week 4 | Weekly | Full month report, upsell conversation |

### Success Metrics

| Metric | Target |
|--------|--------|
| Time to first lead | &lt;72 hours |
| Quiz completion rate | >60% |
| Ruben call connection rate | >80% |
| Lead-to-booking conversion | >15% |
| Total leads in 30 days | 10+ |

## Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| Lead not appearing | n8n execution log | Verify webhook URL in ScoreApp |
| Ruben not calling | `curl ruben-api.dyniq.ai/health` | Rebuild agents-api image |
| Bad call quality | Langfuse traces | Adjust Ruben prompt vocabulary |
| Booking not created | Cal.com API response in n8n | Verify event type ID |
| Notification delayed | n8n execution time | Check rate limiting |
