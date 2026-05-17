# Dental Treatment Financing Calculator

A web application for dental office managers to instantly show patients their insurance coverage and payment options for a treatment.

## Features

- **Insurance slider** — drag 0–100% to see costs update instantly (no API call on move)
- **Cost breakdown** — insurance-covered vs. out-of-pocket amounts with a visual bar
- **Payment options** — Full / 3-month / 6-month / 12-month installment plans
- **Audit history** — every quote is persisted to MySQL via the backend API

## Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS    |
| Backend  | Python 3.11 + FastAPI             |
| Database | MySQL 8.0 (SQLAlchemy ORM)        |
| Testing  | pytest + pytest-cov               |
| Linting  | ruff                              |
| CI       | GitHub Actions                    |

---

## How to Run

### Option A — Docker Compose (recommended)

```bash
git clone https://github.com/nv78/dental-project.git
cd dental-project
cp .env.example .env
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| API docs | http://localhost:8000/docs |
| MySQL    | localhost:3306             |

### Option B — Manual

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit DATABASE_URL if needed
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                   # → http://localhost:5173
```

---

## Running Tests

```bash
cd backend
pytest -v --cov=app --cov-report=term-missing
```

Linting:

```bash
cd backend
ruff check .
ruff format --check .
```

---

## Calculation Logic

All currency is computed with `Decimal` (ROUND\_HALF\_UP) on the backend and mirrored in TypeScript on the frontend for instant slider updates.

```
insurance_covered   = round(treatment_cost × coverage_pct / 100, 2)
out_of_pocket       = round(treatment_cost − insurance_covered, 2)
monthly_installment = round(out_of_pocket / n_months, 2)
```

**Why two calculation layers?**  
The slider must respond instantly — no network round-trip. `frontend/src/lib/calculator.ts` computes display values in real time. When a patient selects a plan, `POST /api/v1/calculate` persists the final quote to MySQL.

---

## Assumptions

1. Treatment cost is fixed at **\$1,000** for this prototype (configurable in the API schema).
2. Insurance coverage is a flat percentage — no deductibles, annual caps, or co-pays modelled.
3. Installment plans divide the balance evenly; any rounding difference is absorbed by the last digit (standard `ROUND_HALF_UP`).
4. No authentication is required for this prototype — all endpoints are public.
5. The history endpoint returns the 50 most recent calculations only.
