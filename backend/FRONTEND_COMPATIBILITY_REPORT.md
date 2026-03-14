# Frontend Compatibility Report

## Scope
Validation date: 2026-03-06
Compared frontend expectations in `FRONTEND_DATA_ANALYSIS.md` with implemented backend routes/schemas.

## Endpoint Validation

| Frontend call | Backend route | Method | Status |
|---|---|---|---|
| `/api/auth/register` | `/api/auth/register` (compat alias) | POST | Compatible |
| `/api/v1/auth/register` | `/api/v1/auth/register` | POST | Compatible |
| `/api/v1/auth/login` | `/api/v1/auth/login` | POST | Compatible |
| `/api/v1/auth/refresh` | `/api/v1/auth/refresh` | POST | Compatible |
| `/api/v1/auth/me` | `/api/v1/auth/me` | GET/PUT | Compatible |
| `/api/v1/projects/` | `/api/v1/projects/` | GET/POST | Compatible |
| `/api/v1/projects/{id}` | `/api/v1/projects/{id}` | GET/PATCH/DELETE | Compatible |
| `/api/v1/projects/{id}/files` | `/api/v1/projects/{id}/files` | GET | Compatible |
| `/api/v1/projects/{id}/files/save` | `/api/v1/projects/{id}/files/save` | POST | Compatible |
| `/api/v1/projects/{id}/files/content` | `/api/v1/projects/{id}/files/content` | GET | Compatible |
| `/api/v1/projects/{id}/runs/*` | `/api/v1/projects/{id}/runs/*` | GET/POST | Compatible |

## Schema Validation

| Frontend type | Backend schema | Status | Notes |
|---|---|---|---|
| `User` | `schemas.token.AuthUser` | Partial | Naming adapted for frontend (`name`, `avatar`) |
| `AuthResponse` | `schemas.token.AuthResponse` | Compatible | Includes `token`, `accessToken`, `refreshToken` |
| `Project` | `schemas.project.ProjectResponse` | Compatible | Core fields match active UI usage |
| `TerraformRun` | `schemas.project.TerraformRunResponse` | Compatible | Includes `planSummary`, `logs` |
| `ProjectFile` | `schemas.file.ProjectFileResponse` | Compatible | Includes content metadata |

## Authentication Validation
- JWT bearer tokens are returned in login/register responses.
- Refresh flow works via `/api/v1/auth/refresh`.
- Protected routes return `401` when token is missing/invalid.

## Pagination Validation
- Query params: `page`, `page_size`, `sort_by`, `sort_order`, plus filters.
- Response metadata includes `total`, `total_pages`, `has_next`, `has_previous`.

## Error Handling Validation
- Validation errors use FastAPI 422 structure (`detail` array).
- Auth errors use 401/403 with readable `detail`.
- Missing resources return 404.

## Discrepancies
- Full Phase 2 schema coverage is not yet complete (git/billing/security/simulation/marketplace advanced entities are pending).
- Compatibility is 100% for currently implemented/active endpoints; global platform-wide compatibility is not yet 100%.
