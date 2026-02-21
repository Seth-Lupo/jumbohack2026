from flask import Blueprint, request, jsonify, g
from ..auth import require_auth
from ..services.supabase_client import get_supabase

logger_bp = Blueprint("logger", __name__)


@logger_bp.route("/events", methods=["POST"])
@require_auth
def post_event():
    """Receive an activity event from the VSCode extension."""
    data = request.get_json()
    if not data or "event_type" not in data:
        return jsonify({"error": "event_type is required"}), 400

    supabase = get_supabase()
    row = {
        "student_id": g.user_id,
        "event_type": data["event_type"],
        "payload": data.get("payload", {}),
    }

    result = supabase.table("activity_logs").insert(row).execute()
    return jsonify({"ok": True, "data": result.data}), 201
