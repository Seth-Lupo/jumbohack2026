from flask import Blueprint, jsonify, request
from ..services.supabase_client import get_supabase

extensions_bp = Blueprint("extensions", __name__)


@extensions_bp.route("/courses", methods=["GET"])
def get_courses():
    """Get courses for a user by utln (no auth required)."""
    utln = request.args.get("utln")
    if not utln:
        return jsonify({"error": "utln parameter required"}), 400

    sb = get_supabase()

    # Lookup profile by utln
    profile = sb.table("profiles").select("id").eq("utln", utln).maybe_single().execute()
    if not profile.data:
        return jsonify({"error": "Profile not found"}), 404

    profile_id = profile.data["id"]

    # Courses where user is professor
    prof_courses = (
        sb.table("courses")
        .select("id, name, code")
        .eq("professor_id", profile_id)
        .execute()
    )

    # Courses where user is a student
    student_rows = (
        sb.table("students")
        .select("course_id")
        .eq("profile_id", profile_id)
        .execute()
    )
    student_course_ids = [r["course_id"] for r in (student_rows.data or [])]

    # Courses where user is an assistant
    assistant_rows = (
        sb.table("assistants")
        .select("course_id")
        .eq("profile_id", profile_id)
        .execute()
    )
    assistant_course_ids = [r["course_id"] for r in (assistant_rows.data or [])]

    # Fetch student/assistant courses by id
    member_course_ids = list(set(student_course_ids + assistant_course_ids))
    member_courses = []
    if member_course_ids:
        member_courses_result = (
            sb.table("courses")
            .select("id, name, code")
            .in_("id", member_course_ids)
            .execute()
        )
        member_courses = member_courses_result.data or []

    # Deduplicate by id
    seen = set()
    courses = []
    for c in (prof_courses.data or []) + member_courses:
        if c["id"] not in seen:
            seen.add(c["id"])
            courses.append(c)

    return jsonify({"data": courses})


@extensions_bp.route("/assignments", methods=["GET"])
def get_assignments():
    """Get assignments for a course (no auth required)."""
    course_id = request.args.get("course_id")
    if not course_id:
        return jsonify({"error": "course_id parameter required"}), 400

    sb = get_supabase()
    result = (
        sb.table("assignments")
        .select("id, name, description, due_date")
        .eq("course_id", course_id)
        .execute()
    )

    return jsonify({"data": result.data or []})


@extensions_bp.route("/flushes", methods=["POST"])
def create_flushes():
    """Batch insert flushes (no auth required). Resolves utln -> user_id."""
    body = request.get_json()
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    utln = body.get("utln")
    assignment_id = body.get("assignment_id")
    flushes = body.get("flushes")

    if not utln or not assignment_id or not flushes:
        return jsonify({"error": "utln, assignment_id, and flushes are required"}), 400

    sb = get_supabase()

    # Resolve utln -> user_id
    profile = sb.table("profiles").select("id").eq("utln", utln).maybe_single().execute()
    if not profile.data:
        return jsonify({"error": "Profile not found for utln"}), 404

    user_id = profile.data["id"]

    # Build rows for insert
    rows = []
    for f in flushes:
        rows.append({
            "user_id": user_id,
            "assignment_id": assignment_id,
            "file_path": f["file_path"],
            "trigger": f["trigger"],
            "start_timestamp": f["start_timestamp"],
            "end_timestamp": f["end_timestamp"],
            "diffs": f["diffs"],
            "active_symbol": f.get("active_symbol"),
            "metrics": {},
        })

    result = sb.table("flushes").insert(rows).execute()

    return jsonify({"inserted": len(result.data or [])})
