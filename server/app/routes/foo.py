from flask import Blueprint, request, jsonify, g
from ..auth import require_auth
from ..services.supabase_client import get_supabase

foo_bp = Blueprint("foo", __name__)


@foo_bp.route("", methods=["GET"])
@require_auth
def list_foos():
    """Get all foo records for the current user."""
    sb = get_supabase()
    result = sb.table("foo").select("*").eq("user_id", g.user_id).order("created_at", desc=True).execute()
    return jsonify({"data": result.data})


@foo_bp.route("", methods=["POST"])
@require_auth
def create_foo():
    """Create a new foo record."""
    data = request.get_json()
    bar = data.get("bar", "") if data else ""

    sb = get_supabase()
    result = sb.table("foo").insert({"user_id": g.user_id, "bar": bar}).execute()
    return jsonify({"data": result.data[0]}), 201


@foo_bp.route("/<foo_id>", methods=["PATCH"])
@require_auth
def update_foo(foo_id):
    """Update the bar field of a foo record (must belong to current user)."""
    data = request.get_json()
    if not data or "bar" not in data:
        return jsonify({"error": "bar field is required"}), 400

    sb = get_supabase()
    result = (
        sb.table("foo")
        .update({"bar": data["bar"], "updated_at": "now()"})
        .eq("id", foo_id)
        .eq("user_id", g.user_id)
        .execute()
    )

    if not result.data:
        return jsonify({"error": "not found or not yours"}), 404

    return jsonify({"data": result.data[0]})


@foo_bp.route("/<foo_id>", methods=["DELETE"])
@require_auth
def delete_foo(foo_id):
    """Delete a foo record (must belong to current user)."""
    sb = get_supabase()
    result = (
        sb.table("foo")
        .delete()
        .eq("id", foo_id)
        .eq("user_id", g.user_id)
        .execute()
    )

    if not result.data:
        return jsonify({"error": "not found or not yours"}), 404

    return jsonify({"ok": True})
