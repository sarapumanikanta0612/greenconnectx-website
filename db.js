/* ==========================================================================
   GreenConnectX - PostgreSQL Database Driver (pg)
   ========================================================================== */

require('dotenv').config();
const { Client, Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'greenconnectx'
};

let pool = null;
let isConnected = false;

// Check if credentials are set to default placeholders
if (!dbConfig.password || dbConfig.password === 'YOUR_POSTGRES_PASSWORD_HERE') {
  console.warn('\n======================================================================');
  console.warn('⚠️  [Database WARNING] PostgreSQL password is not configured.');
  console.warn('👉 Please open the ".env" file in your project folder, enter your');
  console.warn('   actual PostgreSQL database password in DB_PASSWORD, and restart the server.');
  console.warn('======================================================================\n');
} else {
  bootstrapDatabase();
}

async function bootstrapDatabase() {
  try {
    // 1. Connect to default 'postgres' database to check/create the target database
    console.log(`[Database] Verifying database connection to host: ${dbConfig.host}...`);
    
    const client = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: 'postgres'
    });

    await client.connect();
    
    // Check if target database exists
    const checkDbQuery = "SELECT 1 FROM pg_database WHERE datname = $1";
    const res = await client.query(checkDbQuery, [dbConfig.database]);
    
    if (res.rowCount === 0) {
      console.log(`[Database] Database "${dbConfig.database}" does not exist. Creating it now...`);
      // CREATE DATABASE query cannot run inside a transaction blocks, executed directly
      await client.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log(`[Database] Database "${dbConfig.database}" created successfully.`);
    } else {
      console.log(`[Database] Database "${dbConfig.database}" verified.`);
    }
    
    await client.end();

    // 2. Connect to the actual greenconnectx database pool
    pool = new Pool(dbConfig);
    
    // Initialize Waitlist table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Initialize Contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'new'
      )
    `);
    
    isConnected = true;
    console.log(`[Database] PostgreSQL initialized successfully. Tables "waitlist" and "contacts" are ready.`);
  } catch (error) {
    console.error('\n======================================================================');
    console.error('❌ [Database ERROR] Could not connect to PostgreSQL server.');
    console.error(`Reason: ${error.message}`);
    console.error('👉 Please make sure:');
    console.error('   1. Your PostgreSQL service is running on your laptop.');
    console.error('   2. The credentials (user, password, port) in ".env" are correct.');
    console.error('======================================================================\n');
  }
}

module.exports = {
  addWaitlist: async (email) => {
    if (!isConnected || !pool) {
      throw new Error('Database is not connected. Please fix credentials in the .env file.');
    }
    const queryStr = 'INSERT INTO waitlist (email) VALUES ($1)';
    return await pool.query(queryStr, [email]);
  },
  
  addContact: async (name, email, message) => {
    if (!isConnected || !pool) {
      throw new Error('Database is not connected. Please fix credentials in the .env file.');
    }
    const queryStr = 'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING id';
    return await pool.query(queryStr, [name, email, message]);
  },
  
  checkConnection: () => {
    return isConnected;
  }
};
