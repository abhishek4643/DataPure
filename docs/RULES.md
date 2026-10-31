# Engineering Rules & Standards
### DataPure — Code Conventions, Architectural Guardrails, and Deduplication Integrity

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=12,20,26&height=8&section=header&width=100%" width="100%" />
</div>

This document specifies the non-negotiable coding conventions, data normalization standards, and architectural rules governing the **DataPure** enterprise repository.

---

## 1. FastAPI & Python Conventions

### 1.1 Strong Type Typing & Pydantic v2
- Every route handler, utility function, and deduplication subroutine MUST declare explicit Python type annotations:
  ```python
  # CORRECT
  def check_duplicates(entry: EntryCreate, db: Session) -> DeduplicationResult:
      ...
  ```
- All request and response bodies MUST inherit from `pydantic.BaseModel` with strict field validation:
  ```python
  class EntryCreate(BaseModel):
      name: str = Field(..., min_length=1, max_length=150)
      email: EmailStr
      phone: Optional[str] = Field(None, max_length=20)
      content: str = Field(..., min_length=1)
  ```
- NEVER disable Pydantic validation or accept loose `dict` payloads without schema definitions.

### 1.2 Database Sessions & Dependency Injection
- Always acquire database connections using FastAPI's dependency injection system:
  ```python
  @router.post("/entries", response_model=EntryResponse)
  def create_entry(payload: EntryCreate, db: Session = Depends(get_db)):
      ...
  ```
- Never initialize standalone unmanaged database sessions within route logic. Always ensure sessions close cleanly via the `try ... finally db.close()` generator in `database.py`.

---

## 2. Deduplication Engine Guardrails

### 2.1 Deterministic Text Normalization
- All text strings MUST pass through `normalize_text()` before hash generation or similarity comparison:
  ```python
  def normalize_text(text: str) -> str:
      text = text.lower().strip()
      text = re.sub(r"[^a-z0-9\s]", "", text)
      text = re.sub(r"\s+", " ", text)
      return text
  ```
- NEVER bypass normalization. Normalization rules must remain 100% deterministic to guarantee hash reproducibility.

### 2.2 Strict Threshold Guardrails
- Deduplication thresholds MUST be loaded from environment configuration (`config.py`) and adhere strictly to the three-tier classification boundaries:
  - `similarity >= settings.REDUNDANT_THRESHOLD (85.0)` &rarr; **REDUNDANT** (Reject).
  - `settings.FLAGGED_THRESHOLD (70.0) <= similarity < settings.REDUNDANT_THRESHOLD (85.0)` &rarr; **FLAGGED** (Review).
  - `similarity < settings.FLAGGED_THRESHOLD (70.0)` &rarr; **UNIQUE** (Insert).
- NEVER hardcode arbitrary magic numbers in business controllers.

### 2.3 Layer 1 Independence
- Layer 1 (SHA-256) MUST be evaluated before any database iterative comparisons. If an exact hash match occurs, execution MUST short-circuit immediately without invoking the $\mathcal{O}(N)$ RapidFuzz loop.

---

## 3. Frontend & React 19 Standards

### 3.1 Component Architecture & Modularity
- Split complex pages into modular subcomponents:
  - Form inputs (`src/components/IngestForm.jsx`)
  - Status badges (`src/components/StatusBadge.jsx`)
  - Metrics cards (`src/components/MetricCard.jsx`)
  - Queue tables (`src/components/AuditTable.jsx`)
- Do not overload a single component with more than 200 lines of JSX.

### 3.2 Tailwind CSS v4 Strict Guidelines
- Use native Tailwind utility classes. Do not introduce arbitrary inline styles unless rendering dynamic server-driven percentage values.
- Adhere to the established design palette:
  - Brand accents: `bg-indigo-600`, `text-indigo-600` (`#536DFE`)
  - Success states: `bg-emerald-500`, `text-emerald-500` (`#10B981`)
  - Warning states: `bg-amber-500`, `text-amber-500` (`#F59E0B`)
  - Error states: `bg-rose-500`, `text-rose-500` (`#EF4444`)

---

## 4. Git & Commit Conventions

- Use standard Conventional Commits:
  - `feat:` for new deduplication features, endpoints, or UI dashboards.
  - `fix:` for algorithm edge cases, regex fixes, or route bugfixes.
  - `docs:` for architectural documentation, schemas, and PRD updates.
  - `refactor:` for code cleanups without behavioral changes.
  - `test:` for test additions and benchmark suites.
