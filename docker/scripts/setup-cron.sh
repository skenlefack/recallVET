#!/bin/bash
# Setup daily backup cron job at 2:00 AM
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CRON_CMD="0 2 * * * cd /home/ubuntu/recallvet && source .env && bash docker/scripts/backup.sh >> /home/ubuntu/backups/backup.log 2>&1"

# Add cron job if not already present
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_CMD") | crontab -

echo "Backup cron job installed (daily at 2:00 AM)"
crontab -l | grep backup
