"""Integration tests for the FastAPI endpoints using an in-memory SQLite DB."""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


class TestHealthEndpoint:
    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestCalculateEndpoint:
    def test_calculate_50_percent(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 50.0},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["insurance_covered"] == 500.0
        assert data["out_of_pocket"] == 500.0

    def test_calculate_zero_coverage(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 0.0},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["insurance_covered"] == 0.0
        assert data["out_of_pocket"] == 1000.0

    def test_calculate_full_coverage(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 100.0},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["insurance_covered"] == 1000.0
        assert data["out_of_pocket"] == 0.0

    def test_installment_options_present(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 40.0},
        )
        data = response.json()
        months = [o["months"] for o in data["installment_options"]]
        assert months == [1, 3, 6, 12]

    def test_installment_amounts_correct(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 40.0},
        )
        data = response.json()
        opts = {o["months"]: o for o in data["installment_options"]}
        assert opts[1]["monthly_payment"] == 600.0
        assert opts[3]["monthly_payment"] == 200.0
        assert opts[6]["monthly_payment"] == 100.0
        assert opts[12]["monthly_payment"] == 50.0

    def test_default_treatment_cost(self):
        response = client.post("/api/v1/calculate", json={"coverage_pct": 20.0})
        assert response.status_code == 200
        assert response.json()["treatment_cost"] == 1000.0

    def test_negative_cost_rejected(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": -100.0, "coverage_pct": 50.0},
        )
        assert response.status_code == 422

    def test_coverage_above_100_rejected(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 110.0},
        )
        assert response.status_code == 422

    def test_coverage_below_0_rejected(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": -5.0},
        )
        assert response.status_code == 422

    def test_missing_coverage_rejected(self):
        response = client.post("/api/v1/calculate", json={"treatment_cost": 1000.0})
        assert response.status_code == 422

    def test_currency_two_decimal_places(self):
        response = client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 33.33},
        )
        data = response.json()
        for key in ("insurance_covered", "out_of_pocket"):
            value = data[key]
            assert round(value, 2) == value

    def test_persists_to_history(self):
        client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 75.0},
        )
        history = client.get("/api/v1/history").json()
        assert len(history) == 1
        assert history[0]["coverage_pct"] == 75.0


class TestHistoryEndpoint:
    def test_empty_history(self):
        response = client.get("/api/v1/history")
        assert response.status_code == 200
        assert response.json() == []

    def test_history_returns_records(self):
        for pct in [10.0, 20.0, 30.0]:
            client.post(
                "/api/v1/calculate",
                json={"treatment_cost": 1000.0, "coverage_pct": pct},
            )
        history = client.get("/api/v1/history").json()
        assert len(history) == 3

    def test_history_ordered_descending(self):
        for pct in [10.0, 20.0, 30.0]:
            client.post(
                "/api/v1/calculate",
                json={"treatment_cost": 1000.0, "coverage_pct": pct},
            )
        history = client.get("/api/v1/history").json()
        assert history[0]["coverage_pct"] == 30.0

    def test_history_schema(self):
        client.post(
            "/api/v1/calculate",
            json={"treatment_cost": 1000.0, "coverage_pct": 50.0},
        )
        record = client.get("/api/v1/history").json()[0]
        assert "id" in record
        assert "treatment_cost" in record
        assert "coverage_pct" in record
        assert "insurance_covered" in record
        assert "out_of_pocket" in record
        assert "created_at" in record
