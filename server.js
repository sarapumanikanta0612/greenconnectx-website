/* ==========================================================================
   GreenConnectX - Express API Server (Node.js + PostgreSQL Waitlist Backend)
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const emailService = require('./emailService');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize email service
emailService.initializeEmail();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
}

// Cache control - different for development vs production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Cache static assets, but not API responses
    if (req.url.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for static assets
    }
  } else {
    // Development: Disable all caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const healthStatus = {
    server: 'running',
    database: 'unknown',
    environment: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    gmail: process.env.GMAIL_USER ? 'SET' : 'NOT_SET',
    databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    databaseUrlStart: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT_SET'
  };
  
  try {
    // Test database connection
    if (db.checkConnection()) {
      healthStatus.database = 'connected';
    } else {
      healthStatus.database = 'not_connected';
      
      // Try to get more detailed error info
      try {
        const { Pool } = require('pg');
        const testPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
        await testPool.query('SELECT NOW()');
        healthStatus.database = 'test_connection_success_but_not_initialized';
        await testPool.end();
      } catch (testError) {
        healthStatus.database = 'connection_error';
        healthStatus.connectionError = testError.message;
      }
    }
    
    res.json(healthStatus);
  } catch (error) {
    healthStatus.database = 'error: ' + error.message;
    res.status(500).json(healthStatus);
  }
});

// Waitlist Registration API
app.post('/api/waitlist', async (req, res) => {
  console.log('[DEBUG] Waitlist API called');
  
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    console.log('[DEBUG] Invalid email provided');
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  // Check if database is configured/connected
  if (!db.checkConnection()) {
    console.log('[DEBUG] Database not connected');
    console.log('[DEBUG] Environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET'
    });
    return res.status(503).json({ 
      error: 'Database connection is offline. Please configure your DB_PASSWORD in the ".env" file.' 
    });
  }

  try {
    console.log('[DEBUG] Attempting to add email to waitlist:', email);
    await db.addWaitlist(email);
    console.log(`[Waitlist] New signup recorded: ${email}`);
    
    // Send email notifications for waitlist signup
    // Send notification to admin (you) - don't wait for it
    emailService.sendWaitlistNotification(email).catch(err => {
      console.error('[Email] Waitlist admin notification failed:', err.message);
    });
    
    // Send welcome email to user - don't wait for it
    emailService.sendWaitlistWelcome(email).catch(err => {
      console.error('[Email] Waitlist welcome email failed:', err.message);
    });
    
    res.status(201).json({ success: true, message: 'Successfully added to waitlist!' });
  } catch (error) {
    console.error('[DEBUG] Database error:', error);
    // Catch duplicate SQL constraint
    if (error.code === '23505' || (error.message && error.message.includes('unique constraint'))) {
      return res.status(400).json({ error: 'This email is already registered on our waitlist.' });
    }
    console.error('[Waitlist SQL Error]', error);
    res.status(500).json({ error: 'Server database error. Please try again.' });
  }
});

// Contact Form API
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  // Validation
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
  }
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  
  if (!message || message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
  }

  // Check if database is configured/connected
  if (!db.checkConnection()) {
    return res.status(503).json({ 
      error: 'Database connection is offline. Please configure your DB_PASSWORD in the ".env" file.' 
    });
  }

  try {
    const result = await db.addContact(name.trim(), email.trim(), message.trim());
    const contactId = result.rows[0].id;
    console.log(`[Contact] New message received from ${name} (${email}) - ID: ${contactId}`);
    
    // Send email notifications
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      id: contactId
    };
    
    // Send notification to admin (you) - don't wait for it
    emailService.sendContactNotification(contactData).catch(err => {
      console.error('[Email] Admin notification failed:', err.message);
    });
    
    // Send auto-response to user - don't wait for it
    emailService.sendContactAutoResponse(contactData).catch(err => {
      console.error('[Email] Auto-response failed:', err.message);
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Your message has been sent successfully! We will get back to you soon.',
      id: contactId 
    });
  } catch (error) {
    console.error('[Contact SQL Error]', error);
    res.status(500).json({ error: 'Server database error. Please try again later.' });
  }
});

// Start Web Server
app.listen(PORT, () => {
  const environment = process.env.NODE_ENV || 'development';
  console.log(`[Server] GreenConnectX server running on port ${PORT} (${environment} mode)`);
  if (environment === 'development') {
    console.log(`[Server] Local access: http://localhost:${PORT}`);
  }
});
