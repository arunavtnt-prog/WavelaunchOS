# Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

## Pre-Deployment

### Infrastructure
- [ ] Server provisioned (4 CPU, 8GB RAM, 100GB SSD recommended)
- [ ] Ubuntu 22.04 LTS or similar installed
- [ ] Docker and Docker Compose installed
- [ ] Domain name configured with DNS
- [ ] Firewall configured (ports 80, 443, 22 only)

### SSL/TLS
- [ ] SSL certificates obtained (Let's Encrypt or commercial)
- [ ] Certificates copied to `nginx/ssl/` directory
- [ ] Certificate paths updated in `nginx/nginx.conf`
- [ ] Auto-renewal configured for Let's Encrypt

### Environment Configuration
- [ ] `.env.production` created from `.env.example`
- [ ] `POSTGRES_PASSWORD` set to strong password (24+ chars)
- [ ] `NEXTAUTH_SECRET` generated with `openssl rand -base64 32`
- [ ] `ADMIN_PASSWORD` set to strong password
- [ ] `ANTHROPIC_API_KEY` configured
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] Email provider configured (Resend or SMTP)

### Security
- [ ] All passwords are cryptographically random
- [ ] No sensitive data in git repository
- [ ] SSH key-based authentication configured
- [ ] Root SSH login disabled
- [ ] Automatic security updates enabled

## Deployment

### Database Setup
- [ ] PostgreSQL container started
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Performance indexes added (run migration SQL)
- [ ] Admin user seeded
- [ ] Database backup tested

### Application Deployment
- [ ] Application built (`docker-compose build`)
- [ ] All services started (`docker-compose up -d`)
- [ ] Health check passes (`/api/health`)
- [ ] Admin login works
- [ ] File uploads work
- [ ] Email sending tested (if configured)

### Nginx Configuration
- [ ] Nginx container started
- [ ] HTTPS redirect working
- [ ] SSL certificate valid
- [ ] Static file caching working
- [ ] Rate limiting tested
- [ ] Security headers present

## Post-Deployment

### Verification
- [ ] All Docker containers running
- [ ] Application accessible via HTTPS
- [ ] HTTP redirects to HTTPS
- [ ] Database connections working
- [ ] Redis cache working
- [ ] Email notifications working (if configured)
- [ ] File uploads working
- [ ] PDF generation working

### Performance
- [ ] Performance metrics accessible (`/api/monitoring/performance`)
- [ ] Response times < 500ms for typical requests
- [ ] Database indexes verified
- [ ] Cache hit rate > 50%
- [ ] No slow queries (>500ms)

### Monitoring
- [ ] Health check configured
- [ ] Log aggregation working
- [ ] Backup automation configured
- [ ] Disk space alerts configured
- [ ] Memory usage alerts configured
- [ ] Error tracking configured

### Security Audit
- [ ] SSL Labs scan passed (A+ rating)
- [ ] No exposed sensitive endpoints
- [ ] Rate limiting working
- [ ] CSRF protection enabled
- [ ] XSS protection enabled
- [ ] File upload validation working
- [ ] Authentication lockout working

### Documentation
- [ ] Admin credentials documented (securely)
- [ ] Backup procedures documented
- [ ] Recovery procedures documented
- [ ] Monitoring runbook created
- [ ] Team trained on deployment

## Ongoing Maintenance

### Daily
- [ ] Check health endpoints
- [ ] Review error logs
- [ ] Monitor disk space
- [ ] Check backup completion

### Weekly
- [ ] Review performance metrics
- [ ] Check for slow queries
- [ ] Review security logs
- [ ] Test backup restoration

### Monthly
- [ ] Update dependencies
- [ ] Review and rotate logs
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Backup retention cleanup

### Quarterly
- [ ] Update SSL certificates (if not auto-renewed)
- [ ] Review and update documentation
- [ ] Disaster recovery drill
- [ ] Capacity planning review

## Emergency Contacts

- **System Administrator**: _______________
- **Database Administrator**: _______________
- **On-Call Engineer**: _______________
- **Hosting Provider Support**: _______________

## Rollback Plan

If deployment fails:

1. Stop new containers:
   ```bash
   docker-compose -f docker-compose.production.yml down
   ```

2. Restore database backup:
   ```bash
   docker-compose -f docker-compose.production.yml exec postgres \
     psql -U wavelaunch wavelaunch_crm < backup-latest.sql
   ```

3. Restart previous version:
   ```bash
   git checkout <previous-tag>
   docker-compose -f docker-compose.production.yml up -d
   ```

4. Verify rollback successful

5. Investigate failure in separate environment

## Success Criteria

Deployment is successful when:

- ✅ All services running and healthy
- ✅ Application accessible via HTTPS
- ✅ Response times within acceptable range
- ✅ No errors in logs (past 1 hour)
- ✅ Database queries performing well
- ✅ Backups completing successfully
- ✅ Monitoring showing green status

## Sign-Off

- **Deployed by**: _______________
- **Deployment date**: _______________
- **Version deployed**: _______________
- **Checklist completed**: Yes / No
- **Production ready**: Yes / No

---

**Next Steps**: [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)
