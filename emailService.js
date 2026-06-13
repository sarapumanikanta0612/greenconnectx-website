/* ==========================================================================
   GreenConnectX - Email Service (Gmail Integration)
   ========================================================================== */

const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'greenconnectx.team@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
};

let transporter = null;

// Initialize email transporter
function initializeEmail() {
  console.log('[Email] Initializing email service...');
  console.log('[Email] Gmail user:', process.env.GMAIL_USER ? 'SET' : 'NOT_SET');
  console.log('[Email] Gmail password length:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 0);
  
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn('[Email] Gmail App Password not configured. Email notifications disabled.');
    return false;
  }

  try {
    // Use simpler Gmail configuration for better reliability
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'greenconnectx.team@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      rateDelta: 20000,
      rateLimit: 5
    });
    
    console.log('[Email] Gmail transporter initialized successfully.');
    return true;
  } catch (error) {
    console.error('[Email] Failed to initialize Gmail transporter:', error.message);
    return false;
  }
}

// Alternative: Use fetch to send emails via webhook/API instead of SMTP
async function sendEmailViaWebhook(emailData) {
  // For now, we'll log the email content and suggest using Resend
  console.log('[Email] SMTP blocked by Vercel. Email content:', {
    to: emailData.to,
    subject: emailData.subject,
    from: emailData.from
  });
  
  console.log('[Email] Suggestion: Use Resend.com for serverless email sending');
  console.log('[Email] Visit: https://resend.com to set up proper email service');
  
  return { 
    success: false, 
    message: 'SMTP not supported in serverless environment. Use Resend.com instead.' 
  };
}
// Send contact form notification to admin
async function sendContactNotification(contactData) {
  console.log('[Email] sendContactNotification called with:', { id: contactData.id, email: contactData.email });
  
  if (!transporter) {
    console.log('[Email] Transporter not available, reinitializing...');
    const initialized = initializeEmail();
    if (!initialized) {
      console.log('[Email] Failed to initialize transporter, using webhook fallback.');
      return await sendEmailViaWebhook({
        to: 'greenconnectx.team@gmail.com',
        from: process.env.GMAIL_USER,
        subject: `🚀 New Contact Message from ${contactData.name} - GreenConnectX`,
        html: 'Contact form submission received'
      });
    }
  }

  const { name, email, message, id } = contactData;
  
  console.log('[Email] Preparing admin notification email...');
  
  const mailOptions = {
    from: process.env.GMAIL_USER || 'greenconnectx.team@gmail.com',
    to: 'greenconnectx.team@gmail.com',
    subject: `🚀 New Contact Message from ${name} - GreenConnectX`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: #0f172a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #10b981; margin: 0;">📧 New Contact Message</h2>
          <p style="margin: 5px 0 0 0; color: #94a3b8;">GreenConnectX Landing Page</p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #0f172a; margin-top: 0;">Contact Details:</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
                <a href="mailto:${email}" style="color: #10b981; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Message ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">#${id}</td>
            </tr>
          </table>
          
          <h3 style="color: #0f172a; margin-top: 25px;">Message:</h3>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #0f172a; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background: #ecfdf5; border-radius: 6px; border: 1px solid #10b981;">
            <p style="margin: 0; color: #047857; font-weight: 500;">
              💡 <strong>Quick Actions:</strong>
            </p>
            <p style="margin: 5px 0 0 0; color: #047857;">
              • Reply directly to <a href="mailto:${email}" style="color: #10b981;">${email}</a><br>
              • Check your database for more details (Contact ID: #${id})
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>This email was sent automatically from your GreenConnectX landing page contact form.</p>
        </div>
      </div>
    `,
    timeout: 30000 // Increased to 30 second timeout
  };

  console.log('[Email] Attempting to send admin notification...');

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email] Contact notification sent successfully for message ID: ${id}, messageId: ${result.messageId}`);
    return { success: true, message: 'Email notification sent', messageId: result.messageId };
  } catch (error) {
    console.error('[Email] Failed to send contact notification:', error.message);
    
    // Try to reinitialize and retry once
    if (error.message.includes('network') || error.message.includes('connection') || error.message.includes('timeout')) {
      console.log('[Email] Network error detected, attempting retry...');
      try {
        initializeEmail();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        const retryResult = await transporter.sendMail(mailOptions);
        console.log(`[Email] Contact notification sent on retry for message ID: ${id}`);
        return { success: true, message: 'Email notification sent (retry)', messageId: retryResult.messageId };
      } catch (retryError) {
        console.error('[Email] Retry also failed:', retryError.message);
      }
    }
    
    return { success: false, message: error.message };
  }
}

// Send auto-response to user who submitted contact form
async function sendContactAutoResponse(contactData) {
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const { name, email } = contactData;
  
  const mailOptions = {
    from: process.env.GMAIL_USER || 'greenconnectx.team@gmail.com',
    to: email,
    subject: '✅ Thanks for contacting GreenConnectX - We received your message!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px;">🌱 GreenConnectX</h1>
          <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">Thanks for reaching out!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${name}! 👋</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in <strong>GreenConnectX</strong>! We've received your message and our team will get back to you within <strong>24 hours</strong>.
          </p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
            <h3 style="color: #047857; margin-top: 0;">🚀 What happens next?</h3>
            <ul style="color: #047857; margin: 10px 0; padding-left: 20px;">
              <li>Our team will review your message carefully</li>
              <li>We'll respond with detailed information or answers</li>
              <li>If needed, we'll schedule a demo or call</li>
            </ul>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            In the meantime, feel free to explore our platform features and <a href="#" style="color: #10b981; text-decoration: none;"><strong>join our waitlist</strong></a> to be notified when we launch!
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Building cleaner, smarter communities together 🌍
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>This is an automated response. Please don't reply to this email - we'll contact you directly from our team email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Auto-response sent to ${email}`);
    return { success: true, message: 'Auto-response sent' };
  } catch (error) {
    console.error('[Email] Failed to send auto-response:', error.message);
    return { success: false, message: error.message };
  }
}

// Send waitlist signup notification to admin
async function sendWaitlistNotification(email) {
  if (!transporter) {
    console.log('[Email] Transporter not available, reinitializing...');
    const initialized = initializeEmail();
    if (!initialized) {
      console.log('[Email] Failed to initialize transporter, skipping waitlist notification.');
      return { success: false, message: 'Email service not configured' };
    }
  }

  const mailOptions = {
    from: process.env.GMAIL_USER || 'greenconnectx.team@gmail.com',
    to: 'greenconnectx.team@gmail.com',
    subject: '🚀 New Waitlist Signup - GreenConnectX',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: #0f172a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #10b981; margin: 0;">🌱 New Waitlist Signup!</h2>
          <p style="margin: 5px 0 0 0; color: #94a3b8;">GreenConnectX Landing Page</p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #0f172a; margin-top: 0;">Waitlist Details:</h3>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #047857; font-size: 18px; font-weight: 600;">
              📧 ${email}
            </p>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background: #f0f9ff; border-radius: 6px; border: 1px solid #0ea5e9;">
            <p style="margin: 0; color: #0369a1; font-weight: 500;">
              💡 <strong>Quick Stats:</strong>
            </p>
            <p style="margin: 5px 0 0 0; color: #0369a1;">
              • Someone is interested in your GreenConnectX platform<br>
              • They want to be notified when you launch<br>
              • Check your database for the complete waitlist
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>This email was sent automatically from your GreenConnectX waitlist signup form.</p>
        </div>
      </div>
    `,
    timeout: 30000 // 30 second timeout
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email] Waitlist notification sent for: ${email}`);
    return { success: true, message: 'Waitlist notification sent' };
  } catch (error) {
    console.error('[Email] Failed to send waitlist notification:', error.message);
    
    // Try to reinitialize and retry once
    if (error.message.includes('network') || error.message.includes('connection') || error.message.includes('timeout')) {
      console.log('[Email] Network error detected, attempting retry...');
      try {
        initializeEmail();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        const retryResult = await transporter.sendMail(mailOptions);
        console.log(`[Email] Waitlist notification sent on retry for: ${email}`);
        return { success: true, message: 'Waitlist notification sent (retry)' };
      } catch (retryError) {
        console.error('[Email] Retry also failed:', retryError.message);
      }
    }
    
    return { success: false, message: error.message };
  }
}

// Send welcome email to waitlist subscriber
async function sendWaitlistWelcome(email) {
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: process.env.GMAIL_USER || 'greenconnectx.team@gmail.com',
    to: email,
    subject: '🌱 Welcome to the GreenConnectX Waitlist!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px;">🌱 GreenConnectX</h1>
          <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 18px;">Welcome to the Community!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #0f172a; margin-top: 0;">Thanks for joining! 🎉</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            You're now on the <strong>GreenConnectX waitlist</strong>! We're building something amazing for community environmental action, and you'll be among the first to know when we launch.
          </p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
            <h3 style="color: #047857; margin-top: 0;">🚀 What's Coming Next:</h3>
            <ul style="color: #047857; margin: 10px 0; padding-left: 20px;">
              <li>Civic issue reporting with photo & GPS tagging</li>
              <li>Community cleanup drive organization</li>
              <li>Interactive neighborhood maps</li>
              <li>EcoPoints and environmental impact tracking</li>
              <li>Direct connection with local authorities</li>
            </ul>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            We'll keep you updated on our progress and let you know as soon as beta testing begins. In the meantime, feel free to share GreenConnectX with friends who care about their community!
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Building cleaner, smarter communities together 🌍
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>This is a confirmation email. You can unsubscribe by replying to this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Welcome email sent to: ${email}`);
    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error.message);
    return { success: false, message: error.message };
  }
}
module.exports = {
  initializeEmail,
  sendContactNotification,
  sendContactAutoResponse,
  sendWaitlistNotification,
  sendWaitlistWelcome
};