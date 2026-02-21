#!/usr/bin/env python3
"""Cross-platform launcher. Checks for Docker + .env, then starts services."""

import os
import sys
import shutil
import subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))


def main():
    if not shutil.which("docker"):
        print("Docker is required. Install it from https://docker.com")
        sys.exit(1)

    env_file = os.path.join(ROOT, ".env")
    env_example = os.path.join(ROOT, ".env.example")
    if not os.path.exists(env_file):
        shutil.copy2(env_example, env_file)
        print("Created .env from .env.example")

    print("Starting services...")
    subprocess.run(
        f'docker compose -f "{os.path.join(ROOT, "docker-compose.yml")}" up --build',
        shell=True,
    )


if __name__ == "__main__":
    main()
