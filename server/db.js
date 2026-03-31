const { Pool } = require('pg');

// Render provides a single DATABASE_URL string
const connectionString = process.env.DATABASE_URL;

const pool = connectionString 
  ? new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Render/ElephantSQL/Heroku
      }
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'urlshortener',
      password: process.env.DB_PASSWORD || 'admin1234',
      port: process.env.DB_PORT || 5432,
    });

const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_id VARCHAR(50) UNIQUE NOT NULL,
      clicks INTEGER DEFAULT 0,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    -- Ensure comment column exists if table already created
    ALTER TABLE links ADD COLUMN IF NOT EXISTS comment TEXT;
  `;
  try {
    await pool.query(queryText);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb,
};
