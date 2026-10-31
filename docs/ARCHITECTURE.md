# System Architecture
### DataPure — Architectural Topology, Data Flow, and System Specifications

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=12,20,26&height=8&section=header&width=100%" width="100%" />
</div>

This document describes the overall system architecture, technology stack, directory structure, deduplication algorithms, and key design decisions for the **DataPure** enterprise data cleansing platform.

---

### 1. High-Level Architecture

DataPure follows a decoupled client-server architecture connecting a high-performance React 19 single-page application with a FastAPI (Python 3.11) asynchronous backend and a Supabase / PostgreSQL persistence layer:

<p align="center" style="margin: 20px 0;">
  <img src="./architecture.svg" alt="DataPure Architecture Flow" width="100%" />
</p>

---

### 2. Technology Stack

Technologies used across DataPure and their architectural purpose:

| Domain | Technology | Implementation Detail |
| :-- | :-- | :-- |
| **Backend Framework** | FastAPI (v0.111.0) | High-throughput asynchronous REST API with automatic OpenAPI documentation |
| **Server Engine** | Uvicorn (v0.29.0) | Lightning-fast ASGI web server running with standard async worker loops |
| **Validation Layer** | Pydantic v2 (v2.12.5) | Strict request/response payload normalization, type casting, and schema enforcement |
| **Deduplication Engine** | RapidFuzz (v3.9.3) + Hashlib | C-accelerated token-set string distance matching and SHA-256 cryptographic digests |
| **Database ORM** | SQLAlchemy 2.0 (v2.0.41) | Modern declarative ORM mapping models with connection pooling and lazy/eager loading |
| **Database Driver** | Psycopg2-Binary (v2.9.10) | Enterprise-grade PostgreSQL adapter interfacing with Supabase |
| **Database & Auth** | Supabase / PostgreSQL | Managed cloud database instance hosting indexed schemas and audit logs |
| **Frontend Framework** | React 19 (v19.2.8) | Latest React release with concurrent rendering, actions, and compiler optimizations |
| **Frontend Build Tool** | Vite 8 (v8.2.2) | Sub-second HMR development server and optimized ES production bundler |
| **CSS Framework** | Tailwind CSS v4 (v4.3.3) | Next-generation utility engine configured with the native `@tailwindcss/vite` plugin |
| **Visualizations** | Recharts (v3.10.1) | Declarative charting library rendering real-time ingestion rates and classification splits |
| **Animations & UI** | Framer Motion (v13.1.1) | Fluid micro-interactions, layout transitions, and live toast notifications |
| **Icons & Linter** | Lucide React + Oxlint | Lightweight SVG vector iconography and ultra-fast Rust-based code linting |

---

### 3. Folder Structure

The project follows a clean, modular structure separating backend API services, data models, and the frontend web client:

```text
DataPure/
|-- backend/                            # FastAPI Python 3.11 Microservice
|   |-- routes/                         # Modular API Route Controllers
|   |-- config.py                       # Pydantic BaseSettings & Environment Vars
|   |-- database.py                     # SQLAlchemy Engine & SessionLocal Generator
|   |-- deduplication.py                # Layer 1 Hash & Layer 2 RapidFuzz Engine
|   |-- main.py                         # FastAPI Application Initialization & Endpoints
|   |-- models.py                       # SQLAlchemy ORM Database Schemas
|   |-- schemas.py                      # Pydantic v2 Serialization & Request Models
|   `-- requirements.txt                # Python Dependencies
|-- frontend/                           # React 19 + Vite 8 Single-Page Application
|   |-- public/                         # Static Web Assets
|   |-- src/                            # React Application Source
|   |   |-- components/                 # Reusable UI Cards, Modals & Forms
|   |   |-- pages/                      # Route Pages (Dashboard, Ingest, Queue, Logs)
|   |   |-- services/                   # Axios REST API Client Wrappers
|   |   |-- App.jsx                     # Main Routing & Layout Orchestrator
|   |   `-- main.jsx                    # DOM Mounting Point
|   |-- index.html                      # HTML5 Entry Document
|   |-- package.json                    # NPM Scripts & Dependencies
|   `-- vite.config.js                  # Vite 8 & Tailwind v4 Plugin Configuration
|-- docs/                               # Architecture & Engineering Documentation
|   |-- PRD.md                          # Product Requirements & User Scenarios
|   |-- ARCHITECTURE.md                 # System Topology & Algorithm Specifications
|   |-- RULES.md                        # Engineering Conventions & Coding Rules
|   |-- DESIGN.md                       # Design System & UI Specifications
|   |-- TASKS.md                        # Phased Roadmap with 24 Deliverables
|   |-- MEMORY.md                       # Operational State & Milestone Log
|   |-- architecture.svg                # Custom 4-Card Vector Topology
|   |-- palette.svg                     # 8-Swatch Design System Vector Palette
|   `-- principles.svg                  # 4-Card Design Principles Vector
|-- supabase_schema.sql                 # PostgreSQL Database Schema & Indexes
`-- README.md                           # Repository Entry & Developer Guide
```

---

### 4. Deduplication Algorithm Pipeline

```text
[ Incoming Data Record (Name, Email, Phone, Content) ]
                         |
                         v
[ Text Normalization: Lowercase, Strip Punctuation, Collapse Whitespace ]
                         |
                         v
[ Layer 1: SHA-256 Cryptographic Hash Check ]
                         |
      +------------------+------------------+
      |                                     |
      v (Exact Match in DB)                 v (No Exact Match)
[ REDUNDANT: 100% Hash Match ]   [ Layer 2: RapidFuzz Matrix Analysis ]
(Instant Early-Exit)                        |
                                            v (token_set_ratio against DB Records)
                         +------------------+------------------+
                         |                  |                  |
                         v (>= 85%)         v (70% - 84%)      v (< 70%)
                  [ REDUNDANT ]        [ FLAGGED ]        [ UNIQUE ]
                  (Auto-Rejected)   (Queued for Audit)   (Insert into DB)
```

---

### 5. Key Architectural Decisions (ADRs)

* **ADR-001: Two-Layer Hybrid Architecture (Cryptographic Hash + Fuzzy Scoring)**  
  *Rationale*: Evaluating fuzzy string distance across thousands of database records is computationally intensive ($\mathcal{O}(N \times M)$). Layer 1 filters 60%+ of submissions via sub-millisecond SHA-256 hash lookups, reserving Layer 2 RapidFuzz matrix comparisons only for structurally unique payloads.
* **ADR-002: Strict Client-Side Pre-Validation via Pydantic v2 Models**  
  *Rationale*: Unvalidated inputs degrade database performance and compromise deduplication fidelity. Pydantic v2 validates and normalizes schemas prior to touching the deduplication pipeline.
* **ADR-003: Tri-State Classification (Redundant, Flagged, Unique)**  
  *Rationale*: Binary deduplication systems either discard false positives or store false negatives. Introducing an amber "Flagged" state for borderline candidates (70%–84% similarity) enables automated high-throughput ingestion with zero risk of catastrophic record loss.
