---
title: "Content Creation Reference"
sidebar_label: "Content Creation Reference"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Content Creation Reference

Reference for marketing and social media content tasks.

## LinkedIn 2026 Algorithm ("360 Brew")

Key changes effective January 2026:

| Factor | Impact | Optimization |
|--------|--------|--------------|
| External links | -60% reach | Zero links in post |
| Comments vs Likes | 50 comments > 500 likes | End with conversation question |
| PDF Carousels | Highest performing format | Use 2-slide carousel |
| First 2 lines | Determines "see more" click | Numbers hook above fold |
| Engagement bait | Actively suppressed | No "like if..." or emoji CTAs |
| Expertise signal | 360° profile check | Authentic founder story |
| Golden hour | First 60-90 min critical | Post 8-9 AM or 2-3 PM CET |
| Quality comments | 1 thoughtful > 50 "great post" | Reply to every comment personally |

**Sources:**
- [SocialBee - LinkedIn Algorithm 2026](https://socialbee.com/blog/linkedin-algorithm/)
- [Buffer - How LinkedIn's Algorithm Works](https://buffer.com/resources/linkedin-algorithm/)

---

## Platform Constraints

| Platform | Character Limit | Best Format | Algorithm Notes |
|----------|-----------------|-------------|-----------------|
| LinkedIn | 3,000 chars | Carousel/PDF | No external links, conversation CTAs, first 2 lines crucial |
| Twitter/X | 280 chars | Thread | Hooks matter, engagement bait penalized |
| Instagram | 2,200 chars | Carousel | Hashtags still work, 3-5 recommended |
| YouTube | N/A | Long-form | SEO title, thumbnail critical |

---

## Content Sensitivity Checklist

### Never Expose

- Cost per lead / API costs (undermines pricing power)
- Solopreneur status (use "we" not "I" for team positioning)
- Specific revenue numbers unless strategic
- Customer data examples (even anonymized, be careful)
- Margin information

### Privacy-Positive Reframing

| Avoid | Use Instead |
|-------|-------------|
| "Tracking" | "Visibility" |
| "Logging every call" | "Quality assurance" |
| "Tracing conversations" | "Your data stays yours" |
| "Monitoring" | "Insights" |
| "We collect" | "Self-hosted" / "European hosted" |

---

## DYNIQ Brand Quick Reference

| Element | Value |
|---------|-------|
| Archetype | 60% Everyman + 40% Caregiver (updated 2026-02-10 board meeting) |
| ICP | "The Busy Installer" (35-55, HVAC/plumbing/electrical, BE+NL) |
| Tone | 70% casual, confident, direct, local |
| Promise | "10 nieuwe klanten in 30 dagen of geld terug" (with conditions) |
| Visual | 70/30 dark/light hybrid, Emerald #10B981 (primary), Dark #0F1115 |
| Power words | Werkt, Simpel, Helder, Betrouwbaar (Dutch-first, no magic/transform language) |
| Ruben | "Uw Digitale Collega" (not "Digital Sales Expert" or "AI Employee") |
| Pricing | Show €997/mo + €831/mo annual (2 months free) + ROI calculator |

**Single source of truth:** @brand-variables.md
**Brand voice SOP:** `.agents/sops/SOP-everyman-brand-voice.md`

---

## Content Frameworks

| Framework | Source | Application |
|-----------|--------|-------------|
| Hook-Retain-Reward | Alex Hormozi | Numbers in hook, payoff at end |
| Above the fold | Justin Welsh | First 2 lines are hook before "see more" |
| Build in public | Justin Welsh | Document the journey, show progress |
| POV/Behind scenes | Daniel Dalen | Raw reality, struggles, debugging at 2am |
| Document to delegate | Dan Martell | "So someone else can do this next time" |
| **SPCL across posts** | Hormozi (extended) | Apply SPCL across 4-week arc, not just single post |

---

## SPCL Across Posts (4-Week Content Arc)

**Pattern discovered:** 2026-01-31 content planning session

Instead of applying Hormozi's SPCL (Story-Problem-Cure-Landing) to a single post, apply it across a 4-week content series:

| Week | SPCL Role | Hook Style | Example |
|------|-----------|------------|---------|
| 1 | **Problem** | Pain point | "22 nodes. 0 zicht." |
| 2 | **Cure** | Solution reveal | "5 agents. 117 seconden." |
| 3 | **Story** | Depth/learning | "En als ze fout zitten?" |
| 4 | **Landing** | Vision/CTA | "We bouwen geen app." |

**Benefits:**
- Creates series momentum (readers come back)
- Each post teases the next ("volgende week...")
- Builds narrative arc over time
- More engaging than standalone posts

**Implementation:**
1. Plan 4 posts together, not individually
2. End each post with teaser for next week
3. Start each post with callback to previous
4. Week 4 delivers the "big picture" payoff

**Example callbacks:**
- Week 2: "Vorige week: de agents komen. Deze week: ze beslissen al."
- Week 3: "Week 1: agents. Week 2: voting. Week 3: accountability."
- Week 4: "We toonden agents, voting, accountability. Nu: de visie."

**Meta-content pattern:**
For maximum engagement, make the content self-referential:
1. Ask AI board a real question about content
2. Execute the recommendation
3. Document both question AND execution
4. "This post is the result of that decision"

---

## Content Task Planning

### Task Type Classification

Before planning, identify task type:

| Type | Planning Requirements | Iteration Budget |
|------|----------------------|------------------|
| Code | Standard PRD, validation, testing | 1-3 iterations |
| Content | Brand voice, platform limits, visual format | 10-15 iterations |
| Infrastructure | Rollback plan, health checks, monitoring | 1-2 iterations |

### Content-Specific Planning Additions

For content tasks, always specify:

1. **Platform** - LinkedIn/Twitter/Blog/YouTube
2. **Character limit** - Platform-specific constraint
3. **Brand docs to load** - Path to brand strategy files
4. **Visual format** - Carousel/single image/video
5. **Iteration budget** - Expect 10-15 for social media

---

## Hashtag Strategy (LinkedIn)

**Recommended mix (4-8 tags):**

| Category | Examples |
|----------|----------|
| Core | #BuildInPublic #AIAgents #AI |
| Reach | #Automation #SaaS #Startup |
| Niche | #LeadGeneration #TechFounder |

**Rules:**
- 8 tags maximum (LinkedIn 2026)
- No spaces in hashtags
- Mix broad reach + niche targeting

---

## Visual Format Guidelines

### LinkedIn Carousel (5-Slide Pattern - Proven 2026-02-10)

- **Size:** 1080x1080 (square)
- **Optimal structure:** 5 slides (cover + 2-3 content + proof + CTA)

| # | Slide | Source | Purpose |
|---|-------|--------|---------|
| 1 | Cover (hook headline) | Gemini 3 Pro Image | Stop the scroll |
| 2-3 | Content slides (data/flow) | HTML/Playwright render | Deliver value |
| 4 | Proof (real screenshot) | Playwright dark mode capture | Build trust |
| 5 | CTA (clear action) | Gemini 3 Pro Image | Convert |

- **Style:** Dark #0a0a0f background, brand accent colors, Space Grotesk headings
- **Font:** Inter body, Space Grotesk headings, JetBrains Mono code
- **HTML slides:** Render with Playwright at 2x DPI for crisp output

### Carousel Production Workflow

1. **Run brand-strategist FIRST** before designing any visuals
2. Create HTML templates for data/flow slides in `.agents/content/linkedin/slides/`
3. Render HTML to PNG: `node render-slides.mjs`
4. Generate cover + CTA via Gemini 3 (see `openrouter-reference.md`)
5. Capture real product screenshots via Playwright (dark mode)
6. Run 3 specialist agents in parallel (brand + creative + marketing) for review
7. Iterate based on feedback (~3 rounds typical)

**Reference slides:** `.agents/content/linkedin/slides/E3-006-slide*.html`

### Screenshot Guidelines

- Blur sensitive data (API keys, costs, customer info)
- Highlight relevant areas with boxes/arrows
- Include context (browser frame, timestamp)
- Use `colorScheme: 'dark'` for product screenshots (more professional)

---

## Truth Audit (MANDATORY for DYNIQ Marketing Content)

**Pattern (2026-02-09):** LinkedIn post E3-006 made false claims about self-correcting system. Fixed by adding explicit Truth Audit section.

All DYNIQ marketing content MUST include a Truth Audit before publishing:

| Claim | Verified? | Evidence |
|-------|-----------|----------|
| [Each factual claim in the post] | Yes/No | [Link to code, test output, or screenshot] |

**Mandatory section in content drafts:**

```markdown
### What Is NOT YET TRUE
- [List any aspirational claims or features not yet in production]
- [Be explicit about what is planned vs. deployed]
```

**Rules:**
- Every numerical claim must be verifiable (e.g., "82 agents" → `len(AGENT_REGISTRY)`)
- "Self-correcting" requires proof of actual weight updates, not just code existence
- Screenshots should be from production, not mockups (unless labeled as mockup)
- If something is in development, say "building" not "built"

**Connects to Rule #1:** Never Claim Without Proof applies to marketing content too.

---

## Pre-Publish Checklist

Before publishing customer-facing content:

- [ ] Character count within platform limit
- [ ] No sensitive data (costs, margins, solopreneur status)
- [ ] Privacy-positive framing (no surveillance language)
- [ ] Brand voice aligned (Everyman+Caregiver: simpel, betrouwbaar, helder)
- [ ] CTA is conversation-starter, not engagement bait
- [ ] Visual format matches platform best practices
- [ ] Hashtags optimized (4-8 for LinkedIn)
- [ ] First 2 lines hook the reader
- [ ] "We" not "I" for team positioning
- [ ] Truth Audit completed (all claims verified)

---

## Post-Publish Protocol

1. **Stay online** for first 90 minutes after posting
2. **Reply to EVERY comment** within 15 minutes
3. **Ask follow-up questions** in replies (drives conversation)
4. **No generic responses** - personalize each reply
5. **DM anyone who comments with a question** - builds relationships

---

*Last updated: 2026-02-10 (Everyman+Caregiver rebrand, board meeting ADOPT)*
*Reference this doc for ALL marketing/content tasks.*
