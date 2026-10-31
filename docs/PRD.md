# Product Requirements Document (PRD)
### DataPure — Enterprise Data Redundancy Removal & Deduplication System

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=12,20,26&height=8&section=header&width=100%" width="100%" />
</div>

## 1. Executive Summary

In enterprise relational databases, CRM pipelines, and customer support databases, redundant and duplicate entries introduce severe data corruption, waste cloud storage, distort machine learning pipelines, and incur unnecessary operational overhead. Standard string matching algorithms fail when records possess minor typographical typos, varying space conventions, or inverted formatting.

**DataPure** is an enterprise-grade, two-layer data redundancy detection and automated deduplication platform built with a high-throughput **FastAPI (Python 3.11)** backend and an interactive **React 19 + Vite 8** frontend. It pairs deterministic cryptographic hashing (**Layer 1: SHA-256**) with fuzzy token-set similarity evaluation (**Layer 2: RapidFuzz**) to instantly classify incoming data into **UNIQUE** (inserted), **FLAGGED** (queued for human audit), or **REDUNDANT** (automatically rejected).

---

## 2. Target Personas

| Persona | Primary Goal | Pain Points Addressed |
| :-- | :-- | :-- |
| **Data Engineers & DBAs** | Ingest millions of rows cleanly into warehouse lakes | Manual SQL scripts miss typos and inverted token sequences |
| **CRM & Operations Leads** | Prevent multiple sales representatives from calling the same lead | Fragmented duplicate entries across different form inputs |
| **Compliance & Audit Officers** | Ensure complete data auditability with transparent scoring logs | Black-box deduplication scripts lacking cryptographic verification |

---

## 3. Core Functional Requirements

### 3.1 Ingestion & Normalization Pipeline
- **String Preprocessing & Normalization**:
  - Lowercase transformation and leading/trailing whitespace trimming.
  - Multi-whitespace collapsing into single spaces (`re.sub(r"\s+", " ", text)`).
  - Punctuation and non-alphanumeric character stripping while preserving semantic data.
- **Batch CSV & Multipart File Upload**:
  - Direct upload of enterprise CSV/Excel spreadsheets with automatic schema parsing and row validation.
- **Interactive Single-Entry Ingestion**:
  - Web form allowing operators to test individual entries with instant millisecond verdict feedback.

### 3.2 Two-Layer Deduplication Engine
- **Layer 1: SHA-256 Cryptographic Hash Filter**:
  - Generates a 64-character SHA-256 hex digest of the normalized record string (`name + email + phone + content`).
  - Executes an indexed lookup in Supabase / PostgreSQL. If an exact hash match exists, the entry is immediately classified as **REDUNDANT** with `similarity = 100%` in $\mathcal{O}(1)$ time complexity.
- **Layer 2: RapidFuzz Token-Set Fuzzy Analysis**:
  - If Layer 1 passes, the engine runs `rapidfuzz.fuzz.token_set_ratio` against active unflagged database records.
  - Generates a normalized similarity score between $0.00\%$ and $100.00\%$.
- **Automated Three-Tier Classification**:
  - **REDUNDANT** ($\ge 85\%$): Entry rejected; duplicate reference logged.
  - **FLAGGED** ($70\% \le \text{Score} < 85\%$): Entry queued into human review dashboard with side-by-side diff.
  - **UNIQUE** ($< 70\%$): Entry inserted into primary database table with generated hash.

### 3.3 Administrative Audit & Queue Operations
- **Flagged Queue Resolution**:
  - One-click **Approve** (forces insertion as unique record) or **Reject** (marks as redundant).
- **Telemetry Visualizer**:
  - Real-time Recharts visualizations showing ingestion rate, redundancy percentages, and daily classification distributions.

---

## 4. Non-Functional Requirements

- **Latency & Throughput**:
  - Layer 1 exact hash lookup: $< 3\text{ ms}$.
  - Layer 2 fuzzy matrix calculation: $< 25\text{ ms}$ for typical batch operational windows.
- **Data Integrity**:
  - ACID-compliant transactions via PostgreSQL (Supabase) and SQLAlchemy 2.0.
  - Uncommitted records roll back cleanly upon network disruptions.
- **Auditability**:
  - Every rejected or flagged entry records timestamp, matched candidate ID, exact similarity metric, and processing latency.

---

## 5. Scope & Out-of-Scope (v1.0)

- **In Scope**:
  - Two-layer hybrid deduplication (SHA-256 + RapidFuzz).
  - PostgreSQL / Supabase schema with automated migrations.
  - React 19 single-page application with real-time Recharts dashboards.
  - Batch CSV ingestion and JSON REST API.
- **Out of Scope (Deferred to v2.0)**:
  - Vector embeddings / LLM-based semantic deduplication for long-form narrative texts.
  - Apache Kafka distributed streaming ingest.

