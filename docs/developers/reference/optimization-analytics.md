---
title: "Optimization Analytics Framework"
sidebar_label: "Optimization Analytics Framework"
owner: walker
last_review: 2026-02-12
classification: internal
tags: [reference, auto-synced]
---

# Optimization Analytics Framework

> **Purpose:** Data-driven approach to system optimization using the Head of Data methodology.
> **Principle:** Every optimization decision backed by data. Pattern detection drives prevention.

---

## 📌 7-Phase Analysis Framework

| Phase | What | Why | Tools |
|-------|------|-----|-------|
| 1 | Data Collection | Track all issue attributes | issue-tracker.md → Supabase |
| 2 | Exploration | Understand patterns | SQL queries, pandas |
| 3 | Visualization | Trends visible | Charts in dashboards |
| 4 | Calculations | Simple insights | Aggregations, ratios |
| 5 | Feature Engineering | Derived metrics | Complexity score, impact score |
| 6 | Correlations | What causes issues? | Category × time-to-fix |
| 7 | Predictions | Prevent future issues | ML on patterns |

---

## Phase 1: Data Collection Schema

### Issue Attributes (Supabase: `optimization_issues`)

```sql
CREATE TABLE optimization_issues (
  id TEXT PRIMARY KEY,           -- OPT-001
  issue TEXT NOT NULL,           -- Description
  category TEXT NOT NULL,        -- commands|agents|planning|infrastructure
  subcategory TEXT,              -- oversized|duplicate|broken-ref|missing-link
  priority INTEGER,              -- 0=critical, 1=high, 2=medium, 3=low
  first_seen DATE,
  fixed_date DATE,
  status TEXT,                   -- OPEN|IN_PROGRESS|FIXED|WONT_FIX
  time_spent_minutes INTEGER,
  recurrence_count INTEGER DEFAULT 0,
  root_cause_id TEXT,            -- RCA-001
  files_affected TEXT[],         -- Array of file paths
  lines_over_limit INTEGER,      -- For oversized issues
  duplicate_count INTEGER,       -- For duplication issues
  resolution TEXT,
  created_by TEXT,               -- Which command found it
  sprint TEXT                    -- When tracked
);
```

### Run History (Supabase: `optimization_runs`)

```sql
CREATE TABLE optimization_runs (
  id SERIAL PRIMARY KEY,
  run_date TIMESTAMP,
  scope TEXT,                    -- all|planning|commands|agents
  health_score_overall DECIMAL,
  health_score_planning DECIMAL,
  health_score_commands DECIMAL,
  health_score_agents DECIMAL,
  issues_found INTEGER,
  issues_fixed INTEGER,
  time_spent_minutes INTEGER,
  triggered_by TEXT              -- /optimize|/system-review|manual
);
```

---

## Phase 2: Exploration Queries

### Basic Statistics

```sql
-- Issues by category
SELECT category, COUNT(*) as count, AVG(time_spent_minutes) as avg_fix_time
FROM optimization_issues
WHERE status = 'FIXED'
GROUP BY category;

-- Issues by priority
SELECT priority, COUNT(*) as count,
       AVG(DATE_PART('day', fixed_date - first_seen)) as avg_days_to_fix
FROM optimization_issues
WHERE status = 'FIXED'
GROUP BY priority;

-- Recurrence rate by root cause
SELECT root_cause_id, COUNT(*) as total,
       SUM(CASE WHEN recurrence_count > 0 THEN 1 ELSE 0 END) as recurred,
       ROUND(100.0 * SUM(CASE WHEN recurrence_count > 0 THEN 1 ELSE 0 END) / COUNT(*), 1) as rate
FROM optimization_issues
GROUP BY root_cause_id;
```

### Missing/Anomaly Detection

```sql
-- Issues without root cause assigned
SELECT id, issue FROM optimization_issues
WHERE root_cause_id IS NULL AND status = 'FIXED';

-- Unusually long fix times (>2 std dev)
SELECT id, issue, time_spent_minutes
FROM optimization_issues
WHERE time_spent_minutes > (
  SELECT AVG(time_spent_minutes) + 2 * STDDEV(time_spent_minutes)
  FROM optimization_issues WHERE status = 'FIXED'
);
```

---

## Phase 3: Visualization Specs

### 1. Health Score Trend (Line Chart)

```
X-axis: Date (weekly)
Y-axis: Health score (0-100%)
Lines: Overall, Planning, Commands, Agents
Goal line: 90% target
```

### 2. Issue Velocity (Bar + Line)

```
Bars: New issues per week (by priority color)
Line: Cumulative open issues
Target: Net change trending negative
```

### 3. Category Distribution (Stacked Bar)

```
X-axis: Week
Y-axis: Issue count
Stacks: commands|agents|planning|infrastructure
Insight: Which category creates most issues?
```

### 4. Time-to-Fix by Priority (Box Plot)

```
X-axis: Priority (P0, P1, P2, P3)
Y-axis: Days to fix
Boxes: Distribution with median, quartiles
Insight: Are we meeting SLAs?
```

### 5. Root Cause Heatmap

```
X-axis: Root cause category
Y-axis: Week
Color: Issue count
Insight: Are we fixing root causes or just symptoms?
```

---

## Phase 4: Key Metrics

### Core KPIs

| Metric | Formula | Target | Current |
|--------|---------|--------|---------|
| Health Score | (1 - issues_weighted/max_issues) × 100 | >90% | 72% |
| Time-to-Fix (P0) | AVG(fixed_date - first_seen) WHERE priority=0 | <1 day | 0.5 days |
| Time-to-Fix (P1) | AVG(fixed_date - first_seen) WHERE priority=1 | <7 days | TBD |
| Recurrence Rate | recurred / total_fixed × 100 | <10% | 0% |
| Fix Velocity | issues_fixed / week | >5/week | 5 |
| Issue Debt | SUM(open issues × priority weight) | <20 points | 32 |

### Priority Weights for Debt Calculation

| Priority | Weight | Example |
|----------|--------|---------|
| P0 | 8 | 5 issues × 8 = 40 points |
| P1 | 4 | 10 issues × 4 = 40 points |
| P2 | 2 | 6 issues × 2 = 12 points |
| P3 | 1 | 1 issue × 1 = 1 point |

---

## Phase 5: Feature Engineering

### Derived Metrics per Issue

```python
# Complexity score (higher = harder to fix)
df['complexity_score'] = (
    df['files_affected'].apply(len) * 2 +
    df['lines_over_limit'].fillna(0) / 50 +
    df['duplicate_count'].fillna(0) * 1.5
)

# Impact score (higher = more valuable to fix)
df['impact_score'] = (
    (4 - df['priority']) * 3 +  # P0=12, P1=9, P2=6, P3=3
    df['recurrence_count'] * 5 +
    (df['category'] == 'commands').astype(int) * 2  # Commands impact daily work
)

# ROI score (impact / complexity)
df['roi_score'] = df['impact_score'] / (df['complexity_score'] + 1)

# Time efficiency (actual vs expected)
df['efficiency'] = df['expected_minutes'] / df['time_spent_minutes']
```

### Derived Metrics per Run

```python
# Week-over-week change
df['health_delta'] = df['health_score_overall'].diff()

# Issue burn rate
df['burn_rate'] = df['issues_fixed'] / df['issues_found']

# Debt trend
df['debt_trend'] = df['issue_debt'].diff()
```

---

## Phase 6: Correlation Analysis

### Key Questions

| Question | Variables | Method |
|----------|-----------|--------|
| What predicts long fix times? | category, complexity, priority | Regression |
| What categories recur most? | category, root_cause | Chi-square |
| Does early detection reduce fix time? | days_open, time_spent | Correlation |
| Which root causes cluster together? | root_cause patterns | Association rules |

### Example Correlations to Track

```python
# Correlation matrix
corr_vars = ['time_spent_minutes', 'complexity_score', 'files_affected_count',
             'lines_over_limit', 'days_to_fix', 'recurrence_count']

# Expected findings:
# - complexity_score ↔ time_spent (positive)
# - days_open ↔ time_spent (positive - stale issues harder)
# - P0 priority ↔ time_spent (negative - we fix critical fast)
```

### Lag Analysis

```python
# Does health score drop predict issue spike?
# Shift health score by 1 week, correlate with issues_found
df['health_lag1'] = df['health_score_overall'].shift(1)
lag_corr = df[['health_lag1', 'issues_found']].corr()
```

---

## Phase 7: Predictive Analytics (Future)

### Models to Build

| Model | Purpose | Features | Target |
|-------|---------|----------|--------|
| Issue Risk Predictor | Flag files likely to cause issues | lines, age, complexity, change frequency | issue_probability |
| Fix Time Estimator | Accurate time estimates | category, complexity, priority | time_spent_minutes |
| Root Cause Classifier | Auto-assign RCA | issue_text, category, files | root_cause_id |
| Health Forecaster | Predict next week's score | historical scores, issue velocity | health_score |

### Anomaly Detection

```python
# Isolation Forest for unusual issues
from sklearn.ensemble import IsolationForest

features = df[['time_spent_minutes', 'complexity_score', 'files_affected_count']]
clf = IsolationForest(contamination=0.1)
df['is_anomaly'] = clf.fit_predict(features)

# Anomalies: investigate why they took unusually long/short
```

---

## Integration with Commands

### /optimize Command Updates

Add to `/optimize` output:

```markdown
## Data Insights

**This Run:**
- Complexity score: 8.5 (above average)
- ROI priorities: OPT-006 (roi=4.2), OPT-014 (roi=3.8)
- Anomaly: OPT-003 took 30min but complexity was low - investigate

**Trends:**
- Health: 72% (↓3% from last week)
- Burn rate: 0.83 (fixing fewer than finding)
- Top root cause: Oversized files (9/22 = 41%)

**Predictions:**
- Risk files: plan-feature.md, system-review.md (growing fast)
- Next P0 likely in: commands category
```

### /system-review Command Updates

Add analytics section:

```markdown
## Analytics Summary

| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| Health | 72% | 75% | ↓ |
| Issues Fixed | 5 | 3 | ↑ |
| Avg Fix Time | 13 min | 18 min | ↑ |
| Recurrence | 0% | 0% | = |

**Root Cause Progress:**
- RCA-001 (oversized): 9 open → 8 open
- RCA-002 (duplicate): 4 open → 0 open ✅
- RCA-003 (naming): 1 open → 0 open ✅
```

---

## Head of Data Consultation Points

Before major optimization decisions, consult Head of Data:

1. **Before fixing P1 batch:** "Which issues have highest ROI score?"
2. **After each run:** "Any anomalies in fix times or patterns?"
3. **Weekly review:** "What's the health score trend? Are we improving?"
4. **Before creating new reference doc:** "Is there correlation showing this duplication causes issues?"
5. **Before adding prevention rule:** "What's the recurrence rate for this category?"

---

## Migration Path

### Phase 1 (Current): Markdown Tracking
- issue-tracker.md for issues
- optimization-history.md for runs
- Manual updates

### Phase 2 (Q1 2026): Supabase Tables
- Create tables per schema above
- Add views for common queries
- Keep markdown as backup/export

### Phase 3 (Q2 2026): Dashboard
- Real-time health score in walker-os UI
- Issue velocity charts
- Root cause heatmap
- Anomaly alerts

---

*Data-driven optimization. The Head of Data approves all patterns before action.*
