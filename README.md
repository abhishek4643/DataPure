# 🌐 DataPure — Data Redundancy Removal System

> A full-stack cloud application that detects and prevents duplicate data from entering your PostgreSQL (Supabase) database using a **two-layer validation pipeline**: SHA-256 exact hashing + RapidFuzz fuzzy similarity.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      DATAPURE SYSTEM                        │
│                                                             │
│  ┌──────────────┐   HTTP/REST   ┌─────────────────────────┐ │
│  │   FRONTEND   │ ────────────► │      BACKEND (FastAPI)  │ │
│  │  React + Vite│               │                         │ │
│  │  Tailwind CSS│ ◄──────────── │  POST /entries          │ │
│  │  Framer Motion              │  GET  /entries           │ │
│  │  Recharts    │               │  GET  /stats            │ │
│  └──────────────┘               │  GET  /flagged          │ │
│                                 │  POST /flagged/{id}/... │ │
│                                 │  POST /scan-duplicates  │ │
│                                 └──────────┬──────────────┘ │
│                                            │                 │
│                                 ┌──────────▼──────────────┐ │
│                                 │  TWO-LAYER DETECTION    │ │
│                                 │                         │ │
│                                 │  Layer 1: SHA-256 Hash  │ │
│                                 │  └─ Exact match check   │ │
│                                 │                         │ │
│                                 │  Layer 2: RapidFuzz     │ │
│                                 │  └─ Fuzzy similarity    │ │
│                                 └──────────┬──────────────┘ │
│                                            │                 │
│                              ┌─────────────▼─────────────┐  │
│                              │  Supabase (PostgreSQL)    │  │
│                              │  • entries table          │  │
│                              │  • flagged_entries table  │  │
│                              └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 How Two-Layer Redundancy Detection Works

### Layer 1 — Exact Hash Match (SHA-256)

1. All entry fields (name, email, phone, content) are **normalized**: lowercased, trimmed, and stripped of special characters.
2. The normalized string is hashed with **SHA-256** → 64-character hex digest.
3. The hash is compared against all stored `content_hash` values in the database.
4. If a match is found → **REDUNDANT** (instant rejection, O(1) database lookup).

### Layer 2 — Fuzzy Similarity (RapidFuzz)

1. If no exact hash match, the normalized new entry is compared against **all existing records** using `rapidfuzz.fuzz.token_set_ratio`.
2. `token_set_ratio` is order-insensitive (handles reordered fields well).
3. Classification:
   - **Score ≥ 85%** → `REDUNDANT` → Entry rejected, NOT inserted
   - **Score 70–84%** → `FLAGGED` → Stored in `flagged_entries` for manual review
   - **Score < 70%**  → `UNIQUE`   → Inserted into `entries` with its hash

```
New Entry
    │
    ▼
 Normalize (lowercase, strip special chars)
    │
    ▼
 Compute SHA-256 Hash
    │
    ├──► Match in DB? ──YES──► REDUNDANT ❌
    │
    NO
    │
    ▼
 RapidFuzz token_set_ratio vs all records
    │
    ├──► score ≥ 85%  ──► REDUNDANT ❌
    ├──► score 70–84% ──► FLAGGED ⚠️ (manual review)
    └──► score < 70%  ──► UNIQUE ✅ (insert + store hash)
```

---

## 🚀 Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A **Supabase** project (free tier at https://supabase.com)

---

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create a new project.
2. Go to **SQL Editor** and run the contents of `supabase_schema.sql`.
3. Go to **Settings → Database** → Copy the **Connection String** (URI format).
   - It looks like: `postgresql://postgres:PASSWORD@db.XXXXXX.supabase.co:5432/postgres`

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env → paste your Supabase DATABASE_URL

# Start the server
uvicorn main:app --reload --port 8000
```

API is now running at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env → set VITE_API_BASE_URL=http://localhost:8000

# Start dev server
npm run dev
```

App is now running at `http://localhost:5173`

---

## 📁 Project Structure

```
DataPure/
├── backend/
│   ├── main.py              # FastAPI app entry point + CORS + lifespan
│   ├── config.py            # Pydantic settings (loads .env)
│   ├── database.py          # SQLAlchemy engine + session
│   ├── models.py            # ORM models: Entry, FlaggedEntry
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── deduplication.py     # Two-layer detection logic (hash + fuzzy)
│   ├── routes/
│   │   ├── entries.py       # POST /entries, GET /entries
│   │   ├── flagged.py       # GET /flagged, POST /flagged/{id}/approve|reject
│   │   ├── stats.py         # GET /stats
│   │   └── scan.py          # POST /scan-duplicates
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api.js           # Axios client + all API functions
│   │   ├── useToast.jsx     # Toast notification context
│   │   ├── App.jsx          # Root component + routing
│   │   ├── index.css        # Design system (glassmorphism, tokens, animations)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx  # Desktop sidebar + mobile bottom nav
│   │   │   └── Topbar.jsx   # Top bar with live stats chip
│   │   └── pages/
│   │       ├── Dashboard.jsx      # Stat cards + donut chart + activity feed
│   │       ├── AddEntry.jsx       # Form + scanning animation + verdict
│   │       ├── Records.jsx        # Searchable paginated table
│   │       ├── FlaggedReview.jsx  # Side-by-side diff cards + approve/reject
│   │       └── ScanDuplicates.jsx # Full DB scan with animation
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── supabase_schema.sql   # SQL to create tables in Supabase
├── .gitignore
└── README.md
```

---

## 🌍 REST API Reference

| Method | Endpoint                     | Description                            |
|--------|------------------------------|----------------------------------------|
| POST   | `/entries`                   | Submit + validate a new entry          |
| GET    | `/entries?search=&page=&page_size=` | List all unique entries (paginated) |
| GET    | `/stats`                     | Dashboard stats                        |
| GET    | `/flagged`                   | List pending flagged entries           |
| POST   | `/flagged/{id}/approve`      | Approve flagged entry (insert it)      |
| POST   | `/flagged/{id}/reject`       | Reject flagged entry                   |
| POST   | `/scan-duplicates`           | Scan + remove internal duplicates      |

### Example POST /entries response

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
    "content_hash": "a3f1...",
    "created_at": "2025-01-01T10:00:00"
  },
  "message": "High similarity (91.3%) detected. Entry rejected as redundant."
}
```

---

## 🚢 Deployment

### Backend → Render (Free Tier)

1. Push to GitHub.
2. Go to [render.com](https://render.com) → New Web Service → connect repo.
3. **Root Directory**: `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `DATABASE_URL` = your Supabase connection string.

### Frontend → Vercel (Free Tier)

1. Go to [vercel.com](https://vercel.com) → Import from GitHub.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Add environment variable: `VITE_API_BASE_URL` = your Render backend URL.

---

## 🔐 Security Notes

- Do **not** commit `.env` files — they are gitignored.
- For production, restrict CORS `allow_origins` to your actual frontend domain.
- Supabase connection strings contain passwords — treat them as secrets.

---

*Built for CodeAlpha Cloud Computing Internship — Task 1: Data Redundancy Removal System*
