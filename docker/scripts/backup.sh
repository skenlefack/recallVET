#!/bin/bash
# RecallVET MySQL Daily Backup
BACKUP_DIR="/home/ubuntu/backups/mysql"
DATE=$(date +%Y-%m-%d_%H-%M)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Dump database from Docker container
docker exec recallvet-db mysqldump -u root -p"${DB_ROOT_PASSWORD}" ${DB_NAME} --single-transaction | gzip > "$BACKUP_DIR/recallvet_${DATE}.sql.gz"

# Remove backups older than retention period
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: recallvet_${DATE}.sql.gz"
echo "Backups in storage: $(ls $BACKUP_DIR/*.sql.gz | wc -l)"
