# Architecture

## Current system context

```text
Browser
  │
  ▼
React 18 TypeScript frontend
  │ HTTP
  ▼
Laravel 8 REST API ── MySQL 5.7
  │
  ├── phpMyAdmin (local database administration)
  └── MailHog (local SMTP capture)
```

Docker Compose provides the documented local development environment. The API
exposes student CRUD endpoints; Swagger documentation is available when the
optional L5-Swagger setup has been completed.

## Components

| Component | Responsibility | Technology |
| --- | --- | --- |
| Frontend | Client application and routing | React 18, TypeScript, React Router |
| API | REST endpoints and application behavior | Laravel 8, PHP |
| Database | Development data persistence | MySQL 5.7 |
| Local tooling | Database inspection and email capture | phpMyAdmin, MailHog |
| Local runtime | Containerized development | Docker Compose |

## Boundaries

- This is a current local-development architecture, not a claim of production deployment.
- Authentication, API documentation, testing, and TypeScript migration plans are detailed in their linked guides.
- Record future material architecture choices in `adr/`.
