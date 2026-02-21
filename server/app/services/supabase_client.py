from flask import current_app
from supabase import create_client, Client

_client: Client | None = None


def get_supabase() -> Client:
    """Return a shared Supabase client using the service role key."""
    global _client
    if _client is None:
        url = current_app.config["SUPABASE_URL"]
        key = current_app.config["SUPABASE_SERVICE_ROLE_KEY"]
        _client = create_client(url, key)
    return _client


def reset_client():
    """Reset the cached client (useful for testing)."""
    global _client
    _client = None
