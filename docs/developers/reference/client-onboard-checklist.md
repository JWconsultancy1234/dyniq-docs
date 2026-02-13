---
title: "Client Onboarding Checklist Reference"
sidebar_label: "Client Onboarding Checklist Reference"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Client Onboarding Checklist Reference

Detailed checklists and templates for DYNIQ client onboarding.
**Updated:** 2026-02-07 (Board meeting bm-6deb0377)
**Full SOP:** `.agents/sops/dyniq-client-onboarding.md`

---

## Onboarding Timeline

```
DAY 0: AGREEMENT
├── Welcome email + brochure + roadmap sent
├── Client intake form sent (brand assets, service details)
├── Onboarding call scheduled (60 min pilot / 30 min paying)
├── GDPR consent form sent
└── Invoice sent (paying) or verbal agreement (pilot)

DAY 1: ONBOARDING CALL + SETUP
├── Onboarding call conducted (Ruben demo, quiz walkthrough, GDPR)
├── WhatsApp group created
├── Client record created (Supabase + NocoDB)
├── n8n workflow cloned + customized for industry
└── Ruben voice agent prompt customized

DAY 2-3: BUILD
├── Groei-Scan quiz verified for client's trade
├── Voiceflow chatbot cloned + customized
├── Framer website cloned + branded
├── Chatbot embedded on website
├── Notifications configured (WhatsApp/Telegram)
└── First E2E test call (quiz → n8n → Ruben → notification)

DAY 4-5: LAUNCH
├── Cal.com booking setup
├── Quality checklist passed
├── Client approved website content
├── Go-live (publish website, activate workflows)
└── Handoff documentation sent

DAY 5+: FIRST LEADS
├── First lead target: <72 hours
├── Daily WhatsApp check-ins (Week 1)
├── Day 7 report: leads, calls, quality
├── First booking target: <14 days
└── Day 30 review + upsell conversation
```

---

## Client Information Checklist

### Required Information

| Item | Source | Status |
|------|--------|--------|
| Company name | Contract/Agreement | [ ] |
| Contact person | Contract/Agreement | [ ] |
| Phone number | Contract/Agreement | [ ] |
| Email | Contract/Agreement | [ ] |
| Address | Intake form | [ ] |
| BTW number | Contract (paying only) | [ ] |
| Website (existing) | Intake form | [ ] |
| Social media links | Intake form | [ ] |
| GDPR consent signed | Onboarding call | [ ] |

### Service Details

| Item | Description |
|------|-------------|
| Primary services | Top 3 services offered |
| Service area | Gemeentes/regions |
| Target customers | Residential/Commercial |
| USPs | What makes them unique |
| Pricing range | Average project value |
| Trade type | Maps to Groei-Scan Q13 (painter, plumber, electrician, etc.) |

### Brand Assets

| Asset | Format | Required |
|-------|--------|----------|
| Logo (vector) | SVG/AI/EPS | YES |
| Logo (raster) | PNG transparent | YES |
| Brand colors | Hex codes | YES |
| Photos of work | High-res JPG (5-10) | YES |
| Testimonials | Text + photos | If available |
| Google Business Profile | URL | If exists |

---

## Welcome Email Template

```
Subject: Welkom bij DYNIQ.AI - Jouw AI Leadgeneratie Start Nu!

Dag [NAME],

Welkom bij DYNIQ.AI! Wij gaan ervoor zorgen dat je automatisch
de beste leads binnenkrijgt.

WAT JE KUNT VERWACHTEN:
• Ruben, jouw AI-assistent, belt leads namens jou
• Je ontvangt elke lead direct via WhatsApp
• Een gepersonaliseerde quiz vangt leads op via je website

VOLGENDE STAPPEN:

1. Vul de vragenlijst in (5 minuten)
   [QUESTIONNAIRE_LINK]

2. Verzamel deze items:
   • Logo (vector formaat)
   • 5-10 foto's van je werk
   • 2-3 klantgetuigenissen
   • Merk kleuren (hex codes)

3. Onboarding call: [DATE/TIME]
   We doen een live demo van Ruben en lopen alles samen door.

JOUW ROADMAP:
• Dag 1: Kickoff call + setup
• Dag 2-3: Website + chatbot + voice agent bouwen
• Dag 4-5: Testen + livegang
• Dag 5-7: Eerste leads!

Bekijk ook de bijgevoegde welkomstbrochure en dag 1-30 roadmap.

Met vriendelijke groeten,
Walker - DYNIQ.AI
```

---

## Onboarding Call Agenda

### Pilot Call (60 min)

| # | Item | Time | Notes |
|---|------|------|-------|
| 1 | Welcome & rapport | 5 min | Personal connection, thank for being pilot |
| 2 | The promise | 5 min | "10 leads in 30 dagen, wij doen het zware werk" |
| 3 | Demo Ruben | 10 min | Live test call, show how AI voice agent sounds |
| 4 | Quiz walkthrough | 10 min | Fill out Groei-Scan together, explain what happens |
| 5 | GDPR consent | 5 min | Explain call recording, get written consent |
| 6 | WhatsApp group | 5 min | Create group, explain check-in cadence |
| 7 | Success metrics | 5 min | Agree on what "success" looks like |
| 8 | Timeline | 5 min | Walk through Day 1-30 roadmap together |
| 9 | First action | 5 min | "In 48 uur krijg je je eerste lead" |
| 10 | Questions | 5 min | Schedule Day 3 check-in |

### Paying Customer Call (30 min)

| # | Item | Time |
|---|------|------|
| 1 | Welcome + timeline | 5 min |
| 2 | Demo Ruben (live call) | 10 min |
| 3 | GDPR consent | 5 min |
| 4 | Technical setup (domain, WhatsApp) | 5 min |
| 5 | Next steps + deliverables | 5 min |

---

## Build Checklists

### AI Pipeline Setup
- [ ] Groei-Scan quiz verified (Q13 identifies client trade)
- [ ] n8n workflow cloned and tuned for industry
- [ ] Ruben voice agent prompt customized for trade vocabulary
- [ ] Tavily research configured for company lookup
- [ ] First E2E test: quiz → n8n → Ruben → notification

### Website Setup
- [ ] Framer template cloned, staging setup
- [ ] Company name, logo, hero image replaced
- [ ] Services, photos, testimonials added
- [ ] Brand colors applied
- [ ] Voiceflow chatbot embedded in footer
- [ ] Domain connected, SSL active
- [ ] Mobile responsive tested
- [ ] Page speed < 3 seconds

### Chatbot Setup
- [ ] Voiceflow project cloned and customized
- [ ] Webhook URL configured to client's n8n workflow
- [ ] Embedded on website
- [ ] 5 test conversations passed
- [ ] WhatsApp notifications working

---

## Handoff Documentation Template

```markdown
# [COMPANY] - DYNIQ.AI Setup Complete

## Wat Je Hebt Gekregen
- Website: [URL]
- AI Chatbot: Actief op je homepage
- AI Voice Agent (Ruben): Belt leads automatisch namens jou
- Lead Quiz: [SCOREAPP_URL]
- Dashboard: analytics.dyniq.ai (of screenshots)
- Notificaties: WhatsApp [NUMBER]

## Hoe Het Werkt
1. Bezoeker vult quiz in op je website
2. AI kwalificeert de lead (HOT/WARM/COLD)
3. Ruben belt de lead namens jou
4. Jij ontvangt een WhatsApp met alle details
5. Lead wordt automatisch ingepland (Cal.com)

## Jouw Dag 1-30 Roadmap
[Zie bijgevoegde roadmap PDF]

## Support
- WhatsApp groep: [direct contact]
- Email: support@dyniq.ai
- Response tijd: <4 uur
```

---

## Quality Checklist (Before Go-Live)

- [ ] Website loads < 3 seconds
- [ ] All links work
- [ ] Mobile responsive (test on phone)
- [ ] Chatbot tested E2E (5 scenarios)
- [ ] Groei-Scan quiz completes and fires webhook
- [ ] Ruben test call completed with correct industry vocabulary
- [ ] n8n workflow executes full pipeline
- [ ] WhatsApp/Telegram notification received
- [ ] Cal.com booking created on test
- [ ] GDPR consent documented
- [ ] Client approved website content
- [ ] Handoff documentation ready

---

## Automation Triggers

| Day | Trigger | Action |
|-----|---------|--------|
| 0 | Agreement signed | Welcome email + brochure + roadmap |
| 1 | No intake form | Reminder via WhatsApp |
| 1 | Onboarding call | GDPR consent, WhatsApp group |
| 5 | Go-live | "We're Live!" WhatsApp + first leads |
| 7 | Week 1 | Report: leads, calls, quality |
| 14 | Week 2 | First booking check + celebration |
| 30 | Month 1 | Full ROI review + upsell conversation |

---

*Version 2.0 - Updated 2026-02-07 with Ruben voice pipeline, GDPR, pilot vs paying distinction.*
*Reference doc for `/client-onboard` command.*
