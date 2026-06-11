/* ==========================================================================
   GreenConnectX - PostgreSQL Database Driver (pg)
   ========================================================================== */

require('dotenv').config();
const { Client, Pool } = require('pg');

// Support both connection URL (Supabase) and individual config (local)
const dbConfig = process.env.DATABASE_URL ? 
  { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } } :
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'greenconnectx'
  };

let pool = null;
let isConnected = false;

// Force initialization on server startup
const initializeOnStartup = async () => {
  if (process.env.DATABASE_URL) {
    console.log('[Database] Initializing connection on startup...');
    await bootstrapDatabase();
  }
};

// Initialize immediately when module loads
initializeOnStartup().catch(err => {
  console.error('[Database] Startup initialization failed:', err.message);
});

// Check if credentials are set to default placeholders
if (!process.env.DATABASE_URL && (!dbConfig.password || dbConfig.password === 'YOUR_POSTGRES_PASSWORD_HERE')) {
  console.warn('\n======================================================================');
  console.warn('⚠️  [Database WARNING] Database connection is not configured.');
  console.warn('👉 Please set DATABASE_URL environment variable for production');
  console.warn('   or DB_PASSWORD for local development and restart the server.');
  console.warn('======================================================================\n');
} else if (!process.env.DATABASE_URL) {
  // Only run bootstrapDatabase here for local development
  bootstrapDatabase();
}

async function bootstrapDatabase() {
  try {
    console.log(`[Database] Connecting to database...`);
    
    // For connection URL (production), connect directly to pool
    if (process.env.DATABASE_URL) {
      pool = new Pool(dbConfig);
      console.log('[Database] Using connection URL (production mode)');
    } else {
      // For local development, verify database exists first
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
      
      // Connect to the actual database pool
      pool = new Pool(dbConfig);
    }
    
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
    console.error('❌ [Database ERROR] Could not connect to database server.');
    console.error(`Reason: ${error.message}`);
    if (process.env.DATABASE_URL) {
      console.error('👉 Please check your DATABASE_URL environment variable.');
    } else {
      console.error('👉 Please make sure:');
      console.error('   1. Your PostgreSQL service is running on your laptop.');
      console.error('   2. The credentials (user, password, port) in ".env" are correct.');
    }
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
