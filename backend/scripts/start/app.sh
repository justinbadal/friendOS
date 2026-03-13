#!/bin/bash
set -e
echo "Running database migrations..."
alembic upgrade head
echo "Starting FastAPI server..."
uvicorn app.main:api --host 0.0.0.0 --port 8000 --reload
