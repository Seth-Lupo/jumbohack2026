"""
End-to-end test: sign in to Supabase, write an activity log, read it back, clean up.

Requires a valid .env with:
  SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
  TEST_USER_EMAIL, TEST_USER_PASSWORD
"""

import os
import sys
import uuid

import pytest
import requests
from dotenv import load_dotenv
from supabase import create_client

# Load .env from project root
for env_path in [".env", "../.env"]:
    if os.path.exists(env_path):
        load_dotenv(env_path)
        break

# Add parent so we can import the app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
TEST_EMAIL = os.environ.get("TEST_USER_EMAIL", "")
TEST_PASSWORD = os.environ.get("TEST_USER_PASSWORD", "")


def _skip_if_no_creds():
    if not all([SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD]):
        pytest.skip("Supabase credentials not configured in .env")


@pytest.fixture(scope="module")
def access_token():
    """Sign in and return a valid JWT access token."""
    _skip_if_no_creds()
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    result = client.auth.sign_in_with_password(
        {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    assert result.session is not None, "Failed to sign in"
    return result.session.access_token


@pytest.fixture(scope="module")
def app_client():
    """Create a Flask test client."""
    from app import create_app

    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture(scope="module")
def service_client():
    """Supabase client with service role key for cleanup."""
    if not SUPABASE_SERVICE_ROLE_KEY:
        pytest.skip("SUPABASE_SERVICE_ROLE_KEY not set")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


class TestAuthReadWrite:
    """Test the full auth + read/write flow."""

    _created_ids: list[str] = []

    def test_post_event(self, app_client, access_token):
        """Write a test activity log via POST /api/logger/events."""
        resp = app_client.post(
            "/api/logger/events",
            json={
                "event_type": "test_event",
                "payload": {"test_run": True, "marker": str(uuid.uuid4())},
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert resp.status_code == 201, f"POST failed: {resp.get_json()}"
        data = resp.get_json()
        assert data["ok"] is True
        assert len(data["data"]) > 0
        self.__class__._created_ids.append(data["data"][0]["id"])

    def test_get_events(self, app_client, access_token):
        """Read events back via GET /api/data/events."""
        resp = app_client.get(
            "/api/data/events?event_type=test_event",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert resp.status_code == 200, f"GET failed: {resp.get_json()}"
        data = resp.get_json()
        assert "data" in data

    def test_cleanup(self, service_client):
        """Remove test records."""
        for record_id in self.__class__._created_ids:
            service_client.table("activity_logs").delete().eq(
                "id", record_id
            ).execute()
