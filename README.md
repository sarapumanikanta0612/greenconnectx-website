# GreenConnectX Landing Page

A professional landing page for the GreenConnectX platform - connecting communities for environmental action.

## 🚀 Features

- **Modern Landing Page** with interactive mockups
- **Waitlist Registration** with PostgreSQL backend
- **Contact Form** with database storage
- **Responsive Design** optimized for mobile and desktop
- **Real-time Notifications** and feedback
- **Professional UI/UX** with glassmorphism design

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Environment**: dotenv for configuration

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- PostgreSQL (v12 or higher)
- npm (v8.0.0 or higher)

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd greenconnect-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.production.example .env
   # Edit .env with your database credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit** http://localhost:3000

### Production Deployment

1. **Set environment variables**
   ```bash
   cp .env.production.example .env.production
   # Update .env.production with production database credentials
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🗄️ Database Setup

The application automatically creates the required tables:
- `waitlist` - Email signups
- `contacts` - Contact form submissions

Make sure your PostgreSQL database exists and is accessible.

## 🌐 API Endpoints

- `POST /api/waitlist` - Register email for waitlist
- `POST /api/contact` - Send contact message

## 📁 Project Structure

```
greenconnect-landing/
├── public/                 # Static frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   ├── app.js            # Frontend JavaScript
│   └── logo.png          # Logo image
├── server.js              # Express server
├── db.js                 # Database connection and queries
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (development)
└── .env.production.example # Production environment template
```

## 🔒 Security Features

- Input validation and sanitization
- SQL injection protection with parameterized queries
- CORS configuration
- Security headers in production
- Rate limiting ready (can be enabled)

## 📱 Mobile Support

Fully responsive design with:
- Mobile-optimized navigation
- Touch-friendly interactions
- Consistent background effects across devices
- Optimized loading for mobile networks

## 🎨 Features Included

### Landing Page Sections
- Hero with animated mockup
- Feature showcase (8 planned features)
- Interactive workflow timeline
- Before/after comparison widget
- Development roadmap
- Interactive platform mockups
- Waitlist registration
- Contact form with real backend

### Interactive Elements
- Smooth scroll navigation
- Animated mockup dashboard
- Interactive map pins simulation
- Cleanup drives RSVP system
- Community feed simulation
- Before/after comparison slider

## 🚀 Deployment Ready

The project is production-ready with:
- Environment-specific configurations
- Production security headers
- Optimized caching strategies
- Database connection pooling
- Error handling and logging
- Performance optimizations

## 🤝 Contributing

This is a complete landing page project. For modifications:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Private project - All rights reserved.

## 📞 Support

For questions or support, use the contact form on the website or reach out to the development team.

---

**GreenConnectX** - Building cleaner, smarter communities through technology. 🌱