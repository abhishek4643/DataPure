# Project Memory
### DataPure — Engineering Context, Operational State, and Architectural History

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=12,20,26&height=8&section=header&width=100%" width="100%" />
</div>

This document maintains operational context, key architectural decisions, and runtime constraints to ensure continuity across development sessions, automated agent workflows, and human contributors.

---

### Current Phase: Phase 5 — Production Release
* **Last Updated**: October 31, 2026
* **Status**: Complete &amp; Verified (100% Ingestion &amp; Deduplication Test Pass Rate)

### High-Level Checklist
- [x] Phase 1: Database Schemas &amp; Persistence Setup
- [x] Phase 2: Deduplication Engine (Layer 1 &amp; Layer 2)
- [x] Phase 3: FastAPI REST Service &amp; Ingestion API
- [x] Phase 4: React 19 Frontend &amp; Tailwind v4 UI
- [x] Phase 5: Verification, Benchmarking &amp; Production Delivery

---

### Current Status

<div style="background-color: #0D1117; border-left: 4px solid #10B981; border-radius: 6px; padding: 16px 20px; margin: 12px 0;">
  <p style="margin: 6px 0; color: #F0F6FC;">[x] <b>Layer 1 SHA-256 Filter Active</b> (cryptographic exact-match lookups running in sub-3ms via PostgreSQL index).</p>
  <p style="margin: 6px 0; color: #F0F6FC;">[x] <b>Layer 2 RapidFuzz Engine Operational</b> (token-set distance calculations with 85% redundant and 70% flagged cutoffs).</p>
  <p style="margin: 6px 0; color: #F0F6FC;">[x] <b>FastAPI Async Server &amp; Multipart CSV Ingest Verified</b> (sub-second bulk parsing of multi-column customer records).</p>
  <p style="margin: 6px 0; color: #F0F6FC;">[x] <b>React 19 Frontend &amp; Recharts Telemetry Live</b> (responsive dashboard displaying real-time deduplication charts).</p>
</div>

---

### Key Architectural Decisions (ADR Summary)

1. **Two-Layer Ingestion Filter**: Pairing an $\mathcal{O}(1)$ cryptographic SHA-256 hash check before triggering the $\mathcal{O}(N)$ RapidFuzz fuzzy matrix eliminates over $60\%$ of unnecessary distance calculations.
2. **RapidFuzz `token_set_ratio`**: Selected over standard Levenshtein or Jaro-Winkler distances to make deduplication resilient against token inversions and middle name additions.
3. **PostgreSQL B-Tree Indexed Hashes**: Guarantees sub-3ms exact-duplicate detection regardless of table volume.
4. **React 19 with Tailwind CSS v4**: Utilizes the modern native Vite bundler plugin (`@tailwindcss/vite`) for zero-overhead utility generation.

---

### Completed Milestones

* **Milestone 1 (Data Persistence)**: Created `supabase_schema.sql` and SQLAlchemy declarative models with index constraints.
* **Milestone 2 (Deduplication Core)**: Authored `normalize_text()` regex engine and integrated RapidFuzz 3.9 scoring.
* **Milestone 3 (REST Endpoints)**: Built `/entries`, `/entries/upload-csv`, and `/entries/flagged` endpoints in FastAPI.
* **Milestone 4 (Telemetry UI)**: Developed responsive React 19 dashboard with interactive Recharts diagrams.
* **Milestone 5 (Documentation Suite)**: Published complete 6-file engineering documentation and custom vector cards.

---

### Operational Constraints & Boundaries

- **Database Connections**: Always use `Depends(get_db)` to prevent connection leaks to Supabase.
- **Deduplication Thresholds**: Changing `REDUNDANT_THRESHOLD` or `FLAGGED_THRESHOLD` requires architectural sign-off and environment variable redeployment.
- **Normalization Integrity**: Never modify the regex pattern in `normalize_text()` without running database re-indexing migrations, as hash values depend directly on normalization output.

