---
title: "DYNIQ Brand Variables - Single Source of Truth"
sidebar_label: "DYNIQ Brand Variables - Single Source of Truth"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# DYNIQ Brand Variables - Single Source of Truth

> **Last updated:** 2026-02-10 (Emerald rebrand: cyan dropped, emerald primary)
> **Authority:** Afternoon B timeblock session 2026-02-10

---

## Archetype

| Property | Value |
|----------|-------|
| Primary | Everyman (60%) |
| Secondary | Caregiver (40%) |
| Voice | Simpel, betrouwbaar, herkenbaar |
| Avoid | Magic/transform language, Magician archetype, "AI" emphasis |

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#10B981` | CTAs, highlights, links, logo |
| Primary Light | `#34D399` | Hover states |
| Primary Dark | `#059669` | CTA gradients (bottom), pressed states |
| Dark BG | `#0F1115` | Dark section backgrounds (70%) |
| Dark Surface | `#171B21` | Elevated dark cards |
| Light BG | `#F9FAFB` | Light section backgrounds (30%) |
| Light Surface | `#FEFEFE` | Light section top gradient |
| Text on dark | `#E5E7EB` | Primary body on dark |
| Text on light | `#0F172A` | Primary body on light |
| Text muted | `#9CA3AF` | Secondary text |
| **DROPPED** | `#00D4FF` | **Never use** (old cyan - too futuristic) |
| **DROPPED** | `#8B5CF6` | **Never use** (old purple) |

### Post-Change Verification (MANDATORY)

After ANY color/brand change, grep ALL repos for old values before committing:
```bash
grep -r '#OLD_HEX' apps/landing/ .claude/ .agents/ templates/
```
Zero matches required. Config files (manifest, tailwind, meta tags) are first-class brand files.

## Logo

| Property | Value |
|----------|-------|
| Shape | Bold "D" with small square block (top-left) |
| Color | `#10B981` (emerald) on dark backgrounds |
| Format | Inline SVG (no PNG dependency) |
| Wordmark | "DYNIQ" in white, bold, next to D mark |

## Gradient

```css
/* CTA button gradient */
background: linear-gradient(to bottom, #10B981, #059669);

/* Gradient text (Hero H1 and Guarantee only) */
background: linear-gradient(135deg, #10B981, #059669);
-webkit-background-clip: text;
```

## Typography

| Element | Style |
|---------|-------|
| Headlines | Bold, emerald `text-primary` for emphasis words |
| Gradient text | Only Hero H1 and Guarantee (emerald-to-deep-emerald) |
| Body | Regular, readable, Inter font, line-height 1.7 |
| CTAs | Confident, practical (not uppercase) |

## Taglines

| Context | Text |
|---------|------|
| Page title | "DYNIQ.AI \| Uw digitale collega voor installateurs" |
| Hero H1 | "Ruben belt je klanten. Jij sluit de deal." |
| Hero sub | "Je digitale collega die potentiele klanten screent..." |
| Guarantee | "10 nieuwe klanten in 30 dagen of geld terug" |
| Meta desc | "Ruben belt potentiele klanten, kwalificeert en plant afspraken in." |
| CTA | "Start je groei-scan" |

## Ruben Identity

| Property | Value |
|----------|-------|
| Title | Uw Digitale Collega |
| Never call | "AI Sales Agent", "Bot", "Digital Sales Expert" |
| Voice | Professional, friendly, Belgian Dutch |
| Availability | "Dag en nacht" (not "24/7") |
| Reaction | "Reageert meteen" (not "< 3 seconden") |

## Language Rules

| Use | Avoid |
|-----|-------|
| klanten, potentiele klanten | leads (jargon) |
| aanvragen | leads |
| nieuwe klanten | leads |
| dag en nacht | 24/7 |
| Uw Digitale Collega | AI Agent |

## Power Words

| Use (Everyman) | Avoid (Magician) |
|----------------|-------------------|
| Werkt | Transformeer |
| Simpel | Magie |
| Helder | Visie |
| Betrouwbaar | Toekomst |
| Gegarandeerd | Revolutionair |

## Pricing

| Tier | Price | Status |
|------|-------|--------|
| Founder's Circle | EUR 997/mo | First 10 only, locked forever |
| Standard (Groeier) | EUR 1.997/mo | Normal price after founders |
| Premium (Schaalbaar) | EUR 2.997/mo | Voice cloning + strategy calls |
| Enterprise | EUR 3.500+/mo | Custom quotes only |
| Annual discount | 2 months free | e.g., EUR 1.997/mo -> EUR 19.970/yr |
| CTA | "Start je groei-scan" | Links to ScoreApp |
| CTA URL | `https://dyniqai-jandqr97.scoreapp.com` | Primary conversion |

**Stripe Checkout Links:** See `DYNIQ-pricing-architecture-5-agent-synthesis-2026-02-09.md`

## Theme Layout

| Property | Value |
|----------|-------|
| Split | 70% dark / 30% light |
| Dark sections | Navigation, Hero, TrustBar, LiveDemo, Comparison, ROI, Guarantee, CTA, Footer |
| Light sections | HowItWorks, BeforeAfter, Testimonials, FAQ |
| Cards (dark) | Solid with depth shadows, no glassmorphism |
| Cards (light) | White with subtle shadow, lift on hover |
| Animations | Minimal fade-up only, no pulse/glow/stagger |

## ICP

| Property | Value |
|----------|-------|
| Name | "The Busy Installer" |
| Age | 35-55 |
| Trade | HVAC, plumbing, electrical |
| Region | Flanders, Belgium |
| Language | Dutch (Belgian) |

---

## Where This Is Referenced

All brand-touching files should import from here instead of defining inline:
- `.claude/commands/dyniq/build-landing.md` - Landing page development
- `.claude/commands/dyniq/create-linkedin-post.md` - Social media
- `.claude/commands/dyniq/create-email.md` - Email sequences
- `content-creation.md` - Content quick ref
- `.agents/sops/SOP-everyman-brand-voice.md` - Brand voice SOP
- `brand-audit-checklist.md` - Audit patterns

**When brand changes:** Update THIS file first, then run `/brand-audit`.

---

*Single source of truth for DYNIQ brand. Update here, propagate with `/brand-audit`.*
