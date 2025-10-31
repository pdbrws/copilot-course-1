import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_unregister():
    # Use a unique email to avoid conflicts
    test_email = "pytestuser@mergington.edu"
    activity = "Chess Club"

    # Signup
    response = client.post(f"/activities/{activity}/signup", params={"email": test_email})
    assert response.status_code == 200 or (
        response.status_code == 400 and "already signed up" in response.text
    )

    # Unregister
    response = client.post(f"/activities/{activity}/unregister", json={"email": test_email})
    assert response.status_code == 200 or (
        response.status_code == 404 and "Participant not found" in response.text
    )

def test_signup_invalid_activity():
    response = client.post("/activities/NonexistentActivity/signup", params={"email": "test@mergington.edu"})
    assert response.status_code == 404

def test_unregister_invalid_activity():
    response = client.post("/activities/NonexistentActivity/unregister", json={"email": "test@mergington.edu"})
    assert response.status_code == 404

def test_unregister_missing_email():
    response = client.post("/activities/Chess Club/unregister", json={})
    assert response.status_code == 400
