# Operations and runbooks

## Current operational posture

The supported posture documented for this showcase is local development through
Docker Compose. No approved production environment, operating owner, or release
path is recorded by this documentation baseline.

## Local development

Follow the root README for environment setup, Docker Compose commands, API,
frontend, phpMyAdmin, and MailHog access.

## Retained operational guidance

[deploy-runbook.md](deploy-runbook.md), `devops/prep-guide.md`, Jenkinsfile,
and QA/production compose files are retained as planning/reference material.
They must be independently validated for current infrastructure, secrets,
branching, security, backup, and rollback requirements before use.

## Before any future deployment

- [ ] Confirm business, technical, and environment owners.
- [ ] Review secrets, access control, data classification, and external services.
- [ ] Validate monitoring, health checks, backups, restore, and rollback.
- [ ] Record release authorization and post-deployment validation in a delivery issue.
