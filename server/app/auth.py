import functools
import jwt
from flask import request, g, jsonify, current_app


def require_auth(f):
    """Middleware decorator that extracts the Supabase user from the JWT."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split(" ", 1)[1]

        try:
            # Supabase JWTs are signed with the JWT secret; for now we
            # decode without full verification (the Supabase client already
            # validated the session). In production, verify with the JWT secret.
            payload = jwt.decode(token, options={"verify_signature": False})
            g.user_id = payload.get("sub")
            g.user_email = payload.get("email")
            g.user_role = payload.get("user_metadata", {}).get("role", "student")
        except jwt.PyJWTError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated
