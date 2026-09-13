require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Create database if not exists
    const dbName = process.env.DB_NAME || 'recallvet';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);

    // Create migrations tracker
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rv_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get already executed migrations
    const [executed] = await connection.query('SELECT filename FROM rv_migrations');
    const executedSet = new Set(executed.map(r => r.filename));

    // Read migration files in order
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`  Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await connection.query(sql);
      await connection.query('INSERT INTO rv_migrations (filename) VALUES (?)', [file]);
      console.log(`  Done: ${file}`);
    }

    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
