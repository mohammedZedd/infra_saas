# Deployment Checklist

## Pre-Deployment
- [x] All tests passing locally in current backend scope
- [ ] Test coverage meets threshold in CI
- [ ] Dependency vulnerability scan completed
- [x] Environment variables documented
- [x] Secrets not hardcoded in runtime config
- [x] Database migrations tested

## Configuration
- [ ] Production `DATABASE_URL` configured
- [ ] Production `SECRET_KEY` rotated and secured
- [ ] CORS restricted to production domains
- [ ] `DEBUG=false` in production
- [ ] Structured logging configured

## Database
- [ ] Production database created
- [ ] Least-privileged DB user configured
- [ ] Migrations applied to production
- [ ] Automated backup policy configured

## Security
- [ ] HTTPS enforced at ingress
- [ ] Rate limiting configured
- [x] Input validation present on request schemas
- [x] SQL injection mitigated via SQLAlchemy parameterization
- [ ] Security headers reviewed at proxy/API gateway

## Monitoring
- [x] Health endpoints available (`/health`, `/health/detailed`, `/ready`)
- [ ] Centralized error logging configured
- [ ] Performance metrics collection enabled
- [ ] Alerting configured
