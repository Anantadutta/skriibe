# Skriibe - AMA Platform | Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Key Features](#key-features)
6. [Setup & Installation](#setup--installation)
7. [Running the Project](#running-the-project)
8. [API Documentation](#api-documentation)
9. [Database Models](#database-models)
10. [Authentication Flow](#authentication-flow)
11. [Environment Variables](#environment-variables)
12. [Development Guide](#development-guide)
13. [Deployment](#deployment)

---

## 🎯 Project Overview

**Skriibe** is a multi-tier AMA (Ask Me Anything) platform that connects creators with fans. The platform enables creators to host live Q&A sessions, manage content, handle payments, and build community engagement.

### Core User Roles

- **Creators**: Content creators who host AMA sessions, reply to questions, and earn money
- **Fans/Buyers**: Users who ask questions and support creators
- **Admins**: Platform administrators who manage disputes, verify creators, and monitor platform health

### Platform Goals

- Enable creators to monetize their expertise through live Q&A sessions
- Provide fans with direct access to their favorite creators
- Maintain platform integrity through dispute resolution and content moderation

---

## 🏗️ Architecture

The project follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT TIER (Frontend)                │
├─────────────────────────────────────────────────────────┤
│  Frontend (Buyers/Fans)  │  Admin Frontend  │  Developer │
│  - User landing page     │  - Admin panel   │  - Stubs    │
│  - Creator profile       │  - Dispute mgmt  │  - Showcase │
│  - Question management   │  - User moderation           │
└─────────────────────────────────────────────────────────┘
              ▼                    ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                   API TIER (Backend)                     │
├─────────────────────────────────────────────────────────┤
│              Express.js REST API Server                  │
│  - Routes: auth, creators, buyers, questions            │
│  - Controllers: business logic layer                     │
│  - Middleware: authentication, error handling           │
│  - WebSocket: real-time notifications (Socket.io)       │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│              DATA TIER (Database & Services)             │
├─────────────────────────────────────────────────────────┤
│  - MongoDB: data persistence                            │
│  - Razorpay: payment processing                         │
│  - Nodemailer: email service                            │
│  - WATI: WhatsApp messaging                             │
│  - Passport: OAuth (Google, Facebook)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Root Directory

```
skriibe-main/
├── backend/                    # Node.js Express server
├── frontend/                   # React buyer/fan frontend
├── admin-frontend/             # React admin dashboard
├── implementation_plan.md       # Phase 1 implementation plan
├── fetch_alerts.js            # Utility script
├── insert_alert.js            # Utility script
├── backfill_alerts.js         # Utility script
└── scratch.js                 # Scratch file
```

### Backend Structure

```
backend/
├── server.js                   # Main Express server entry point
├── package.json               # Node dependencies
├── .env                       # Environment configuration
├── vercel.json               # Deployment config
│
├── controllers/               # Business logic (expand as needed)
├── middleware/
│   ├── auth.js               # JWT verification middleware
│   └── errorHandler.js        # Global error handler
├── models/
│   ├── AdminAlert.js         # Admin notification model
│   ├── Creator.js            # Creator profile model
│   ├── Fan.js                # Fan/buyer profile model
│   ├── Notification.js       # Notification model
│   ├── Question.js           # Question model
│   ├── OtpAttempt.js        # OTP tracking model
│   ├── DeletedAccountReason.js
│   └── Waitlist.js           # Waitlist model
├── routes/
│   ├── admin.js              # Admin endpoints
│   ├── auth.js               # Authentication endpoints
│   ├── buyers.js             # Buyer endpoints
│   ├── creators.js           # Creator endpoints
│   ├── creator.js            # Single creator endpoints
│   ├── fanAuth.js            # Fan authentication
│   ├── public.js             # Public endpoints
│   └── questions.js          # Question endpoints
└── utils/
    ├── emailService.js       # Nodemailer email templates
    ├── smsService.js         # WATI WhatsApp integration
    ├── otpStore.js          # In-memory OTP store
    ├── razorpayService.js    # Payment processing
    └── seedCreator.js        # Database seeding utility
```

### Frontend Structure (Buyer/Fan)

```
frontend/
├── src/
│   ├── App.jsx              # Main app router component
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   ├── App.css              # App-specific styles
│   │
│   ├── api/
│   │   ├── buyerApi.js      # Buyer API client
│   │   └── ...
│   ├── components/
│   │   ├── Navbar.jsx       # Navigation component
│   │   ├── Hero.jsx         # Landing hero section
│   │   ├── Footer.jsx       # Footer component
│   │   ├── Calculator.jsx   # Price calculator
│   │   ├── PaymentButton.jsx
│   │   ├── WaitlistForm.jsx
│   │   ├── StorySteps.jsx
│   │   ├── ProofMarquee.jsx
│   │   ├── FlowGraphic.jsx
│   │   ├── DMCounter.jsx
│   │   ├── ama/             # AMA component library
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── layout/      # Layout components
│   │   ├── fan/             # Fan feature components
│   │   ├── discovery/       # Creator discovery
│   │   └── ...
│   ├── pages/
│   │   ├── LandingPage.jsx  # Marketing landing page (/)
│   │   ├── Login.jsx        # Fan login
│   │   ├── Signup.jsx       # Fan signup
│   │   ├── CreatorProfile.jsx
│   │   ├── CreatorDashboard.jsx
│   │   ├── CreatorReplyScreen.jsx
│   │   ├── Dashboard.jsx
│   │   ├── AMAPlaceholder.jsx
│   │   ├── admin/           # Admin pages
│   │   ├── creator/         # Creator pages
│   │   ├── buyer/           # Buyer pages
│   │   ├── fan/             # Fan pages
│   │   ├── dev/             # Development pages
│   │   └── stubs/           # Placeholder pages
│   ├── services/
│   │   ├── api.js           # Core API client
│   │   ├── buyerApi.js      # Buyer service
│   │   └── creatorApi.js    # Creator service
│   ├── context/
│   │   └── CreatorOnboardingContext.jsx
│   ├── mock/
│   │   └── questions.js     # Mock data
│   └── assets/              # Images, icons
│
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── index.html
```

### Admin Frontend Structure

```
admin-frontend/
├── src/
│   ├── App.jsx              # Admin app router
│   ├── main.jsx             # Entry point
│   ├── globals.css          # Global styles
│   │
│   ├── components/
│   │   ├── AdminLayout.jsx
│   │   └── NotificationBell.jsx
│   └── pages/
│       ├── AdminLogin.jsx
│       ├── Dashboard.jsx
│       ├── AdminAlerts.jsx
│       ├── ApproveCreator.jsx
│       ├── CreatorDisputes.jsx
│       ├── CreatorDisputeScreen.jsx
│       ├── CreatorHealth.jsx
│       ├── BuyerDisputes.jsx
│       ├── BuyerManagement.jsx
│       ├── VerificationQueue.jsx
│       ├── PlatformAnalytics.jsx
│       ├── RefundDispute.jsx
│       ├── DismissDispute.jsx
│       ├── DisputeScreen.jsx
│       ├── OpenQuestions.jsx
│       ├── UnbanBuyer.jsx
│       ├── StrikeCreator.jsx
│       ├── RejectCreator.jsx
│       └── ConfirmBlock.jsx
│
├── package.json
├── vite.config.js
└── index.html
```

---

## 🛠️ Technology Stack

### Frontend

| Category        | Technology           | Purpose              |
| --------------- | -------------------- | -------------------- |
| **Framework**   | React 19             | UI component library |
| **Build Tool**  | Vite 8               | Fast build tooling   |
| **Styling**     | Tailwind CSS 4       | Utility-first CSS    |
| **Routing**     | React Router v7      | Client-side routing  |
| **Animation**   | Framer Motion 12     | Advanced animations  |
| **Animation**   | GSAP 3               | Timeline animations  |
| **HTTP Client** | Axios 1              | API requests         |
| **Icons**       | Lucide React         | SVG icons            |
| **QR Code**     | qrcode.react         | QR code generation   |
| **UI Effects**  | canvas-confetti      | Celebration effects  |
| **Utilities**   | clsx, tailwind-merge | Class name utilities |

### Admin Frontend

| Category        | Technology      | Purpose              |
| --------------- | --------------- | -------------------- |
| **Framework**   | React 18        | UI component library |
| **Build Tool**  | Vite 5          | Fast build tooling   |
| **Routing**     | React Router v6 | Client-side routing  |
| **HTTP Client** | Axios 1.6       | API requests         |
| **Icons**       | Lucide React    | SVG icons            |

### Backend

| Category           | Technology         | Purpose                      |
| ------------------ | ------------------ | ---------------------------- |
| **Runtime**        | Node.js            | JavaScript runtime           |
| **Framework**      | Express 5          | Web server framework         |
| **Database**       | MongoDB 9.6        | NoSQL database               |
| **ORM**            | Mongoose 9.6       | MongoDB object modeling      |
| **Real-time**      | Socket.io 4.8      | WebSocket communication      |
| **Authentication** | JWT                | Token-based auth             |
| **Authentication** | Passport 0.7       | OAuth strategy support       |
| **Payments**       | Razorpay 2.9       | Payment processing           |
| **Email**          | Nodemailer 8       | Email delivery               |
| **Email**          | Resend 4.8         | Modern email service         |
| **SMS/Chat**       | WATI API           | WhatsApp messaging           |
| **Validation**     | Zod 4.4            | TypeScript schema validation |
| **Security**       | bcryptjs           | Password hashing             |
| **File Upload**    | Multer 2.1         | File upload middleware       |
| **CORS**           | cors 2.8           | Cross-origin requests        |
| **Rate Limiting**  | express-rate-limit | API rate limiting            |
| **Development**    | Nodemon 3.1        | Auto-restart on file changes |

---

## ✨ Key Features

### For Creators

- ✅ Create and manage live AMA sessions
- ✅ Real-time question display with moderation
- ✅ Reply to fan questions
- ✅ Earnings dashboard and payment history
- ✅ Fan management and blocking
- ✅ Profile customization
- ✅ Health metrics tracking

### For Fans/Buyers

- ✅ Discover creators
- ✅ Ask questions to creators
- ✅ Purchase premium access
- ✅ View creator profiles
- ✅ Real-time notifications
- ✅ Payment via Razorpay
- ✅ Account management

### For Admins

- ✅ User verification and approval workflows
- ✅ Dispute management (creator/buyer)
- ✅ Creator strikes and banning
- ✅ Buyer account management and unbanning
- ✅ Platform analytics
- ✅ Question moderation
- ✅ Alert notifications system
- ✅ Refund processing

### Platform Features

- 🔐 Multi-factor authentication (OTP via SMS/WhatsApp)
- 🔑 OAuth integration (Google, Facebook)
- 💳 Razorpay payment integration
- 📧 Email notifications (Nodemailer + Resend)
- 💬 WhatsApp integration (WATI)
- 🔔 Real-time notifications via Socket.io
- ⚡ Rate limiting for API protection
- 📱 Responsive mobile-first design

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB (local or Atlas)
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/skriibe-main.git
cd skriibe-main
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with required variables (see Environment Variables section)
cp .env.example .env

# Install additional packages if needed
npm install cookie-parser jsonwebtoken

# Start development server
npm run dev
# or production
npm start
```

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Production build
npm run build
```

### Step 4: Admin Frontend Setup

```bash
cd admin-frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Production build
npm run build
```

### Database Setup

1. Create MongoDB database (local or MongoDB Atlas)
2. Update `MONGODB_URI` in backend `.env`
3. Optional: Run seeding script

```bash
cd backend
node utils/seedCreator.js
```

---

## ⚙️ Running the Project

### Development Environment (All Services Running)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Runs on http://localhost:5000 (or configured PORT)
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3 - Admin Frontend:**

```bash
cd admin-frontend
npm run dev
# Runs on http://localhost:5174
```

### Access Points

- 🏠 **Landing Page**: http://localhost:5173
- 👤 **Creator Dashboard**: http://localhost:5173/creator/dashboard
- 🔐 **Admin Panel**: http://localhost:5174/admin/login
- 🧪 **Component Showcase**: http://localhost:5173/dev/components
- 🔌 **API Server**: http://localhost:5000

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Admin Frontend
cd admin-frontend
npm run build

# Backend runs directly with node server.js
cd backend
npm start
```

---

## 📡 API Documentation

### Base URL

- Development: `http://localhost:5000`
- Production: `https://api.skriibe.com`

### Authentication Routes (`/routes/auth.js`)

```
POST   /auth/register         - Register new account
POST   /auth/login            - Login with credentials
POST   /auth/logout           - Clear session
POST   /auth/request-otp      - Request OTP
POST   /auth/verify-otp       - Verify OTP token
POST   /auth/refresh          - Refresh auth token
GET    /auth/google           - Google OAuth callback
GET    /auth/facebook         - Facebook OAuth callback
```

### Creator Routes (`/routes/creator.js`, `/routes/creators.js`)

```
GET    /creators              - List all creators
GET    /creators/:handle      - Get creator profile
POST   /creator/profile       - Create/update profile
GET    /creator/dashboard     - Creator dashboard data
GET    /creator/earnings      - Earnings summary
GET    /creator/questions     - Get pending questions
PATCH  /creator/question/:id  - Reply to question
```

### Buyer Routes (`/routes/buyers.js`, `/routes/fanAuth.js`)

```
POST   /fan/register          - Register as fan
GET    /buyers                - List buyers
GET    /buyer/profile         - Get buyer profile
POST   /buyer/question        - Ask creator a question
GET    /buyer/history         - Get question history
```

### Admin Routes (`/routes/admin.js`)

```
POST   /admin/approve-creator     - Verify creator
POST   /admin/strike-creator      - Issue creator strike
POST   /admin/ban-creator         - Ban creator
POST   /admin/unban-buyer         - Unban buyer account
POST   /admin/resolve-dispute     - Resolve dispute
GET    /admin/disputes            - List disputes
GET    /admin/alerts              - Get admin alerts
POST   /admin/dismiss-alert       - Dismiss alert
```

### Question Routes (`/routes/questions.js`)

```
GET    /questions             - Get questions
POST   /questions             - Create question
GET    /questions/:id         - Get question details
PATCH  /questions/:id         - Update question
DELETE /questions/:id         - Delete question
```

### Public Routes (`/routes/public.js`)

```
POST   /waitlist/join         - Join waitlist
GET    /public/stats          - Platform statistics
```

---

## 🗄️ Database Models

### Creator Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  handle: String (unique),
  profilePic: String (URL),
  bio: String,
  category: String,
  isVerified: Boolean,
  verification: {
    status: enum ['pending', 'approved', 'rejected'],
    reviewedBy: ObjectId (Admin),
    reviewedAt: Date,
    reason: String (for rejection)
  },
  strikes: Number (default: 0),
  isBanned: Boolean (default: false),
  followersCount: Number,
  rating: Number,
  earnings: {
    totalEarned: Number,
    balance: Number,
    payoutHistory: Array
  },
  socialLinks: {
    instagram: String,
    twitter: String,
    youtube: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Fan Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  profilePic: String,
  bio: String,
  isBanned: Boolean (default: false),
  spentAmount: Number,
  questionsAsked: Number,
  followedCreators: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Question Model

```javascript
{
  _id: ObjectId,
  creator: ObjectId (ref: Creator),
  asker: ObjectId (ref: Fan),
  question: String,
  reply: String,
  status: enum ['pending', 'answered', 'rejected'],
  price: Number,
  isPaid: Boolean,
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AdminAlert Model

```javascript
{
  _id: ObjectId,
  type: enum ['dispute', 'verification', 'strike', 'payment'],
  title: String,
  message: String,
  relatedUser: ObjectId,
  relatedCreator: ObjectId,
  isRead: Boolean,
  isDismissed: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model

```javascript
{
  _id: ObjectId,
  recipient: ObjectId (ref: User),
  type: String,
  title: String,
  message: String,
  link: String,
  isRead: Boolean,
  createdAt: Date
}
```

---

## 🔐 Authentication Flow

### Creator Registration & Login Flow

```
1. User visits /creator/signup
2. Enters email and password
3. POST /auth/register
4. JWT token created, stored in HTTP-only cookie
5. Redirect to /creator/dashboard
6. Middleware verifies token on protected routes
```

### OTP Verification Flow

```
1. User enters phone number
2. POST /auth/request-otp → SMS/WhatsApp sent via WATI
3. User enters OTP code
4. POST /auth/verify-otp → Token generated
5. User redirected to next step
```

### OAuth Flow (Google/Facebook)

```
1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. Google redirects back to /auth/google callback
4. Passport verifies credentials
5. User account created/updated in MongoDB
6. JWT token generated and set in cookie
```

### Admin Authentication

```
1. Admin visits /admin/login
2. POST /admin/login with credentials
3. JWT token with admin role stored
4. Middleware checks admin-level permissions
5. Access granted to admin routes
```

### Protected Route Middleware

```javascript
// In auth.js middleware
verifyCreatorToken: Checks JWT cookie for creator role
verifyAdminToken: Checks JWT cookie for admin role
errorHandler: Catches and formats errors
```

---

## 🔧 Environment Variables

### Backend `.env` Template

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/skriibe

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRY=7d

# CORS & URLs
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# OAuth - Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

RESEND_API_KEY=your_resend_api_key

# SMS/WhatsApp - WATI
WATI_API_URL=https://wati.io/api/v1
WATI_ACCESS_TOKEN=your_wati_token

# Payments - Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Session
SESSION_SECRET=your_session_secret_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend `.env` (if needed)

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Skriibe
```

---

## 📖 Development Guide

### Adding a New API Route

1. Create route file in `backend/routes/newFeature.js`
2. Import in `server.js`: `app.use('/api/feature', require('./routes/newFeature'))`
3. Add authentication middleware as needed
4. Test with Postman or curl

### Adding a New Frontend Component

1. Create component in `frontend/src/components/`
2. Export from component's barrel file or directly
3. Import and use in pages
4. Style using Tailwind classes

### Adding a New Page

1. Create page file in `frontend/src/pages/`
2. Add route in `App.jsx`
3. Implement layout and components
4. Add navigation links

### Database Schema Changes

1. Update Mongoose model in `backend/models/`
2. Add migration script if needed
3. Test with test data
4. Document schema changes

### Common Issues & Fixes

| Issue                         | Solution                                     |
| ----------------------------- | -------------------------------------------- |
| CORS errors                   | Check allowed origins in server.js           |
| JWT not found                 | Ensure cookies are enabled, check JWT_SECRET |
| MongoDB connection fails      | Verify MONGODB_URI, network access           |
| WhatsApp messages not sending | Check WATI_ACCESS_TOKEN and phone format     |
| Razorpay payments failing     | Verify API keys, check test mode             |

---

## 🌐 Deployment

### Backend Deployment (Vercel)

```bash
cd backend
# Vercel config already in place
vercel deploy
```

### Frontend Deployment (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy the dist/ folder
vercel deploy dist/
```

### Database Deployment

- Use MongoDB Atlas for cloud hosting
- Set up automatic backups
- Configure IP whitelist for security

### Environment Variables on Production

1. Set all environment variables in hosting platform dashboard
2. Never commit `.env` files
3. Use different secrets for dev/prod

### SSL Certificate

- Production URLs should use HTTPS
- Configure SSL in hosting platform
- Update CORS and callback URLs for HTTPS

### Monitoring & Logging

- Set up error tracking (Sentry)
- Monitor API performance
- Track Socket.io connections
- Monitor payment transactions

---

## 📝 Development Workflow

### Branch Strategy

```
main (production)
├── develop (staging)
└── feature/* (feature branches)
```

### Commit Convention

```
[TYPE]: Description

Types: feat, fix, docs, style, refactor, test, chore
Example: feat: Add creator strike system
```

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Testing

Steps to test the changes

## Screenshots (if UI changes)
```

---

## 🤝 Team Collaboration

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included/passing
- [ ] No hardcoded values (use env vars)
- [ ] Database queries are optimized
- [ ] Error handling is proper
- [ ] UI is responsive

### Communication Channels

- Slack for quick discussions
- GitHub issues for bug tracking
- PRs for code review

---

## 📞 Support & Contact

For questions or issues:

1. Check existing GitHub issues
2. Review implementation_plan.md for Phase 1 details
3. Contact development team on Slack

---

## 📄 License

[Add license information here]

---

## 🔄 Version History

| Version | Date       | Changes                 |
| ------- | ---------- | ----------------------- |
| 1.0.0   | 2026-06-06 | Initial platform launch |
| 0.9.0   | 2026-05-15 | Phase 1 implementation  |
| 0.1.0   | 2026-01-01 | Project kickoff         |

---

**Last Updated**: June 6, 2026  
**Documentation Version**: 1.0.0  
**Maintained By**: Development Team
