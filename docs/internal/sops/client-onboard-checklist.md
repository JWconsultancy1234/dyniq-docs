---
title: "Client Onboarding Checklist"
sidebar_label: "Client Onboarding Checklist"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [sops, auto-synced]
---

# Client Onboarding Checklist

**Version:** 1.0
**Created:** 2026-02-12
**Parent SOP:** `dyniq-client-onboarding.md`
**Used by:** `/client-onboard` command

---

## 1. Client Intake Form

Collect before or during onboarding call.

### Company Info

| Field | Value | Required |
|-------|-------|----------|
| Bedrijfsnaam | | YES |
| Contactpersoon (voornaam + achternaam) | | YES |
| Telefoonnummer | | YES |
| Email | | YES |
| BTW / KBO-nummer | | For invoice/privacy |
| Adres | | For privacy policy |
| Website (als bestaand) | | Optional |

### Service Details

| Field | Value | Required |
|-------|-------|----------|
| Top 3 diensten | | YES |
| Werkgebied (regio/straal) | | YES |
| Doelklanten (particulier/zakelijk/beide) | | YES |
| USPs (wat maakt jullie anders?) | | YES |
| Gemiddelde klusprijs | | For ROI calc |
| Seizoensafhankelijk? | | For Ruben script |

### Brand Assets

| Asset | Format | Required |
|-------|--------|----------|
| Logo (vector: SVG/AI/EPS) | High-res | YES |
| Logo (raster: PNG/JPG) | Min 500px | YES |
| Brand kleuren (hex codes) | e.g. #10B981 | If available |
| Foto's (werkplaats, team, projecten) | JPG/PNG, min 3 | Recommended |
| Bestaande testimonials/reviews | Text | If available |
| Google Reviews URL | Link | If available |

---

## 2. Welcome Email Template

**Subject:** Welkom bij DYNIQ, {{voornaam}}! Jouw digitale collega staat klaar

**Body:**

```
Beste {{voornaam}},

Welkom bij DYNIQ! We zijn blij dat je erbij bent.

In bijlage vind je:
- Je persoonlijke welkomstbrochure
- Het Dag 1-30 stappenplan

Wat gebeurt er nu?
1. We bouwen jouw website en chatbot (Dag 1-3)
2. Ruben, jouw digitale collega, wordt getraind op jouw vak (Dag 2-3)
3. We testen alles samen (Dag 3-5)
4. Go-live: eerste aanvragen binnen 72 uur (Dag 5-7)

Je kunt mij altijd bereiken via WhatsApp of email:
- WhatsApp: {{walker_telefoon}}
- Email: info@dyniq.ai

Vragen? Stuur gerust een berichtje. We staan naast je.

Met vriendelijke groet,
Walker Jashari
Oprichter, DYNIQ
```

**Attachments:**
- [ ] DYNIQ-Welcome-Brochure.pdf
- [ ] DYNIQ-Roadmap-Day1-30.pdf

---

## 3. Kickoff Call Agenda (60 min - Pilots)

| # | Onderwerp | Duur | Doel |
|---|-----------|------|------|
| 1 | Welkom + persoonlijk | 5 min | Rapport opbouwen |
| 2 | De belofte | 5 min | "10 klanten in 30 dagen, wij doen het zware werk" |
| 3 | Demo Ruben | 10 min | Live test call, laat horen hoe het klinkt |
| 4 | Quiz doorlopen | 10 min | Groei-Scan samen invullen, laten zien wat er gebeurt |
| 5 | GDPR toestemming | 5 min | Uitleg gespreksopname, schriftelijke toestemming |
| 6 | WhatsApp groep | 5 min | Groep aanmaken, check-in cadence uitleggen |
| 7 | Succeskriterien | 5 min | Afspreken wat "succes" betekent |
| 8 | Tijdlijn | 5 min | Dag 1-30 roadmap doorlopen |
| 9 | Eerste actie | 5 min | "In 48 uur krijg je je eerste aanvraag" |
| 10 | Vragen + next steps | 5 min | Dag 3 check-in inplannen |

### Kickoff Agenda (30 min - Paying)

Abbreviated: items 1, 3, 5, 8, 10 (5 min each).

---

## 4. Pre-Launch Quality Checklist

Run before going live with any client.

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Website live en snel (<3s) | [ ] | Test via PageSpeed Insights |
| 2 | SSL certificaat actief | [ ] | Groen slotje in browser |
| 3 | Mobiel responsive | [ ] | Test op echte telefoon |
| 4 | Chatbot ingebed en werkend | [ ] | Test 5 scenario's (zie SOP 2.4) |
| 5 | Groei-Scan quiz getest | [ ] | Volledige flow doorlopen |
| 6 | Ruben voice agent getest | [ ] | Test call met klantscenario |
| 7 | n8n webhook verbonden | [ ] | Check execution log |
| 8 | Notificaties werken (WhatsApp/Telegram) | [ ] | Stuur test bericht |
| 9 | Cal.com booking flow getest | [ ] | Boek test afspraak |
| 10 | GDPR toestemming verkregen + gedocumenteerd | [ ] | Bewaar in CRM |
| 11 | Klant goedkeuring website content | [ ] | Screenshot van akkoord |
| 12 | Privacy policy live op website | [ ] | /privacy route |
| 13 | Cookie consent banner | [ ] | GDPR vereist |

---

## 5. Handoff Documentation (Client-Facing 1-Pager)

Send after go-live.

```
WAT JE HEBT GEKREGEN:

- Website: [URL]
- Chatbot: Actief op je website (rechtsonder)
- Ruben: Je digitale collega die klanten belt
- Quiz: [ScoreApp URL]
- Dashboard: [Metabase URL of screenshots]

HOE HET WERKT:
Aanvraag via quiz -> Ruben belt -> Afspraak in je agenda -> WhatsApp notificatie

SUPPORT:
- WhatsApp: {{walker_telefoon}} (directe lijn)
- Email: info@dyniq.ai
- Check-ins: dagelijks (Week 1), om de 2 dagen (Week 2-4)

JE GARANTIES:
- 10 nieuwe klanten in 30 dagen
- Eerste klant binnen 72 uur
- Geen lock-in, maandelijks opzegbaar
```

---

## 6. GDPR Consent Form (Dutch)

```
TOESTEMMINGSFORMULIER GESPREKSOPNAME

Ik, {{voornaam}} {{achternaam}}, vertegenwoordiger van {{bedrijfsnaam}},
geef hierbij toestemming aan DYNIQ (Walker Jashari) om:

- [ ] Telefoongesprekken met potentiele klanten op te nemen
- [ ] Deze opnames te gebruiken voor kwaliteitsverbetering
- [ ] Gespreksverslagen op te slaan (max 90 dagen)

Ik begrijp dat:
- Klanten aan het begin van elk gesprek geinformeerd worden
- Ik deze toestemming op elk moment kan intrekken
- Opnames verwijderd worden op verzoek

Naam: ________________________________
Datum: ________________________________
Handtekening: ________________________

Contact privacy: privacy@dyniq.ai
```

---

## Quick Reference: Template Variables

Full dictionary: `.agents/docs/templates/TEMPLATE-VARIABLES.md`

**Minimum required for pilot:**
- `{{voornaam}}` - Client first name
- `{{bedrijfsnaam}}` - Company name
- `{{walker_telefoon}}` - Walker's phone

---

*Checklist v1.0. Referenced by dyniq-client-onboarding.md SOP v3.0.*
