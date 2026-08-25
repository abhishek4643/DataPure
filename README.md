<div align="center">

# ⚡ DataPure
### *Enterprise-Grade Data Redundancy Removal System*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

> A full-stack cloud application that silently guards your database against pollution.
> DataPure uses a **two-layer validation pipeline** — SHA-256 exact hashing followed by RapidFuzz semantic similarity — to detect and prevent duplicate data before it ever reaches your PostgreSQL (Supabase) database.

<br/>

**[🚀 Live Demo](#-local-setup) · [📖 API Docs](#-rest-api-reference) · [🐛 Report Bug](https://github.com/abhishek4643/DataPure/issues) · [✨ Request Feature](https://github.com/abhishek4643/DataPure/issues)**

</div>

---

## 🌟 What Makes DataPure Different?

Most deduplication tools check for *exact* matches. DataPure goes further.

| Feature | Basic Deduplication | **DataPure** |
|---|:---:|:---:|
| Exact duplicate detection | ✅ | ✅ |
| Handles typos & misspellings | ❌ | ✅ |
| Handles reordered fields | ❌ | ✅ |
| Near-duplicate flagging for review | ❌ | ✅ |
| Manual review workflow | ❌ | ✅ |
| Real-time analytics dashboard | ❌ | ✅ |
| Live search command palette | ❌ | ✅ |

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATAPURE SYSTEM                          │
│                                                                 │
│  ┌──────────────────┐   REST/JSON   ┌────────────────────────┐  │
│  │    FRONTEND      │ ────────────► │   BACKEND  (FastAPI)   │  │
│  │                  │               │                        │  │
│  │  React 18 + Vite │ ◄──────────── │  POST /entries         │  │
│  │  Framer Motion   │               │  GET  /entries         │  │
│  │  Lucide Icons    │               │  GET  /stats           │  │
│  │  Custom CSS DS   │               │  GET  /flagged         │  │
│  └──────────────────┘               │  POST /flagged/{id}/.. │  │
│                                     │  POST /scan-duplicates │  │
│                                     └──────────┬─────────────┘  │
│                                                │                 │
│                                     ┌──────────▼─────────────┐  │
│                                     │   TWO-LAYER DETECTION  │  │
│                                     │                        │  │
│                                     │  Layer 1: SHA-256      │  │
│                                     │  └─► Exact hash match  │  │
│                                     │                        │  │
│                                     │  Layer 2: RapidFuzz    │  │
│                                     │  └─► Fuzzy similarity  │  │
│                                     └──────────┬─────────────┘  │
│                                                │                 │
│                                   ┌────────────▼────────────┐   │
│                                   │  Supabase (PostgreSQL)  │   │
│                                   │  • entries              │   │
│                                   │  • flagged_entries      │   │
│                                   └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 How the Two-Layer Detection Pipeline Works

### Layer 1 — Exact Hash Match (SHA-256)

A new entry is first **normalized** (lowercased, trimmed, special characters stripped) and hashed with SHA-256 into a 64-character hex digest. This hash is compared against every `content_hash` in the database in a single O(1) lookup.

> **Match found?** → Instant `REDUNDANT` rejection. No fuzzy pass needed.

### Layer 2 — Fuzzy Similarity (RapidFuzz)

If no exact hash match exists, the normalized entry is compared semantically against **all existing records** using `token_set_ratio` — a method that is fully order-insensitive, making it robust against reordered names, swapped fields, and minor typos.

```
New Entry
    │
    ▼
 Normalize (lowercase, strip, trim)
    │
    ▼
 SHA-256 Hash → Compare against DB hashes
    │
    ├──► MATCH FOUND?  ───────────────YES──► ❌ REDUNDANT (rejected)
    │
    NO ↓
    │
 RapidFuzz token_set_ratio vs all records
    │
    ├──► score ≥ 85%  ──────────────────► ❌ REDUNDANT (rejected)
    ├──► score 70–84% ──────────────────► ⚠️  FLAGGED  (manual review queue)
    └──► score  < 70% ──────────────────► ✅  UNIQUE   (inserted + hash stored)
```

---

## 🚀 Local Setup

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- A **Supabase** project (free tier at [supabase.com](https://supabase.com))

---

### Step 1 — Supabase Database

1. Go to [supabase.com](https://supabase.com/) → create a new project.
2. Open the **SQL Editor** and run the full contents of `supabase_schema.sql`.
3. Go to **Settings → Database** → copy your **Connection String** (URI format).
   ```
   postgresql://postgres:PASSWORD@db.XXXXXX.supabase.co:5432/postgres
   ```

---

### Step 2 — Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# ↑ Open .env and paste your Supabase DATABASE_URL

# Start the server
uvicorn main:app --reload --port 8000
```

> ✅ API running at: `http://localhost:8000`
> 📖 Interactive docs: `http://localhost:8000/docs`

---

### Step 3 — Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# ↑ Set VITE_API_BASE_URL=http://localhost:8000

# Start dev server
npm run dev
```

> ✅ App running at: `http://localhost:5173`

---

## 📁 Project Structure

```
DataPure/
│
├── backend/
│   ├── main.py              # FastAPI entry point, CORS, lifespan hooks
│   ├── config.py            # Pydantic settings (reads .env)
│   ├── database.py          # SQLAlchemy engine + session factory
│   ├── models.py            # ORM models: Entry, FlaggedEntry
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── deduplication.py     # ⭐ Core two-layer detection logic
│   ├── routes/
│   │   ├── entries.py       # POST /entries · GET /entries
│   │   ├── flagged.py       # GET /flagged · approve · reject
│   │   ├── stats.py         # GET /stats
│   │   └── scan.py          # POST /scan-duplicates
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api.js              # Axios client + all API call functions
    │   ├── useToast.jsx        # Custom toast notification context
    │   ├── App.jsx             # Root + routing + theme provider
    │   ├── index.css           # ⭐ Custom design system (tokens, animations)
    │   ├── components/
    │   │   ├── Sidebar.jsx     # Navigation sidebar
    │   │   ├── Topbar.jsx      # Live search command palette + profile
    │   │   └── ui/
    │   │       ├── StatCard.jsx     # Spotlight hover metric cards
    │   │       ├── Skeleton.jsx     # Loading skeleton components
    │   │       └── EmptyState.jsx   # Empty state illustrations
    │   └── pages/
    │       ├── Dashboard.jsx        # Metric cards + live activity feed
    │       ├── AddEntry.jsx         # Entry form + verdict animation
    │       ├── Records.jsx          # Searchable paginated records table
    │       ├── FlaggedReview.jsx    # Side-by-side diff + approve/reject
    │       ├── ScanDuplicates.jsx   # Full database scan with progress
    │       └── Settings.jsx         # Profile, Preferences, Security, Alerts
    ├── .env.example
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🌍 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/entries` | Submit + validate a new entry through the full pipeline |
| `GET` | `/entries?search=&page=&page_size=` | List all unique entries (paginated + searchable) |
| `GET` | `/stats` | Dashboard statistics (totals, accuracy, queue count) |
| `GET` | `/flagged` | List all pending flagged entries awaiting review |
| `POST` | `/flagged/{id}/approve` | Approve a flagged entry (insert into main DB) |
| `POST` | `/flagged/{id}/reject` | Permanently reject a flagged entry |
| `POST` | `/scan-duplicates` | Retroactively scan existing records for internal duplicates |

### Example — `POST /entries` Response

```json
{
  "classification": "REDUNDANT",
  "similarity_score": 91.3,
  "matched_record": {
    "id": 5,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+919876543210",
    "content": "Looking for cloud solutions",
    "content_hash": "a3f1c8...",
    "created_at": "2025-01-01T10:00:00"
  },
  "message": "High similarity (91.3%) detected. Entry rejected as redundant."
}
```

---

## 🚢 Deployment

### Backend → [Render](https://render.com) *(Free Tier)*

1. Push your code to GitHub.
2. Go to **Render** → New Web Service → connect your repository.
3. Set the following:

   | Setting | Value |
   |---------|-------|
   | Root Directory | `backend` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | Environment Var | `DATABASE_URL` = your Supabase connection string |

### Frontend → [Vercel](https://vercel.com) *(Free Tier)*

1. Go to **Vercel** → Import from GitHub.
2. Set the following:

   | Setting | Value |
   |---------|-------|
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Environment Var | `VITE_API_BASE_URL` = your Render backend URL |

---

## 🔐 Security Notes

- ❌ **Never** commit `.env` files — they are gitignored by default.
- 🌐 For production, restrict `allow_origins` in CORS to your actual frontend domain only.
- 🔑 Supabase connection strings contain passwords — treat them as secrets and rotate them if exposed.

---

## 🧠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI framework + lightning-fast dev server |
| **Styling** | Vanilla CSS + CSS Variables | Custom design system, no framework overhead |
| **Animations** | Framer Motion | Micro-interactions, page transitions |
| **Backend** | FastAPI (Python) | High-performance async REST API |
| **Deduplication** | RapidFuzz + hashlib | Two-layer fuzzy + exact detection |
| **Database** | Supabase (PostgreSQL) | Managed cloud database with real-time features |
| **ORM** | SQLAlchemy | Database abstraction layer |
| **Validation** | Pydantic v2 | Request/response schema enforcement |

---

<div align="center">

*Built for the **CodeAlpha Cloud Computing Internship** — Task 1: Data Redundancy Removal System*

<br/>

⭐ **If this project helped you, consider starring the repo!** ⭐

</div>
