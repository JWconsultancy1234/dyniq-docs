---
title: "Data Analysis Code Examples"
sidebar_label: "Data Analysis Code Examples"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Data Analysis Code Examples

> **Purpose:** Python code snippets for data analysis, correlation, feature engineering, and historical decision search.

## Analysis Framework (4 Phases)

### Phase 1: Collect

```python
from supabase import create_client
supabase = create_client(URL, KEY)
sessions = supabase.table('timeblock_sessions').select('*').execute()
```

### Phase 2: Transform

```python
import pandas as pd
df = pd.DataFrame(sessions.data)
df['date'] = pd.to_datetime(df['date'])
df['productivity'] = df['focus_score'] * df['energy_level'] / 10
```

### Phase 3: Visualize

```python
import matplotlib.pyplot as plt
df.groupby('block_type')['focus_score'].mean().plot(kind='barh')
plt.title('Which Timeblock Works Best?')
```

### Phase 4: Insight

```markdown
## Key Insight

**Finding:** First 90 blocks have 40% higher focus.
**Recommendation:** Prioritize complex work in First 90.
**Expected Impact:** +2 hours productive time per week
```

---

## Correlation Analysis (Walker-OS Context)

### What Drives Focus & Energy?

```python
# Correlate habits with next-day focus
corr_vars = ['morning_exercise', 'meditation', 'sleep_hours', 'focus_score', 'energy_level']
df[corr_vars].corr()
```

**Key Questions:**
- Which habits correlate with high focus scores?
- Does block_type affect productivity?
- What's the relationship between B-hours and weekly wins?

### Lag Analysis (Time-Delayed Effects)

```python
# Does morning exercise affect AFTERNOON energy?
df['exercise_lag'] = df['morning_exercise'].shift(1)  # Previous block
df[['exercise_lag', 'energy_level']].corr()
```

**Walker-OS Examples:**
- "Morning meditation → afternoon focus (lag 1 block)"
- "Low sleep → energy crash 2 days later"
- "Negative lead feedback → conversion drop next week"

---

## Feature Engineering (Freedom Metrics)

```python
# Productivity composite
df['productivity'] = df['focus_score'] * df['energy_level'] / 10

# Rolling 4-week trend
df['focus_trend'] = df.groupby('block_type')['focus_score'].transform(
    lambda x: x.rolling(4).mean()
)

# Day-of-week patterns
df['weekday'] = df['date'].dt.dayofweek
df.groupby('weekday')['focus_score'].mean()

# DYNIQ: Conversion ratio
df['conversion_rate'] = df['closes'] / df['leads']
```

---

## DYNIQ Lead Analysis

### Funnel Metrics

```
Quiz Complete → Lead Captured → Ruben Call → Meeting → Close
     100%          85%            40%          20%       8%
```

### What Predicts Conversion?

| Factor | Data Question | Analysis |
|--------|---------------|----------|
| Industry | Which industries close best? | `groupby('industry')['converted'].mean()` |
| Quiz score | Do high scorers convert more? | Correlation + regression |
| Response time | Does speed matter? | Lag analysis |
| Call time | Best time for Ruben calls? | Hour-of-day breakdown |

---

## Historical Decision Search (Board Meeting Phase 1)

**Purpose:** Load similar past decisions to inform current decision with institutional memory.

### Query Implementation

```python
from supabase import create_client

def search_historical_decisions(topic: str, decision_type: str = None, limit: int = 5):
    """
    Search past board meeting decisions using full-text search.

    Args:
        topic: Current decision topic (e.g., "MoltBot evaluation")
        decision_type: Optional filter (financial, technical, strategic, operational, market)
        limit: Number of results to return

    Returns:
        List of past decisions with outcomes and impact data
    """
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Build full-text search query
    query = supabase.table("board_meeting_decisions") \
        .select("topic, decision_summary, decision_type, ceo_decision, ceo_rationale, "
                "predicted_impact, actual_impact, outcome_status, agent_votes, "
                "complexity_level, meeting_date, created_at")

    # Full-text search on topic
    query = query.text_search("topic", topic, config="english")

    # Optional: filter by decision type
    if decision_type:
        query = query.eq("decision_type", decision_type)

    # Order by recency
    query = query.order("meeting_date", desc=True)

    # Limit results
    query = query.limit(limit)

    # Execute
    response = query.execute()

    return response.data


def format_historical_context(similar_decisions):
    """
    Format search results for CEO presentation in Phase 1.

    Returns formatted string with past decisions, outcomes, and learnings.
    """
    if not similar_decisions:
        return "No similar past decisions found in database."

    context = "## Historical Context (Similar Past Decisions)\n\n"

    for i, decision in enumerate(similar_decisions, 1):
        context += f"### {i}. {decision['topic']}\n"
        context += f"**Date:** {decision['meeting_date']}\n"
        context += f"**Type:** {decision['decision_type'].title()}\n"
        context += f"**Decision:** {decision['ceo_decision']}\n"

        # Show outcome if reviewed
        if decision['outcome_status'] != 'pending':
            context += f"**Outcome (T+30):** {decision['outcome_status']}\n"

        # Show actual vs predicted impact
        if decision['actual_impact']:
            predicted = decision['predicted_impact']
            actual = decision['actual_impact']
            context += f"**Impact Analysis:**\n"
            context += f"  - Predicted: {predicted}\n"
            context += f"  - Actual: {actual}\n"

        # Extract key learning
        if decision['ceo_rationale']:
            context += f"**Rationale:** {decision['ceo_rationale'][:200]}...\n"

        context += "\n"

    return context
```

### Example Usage (Phase 1 of Board Meeting)

```python
# During Phase 1: Frame & Load
topic = "MoltBot Evaluation"
decision_type = "technical"

# Search similar decisions
similar = search_historical_decisions(topic, decision_type, limit=3)

# Format for CEO
historical_context = format_historical_context(similar)

# Present to CEO
print(historical_context)
```

### Expected Output

```
## Historical Context (Similar Past Decisions)

### 1. Cursor AI Integration
**Date:** 2025-12-15
**Type:** Technical
**Decision:** ADOPT with 2-week trial
**Outcome (T+30):** confirmed_good
**Impact Analysis:**
  - Predicted: 4h/week time savings
  - Actual: 6h/week time savings (better than expected)
**Rationale:** Strong time buyback justified cost. Rollback plan mitigated risk...

### 2. Tavily Research API
**Date:** 2025-11-20
**Type:** Technical
**Decision:** ADOPT
**Outcome (T+30):** needs_adjustment
**Impact Analysis:**
  - Predicted: Better lead research quality
  - Actual: Good quality but rate limits hit faster than expected
**Rationale:** Market research capability was missing. API key management needed...
```

### Integration with Phase 1

1. **CEO frames problem** (5 min)
2. **Data Executive searches in parallel** (use code above)
3. **Data presents historical context** (3 min)
4. **CEO adjusts decision framing** based on past learnings
5. **Continue to Phase 2** with informed starting point

---

*Reference for Head of Data agent - Python implementation examples.*
