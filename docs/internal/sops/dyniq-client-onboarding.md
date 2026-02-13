---
title: "SOP: DYNIQ Client Onboarding"
sidebar_label: "SOP: DYNIQ Client Onboarding"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# SOP: DYNIQ Client Onboarding

**Created:** 2026-01-19
**Version:** 3.0 (Updated with Ruben voice pipeline, ScoreApp, Metabase, GDPR)
**Updated:** 2026-02-07 (Board meeting bm-6deb0377, 81 agents)
**Time to Complete:** 7 days
**Owner:** Walker (can be delegated after first 3 clients)

---

## Overview

Complete client onboarding from first contact to first lead delivered. Covers the full DYNIQ AI lead generation pipeline including voice agent.

**Client Gets:**
- Custom website (Framer template)
- AI chatbot with lead scoring (Voiceflow)
- AI voice agent (Ruben) for outbound lead calls
- ScoreApp/Groei-Scan quiz for lead capture
- WhatsApp/Telegram instant notifications
- Automatic callback booking (Cal.com)
- AI-generated sales briefings (Tavily research)
- Metabase analytics dashboard (or screenshots for pilots)
- Welcome brochure/PDF + visual Day 1-30 roadmap

---

## Prerequisites

### For Paying Customers
- [ ] Contract signed
- [ ] First payment received (setup fee)
- [ ] Kickoff call scheduled
- [ ] Client info + brand assets collected (see checklist reference)

### For Pilot Clients (FREE)
- [ ] Verbal agreement + GDPR consent (no contract/payment)
- [ ] Onboarding call scheduled (60 min, expanded agenda)
- [ ] Client info + brand assets collected
- [ ] WhatsApp group created for daily check-ins

**Checklist reference:** `client-onboard-checklist.md`

---

## Day 0: Pre-Onboarding Preparation

### 0.1 Collect Brand Assets via Intake Form

Use intake checklist from `client-onboard-checklist.md`:
- Company info (name, contact, phone, email, BTW, address)
- Service details (top 3 services, service area, target customers, USPs, pricing)
- Brand assets (logo vector + raster, brand colors hex, photos, testimonials)

### 0.2 Prepare Client Deliverables

- [ ] Generate welcome brochure/PDF (DYNIQ branded, template from DYN-80)
- [ ] Generate visual Day 1-30 roadmap (template from DYN-81)
- [ ] Prepare welcome email (template in `client-onboard-checklist.md`)

### 0.3 Verify Pipeline Ready

- [ ] ScoreApp Groei-Scan quiz accessible and working
- [ ] Ruben voice agent running (`curl https://ruben-api.dyniq.ai/health`)
- [ ] n8n automation active (`curl https://automation.dyniq.ai/healthz`)

---

## Day 1: Onboarding Call + Infrastructure Setup

### 1.1 Onboarding Call (60 min - Pilots / 30 min - Paying)

**Pilot agenda (60 min, from board meeting bm-6deb0377):**

1. **Welcome & rapport** (5 min) - personal connection, thank for being pilot
2. **The promise** (5 min) - "10 leads in 30 dagen, wij doen het zware werk"
3. **Demo Ruben** (10 min) - live test call, show how AI voice agent sounds
4. **Quiz walkthrough** (10 min) - fill out Groei-Scan together, show what happens
5. **GDPR consent** (5 min) - explain call recording, get written consent
6. **WhatsApp group setup** (5 min) - create group, explain check-in cadence
7. **Success metrics** (5 min) - agree on what "success" looks like
8. **Timeline & expectations** (5 min) - Day 1-30 milestones (show roadmap)
9. **First action** (5 min) - "In 48 uur krijg je je eerste lead"
10. **Questions & next steps** (5 min) - schedule Day 3 check-in

**Paying customer agenda (30 min):** Abbreviated version - items 1, 3, 5, 8, 10.

### 1.2 Send Welcome Package

- [ ] Welcome email (template in checklist reference)
- [ ] Welcome brochure/PDF attached
- [ ] Visual Day 1-30 roadmap attached
- [ ] GDPR consent form (if not signed during call)

### 1.3 Create Client Record

**Supabase (leads table - DYNIQ database):**
```sql
INSERT INTO leads (email, name, phone, company_name, industry, source, status)
VALUES ('[email]', '[name]', '[phone]', '[company]', '[industry]', 'pilot', 'onboarding');
```

**NocoDB (crm.dyniq.ai) - legacy, keep in sync:**
```
Table: Clients → company_name, contact_name, phone, email, industry, plan, status, client_id
```

### 1.4 Clone n8n Workflow

1. Go to `https://automation.dyniq.ai`
2. Duplicate workflow `DP0wfYBh8SJK33Ue` (Voiceflow Lead Pipeline)
3. Rename to `[ClientName]-lead-pipeline`
4. Update nodes:
   - **Telegram/WhatsApp**: Change chat ID/number to client's
   - **Lead storage**: Add client_id filter
   - **Cal.com booking**: Update to client's calendar
   - **Qualification weights**: Tune for client's industry (e.g., Q13 = painter)
5. New webhook URL: `https://automation.dyniq.ai/webhook/[client-slug]-lead`

---

## Day 2: Voice Agent + Chatbot + Quiz Setup

### 2.1 Customize Ruben Voice Agent Prompt

SSH to Contabo and update agent prompt for client's industry:
- Industry-specific vocabulary and terminology
- Common objections for their trade
- Service descriptions in their language
- Booking script adapted for their services

```bash
# After prompt changes (agents-api is BAKED, not volume-mounted):
ssh contabo "cd /opt/dyniq-voice/docker && docker compose build agents-api && docker compose up -d agents-api --force-recreate"
```

### 2.2 Verify Groei-Scan Quiz

**CEO Override: Use existing Groei-Scan (15 questions) as-is.** No per-client quiz needed.

- [ ] Quiz accessible at ScoreApp URL
- [ ] Q13 ("Wat voor type werk doet u voornamelijk?") correctly identifies client's trade
- [ ] Quiz completion → webhook fires to n8n

### 2.3 Clone Voiceflow Chatbot

1. Open Voiceflow Creator: `https://creator.voiceflow.com`
2. Duplicate "DYNIQ Internal Agent" project → "[ClientName] Chatbot"
3. Update variables: `company_name`, `contact_name`, `phone`, `service_area`, `specialization`
4. Customize messages: welcome, service descriptions, booking prompts
5. Connect webhook: `POST https://automation.dyniq.ai/webhook/[client-slug]-lead`

### 2.4 Test Chatbot (5 scenarios)

- [ ] Test 1: Full happy path (all info provided)
- [ ] Test 2: Missing phone → should prompt
- [ ] Test 3: No callback time → should skip booking
- [ ] Test 4: With callback time → should create booking
- [ ] Test 5: Edge case (special characters in name)

---

## Day 3-4: Website + Notifications + Testing

### 3.1 Clone Framer Website

1. Duplicate industry-specific Framer template
2. Replace: company name, logo, hero image, services, service area, contact info, testimonials
3. Apply brand colors from intake form
4. Embed Voiceflow chatbot widget in footer
5. Connect to client's domain (or DYNIQ subdomain for pilots)

### 3.2 Technical Checks

- [ ] SSL certificate active
- [ ] Mobile responsive (painters check phone on job site)
- [ ] Page speed < 3 seconds
- [ ] SEO meta tags configured
- [ ] Cookie consent banner (GDPR)

### 3.3 Setup Notifications

**WhatsApp (preferred for clients):**
1. Create WhatsApp group with client
2. Configure n8n workflow with client's number

**Telegram (fallback):**
1. Create Telegram group, add DYNIQ bot
2. Get chat ID, update n8n workflow

### 3.4 First E2E Test Call

- [ ] Trigger test lead through Groei-Scan quiz
- [ ] Verify n8n receives webhook, qualifies lead
- [ ] Verify Tavily researches the company
- [ ] Verify Ruben makes test call with correct vocabulary
- [ ] Verify client receives WhatsApp/Telegram notification
- [ ] Verify Cal.com booking created (if callback time specified)

**This is the critical gate. Do NOT go live until E2E test passes.**

---

## Day 5: Cal.com Booking + Go-Live Prep

### 5.1 Cal.com Setup

1. Create event: "[ClientName] - Strategy Call" (15-30 min)
2. Note Event Type ID
3. Update n8n workflow "Book Cal.com" node with ID

### 5.2 Pre-Launch Quality Checklist

| Check | Status |
|-------|--------|
| Website live and fast (<3s) | [ ] |
| Chatbot embedded and working | [ ] |
| Groei-Scan quiz tested | [ ] |
| Ruben voice agent tested with client industry vocabulary | [ ] |
| n8n webhook connected | [ ] |
| Notifications working (WhatsApp/Telegram) | [ ] |
| Cal.com booking flow tested | [ ] |
| GDPR consent obtained and documented | [ ] |
| Client approved website content | [ ] |

---

## Day 5-7: Go-Live + First Leads

### 6.1 Go-Live

1. Publish Voiceflow to production
2. Publish Framer website
3. Activate n8n workflow
4. Send "We're Live!" message to WhatsApp group

### 6.2 Handoff Documentation

Send to client:
- Quick reference card (1-pager): what was delivered, how it works
- Support contact info
- Day 1-30 roadmap reminder
- Dashboard access (Metabase link or screenshots for pilots)

**How It Works (updated):**
```
Quiz lead → AI qualifies → Tavily researches company →
Ruben calls lead → Books appointment → You get WhatsApp notification
```

### 6.3 First Real Lead Target

- Target: first lead within 72 hours of go-live
- Monitor n8n executions, Langfuse traces, Metabase funnel

---

## Post-Launch: Days 7-30

### Week 1 (Daily Check-ins)

- [ ] Daily WhatsApp check-in with client
- [ ] Monitor lead quality and Ruben call recordings
- [ ] Adjust Ruben prompt based on feedback
- [ ] Day 7 report: leads delivered, calls made, quality rating

### Week 2 (Optimization)

- [ ] Reduce check-ins to every 2 days
- [ ] A/B test quiz based on completion rates
- [ ] Ruben refinement from call recordings
- [ ] Target: **First booking from AI call** (the "aha moment")

### Week 3 (Prove ROI)

- [ ] ROI dashboard with real data (Metabase)
- [ ] Capture video testimonial if booking achieved (template: DYN-83)
- [ ] "First Booking Celebration" moment (DYN-82)

### Week 4 (Convert)

- [ ] Full month report with ROI metrics
- [ ] "10 leads in 30 days" proof point
- [ ] Case study draft for LinkedIn
- [ ] Upsell conversation: free → Founder's Circle (EUR 997/mo) or Standard (EUR 1,997/mo)
- [ ] Document SOP learnings for next client

### Success Metrics

| Metric | Target |
|--------|--------|
| Time to first lead | <72 hours |
| Quiz completion rate | >60% |
| Ruben call connection rate | >80% |
| Lead-to-booking conversion | >15% |
| First booking from AI call | <14 days |
| Pilot NPS score | >8/10 |
| Total leads in 30 days | 10+ |

---

## Troubleshooting

### Lead Not Appearing
1. Check ScoreApp → webhook fired? (ScoreApp dashboard)
2. Check n8n execution log → webhook received? (`automation.dyniq.ai`)
3. Check Supabase → lead record created?
4. Check notifications → WhatsApp/Telegram sent?

### Ruben Not Calling / Bad Call Quality
1. Check Ruben API health: `curl https://ruben-api.dyniq.ai/health`
2. Check LiveKit: `ssh contabo "docker logs docker-livekit-1 --tail=20"`
3. Check Langfuse traces for call: `langfuse.dyniq.ai`
4. Verify Ruben prompt has correct industry vocabulary
5. Restart if needed: `ssh contabo "cd /opt/dyniq-voice/docker && docker compose build agents-api && docker compose up -d agents-api --force-recreate"`

### Booking Not Created
1. Verify `callback_time` field populated in lead data
2. Check Cal.com API response in n8n execution
3. Verify event type ID matches client's Cal.com event
4. Check Cal.com availability slots

### Notification Delayed
1. Check n8n execution time
2. Verify Telegram bot token / WhatsApp credentials
3. Check for rate limiting

---

## Reference

| Item | Value |
|------|-------|
| n8n workflow (base) | `DP0wfYBh8SJK33Ue` |
| Voiceflow project | "DYNIQ Internal Agent" (clone from) |
| Cal.com event (default) | 13321 |
| Ruben API | `ruben-api.dyniq.ai` (port 8080) |
| Agents API | `agents-api.dyniq.ai` (port 8000) |
| Metabase | `analytics.dyniq.ai` |
| Checklist reference | `client-onboard-checklist.md` |
| Board meeting | bm-6deb0377 (81 agents, ADOPT Option C) |

---

*Version 3.0 - Updated 2026-02-07 with Ruben voice pipeline, ScoreApp/Groei-Scan, GDPR, Metabase, pilot vs paying distinction.*
*Delegatable to a VA after first 3 clients.*
