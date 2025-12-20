# Deploy Runbook

This runbook provides concise steps to build, deploy, verify, and rollback releases for the `laravel-react-classroom` application.

Pre-requisites

- Docker and Docker Compose installed
- Access to container registry (DockerHub/ACR/ECR) credentials configured in CI/CD
- SSH or provider access to target environment (if not using compose)

Build & publish images (CI)

1. CI should run tests and build multi-stage images from `api/` and `front/`.
2. Tag images with semantic tags (e.g., `v1.2.3`, `sha-<short>`), push to registry.

Manual local build & push (example):

```bash
# API image
docker build -t myregistry/laravel-classroom-api:sha-$(git rev-parse --short HEAD) ./api
docker push myregistry/laravel-classroom-api:sha-$(git rev-parse --short HEAD)

# Front image
docker build -t myregistry/laravel-classroom-front:sha-$(git rev-parse --short HEAD) ./front
docker push myregistry/laravel-classroom-front:sha-$(git rev-parse --short HEAD)
```

Deploy (compose-based)

1. Prepare production env file (never commit secrets): create `docker/.env.production` from the example.
2. On the target server pull images and start:

```bash
docker compose -f docker-compose.prod.yml --env-file docker/.env.production pull
docker compose -f docker-compose.prod.yml --env-file docker/.env.production up -d
```

3. Run migrations with caution:

```bash
docker compose -f docker-compose.prod.yml exec api php artisan migrate --force
```

Smoke tests

- GET /api/health or GET /api/students should return 200
- Login and list/create a student through the frontend UI
- Check logs for errors: `docker compose logs api` and `docker compose logs front`

Rollback

- If the new release is faulty, re-deploy the previous image tag:

```bash
docker compose -f docker-compose.prod.yml --env-file docker/.env.production pull
docker compose -f docker-compose.prod.yml --env-file docker/.env.production up -d
```

Backups

- Automate regular DB backups to object storage. Test restores regularly.

Notes

- For zero-downtime schema migrations, follow Laravel best practices (backwards-compatible changes, deploy code first, then run migration jobs that are safe).

Jenkins integration

This project uses Jenkins as the CI/CD engine. A `Jenkinsfile` is included at the repository root that performs the build, push, and deploy steps. Typical setup:

1. Configure Jenkins credentials:
   - `docker-registry-creds` (username/password) for logging into the container registry.
2. Configure a Jenkins pipeline job (multibranch or pipeline) that reads the `Jenkinsfile` in this repo.
3. Configure a GitHub webhook (or use GitHub Branch Source integration) so pushes to `main` trigger Jenkins builds.
4. Ensure the Jenkins agent can run Docker Compose and access `docker/.env.production` (do not commit secrets).

Jenkins manual deploy step (if using Jenkins UI):

```bash
# On Jenkins host or agent with Docker
export IMAGE_TAG=sha-$(git rev-parse --short HEAD)
docker build -t myregistry/laravel-classroom-api:$IMAGE_TAG ./api
docker build -t myregistry/laravel-classroom-front:$IMAGE_TAG ./front
docker push myregistry/laravel-classroom-api:$IMAGE_TAG
docker push myregistry/laravel-classroom-front:$IMAGE_TAG
# Deploy
docker compose -f docker-compose.prod.yml --env-file docker/.env.production pull
docker compose -f docker-compose.prod.yml --env-file docker/.env.production up -d
docker compose -f docker-compose.prod.yml --env-file docker/.env.production exec -T api php artisan migrate --force
```

Rollback tips

- Use the previous image tag and re-run the `docker compose pull` / `up -d` steps.
- Keep image tags in a release registry so Jenkins can reference prior releases.
