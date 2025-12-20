#!/usr/bin/env bash
set -euo pipefail

# Simple QA smoke test: checks API health and students endpoint
BASE_URL=${1:-http://localhost:8080}

echo "Checking API health..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$HTTP" -ne 200 ]; then
  echo "Health check failed: HTTP $HTTP"
  exit 2
fi

echo "Health OK. Checking students list..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/students")
if [ "$HTTP" -ne 200 ]; then
  echo "Students endpoint failed: HTTP $HTTP"
  exit 3
fi

echo "Smoke tests passed. API reachable and basic endpoints OK."
exit 0
