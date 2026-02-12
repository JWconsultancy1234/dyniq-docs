---
title: "Scraping Protected Sites"
sidebar_label: "Scraping Protected Sites"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Scraping Protected Sites

Reference for web scraping tasks involving anti-bot protected sites.

---

## Pre-Implementation Research (MANDATORY)

**BEFORE writing ANY scraping code, spend 5 minutes:**

1. Research target site's anti-bot protection
2. Check if premium proxy required (BrightData, SmartProxy)
3. Determine if JavaScript rendering needed (Playwright vs httpx)

**Incident (2026-02-03):** 2 hours wasted on Bol.com trying Apify, httpx, GraphQL before discovering BrightData works. Research first prevents this.

---

## Site-Specific Notes

| Site | Protection Level | Proxy Needed | JS Rendering | Notes |
|------|------------------|--------------|--------------|-------|
| Bol.com | High | BrightData ISP | Yes for full images | Static HTML has ~75% of images |
| Amazon | Very High | BrightData + Playwright | Yes | Aggressive fingerprinting |
| LinkedIn | Very High | Not recommended | N/A | Legal risks, use official API |
| Google | High | Rotating residential | Varies | Rate limits strict |

---

## BrightData Configuration

**Credentials Location:** `walker-os/apps/api/.env`

| Variable | Purpose |
|----------|---------|
| `BRIGHTDATA_USER_NAME` | Account zone identifier |
| `BRIGHTDATA_PASSWORD` | Zone password |
| `BRIGHTDATA_HOST` | Proxy endpoint (default: `brd.superproxy.io:33335`) |

**Proxy URL Format:**
```
http://{username}:{password}@{host}
```

**Session Stickiness (same IP across requests):**
```python
username = f"{base_username}-session-{session_id}"
```

**Port Reference:**
| Port | Proxy Type |
|------|------------|
| 33335 | Residential/ISP (recommended for anti-bot) |
| 22225 | Datacenter (blocked by most protected sites) |

---

## Quick Test

```bash
cd /Users/walker/Desktop/Code/dyniq-ai-agents
python3 tests/local/test_brightdata_bol.py
```

**Expected Output:**
- Status: 200
- Content-Length: 700,000+ chars
- Images extracted: 9+ (from static HTML)

---

## Common Patterns

### httpx with BrightData Proxy

```python
import httpx

proxy_url = f"http://{username}:{password}@{host}"

async with httpx.AsyncClient(
    proxy=proxy_url,
    timeout=90.0,
    follow_redirects=True,
) as client:
    response = await client.get(url, headers=headers)
```

### Mobile User-Agent (Helps Avoid Detection)

```python
headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}
```

---

## Bol.com Specific

### Image Extraction

Gallery images have 124x124 thumbnails. Filter using this:

```python
def extract_product_gallery_images(html: str) -> list[str]:
    """Extract only main product gallery images."""
    image_sizes: dict[str, set[str]] = {}

    for match in re.findall(
        r'https://media\.s-bol\.com/([^/]+/[^/]+)/(\d+x\d+)\.(?:jpg|jpeg|png|webp)',
        html, re.IGNORECASE
    ):
        base, size = match[0], match[1]
        if base not in image_sizes:
            image_sizes[base] = set()
        image_sizes[base].add(size)

    # Only include images that have 124x124 thumbnails
    gallery_images = []
    for base, sizes in image_sizes.items():
        if "124x124" in sizes:
            largest = max(sizes, key=lambda s: int(s.split('x')[0]))
            gallery_images.append(f"https://media.s-bol.com/{base}/{largest}.jpg")

    return sorted(gallery_images)
```

### Known Limitations

| Issue | Cause | Workaround |
|-------|-------|------------|
| Only 9 of 12 images | 3 load via JavaScript | Use Playwright for full extraction |
| Some URLs 404 | Normalized size doesn't exist | Use actual largest available size |
| Blocked after many requests | IP reputation | Use session stickiness, rotate sessions |

---

## Apify vs BrightData

| Approach | Pros | Cons |
|----------|------|------|
| Apify + residential proxy | Managed infrastructure | Blocked by aggressive anti-bot (Bol.com) |
| BrightData ISP | Works on protected sites | Requires credentials, more setup |
| BrightData Browser API | Full JS rendering | Higher cost (~€0.01/page) |

**Recommendation:** Start with BrightData ISP + httpx. Only add Playwright if JavaScript rendering is required.

---

## Cost Estimation

| Service | Cost | Notes |
|---------|------|-------|
| BrightData ISP | ~€0.005/request | Pay per bandwidth |
| Apify Actor | ~€0.005/result | Third-party limited |
| BrightData Browser API | ~€0.01/page | Full JS rendering |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 403 Forbidden | No proxy or blocked proxy | Use BrightData ISP |
| 90s timeout | Site blocking connection | Check proxy credentials |
| Short response (<5KB) | Block page returned | Check for "blocked" in response |
| Missing images | JavaScript-loaded | Use Playwright + BrightData |
| Inconsistent results | IP banned mid-session | Use session stickiness |

---

## Future Improvements

- [ ] Add Playwright + BrightData Browser API for full JS rendering
- [ ] Create reusable `BrightDataClient` class in `shared/`
- [ ] Add automatic retry with session rotation
- [ ] Consider official Bol.com API partnership for production

---

*Last updated: 2026-02-03*
*Reference this doc before ANY scraping implementation.*
