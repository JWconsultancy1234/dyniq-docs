---
sidebar_position: 1
title: Data Models
description: Database schemas, ER diagrams, and field documentation for DYNIQ databases
doc_owner: CTO
review_cycle: 60d
doc_status: published
---

# Data Models

DYNIQ uses two Supabase projects and one Contabo Postgres instance. This page documents all database schemas with ER diagrams.

## Database Overview

| Database | Purpose | Key Tables |
|----------|---------|------------|
| **DYNIQ Supabase** | Business data | leads, quiz_responses, content_posts, board_meetings |
| **Walker-OS Supabase** | Personal data | daily_scorecard, weekly_cashflow, timeblock_sessions |
| **Contabo Postgres** | LiveKit/Langfuse | livekit sessions, langfuse traces |

## DYNIQ Database

### Leads Table (91 columns)

The central table for all lead data. Email is the unique key.

```mermaid
erDiagram
    LEADS {
        uuid id PK
        text email UK "NOT NULL, UNIQUE"
        text name
        text phone
        text company_name
        text industry
        text source "pilot, quiz, referral"
        text status "onboarding, active, churned"
        text tier "HOT, WARM, COLD"
        integer lead_score
        text[] pain_points "ARRAY type"
        text[] needs "ARRAY type"
        text urgency "CHECK constraint"
        timestamptz created_at
        timestamptz updated_at
    }

    QUIZ_RESPONSES {
        uuid id PK
        text email FK "Links to leads"
        integer total_score
        text tier "HOT, WARM, COLD"
        text sales_briefing_url
        jsonb answers
        timestamptz created_at
    }

    CONTENT_POSTS {
        uuid id PK
        text platform "linkedin, twitter"
        text hook
        text topic
        text body
        date post_date
        timestamptz created_at
    }

    CONTENT_METRICS {
        uuid id PK
        uuid post_id FK
        integer likes
        integer comments
        float engagement_rate
        date metric_date
    }

    LEADS ||--o{ QUIZ_RESPONSES : "email"
    CONTENT_POSTS ||--o{ CONTENT_METRICS : "post_id"
```

### Key Constraints

| Table | Column | Type | Constraint |
|-------|--------|------|-----------|
| leads | email | text | UNIQUE, NOT NULL |
| leads | urgency | text | CHECK (valid enum) |
| leads | pain_points | text[] | ARRAY - use `'{val1,val2}'` format |
| leads | tier | text | CHECK (HOT/WARM/COLD) |
| quiz_responses | email | text | FK to leads.email |

:::warning Empty Strings
Columns with CHECK constraints reject `""`. Always use `null` instead of empty strings.
:::

### Board Meeting Tables

```mermaid
erDiagram
    BOARD_MEETINGS {
        uuid id PK
        text thread_id UK "bm-xxxxx format"
        text topic
        text decision_type
        integer level "0-5"
        text status "processing, completed"
        jsonb agent_analyses
        text recommendation "ADOPT, DEFER, REJECT"
        float total_cost_usd
        integer agent_count
        timestamptz created_at
    }

    UNIVERSAL_EMBEDDINGS {
        uuid id PK
        uuid source_id FK "UUID type - NOT string"
        text source_type
        text content
        vector embedding "vector(1536)"
        jsonb metadata
        timestamptz created_at
    }

    BOARD_MEETINGS ||--o{ UNIVERSAL_EMBEDDINGS : "source_id"
```

:::danger UUID Type
`universal_embeddings.source_id` is UUID type. Convert string IDs to UUID5:
```python
import uuid
source_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, thread_id)
```
:::

## Walker-OS Database

### Productivity Tables

```mermaid
erDiagram
    DAILY_SCORECARD {
        uuid id PK
        date scorecard_date UK
        boolean fajr
        boolean mind
        boolean body
        boolean shutdown_ritual
        boolean first_90
        float b_quadrant_hours
        text energy_level "high, medium, low"
        text day_verdict "green, yellow, red"
        timestamptz created_at
    }

    TIMEBLOCK_SESSIONS {
        uuid id PK
        text block_type "first_90, deep_work, midday_b"
        timestamptz started_at
        timestamptz ended_at
        text summary
        float hours
        text quadrant "E, S, B, I"
    }

    WEEKLY_CASHFLOW {
        uuid id PK
        date week_start
        float income
        float fixed_costs
        float freedom_fund
        float play_money
        float long_term_savings
        float education
        float charity_zakat
    }

    WEEKLY_REVIEWS {
        uuid id PK
        date review_date
        float path_a_hours
        float path_b_hours
        float e_quadrant_hours
        text top_wins
        text blockers
        text next_week_priorities
    }

    NET_WORTH {
        uuid id PK
        date snapshot_date
        float total_assets
        float total_liabilities
        float net_worth
        jsonb asset_breakdown
    }
```

### Financial Tables

```mermaid
erDiagram
    PROFIT_FIRST_BUCKETS {
        uuid id PK
        date period_start
        float revenue
        float fixed_costs_pct "50%"
        float freedom_pct "15%"
        float play_pct "12.5%"
        float savings_pct "10%"
        float education_pct "10%"
        float zakat_pct "2.5%"
    }

    PATH_A {
        uuid id PK
        text milestone
        date target_date
        text status
        float equity_percentage "45%"
        text notes
    }

    PATH_B {
        uuid id PK
        text product
        float mrr_target "10000"
        float mrr_current
        text status
        text notes
    }

    DECISION_FILTER_HISTORY {
        uuid id PK
        text decision
        text outcome "DO_NOW, DELEGATE, SCHEDULE, CUT"
        float hourly_value_test
        boolean path_aligned
        text path "A or B"
        timestamptz created_at
    }
```

## Cross-Service Communication

```mermaid
flowchart LR
    subgraph External
        ScoreApp[ScoreApp Quiz]
        Twilio[Twilio SIP]
        Phone[Phone]
    end

    subgraph n8n["n8n (automation.dyniq.ai)"]
        Webhook[Webhook Receiver]
        Pipeline[Lead Pipeline]
        Notify[Notifications]
    end

    subgraph Voice["Voice Stack (voice-net)"]
        AgentsAPI[agents-api]
        RubenAPI[ruben-api]
        LiveKit[LiveKit]
        Ruben[Ruben Agent]
    end

    subgraph Data["Data Stores"]
        DyniqDB[(DYNIQ Supabase)]
        WalkerDB[(Walker-OS Supabase)]
        Langfuse[(Langfuse)]
    end

    ScoreApp -->|webhook| Webhook
    Webhook --> Pipeline
    Pipeline -->|qualify| AgentsAPI
    Pipeline -->|store| DyniqDB
    Pipeline -->|notify| Notify
    AgentsAPI -->|dispatch| RubenAPI
    RubenAPI --> LiveKit
    LiveKit --> Ruben
    Ruben -->|traces| Langfuse
    Twilio <-->|SIP| LiveKit
    Phone <-->|call| Twilio
```

## Schema Discovery

Before proposing new tables, check what exists:

```sql
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns c
        WHERE c.table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

Check column types before INSERT:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```
