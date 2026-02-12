---
sidebar_position: 1
title: Glossary
description: DYNIQ platform terminology, acronyms, and concepts
doc_owner: COO
review_cycle: 90d
doc_status: published
---

# Glossary

Terminology and concepts used across the DYNIQ platform.

## A

### Agent
An AI model instance with a specific role, system prompt, and capabilities. DYNIQ uses 82 static agents organized in a corporate hierarchy.

### Agent Calibration
The process of tracking and improving agent confidence accuracy using Bayesian methods (ECE/ACE metrics).

### AGENT_REGISTRY
The Python dictionary in `agent_registry.py` containing all 82 static agent definitions (roles, prompts, models, tiers).

### agents-api
The FastAPI backend service (`agents-api.dyniq.ai:8000`) that hosts board meetings, content generation, style transfer, and HITL endpoints.

## B

### Board Meeting
A multi-agent decision-making session where 3-82 agents analyze a topic from different perspectives and vote on recommendations.

### Board Meeting Levels
Complexity tiers (0-5) that control how many agents participate:
- **Level 0**: 3 agents (quick check)
- **Level 1**: 8 agents (C-Suite)
- **Level 2**: 20-26 agents (full executive)
- **Level 3-5**: 40-90 agents (deep analysis)

## C

### C-Suite
The top tier of the agent hierarchy: CEO, CFO, CTO, COO, CDO, CMO, CHRO, General Counsel, and Evaluator.

### Cloudflare Timeout
The 100-second proxy timeout enforced by Cloudflare on all `*.dyniq.ai` domains. Requests exceeding this are terminated with a 524 error.

## D

### DYNIQ
AI-native platform for automated lead qualification, voice-based sales, and multi-agent decision-making. Target: Belgian/Dutch trade installers.

### Domain-Weighted Voting
The system where agent votes are weighted based on their expertise relevance to the decision type (e.g., CFO gets 1.5x weight on financial decisions).

## E

### ECE (Expected Calibration Error)
A metric measuring how well an agent's confidence scores match actual accuracy. Lower is better (0.03 is excellent for C-Suite).

### Everyman + Caregiver
The DYNIQ brand archetype: 60% Everyman (practical, proven, simple) + 40% Caregiver (supportive, protective). See [Brand Voice Guide](/docs/internal/sops/brand-voice).

## G

### Groei-Scan
The ScoreApp quiz used for lead capture. Dutch for "Growth Scan". 15 questions qualifying leads as HOT/WARM/COLD.

### GxP-Inspired
Documentation standard inspired by pharmaceutical GxP (Good Practice) but simplified: document ownership, review cycles, and git-based audit trails.

## H

### HITL (Human-in-the-Loop)
A workflow pattern where AI-generated content pauses for human approval before proceeding. Used in content creation and board meeting decisions.

## I

### ICP (Ideal Customer Profile)
"The Busy Installer" - HVAC, plumbing, and electrical contractors aged 35-55 in Flanders and the Netherlands.

## K

### Kimi K2.5
The Moonshot AI model used for the board meeting swarm and style transfer analysis. Cost-efficient for parallel agent execution.

## L

### LangGraph
The orchestration framework (from LangChain) used to define agent workflows as directed graphs with conditional routing.

### Langfuse
Open-source LLM observability platform (`langfuse.dyniq.ai`) for tracing, cost tracking, and agent performance monitoring.

## M

### Mermaid.js
Diagram-as-code library embedded in Docusaurus for rendering architecture diagrams, flowcharts, and sequence diagrams.

## N

### n8n
Self-hosted workflow automation platform (`automation.dyniq.ai`) connecting webhooks, APIs, and data stores.

## O

### OpenRouter
LLM API gateway providing access to multiple models (GPT-4o-mini, Kimi K2.5, etc.) via a single API key.

## P

### Pydantic AI
The Python framework used to define type-safe agents with structured outputs and tool calling.

## R

### Ruben
The DYNIQ AI voice agent ("Uw Digitale Collega") that makes outbound sales calls using LiveKit, Deepgram STT, OpenRouter LLM, and ElevenLabs TTS.

### ruben-api
The voice call dispatch API (`ruben-api.dyniq.ai:8080`). Separate from agents-api.

## S

### SAC (Strategic Agent Council)
The phased development plan for the DYNIQ agent infrastructure. SAC Phase 1 = core agents, Phase 2 = knowledge management, Phase 3 = advanced features.

### Style Transfer
The process of analyzing a brand's voice, ICP, keywords, and USPs using an 8-agent Kimi K2.5 swarm, then generating content in that brand's style.

### Swarm
A collection of agents working in parallel on a single task. The DYNIQ swarm can scale from 3 to 82+ agents.

## T

### Task Force
Dynamically spawned agents from the `TASK_FORCE_REGISTRY` (16 types). Created on-demand for specific tasks, then terminated.

### Thread ID
A unique identifier (`bm-xxxxx`) for tracking async board meeting sessions across API calls.

## V

### Voiceflow
The chatbot platform used for the DYNIQ website chat widget. Handles initial lead capture before Ruben calls.
