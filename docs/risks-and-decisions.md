# Risks and decisions

## Assumptions

- The README documents the intended local workflow and should be revalidated before a live demonstration.
- Detailed plans represent useful direction but not necessarily completed product capability.

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
| --- | --- | --- | --- | --- |
| Local documentation and runnable stack diverge | Medium | Medium | Revalidate Docker Compose and test guidance before presenting | Open |
| Future SaaS plans are mistaken for current features | Medium | High | Keep implemented scope and roadmap separate | Mitigated |
| Historical deployment material is operationalized without review | Low | High | Treat runbooks as reference until separately approved and validated | Open |
| Secrets or environment values enter version control | Low | High | Use examples only; review `.env` handling before any deployment work | Open |

## Decision log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-10-11 | Add a concise current-state documentation layer | Make existing detailed material discoverable without duplicating it |
| 2026-10-11 | Keep operations limited to validated local development | Production ownership and infrastructure approval are not recorded |
