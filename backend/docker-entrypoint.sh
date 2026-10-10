#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."

# Wait for MySQL to accept connections
until node -e "
  const mysql = require('mysql2/promise');
  mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'recallvet',
    password: process.env.DB_PASSWORD || 'devpassword'
  }).then(c => { c.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "  MySQL not ready yet, retrying in 2s..."
  sleep 2
done

echo "✅ Database is ready!"

echo "🔄 Running migrations..."
node run-migrations.js

echo "🚀 Starting RecallVET API..."
exec node server.js
