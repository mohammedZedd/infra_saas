# Docker Commands

Run commands from `backend/`.

## Starting Services
- Start all services:
```bash
docker compose up
```
- Start only database:
```bash
docker compose up postgres
```
- Start all services in detached mode:
```bash
docker compose up -d
```
- Rebuild and start:
```bash
docker compose up --build -d
```

## Stopping Services
- Stop all services:
```bash
docker compose down
```
- Stop and remove volumes:
```bash
docker compose down -v
```

## Viewing Logs
- View all logs:
```bash
docker compose logs
```
- View specific service logs:
```bash
docker compose logs backend
```
- Follow logs in real time:
```bash
docker compose logs -f backend
```

## Database Operations
- Open PostgreSQL shell:
```bash
docker compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```
- Create database backup:
```bash
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql
```
- Restore database backup:
```bash
cat backup.sql | docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

## Maintenance
- Remove all project containers, images, and volumes:
```bash
docker compose down --rmi all -v --remove-orphans
```
- Rebuild backend only:
```bash
docker compose build backend
```
- View service status:
```bash
docker compose ps
```
