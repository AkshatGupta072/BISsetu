# BISsetu
# BISsetu (BIS Setu) — BIS AI Assistant

> AI Assistant for Indian Standards, Bureau of Indian Standards (BIS) Certification Schemes, Compliance, and Quality Control Orders (QCOs).

---

## Overview

**BISsetu** is an intelligent, domain-specific AI assistant built to bridge the gap between Indian consumers, manufacturers, MSMEs, startups, and technical standards established by the **Bureau of Indian Standards (BIS)**.

It operates under a strict **Retrieve → Verify → Understand → Explain** pipeline.

Rather than generating speculative answers, BISsetu acts as an explanation layer over verified BIS databases, official portals, QCO regulations, and standard specifications.

---

## Key Features

- **Strict Anti-Hallucination & RAG Grounding**  
  Responses are grounded strictly in Indian Standards (`IS` codes) and official BIS documentation. Unknown standards are safely flagged rather than fabricated.

- **Multimodal Product & Label Inspection**  
  Upload or capture product labels to detect ISI marks, Registration marks (CRS), Hallmarks, and standard numbers directly from packaging.

- **Multilingual Voice Engine**  
  Complete Web Speech voice input and output with support for English, Hindi, Hinglish, and 22 scheduled Indian languages.

- **23 Indian Languages**  
  Complete localized UI translation dictionary across constitutional Indian languages including Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, etc.

- **Context-Aware Multi-Turn Chat**  
  Intelligent follow-up understanding. For example, asking "Is it mandatory?" after inquiring about "Packaged drinking water" maintains the relevant standard context.

- **Real-Time Streaming & Atomic API Endpoints**  
  Offers both full atomic JSON responses and Server-Sent Events (SSE) streaming for fast rendering.

- **Fully Responsive Adaptive UI**  
  Tailored experiences for desktop/laptop workflows and mobile viewports.

- **Intelligent Product & Standard Discovery**  
  Helps identify potentially applicable Indian Standards based on product attributes, category, material, intended use, and context.

- **Technical-to-Plain-Language Explanation**  
  Preserves the original BIS technical requirement while explaining its meaning in simple, user-friendly language.

- **Version, Amendment & Duplicate Control**  
  Distinguishes current standards, previous revisions, amendments, exact duplicate documents, and related BIS documents.

- **Applicability Validation**  
  Prevents similar products or unrelated standards from being incorrectly mixed by checking product attributes and standard scope before generating an answer.

---

## Architecture & Technology Stack

### Backend

- **Node.js & Express 5**  
  Fast and robust HTTP backend routing and SSE endpoints.

- **Google Gen AI SDK (`@google/genai`)**  
  Gemini reasoning layer for grounded response generation.

- **Deterministic RAG Retrieval Engine**  
  Specialized query normalizer, category disambiguation planner, and evidence retrieval services.

- **Answer Validation Layer**  
  Validates retrieved evidence before allowing it to become the basis of the final response.

### Frontend

- **Tailwind CSS**
- **Vanilla JavaScript**
- **Local Vendor Libraries**: marked, DOMPurify, highlight.js
- **Web Components**

### AI & Retrieval

- Gemini AI
- Retrieval-Augmented Generation (RAG)
- BM25 / Lexical Retrieval
- Semantic / Vector Retrieval
- Query Normalization
- Category Disambiguation
- Evidence Structuring
- Context-Aware Conversation
- Anti-Hallucination Validation

---

## Core BISsetu Workflow

```text
USER
 ↓
Query / Image / Voice
 ↓
Query Normalization
 ↓
Product & Category Discovery
 ↓
BIS Knowledge Retrieval
 ↓
Hybrid / Evidence Retrieval
 ↓
Reranking
 ↓
Applicability Validation
 ↓
Version & Duplicate Checking
 ↓
Verified BIS Context
 ↓
Gemini AI
 ↓
Answer Validation
 ↓
Final Grounded Response
 ↓
Source + Clause Reference
```

---

## Anti-Hallucination Architecture

BISsetu does not rely on the language model alone to determine the correct BIS requirement.

The system follows:

```text
User Query
 ↓
Retrieve
 ↓
Verify
 ↓
Understand
 ↓
Explain
```

The AI should not invent:

- IS numbers
- Technical requirements
- Numerical limits
- Test values
- Certification requirements
- QCO applicability
- Dates
- Clauses
- Standard revisions

If reliable evidence is unavailable, the system can request clarification or indicate that the information could not be verified.

---

## Product Applicability & Disambiguation

A major challenge with BIS information is that multiple products can have similar names or overlapping terminology.

BISsetu therefore uses product attributes before selecting the final standard.

```text
User:
"What BIS standard applies to my water bottle?"

        ↓
Product Identification
        ↓
Material?
Purpose?
Type?
Application?
        ↓
Candidate Standards
        ↓
Scope Matching
        ↓
Applicability Validation
        ↓
Current Relevant Standard
```

If critical information is missing:

```text
Critical Attribute Missing
        ↓
DO NOT GUESS
        ↓
Ask Clarifying Question
        ↓
Retrieve Again
        ↓
Validate
        ↓
Answer
```

---

## Duplicate & Version Control

BISsetu distinguishes between:

### Exact Duplicate

Same document/version and same content hash.

```text
Document A + Document B
        ↓
Same Hash
        ↓
Exact Duplicate
        ↓
Keep One Canonical Record
```

### Amendment

```text
IS XXXX:2024
      ↓
Amendment 1
      ↓
Amendment 2
```

Amendments are not treated as duplicates. They are linked to their parent standard.

### Revision

```text
IS XXXX:2016
      ↓
Superseded By
      ↓
IS XXXX:2024
```

Both versions may be retained for historical purposes, but the current version is prioritized for current-answer retrieval.

### Related Document

```text
IS XXXX:2024
      ↓
Product Manual
      ↓
Testing / Certification Information
```

A Product Manual is a related document, not a duplicate of the standard.

---

## Technical-to-Plain-Language Explanation

BIS documents often contain highly technical language.

### Technical Requirement

> The manufacturer shall maintain the necessary infrastructure, manufacturing process controls and testing facilities for ensuring conformity to the requirements of the standard.

### Simple Explanation

> The manufacturer must have the required equipment, control the manufacturing process properly, and maintain the necessary testing facilities to make sure the product meets the applicable standard.

The system should preserve the original technical meaning and should not change numerical values, limits, dates, conditions, mandatory requirements, test methods, or legal/compliance requirements.

---

## Project Structure

```text
Project BIS/

├── api/
│   └── index.js
├── landing-page/
│   └── code.html
├── search-page/
│   ├── code.html
│   └── DESIGN.md
├── shared/
│   ├── appSidebar.js
│   ├── fullTranslationsData.js
│   └── voiceEngine.js
├── src/
│   ├── data/
│   │   ├── bisEcosystemDatabase.js
│   │   └── bisStandardsDatabase.js
│   └── services/
│       ├── agentReachService.js
│       ├── answerValidationService.js
│       ├── bisRetrievalService.js
│       ├── categoryDiscoveryService.js
│       ├── conversationContextService.js
│       ├── geminiSearchPlannerService.js
│       ├── geminiService.js
│       ├── productNormalizationService.js
│       └── sessionService.js
├── tests/
├── desktop landing page.html
├── instruction.md
├── server.js
├── vercel.json
├── package.json
└── .env
```

> Note: The actual `.env` file should never be committed to GitHub. Add `.env` to `.gitignore`.

---

## Getting Started

### Prerequisites

- Node.js v18.0.0 or higher
- NPM v9.0.0 or higher
- Google Gemini API Key

### Installation

```bash
git clone <repository-url>
cd "Project BIS"
npm install
```

### Environment Configuration

Create a `.env` file:

```ini
PORT=3000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Never commit the `.env` file or expose your Gemini API key publicly.

### Running

```bash
npm start
```

---

## API Endpoints

### Health Check

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "BISsetu AI Backend",
  "version": "1.0.0",
  "geminiConfigured": true
}
```

### Atomic Search / Query

```http
POST /api/search
Content-Type: application/json
```

Example:

```json
{
  "query": "What is the BIS standard for packaged drinking water?",
  "language": "en"
}
```

Features include RAG retrieval, Gemini synthesis, answer validation, source retrieval, multilingual handling, and optional image input.

### Multi-Turn Chat

```http
POST /api/chat
Content-Type: application/json
```

Example:

```json
{
  "message": "Is certification mandatory?",
  "session_id": "user_session_12345",
  "language": "en"
}
```

### Streaming Chat

```http
POST /api/chat/stream
Content-Type: application/json
```

Streams events such as:

```text
thought
delta
sources
done
```

### Reset Session

```http
POST /api/chat/reset
Content-Type: application/json
```

```json
{
  "session_id": "user_session_12345"
}
```

---

## Testing

```bash
npm test
npm run test:chat
```

The repository contains tests for API responses, context retention, multilingual handling, RAG retrieval, chat behavior, and answer validation.

---

## Deployment

The project includes a `vercel.json` configuration for Vercel deployment.

```bash
npm i -g vercel
vercel
vercel --prod
```

Configure:

```text
GEMINI_API_KEY
```

as an environment variable in the deployment platform.

---

## Security

Never commit:

```text
.env
API keys
Private credentials
Database passwords
Authentication secrets
```

Recommended `.gitignore`:

```gitignore
node_modules/
.env
.env.local
dist/
build/
.vite/
*.log
```

---

## BIS Knowledge Sources

BISsetu is designed around official and permitted BIS sources, including relevant:

- Indian Standards
- BIS standard metadata
- Amendments
- Revised standards
- Quality Control Orders (QCOs)
- Product Manuals
- Testing information
- BIS laboratories
- Certification information
- BIS schemes
- Official notifications
- Related BIS resources

The system is designed to maintain source attribution and version awareness so outdated or superseded information is not blindly presented as current.

---

## Continuous Knowledge Synchronization

BIS information can change over time. BISsetu supports an architecture where the knowledge base can be periodically checked for updates.

```text
Official BIS Sources
        ↓
Update Monitor
        ↓
New / Changed Information
        ↓
Duplicate Detection
        ↓
Version / Amendment Linking
        ↓
Knowledge Base Update
        ↓
Re-indexing
        ↓
Current Verified Context
        ↓
AI Response
```

---

## Target Users

- Consumers
- Manufacturers
- MSMEs
- Startups
- Industries
- Testing laboratories
- Students and researchers
- Product buyers
- Compliance teams
- Other BIS stakeholders

---

## Example Queries

- What BIS standard applies to packaged drinking water?
- Is BIS certification mandatory for this product?
- What tests are required under this standard?
- Explain this BIS clause in simple English.
- What does "shall conform" mean in this standard?
- What documents are required for BIS certification?
- Which BIS laboratory can test this product?
- What is the difference between two revisions of this standard?
- Has this standard been amended?
- Is this standard still current?
- What does this ISI mark mean?
- What is the applicable QCO for this product?

---

## Project Vision

The goal of **BISsetu** is to make Indian Standards and BIS compliance information:

- Accessible
- Understandable
- Searchable
- Reliable
- Multilingual
- Context-aware
- Source-backed
- Easy to navigate

Instead of forcing users to understand complex standards, multiple documents, technical terminology, and different BIS resources, BISsetu aims to provide a single conversational interface that connects the user with the relevant information.

---

## Disclaimer

BISsetu is an AI assistant providing informational and educational guidance based on official BIS publications and standards.

For legal, regulatory, manufacturing, or commercial certification purposes, users should verify applicable requirements with the official Bureau of Indian Standards (BIS) sources.

BISsetu is not a substitute for official BIS certification, regulatory decisions, laboratory testing, or professional compliance advice.
