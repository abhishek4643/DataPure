<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,26&height=220&section=header&text=DataPure%20Platform&fontSize=52&fontColor=FFFFFF&fontAlignY=36&desc=Enterprise-Grade%20Data%20Redundancy%20Removal%20%26%20Deduplication%20System&descSize=16&descColor=A5B4FC&descAlignY=58&animation=fadeIn" width="100%" />

<br/>

<a href="#system-architecture">
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-10B981?style=for-the-badge&labelColor=1e1b4b" alt="React 19" />
</a>
&nbsp;
<a href="#system-architecture">
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-8B5CF6?style=for-the-badge&labelColor=1e1b4b" alt="Tailwind CSS v4" />
</a>
&nbsp;
<a href="#system-architecture">
  <img src="https://img.shields.io/badge/Backend-FastAPI%200.111%20%2B%20Python%203.11-38BDF8?style=for-the-badge&labelColor=1e1b4b" alt="FastAPI" />
</a>
&nbsp;
<a href="#system-architecture">
  <img src="https://img.shields.io/badge/Algorithm-RapidFuzz%20%2B%20SHA--256-EC4899?style=for-the-badge&labelColor=1e1b4b" alt="RapidFuzz" />
</a>
&nbsp;
<a href="#system-architecture">
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Supabase-F59E0B?style=for-the-badge&labelColor=1e1b4b" alt="Supabase" />
</a>

</div>

<br/>

# DataPure — Enterprise Data Redundancy Removal System

A high-performance data cleansing and deduplication engine built with FastAPI, React 19, and PostgreSQL.

DataPure guards enterprise database systems against data pollution using a **two-layer validation pipeline** — deterministic cryptographic hashing (**Layer 1: SHA-256**) followed by C-accelerated fuzzy string analysis (**Layer 2: RapidFuzz**) — to classify incoming records into **UNIQUE**, **FLAGGED**, or **REDUNDANT** before database commit.

---

## System Architecture

<p align="center" style="margin: 20px 0;">
  <img src="./docs/architecture.svg" alt="DataPure Architecture Flow" width="100%" />
</p>

---

## Deduplication Pipeline & Two-Layer Engine

Most deduplication scripts only perform exact string matches. DataPure combines $\mathcal{O}(1)$ cryptographic lookups with token-set distance analysis:

| Layer | Mechanism | Algorithm | Complexity | Verdict |
| :-- | :-- | :-- | :-- | :-- |
| **Layer 1** | Cryptographic Hash Filter | SHA-256 Hex Digest | $\mathcal{O}(1)$ via B-Tree Index | Instant match &rarr; **REDUNDANT (100%)** |
| **Layer 2** | Fuzzy Token Analysis | `rapidfuzz.fuzz.token_set_ratio` | $\mathcal{O}(N)$ C-Accelerated | Score $\ge 85\%$ &rarr; **REDUNDANT** |
| **Layer 2** | Fuzzy Review Queue | Token Set Intersection | Sub-25ms Matrix | $70\% \le \text{Score} < 85\%$ &rarr; **FLAGGED** |
| **Pass** | Unique Record Insertion | Normalized Token Insert | ACID Transaction | Score $< 70\%$ &rarr; **UNIQUE (Inserted)** |

---

## Engineering Documentation

The project includes a complete production-grade architecture and development documentation suite:

| Document | Purpose |
| :-- | :-- |
| [**`docs/PRD.md`**](./docs/PRD.md) | Product Requirements Document: MVP specifications, target personas & success metrics |
| [**`docs/ARCHITECTURE.md`**](./docs/ARCHITECTURE.md) | System topology, algorithm pipeline, directory tree & ADRs |
| [**`docs/RULES.md`**](./docs/RULES.md) | Engineering standards, FastAPI/Python conventions, and normalization guardrails |
| [**`docs/DESIGN.md`**](./docs/DESIGN.md) | Design system, UI tokens, Inter & JetBrains Mono typography, and telemetry cards |
| [**`docs/TASKS.md`**](./docs/TASKS.md) | Phased roadmap tracking 24 engineering deliverables with priority & status badges |
| [**`docs/MEMORY.md`**](./docs/MEMORY.md) | Active session memory, completed milestone log, and operational boundaries |

---

## Setup Instructions

### Prerequisites
- Python `3.10+` (Python `3.11` recommended)
- Node.js `18+` & npm
- PostgreSQL database (or Supabase instance)

### 1. Clone the repository
```bash
git clone https://github.com/abhishek4643/DataPure.git
cd DataPure
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/datapure
REDUNDANT_THRESHOLD=85.0
FLAGGED_THRESHOLD=70.0
PORT=8000
```

Apply the database schema:
```bash
psql -U postgres -d datapure -f ../supabase_schema.sql
```

Launch the FastAPI backend server:
```bash
uvicorn main:app --reload --port 8000
```
API interactive documentation will be available at: `http://localhost:8000/docs`.

### 3. Frontend Setup (React 19 + Vite 8)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React 19 interface will launch at: `http://localhost:5173`.

---

## Key Features

- **Sub-3ms Exact Match**: Instant rejection of exact duplicates via SHA-256 indexed hash lookups.
- **Typo & Reordering Resilience**: Robust detection of misspellings and inverted token orders using RapidFuzz.
- **Multipart CSV Ingestion**: Bulk upload and analyze large multi-column datasets with progress tracking.
- **Interactive Review Queue**: Human-in-the-loop review interface for borderline duplicate entries (70–84%).
- **Real-Time Recharts Telemetry**: Live graphical breakdown of unique vs flagged vs redundant statistics.

---

## License

This project is open-source and available under the MIT License.
