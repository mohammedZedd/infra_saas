# API Examples

## Auth

### Register
- Auth: no
- `POST /api/v1/auth/register`

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!","full_name":"Jane Doe"}'
```

```python
import httpx

payload = {"email": "user@example.com", "password": "Password123!", "full_name": "Jane Doe"}
resp = httpx.post("http://localhost:8000/api/v1/auth/register", json=payload)
print(resp.status_code, resp.json())
```

Success response (201):
```json
{
  "token": "<jwt>",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "tokenType": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe"
  }
}
```

Error response (400 duplicate email):
```json
{"detail":"An account with this email already exists"}
```

### Login
- Auth: no
- `POST /api/v1/auth/login`

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```

### Me
- Auth: bearer token
- `GET /api/v1/auth/me`

```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <access-token>"
```

## Projects

### List projects
- Auth: bearer token
- `GET /api/v1/projects/?page=1&page_size=20&sort_by=updated_at&sort_order=desc`

```bash
curl "http://localhost:8000/api/v1/projects/?page=1&page_size=20" \
  -H "Authorization: Bearer <access-token>"
```

### Create project
- Auth: bearer token
- `POST /api/v1/projects/`

```bash
curl -X POST http://localhost:8000/api/v1/projects/ \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Infra","description":"demo","region":"eu-west-3","environment":"dev"}'
```

### Update project
- Auth: bearer token
- `PATCH /api/v1/projects/{project_id}`

```bash
curl -X PATCH http://localhost:8000/api/v1/projects/<project-id> \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Renamed Project"}'
```

### Delete project
- Auth: bearer token
- `DELETE /api/v1/projects/{project_id}`

```bash
curl -X DELETE http://localhost:8000/api/v1/projects/<project-id> \
  -H "Authorization: Bearer <access-token>"
```

## Project Files

### Save file
- `POST /api/v1/projects/{project_id}/files/save`

```bash
curl -X POST http://localhost:8000/api/v1/projects/<project-id>/files/save \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"path":"main.tf","content":"resource \"null_resource\" \"x\" {}"}'
```

### Get file content
- `GET /api/v1/projects/{project_id}/files/content?path=main.tf`

## Terraform Runs

### Trigger plan
- `POST /api/v1/projects/{project_id}/runs/plan`

```bash
curl -X POST http://localhost:8000/api/v1/projects/<project-id>/runs/plan \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Read logs
- `GET /api/v1/projects/{project_id}/runs/{run_id}/logs`

## Health
- `GET /health`
- `GET /health/detailed`
- `GET /ready`
