"""Integration tests for payment plan endpoints using an in-memory SQLite DB."""

from __future__ import annotations

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


class TestCreatePaymentPlan:
    def test_creates_plan_with_correct_installment_count(self):
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 600.0, "months": 3},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["months"] == 3
        assert len(data["installments"]) == 3

    def test_monthly_payment_rounded_to_2dp(self):
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 100.0, "months": 3},
        )
        assert response.status_code == 201
        data = response.json()
        # 100 / 3 = 33.333... -> rounds to 33.33
        assert data["monthly_payment"] == 33.33
        for installment in data["installments"]:
            assert installment["amount"] == 33.33

    def test_monthly_payment_exact_division(self):
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 600.0, "months": 3},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["monthly_payment"] == 200.0

    def test_plan_with_phone_works_gracefully(self):
        """SMS is skipped when Twilio is not configured — should not raise."""
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 300.0, "months": 3, "patient_phone": "+15550001234"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["months"] == 3

    def test_12_months_creates_12_installments(self):
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 1200.0, "months": 12},
        )
        assert response.status_code == 201
        data = response.json()
        assert len(data["installments"]) == 12

    def test_invalid_months_zero_returns_422(self):
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 600.0, "months": 0},
        )
        assert response.status_code == 422

    def test_invalid_months_13_returns_422(self):
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 600.0, "months": 13},
        )
        assert response.status_code == 422

    def test_installments_are_pending_initially(self):
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 600.0, "months": 3},
        )
        data = response.json()
        for installment in data["installments"]:
            assert installment["status"] == "pending"
            assert installment["paid_at"] is None

    def test_plan_status_is_active_initially(self):
        response = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 600.0, "months": 3},
        )
        data = response.json()
        assert data["status"] == "active"


class TestListPaymentPlans:
    def test_get_payment_plans_returns_created_plan(self):
        client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 500.0, "months": 5},
        )
        response = client.get("/api/v1/payment-plans")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["total_amount"] == 500.0

    def test_get_payment_plans_empty(self):
        response = client.get("/api/v1/payment-plans")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_payment_plans_newest_first(self):
        client.post("/api/v1/payment-plans", json={"total_amount": 100.0, "months": 1})
        client.post("/api/v1/payment-plans", json={"total_amount": 200.0, "months": 2})
        response = client.get("/api/v1/payment-plans")
        data = response.json()
        assert data[0]["total_amount"] == 200.0


class TestGetPaymentPlan:
    def test_get_single_plan(self):
        create_resp = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 600.0, "months": 6},
        )
        plan_id = create_resp.json()["id"]
        response = client.get(f"/api/v1/payment-plans/{plan_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == plan_id
        assert len(data["installments"]) == 6

    def test_get_missing_plan_returns_404(self):
        response = client.get("/api/v1/payment-plans/99999")
        assert response.status_code == 404


class TestMonerisWebhook:
    def test_payment_received_marks_installment_paid(self):
        create_resp = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 300.0, "months": 3},
        )
        plan = create_resp.json()
        plan_id = plan["id"]
        monthly = plan["monthly_payment"]

        webhook_resp = client.post(
            "/api/v1/webhooks/moneris",
            json={
                "event_type": "payment_received",
                "order_id": "ORD-001",
                "plan_id": plan_id,
                "amount": monthly,
                "timestamp": "2026-05-17T10:00:00Z",
            },
        )
        assert webhook_resp.status_code == 200
        assert webhook_resp.json() == {"status": "processed"}

        plan_resp = client.get(f"/api/v1/payment-plans/{plan_id}")
        installments = plan_resp.json()["installments"]
        paid = [i for i in installments if i["status"] == "paid"]
        assert len(paid) == 1
        assert paid[0]["paid_at"] is not None

    def test_unknown_event_type_returns_ignored(self):
        create_resp = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 300.0, "months": 3},
        )
        plan_id = create_resp.json()["id"]

        response = client.post(
            "/api/v1/webhooks/moneris",
            json={
                "event_type": "refund_issued",
                "order_id": "ORD-002",
                "plan_id": plan_id,
                "amount": 100.0,
                "timestamp": "2026-05-17T11:00:00Z",
            },
        )
        assert response.status_code == 200
        assert response.json() == {"status": "ignored"}

    def test_webhook_with_sms_phone_works_gracefully(self):
        """Twilio not configured — webhook should complete without error."""
        create_resp = client.post(
            "/api/v1/payment-plans",
            json={"total_amount": 300.0, "months": 3, "patient_phone": "+15550009999"},
        )
        plan = create_resp.json()
        plan_id = plan["id"]

        response = client.post(
            "/api/v1/webhooks/moneris",
            json={
                "event_type": "payment_received",
                "order_id": "ORD-003",
                "plan_id": plan_id,
                "amount": plan["monthly_payment"],
                "timestamp": "2026-05-17T12:00:00Z",
            },
        )
        assert response.status_code == 200
        assert response.json() == {"status": "processed"}
