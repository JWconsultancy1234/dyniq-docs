---
title: "Tavily Search API Gotchas"
sidebar_label: "Tavily Search API Gotchas"
owner: walker
last_review: 2026-02-13
classification: internal
tags: [reference, auto-synced]
---

# Tavily Search API Gotchas

Lessons learned from DYNIQ lead intelligence integration.

## Critical: AI Hallucination

`include_answer: true` enables Tavily's AI summary feature. **This can hallucinate:**

- Fake business connections (combining search terms into fictional entities)
- Incorrect company information
- Wrong industry associations

**Real example:** Searching "Camicoo Dakwerken Antwerpen" with `include_answer: true` returned:
> "Camicoo Dakwerken Antwerpen België is a roofing company registered with the KBO..."

**Reality:** Camicoo is an e-commerce brand selling camper accessories. It has nothing to do with roofing.

**Rule:** Disable `include_answer` for business verification. Only use for general knowledge queries.

---

## Search Strategy

### Company Lookup (DO)

```json
{
  "api_key": "...",
  "query": "CompanyName KvK KBO BTW ondernemingsnummer",
  "search_depth": "advanced",
  "include_answer": false,
  "max_results": 8
}
```

### Company Lookup (DON'T)

```json
{
  "query": "CompanyName Dakwerken Antwerpen bedrijf",
  "include_answer": true
}
```

**Why it fails:** Tavily combines all search terms and may find roofing companies, then attribute them to "CompanyName" in its AI summary.

---

## Result Processing

### What Tavily Returns

| Field | Contains | Useful For |
|-------|----------|------------|
| `results[].title` | Page title | Display |
| `results[].url` | Page URL | Links |
| `results[].snippet` | Text excerpt | May be marketing copy |
| `answer` | AI-generated summary | **UNRELIABLE for business data** |

### What Tavily Does NOT Return

- Structured business data
- Verified KvK/KBO numbers (must parse from snippets)
- Confirmed company information

### Extracting Structured Data

Parse registry info from snippets:

```javascript
function extractBusinessInfo(snippet) {
  const info = {};

  // Dutch KvK (8 digits)
  const kvkMatch = snippet.match(/KvK[:\s-]*(\d{8})/i);
  if (kvkMatch) info.kvk = kvkMatch[1];

  // Dutch BTW (NL + 9 digits + B + 2 digits)
  const nlBtwMatch = snippet.match(/(NL\d{9}B\d{2})/i);
  if (nlBtwMatch) info.btw = nlBtwMatch[1];

  // Belgian KBO (10 digits, often with dots)
  const kboMatch = snippet.match(/(\d{4}[.\s]?\d{3}[.\s]?\d{3})/);
  if (kboMatch) info.kbo = kboMatch[1].replace(/[.\s]/g, '');

  // Belgian BTW (BE + 10 digits)
  const beBtwMatch = snippet.match(/(BE\s?\d{4}[.\s]?\d{3}[.\s]?\d{3})/i);
  if (beBtwMatch) info.btw = beBtwMatch[1].replace(/[.\s]/g, '');

  return info;
}
```

---

## Filtering Garbage Results

Tavily may return irrelevant results. Filter before display:

```javascript
function isRelevantResult(result, companyName, leadName) {
  const content = (result.title + ' ' + result.snippet + ' ' + result.url).toLowerCase();

  // Garbage domains to reject
  const garbage = ['amazon.', 'ebay.', 'aliexpress.', 'wikipedia.', 'dictionary'];
  if (garbage.some(g => result.url.toLowerCase().includes(g))) return false;

  // Must contain company or lead name
  const searchTerms = [companyName, leadName].filter(Boolean).map(s => s.toLowerCase());
  return searchTerms.some(term => content.includes(term));
}
```

---

## Benelux Considerations

DYNIQ serves both NL and BE. **Don't restrict to single-country registries:**

```javascript
// WRONG - Misses Dutch companies
"include_domains": ["staatsbladmonitor.be", "kbo.be"]

// WRONG - Misses Belgian companies
"include_domains": ["kvk.nl", "companyweb.be"]

// CORRECT - Broad search
// Don't use include_domains, filter results by relevance instead
```

---

## Fallback Messaging

When no relevant results found:

```javascript
if (filteredResults.length === 0) {
  return {
    message: "Geen relevante online aanwezigheid gevonden",
    action: "Vraag tijdens het gesprek naar website, socials en KvK/KBO nummer"
  };
}
```

**Never display garbage results.** Empty is better than wrong.

---

## Alternative Approaches

For reliable business data, consider:

| Need | Better Option |
|------|---------------|
| KvK lookup (NL) | KvK API or OpenKVK |
| KBO lookup (BE) | KBO Public Search API |
| Company verification | CompanyWeb, OpenCorporates |
| LinkedIn profiles | LinkedIn Sales Navigator API |

Tavily is a **search engine**, not a **business registry API**.

---

*Added: 2026-01-20 after lead intelligence hallucination incident*

---

## R&D Research / Board Meeting Usage

### Query Length Limit (CRITICAL)

**Tavily API rejects queries >400 characters.**

| Limit | Value |
|-------|-------|
| Max query length | 400 characters |
| Default results | 5 per trace |
| Cache TTL | 24 hours (Redis) |

### Problem: Truncation Produces Meaningless Queries

```python
# BAD - long topic truncated to meaningless query
query = f"{topic} news trends 2026"[:400]
# "FULL EPIC REVIEW: DYNIQ Autonomous Enterprise - Ph..." → dictionary results for "full"
```

### Solution: Extract Meaningful Search Terms

Extract key terms instead of truncating:

```python
def _extract_search_terms(topic: str, max_length: int = 200) -> str:
    # 1. Extract content after colons (the real topic)
    if ":" in topic[:50]:
        main_content = topic.split(":", 1)[1].strip()

    # 2. Extract pricing/money terms
    money_terms = re.findall(r'[€$]\d+[KkMm]?', topic)

    # 3. Split on separators, take first 3 parts
    parts = re.split(r' - |, ', main_content)[:3]

    return " ".join(parts + money_terms)[:max_length]
```

**Implementation:** `research_traces.py:_extract_search_terms()`

### Prefix Detection

Topics starting with these prefixes ALWAYS need term extraction:

| Prefix | Example |
|--------|---------|
| `FULL ` | "FULL EPIC REVIEW: ..." |
| `EPIC` | "EPIC: DAE-001 ..." |
| `REVIEW:` | "REVIEW: Phase 6 ..." |
| `BOARD MEETING:` | "BOARD MEETING: Strategic..." |

---

## Multi-Trace Fusion Pattern

Board meeting R&D research runs 3 parallel Tavily searches:

| Trace | Query Template | Max Results |
|-------|----------------|-------------|
| News | `{topic} news trends {year}` | 5 |
| Competitors | `{topic} competitors alternatives` | 5 |
| Risks | `{topic} risks challenges opportunities` | 5 |

**Timeout:** 30 seconds for all 3 traces combined (parallel execution)

---

## Authority Sources Boost

Results from these domains get +5 relevance score:

```python
AUTHORITY_SOURCES = [
    "techcrunch.com", "reuters.com", "bloomberg.com",
    "wsj.com", "forbes.com", "hbr.org", "mckinsey.com",
    "gartner.com", "forrester.com", "wired.com"
]
```

---

## Redis Caching

Results are cached with 24h TTL:

```bash
# Cache key pattern: rd_research:{topic_hash}

# Flush R&D cache
ssh contabo "docker exec docker-redis-1 redis-cli KEYS 'rd_*' | xargs -r docker exec -i docker-redis-1 redis-cli DEL"
```

---

## Test Command

```bash
export AGENTS_API_KEY=$(grep '^AGENTS_API_KEY=' ~/Desktop/Code/walker-os/apps/api/.env | cut -d'=' -f2)
curl -s -X POST https://agents-api.dyniq.ai/api/board-meeting/analyze \
  -H "X-API-Key: $AGENTS_API_KEY" -H "Content-Type: application/json" \
  -d '{"topic":"FULL EPIC REVIEW: Test","level":1,"decision_type":"strategic","options":["A","B"],"skip_research":false}' \
  | jq '{news: .rd_research.news | length, competitors: .rd_research.competitors | length}'
# Expected: {news: 5, competitors: 5}
```

---

## R&D Research Incident History

| Date | Issue | Fix |
|------|-------|-----|
| 2026-02-03 | EPIC topics returned dictionary definitions | Added prefix detection + term extraction |
| 2026-02-03 | R&D research logs invisible | Switched to `get_logger()` |

---

*Updated: 2026-02-03 after R&D research debugging session*
