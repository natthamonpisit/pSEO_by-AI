"""
Basic API tests for CompareX
Run with: pytest tests/
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint returns status"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data


def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "database" in data
    assert "timestamp" in data


def test_products_endpoint():
    """Test products list endpoint"""
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_invalid_comparison_id():
    """Test comparison endpoint with invalid ID"""
    response = client.get("/api/comparisons/invalid-uuid-12345")
    assert response.status_code in [404, 500]  # Should fail gracefully


def test_enrich_validation():
    """Test request validation on enrich endpoint"""
    # Empty product name should fail
    response = client.post("/api/clerk/enrich", json={
        "product_name": "",
        "category": "test"
    })
    assert response.status_code == 422  # Validation error


def test_cors_headers():
    """Test CORS headers are present"""
    response = client.get("/", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 200
    # CORS headers should be present
    assert "access-control-allow-origin" in [h.lower() for h in response.headers.keys()]
