"""Integration tests for the /api/v1/verify-coverage endpoints."""

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

PPO_PAYLOAD = {
    "procedure_code": "D2150",
    "procedure_cost": 500.0,
    "insurance_plan_type": "PPO",
    "patient_age": 35,
}

DHMO_PAYLOAD = {
    "procedure_code": "D2150",
    "procedure_cost": 500.0,
    "insurance_plan_type": "DHMO",
    "patient_age": 35,
}


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


class TestVerifyCoverageEndpoint:
    def test_valid_ppo_request_returns_200(self):
        response = client.post("/api/v1/verify-coverage", json=PPO_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        assert data["procedure_code"] == "D2150"
        assert data["procedure_cost"] == 500.0
        assert data["insurance_plan_type"] == "PPO"
        assert "predicted_coverage_pct" in data
        assert "approval_probability" in data
        assert "risk_factors" in data
        assert "recommended_action" in data
        assert "estimated_insurance_payment" in data
        assert "estimated_patient_cost" in data

    def test_dhmo_lower_coverage_than_ppo(self):
        ppo_response = client.post("/api/v1/verify-coverage", json=PPO_PAYLOAD)
        dhmo_response = client.post("/api/v1/verify-coverage", json=DHMO_PAYLOAD)
        assert ppo_response.status_code == 200
        assert dhmo_response.status_code == 200
        ppo_coverage = ppo_response.json()["predicted_coverage_pct"]
        dhmo_coverage = dhmo_response.json()["predicted_coverage_pct"]
        assert dhmo_coverage < ppo_coverage

    def test_d0_higher_probability_than_d7(self):
        d0_payload = {**PPO_PAYLOAD, "procedure_code": "D0120"}
        d7_payload = {**PPO_PAYLOAD, "procedure_code": "D7140"}
        d0_response = client.post("/api/v1/verify-coverage", json=d0_payload)
        d7_response = client.post("/api/v1/verify-coverage", json=d7_payload)
        assert d0_response.status_code == 200
        assert d7_response.status_code == 200
        assert (
            d0_response.json()["approval_probability"] > d7_response.json()["approval_probability"]
        )

    def test_invalid_plan_type_returns_422(self):
        payload = {**PPO_PAYLOAD, "insurance_plan_type": "INVALID"}
        response = client.post("/api/v1/verify-coverage", json=payload)
        assert response.status_code == 422

    def test_negative_cost_returns_422(self):
        payload = {**PPO_PAYLOAD, "procedure_cost": -100.0}
        response = client.post("/api/v1/verify-coverage", json=payload)
        assert response.status_code == 422

    def test_zero_cost_returns_422(self):
        payload = {**PPO_PAYLOAD, "procedure_cost": 0.0}
        response = client.post("/api/v1/verify-coverage", json=payload)
        assert response.status_code == 422

    def test_age_above_120_returns_422(self):
        payload = {**PPO_PAYLOAD, "patient_age": 121}
        response = client.post("/api/v1/verify-coverage", json=payload)
        assert response.status_code == 422

    def test_estimated_payment_calculation(self):
        response = client.post("/api/v1/verify-coverage", json=PPO_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        expected_payment = round(data["procedure_cost"] * data["predicted_coverage_pct"] / 100, 2)
        expected_patient_cost = round(data["procedure_cost"] - expected_payment, 2)
        assert data["estimated_insurance_payment"] == expected_payment
        assert data["estimated_patient_cost"] == expected_patient_cost

    def test_age_risk_factor_added_for_minor(self):
        payload = {**PPO_PAYLOAD, "patient_age": 15}
        response = client.post("/api/v1/verify-coverage", json=payload)
        assert response.status_code == 200
        assert "age_risk" in response.json()["risk_factors"]

    def test_age_risk_factor_added_for_senior(self):
        payload = {**PPO_PAYLOAD, "patient_age": 70}
        response = client.post("/api/v1/verify-coverage", json=payload)
        assert response.status_code == 200
        assert "age_risk" in response.json()["risk_factors"]

    def test_high_cost_risk_factor_added(self):
        payload = {**PPO_PAYLOAD, "procedure_cost": 2500.0}
        response = client.post("/api/v1/verify-coverage", json=payload)
        assert response.status_code == 200
        assert "high_cost" in response.json()["risk_factors"]

    def test_no_risk_factors_for_normal_case(self):
        response = client.post("/api/v1/verify-coverage", json=PPO_PAYLOAD)
        assert response.status_code == 200
        assert response.json()["risk_factors"] == []


class TestVerificationHistoryEndpoint:
    def test_history_endpoint_returns_list(self):
        response = client.get("/api/v1/verify-coverage/history")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_empty_history_initially(self):
        response = client.get("/api/v1/verify-coverage/history")
        assert response.status_code == 200
        assert response.json() == []

    def test_two_records_appear_after_two_posts(self):
        client.post("/api/v1/verify-coverage", json=PPO_PAYLOAD)
        client.post("/api/v1/verify-coverage", json=DHMO_PAYLOAD)
        history = client.get("/api/v1/verify-coverage/history").json()
        assert len(history) == 2

    def test_history_record_schema(self):
        client.post("/api/v1/verify-coverage", json=PPO_PAYLOAD)
        record = client.get("/api/v1/verify-coverage/history").json()[0]
        assert "id" in record
        assert "procedure_code" in record
        assert "procedure_cost" in record
        assert "insurance_plan_type" in record
        assert "patient_age" in record
        assert "predicted_coverage_pct" in record
        assert "approval_probability" in record
        assert "recommended_action" in record
        assert "created_at" in record

    def test_history_ordered_desc(self):
        client.post("/api/v1/verify-coverage", json=PPO_PAYLOAD)
        client.post("/api/v1/verify-coverage", json=DHMO_PAYLOAD)
        history = client.get("/api/v1/verify-coverage/history").json()
        assert history[0]["insurance_plan_type"] == "DHMO"
