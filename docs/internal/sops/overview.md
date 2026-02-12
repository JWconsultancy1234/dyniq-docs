---
sidebar_position: 1
title: Standard Operating Procedures
description: Internal SOPs for DYNIQ operations and delegation
doc_owner: COO
review_cycle: 30d
doc_status: published
---

# Standard Operating Procedures

:::caution Internal Only
This section is for DYNIQ team members, VAs, and contractors.
:::

## Available SOPs

| SOP | Audience | Review Cycle |
|-----|----------|-------------|
| [Client Onboarding](./client-onboarding) | Walker, VAs | 30 days |
| [Brand Voice Guide](./brand-voice) | All content creators | 60 days |
| [Creating Pydantic AI Agents](./creating-agents) | Developers | 60 days |
| [Deployment Guide](./deployment) | Developers, DevOps | 30 days |
| [n8n Workflow Debugging](./n8n-debugging) | Developers | 60 days |

## SOP Standards

All SOPs follow the GxP-inspired documentation standard:

- **Owner**: Person responsible for keeping the SOP current
- **Review Cycle**: How often the SOP should be reviewed
- **Version History**: Tracked via git commits
- **Audit Trail**: Git blame provides full change history

## Delegation Model

| Delegatable After | SOPs |
|-------------------|------|
| 3 clients | Client Onboarding |
| Immediately | Deployment, n8n Debugging |
| With brand training | Brand Voice Guide |
| With technical onboarding | Creating Agents |

## Adding New SOPs

1. Create new `.md` file in this directory
2. Add GxP frontmatter (`doc_owner`, `review_cycle`, `doc_status`)
3. Follow the standard structure: Purpose, Prerequisites, Steps, Checklist, Troubleshooting
4. Update this overview page
5. Submit PR for review
