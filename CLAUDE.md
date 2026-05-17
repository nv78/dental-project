# CLAUDE.md — Dental Treatment Financing Calculator

## Project Overview

A web application that allows a dental office manager to enter insurance coverage and instantly show a patient their cost breakdown with flexible payment options.

**Stack:** React 18 + Vite + Tailwind CSS (frontend) | FastAPI + SQLAlchemy (backend) | MySQL 8 (database)

---

## Repository Layout

```
dental-project/
├── CLAUDE.md
├── README.md
├── docker-compose.yml
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app factory + CORS
│   │   ├── calculator.py    # Pure calculation logic (no framework deps)
│   │   ├── models.py        # SQLAlchemy ORM models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── database.py      # DB engine + session factory
│   │   └── routers/
│   │       └── calculator.py  # /api/v1/calculate and /api/v1/history
│   ├── tests/
│   │   ├── test_calculator.py  # Unit tests for pure logic
│   │   └── test_api.py         # Integration tests via TestClient
│   ├── pyproject.toml       # ruff + pytest config
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── lib/
    │   │   └── calculator.ts    # Mirrors backend logic; drives instant UI updates
    │   ├── components/
    │   │   ├── InsuranceSlider.tsx
    │   │   ├── CostBreakdown.tsx
    │   │   └── PaymentOptions.tsx
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Calculation Logic

### Core formula

```
insurance_covered   = round(treatment_cost × (coverage_pct / 100), 2)
out_of_pocket       = round(treatment_cost − insurance_covered, 2)
monthly_installment = round(out_of_pocket / n_months, 2)
```

### Rounding

All currency values use Python's `round(x, 2)` (banker's rounding) on the backend and `Number(x.toFixed(2))` on the frontend.  Both sides always agree because intermediate arithmetic uses the same operands.

### Why client-side calculation too?

The slider must update **instantly** — no network latency. The frontend `lib/calculator.ts` computes display values immediately; the backend `/api/v1/calculate` endpoint is called once the user submits (to persist the quote to MySQL for audit history).

---

## Local Development

### Option A — Docker Compose (recommended)

```bash
cp .env.example .env          # fill in any secrets if needed
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000/docs   |
| MySQL    | localhost:3306               |

### Option B — Manual

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## Running Tests

```bash
cd backend
pytest -v --cov=app --cov-report=term-missing
```

Linting:

```bash
ruff check .
ruff format --check .
```

---

## CI

`.github/workflows/ci.yml` runs three jobs on every push and PR:

1. **backend-lint** — ruff check + format check
2. **backend-test** — pytest with SQLite (DATABASE_URL overridden to `sqlite:///./test.db`)
3. **frontend-build** — `npm ci && npm run build` (includes `tsc --noEmit`)

---

## Assumptions

1. Treatment cost is fixed at **$1,000** for this iteration; the backend schema accepts a configurable `treatment_cost` field to support future changes.
2. Insurance coverage is a simple percentage with no deductibles, co-pays, or annual caps modelled.
3. Installment plans divide the out-of-pocket balance evenly; any cent remainder falls in the first payment (standard banking convention; implemented via `toFixed` rounding).
4. The history endpoint returns the 50 most recent calculations; no authentication is required for this prototype.
