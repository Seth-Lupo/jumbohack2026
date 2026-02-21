from flask import Blueprint, request, jsonify, g
from ..auth import require_auth
from ..services.supabase_client import get_supabase

data_bp = Blueprint("data", __name__)


@data_bp.route("/events", methods=["GET"])
@require_auth
def get_events():
    """Retrieve activity events. TAs/professors see all; students see their own."""
    supabase = get_supabase()
    query = supabase.table("activity_logs").select("*")

    # Students can only see their own events
    if g.user_role == "student":
        query = query.eq("student_id", g.user_id)

    # Optional filters
    event_type = request.args.get("event_type")
    if event_type:
        query = query.eq("event_type", event_type)

    limit = request.args.get("limit", 100, type=int)
    query = query.order("created_at", desc=True).limit(limit)

    result = query.execute()
    return jsonify({"data": result.data})
