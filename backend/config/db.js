const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recallvet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  typeCast: function (field, next) {
    if (field.type === 'VAR_STRING' || field.type === 'STRING' || field.type === 'BLOB') {
      return field.string();
    }
    return next();
  }
});

pool.on('connection', (connection) => {
  connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
});

pool.getConnection()
  .then(async conn => {
    await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    console.log('Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

module.exports = pool;
