---
sidebar_position: 6
title: Vision API
description: UI-to-code generation converting screenshots and descriptions into React components
---

# Vision API

The vision pipeline converts screenshots, wireframes, or text descriptions into production-ready React components using Kimi K2.5's native vision capabilities.

## UI to Code

Convert an image or description into a React component.

```
POST /api/vision/ui-to-code
```

### Request Body

Provide at least one of `image_base64`, `image_url`, or `description`:

```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "description": "A pricing card with 3 tiers, dark background, emerald accent",
  "components_hint": ["PricingCard", "PricingTier", "FeatureList"],
  "brand_colors": ["#0F1115", "#10B981", "#FFFFFF"],
  "context": "Part of the DYNIQ landing page, Tailwind CSS"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image_base64` | string | One of three | Base64 encoded image (PNG, JPG, WebP) |
| `image_url` | string | One of three | URL to image |
| `description` | string | One of three | Text description of desired UI |
| `components_hint` | string[] | No | Suggested component names |
| `brand_colors` | string[] | No | Brand colors to use |
| `context` | string | No | Additional context (framework, design system) |

### Response

```json
{
  "thread_id": "vis-abc123",
  "status": "completed",
  "component_code": "import React from 'react';\n\ninterface PricingCardProps {\n  ...\n}\n\nexport function PricingCard({ ... }: PricingCardProps) {\n  return (\n    <div className=\"bg-[#0F1115] ...\">\n      ...\n    </div>\n  );\n}",
  "types_code": "export interface PricingTier {\n  name: string;\n  price: number;\n  features: string[];\n  highlighted?: boolean;\n}",
  "confidence": 0.89,
  "cost_usd": 0.05,
  "model": "moonshotai/kimi-k2.5",
  "generation_time_seconds": 28
}
```

## Check Status

```
GET /api/vision/status/{thread_id}
```

For long-running generations (complex multi-component layouts):

```json
{
  "thread_id": "vis-abc123",
  "status": "processing",
  "progress": "Generating component structure..."
}
```

## Submit Feedback

Provide feedback on generated code for future improvement.

```
POST /api/vision/feedback
```

```json
{
  "thread_id": "vis-abc123",
  "rating": 4,
  "corrections": "The spacing between pricing tiers should be larger"
}
```

## Supported Input Formats

| Format | Extension | Max Size |
|--------|-----------|----------|
| PNG | .png | 10MB |
| JPEG | .jpg, .jpeg | 10MB |
| WebP | .webp | 10MB |

## Performance

| Metric | Value |
|--------|-------|
| Typical generation time | ~30 seconds |
| API timeout | 180 seconds |
| Cost per request | ~$0.05 |
| Model | Kimi K2.5 (native vision) |

:::tip Best Results
For best code generation quality:
- Provide clear, high-contrast screenshots
- Include `components_hint` with desired component names
- Specify `brand_colors` for accurate color matching
- Add `context` about the framework and design system in use
:::
