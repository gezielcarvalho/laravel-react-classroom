#!/usr/bin/env bash
set -euo pipefail

# Helper script used by Jenkins to deploy the compose stack on the server.
# Usage: scripts/jenkins-deploy.sh <image-tag>

IMAGE_TAG=${1:-latest}
REGISTRY=${REGISTRY:-myregistry}
API_IMAGE=${REGISTRY}/laravel-classroom-api:${IMAGE_TAG}
FRONT_IMAGE=${REGISTRY}/laravel-classroom-front:${IMAGE_TAG}

echo "Pulling images: $API_IMAGE and $FRONT_IMAGE"
docker pull "$API_IMAGE"
docker pull "$FRONT_IMAGE"

echo "Updating docker-compose.prod.yml to use ${IMAGE_TAG}"
# Use env substitution via docker/.env.production or export env vars
echo "Exporting environment variables for docker-compose"
export API_IMAGE="$API_IMAGE"
export FRONT_IMAGE="$FRONT_IMAGE"

docker compose -f docker-compose.prod.yml --env-file docker/.env.production pull
docker compose -f docker-compose.prod.yml --env-file docker/.env.production up -d

echo "Running migrations"
docker compose -f docker-compose.prod.yml --env-file docker/.env.production exec -T api php artisan migrate --force

echo "Running smoke tests"
chmod +x scripts/qa-smoke-test.sh || true
./scripts/qa-smoke-test.sh ${APP_URL:-http://localhost}

echo "Deploy complete"
