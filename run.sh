#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker &> /dev/null; then
  echo "Docker is required. Install it from https://docker.com"
  exit 1
fi

if [ ! -f .env ]; then
  echo "No .env file found. Copying from .env.example..."
  cp .env.example .env
  echo "Please edit .env with your Supabase credentials, then re-run."
  exit 1
fi

echo "Starting services..."
docker compose up --build "$@"
