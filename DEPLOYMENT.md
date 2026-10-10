# RecallVET Deployment Guide

## Prerequisites

- **Server**: Ubuntu 22.04+ with Docker and Docker Compose installed
- **Domain**: DNS records pointing to the server for:
  - `recallvet.com` / `www.recallvet.com` (marketing website)
  - `app.recallvet.com` (admin dashboard)
  - `api.recallvet.com` (backend API)
- **GitHub**: Repository access with permission to configure secrets
- **SSL**: Managed automatically via Certbot (Let's Encrypt)

## GitHub Secrets Configuration

Navigate to **Settings > Secrets and variables > Actions** in the GitHub repository and add:

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Production server IP address or hostname |
| `SERVER_USER` | SSH username (e.g., `ubuntu`) |
| `SERVER_SSH_KEY` | Private SSH key for server access (full PEM content) |

## CI/CD Pipeline

### Automatic Deployment

Pushing to the `main` branch triggers automatic deployment via `.github/workflows/deploy.yml`:

1. GitHub Actions connects to the server via SSH
2. Pulls the latest code from `main`
3. Rebuilds and restarts Docker containers

### Test Pipeline

Pull requests and pushes to `main`/`master` trigger `.github/workflows/test.yml`:

- **backend-tests**: Installs dependencies and runs backend test suite
- **admin-tests**: Installs dependencies and runs admin dashboard tests

## Manual Deployment

If you need to deploy manually on the server:

```bash
cd /home/ubuntu/recallvet
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

To check service status:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

## Environment Variables

Copy the example file and fill in production values:

```bash
cp .env.example .env
nano .env
```

### Required Variables

| Variable | Description |
|----------|-------------|
| `DB_ROOT_PASSWORD` | MySQL root password |
| `DB_NAME` | Database name (default: `recallvet`) |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database user password |
| `JWT_SECRET` | JWT signing secret (min 32 chars). Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (min 32 chars) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port (typically 587) |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASS` | SMTP authentication password |
| `SMTP_FROM` | Sender email address |

## Backup Setup

### Install the Cron Job

Run the setup script on the server to schedule daily backups at 2:00 AM:

```bash
cd /home/ubuntu/recallvet
bash docker/scripts/setup-cron.sh
```

### Manual Backup

To run a backup manually:

```bash
cd /home/ubuntu/recallvet
source .env
bash docker/scripts/backup.sh
```

Backups are stored in `/home/ubuntu/backups/mysql/` as gzipped SQL dumps. Files older than 30 days are automatically deleted.

### Restore from Backup

```bash
gunzip < /home/ubuntu/backups/mysql/recallvet_YYYY-MM-DD_HH-MM.sql.gz | docker exec -i recallvet-db mysql -u root -p"${DB_ROOT_PASSWORD}" ${DB_NAME}
```

## Health Check

Run the health check script to verify all services are responding:

```bash
bash docker/scripts/healthcheck.sh
```

This checks HTTP status for:
- `https://www.recallvet.com` (website)
- `https://app.recallvet.com` (admin dashboard)
- `https://api.recallvet.com/api/public/plans` (API)

You can add this to cron for periodic monitoring:

```bash
*/5 * * * * bash /home/ubuntu/recallvet/docker/scripts/healthcheck.sh >> /home/ubuntu/backups/healthcheck.log 2>&1
```

## Stripe Configuration

To enable payment processing:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard (Developers > API keys)
3. Add the keys to your `.env` file:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Set up a webhook endpoint in Stripe Dashboard pointing to `https://api.recallvet.com/api/stripe/webhook`
5. Select the events to listen for (e.g., `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`)
6. Restart the backend container: `docker compose -f docker-compose.prod.yml restart backend`

## SSL Certificate Renewal

SSL certificates are managed automatically by the Certbot container, which checks for renewal every 12 hours. To manually renew:

```bash
docker compose -f docker-compose.prod.yml exec certbot certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

## Troubleshooting

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend

# Database
docker compose -f docker-compose.prod.yml logs -f db
```

### Restart a Service

```bash
docker compose -f docker-compose.prod.yml restart backend
```

### Full Rebuild

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```
