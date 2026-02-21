#!/usr/bin/env python3
"""
Seed local Supabase with a professor account + class.
Uses service role key to bypass RLS.
Expects Supabase to be running locally (via docker-compose).
"""

import os
import sys

from dotenv import load_dotenv
from supabase import create_client

# Load .env from project root
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(root, ".env"))

SUPABASE_URL = os.environ.get("SUPABASE_URL", "http://localhost:10002")
SERVICE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
)

PROF_EMAIL = "professor@codeactivity.test"
PROF_PASSWORD = "testpass123"
CLASS_NAME = "CS 101 - Intro to Computer Science"
CLASS_CODE = "CS101"

sb = create_client(SUPABASE_URL, SERVICE_KEY)


def seed():
    """Create a professor account and a class."""
    print("Seeding...")

    # Create class
    cls = sb.table("classes").insert({"name": CLASS_NAME, "code": CLASS_CODE}).execute()
    class_id = cls.data[0]["id"]
    print(f"  Created class: {CLASS_NAME} ({class_id})")

    # Create professor auth user
    prof = sb.auth.admin.create_user({
        "email": PROF_EMAIL,
        "password": PROF_PASSWORD,
        "email_confirm": True,
        "user_metadata": {"role": "professor"},
    })
    prof_id = prof.user.id
    print(f"  Created professor: {PROF_EMAIL} ({prof_id})")

    # Create professor profile
    sb.table("profiles").insert({
        "id": prof_id,
        "email": PROF_EMAIL,
        "display_name": "Professor Test",
        "role": "professor",
        "class_id": class_id,
    }).execute()

    print("Seed done.")
    print()
    print("=== Test credentials ===")
    print(f"  Email:    {PROF_EMAIL}")
    print(f"  Password: {PROF_PASSWORD}")
    print(f"  Class:    {CLASS_NAME}")


if __name__ == "__main__":
    seed()
