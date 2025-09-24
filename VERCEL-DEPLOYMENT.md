# SportbikeFL - Complete Vercel Deployment Guide

## 🚀 Quick Deploy Settings

### Vercel Project Configuration
- **Root Directory**: `.` (current directory)
- **Framework Preset**: Other
- **Build Command**: `npm run db:push && npm run build`  
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

## 📁 Project Structure (Vercel-Ready)

```
SportbikeFL/
├── api/
│   └── index.ts              # Serverless function wrapper
├── server/
│   ├── app.ts               # Express app factory 
│   ├── index.ts             # Development server
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Database interface
│   ├── db.ts                # Database connection
│   └── seed.ts              # Database seeding
├── client/src/              # React frontend
├── dist/                    # Built frontend (auto-generated)
├── vercel.json             # Vercel configuration
└── package.json            # Dependencies & scripts
```

## 🔑 Required Environment Variables

### Database (Required)
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```
- **Source**: PostgreSQL database (Neon, Supabase, or similar)
- **Format**: Standard PostgreSQL connection string with SSL
- **Usage**: Database operations, automatic migrations

### Session Security (Required)
```env
IRON_SESSION_PASSWORD=your-secret-key-at-least-32-characters-long
# OR (fallback)
SESSION_SECRET=your-secret-key-at-least-32-characters-long
```
- **Requirements**: Minimum 32 characters, high entropy
- **Usage**: Cookie-based session encryption (stateless for Vercel)
- **Generate**: `openssl rand -base64 32`

### Stripe Payment Processing (Required)
```env
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...
```
- **Source**: Stripe Dashboard → Developers → API Keys
- **VITE_ prefix**: Exposes to frontend (publishable key only)
- **Usage**: Payment processing, checkout sessions

### Stripe Webhooks (Optional but Recommended)
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```
- **Source**: Stripe Dashboard → Webhooks → Endpoint details
- **Usage**: Secure webhook signature verification
- **Endpoint URL**: `https://your-app.vercel.app/api/stripe-webhook`

### Twilio SMS Notifications (Optional)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```
- **Source**: Twilio Console → Account Info
- **Usage**: SMS notifications for bookings/orders
- **Phone Number**: Must be Twilio-verified number

### SendGrid Email (Optional)
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- **Source**: SendGrid Dashboard → Settings → API Keys
- **Usage**: Transactional emails, receipts, confirmations

## ⚙️ Vercel Configuration Files

### vercel.json (Already Created)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🔧 Deployment Process

### 1. Database Setup (Before Deployment)
1. **Create PostgreSQL database** (Neon, Supabase, etc.)
2. **Get connection string** with SSL enabled
3. **Set DATABASE_URL** in Vercel environment variables
4. **Run migrations**: Database schema will be created automatically during build

### 2. Vercel Environment Variables Setup
Navigate to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add all required variables for **Production**, **Preview**, and **Development** environments:

#### Essential Variables (Must Have)
- `DATABASE_URL`
- `IRON_SESSION_PASSWORD` or `SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

#### Optional Variables (Feature-Dependent)
- `STRIPE_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `SENDGRID_API_KEY`

### 3. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: GitHub Integration
1. **Push to GitHub**: Commit all changes
2. **Connect Repository**: Link GitHub repo to Vercel
3. **Auto-Deploy**: Vercel deploys automatically on push

### 4. Post-Deployment Setup

#### Stripe Webhook Configuration
1. **Webhook URL**: `https://your-app.vercel.app/api/stripe-webhook`
2. **Events to Send**: 
   - `checkout.session.completed`
   - `payment_intent.succeeded`
3. **Copy webhook secret** to `STRIPE_WEBHOOK_SECRET`

#### Database Seeding
- **Automatic**: Database seeds automatically during deployment
- **Manual**: If needed, run seeding endpoint (owner login required)

## 🧪 Testing Deployment

### Health Checks
- **Health Endpoint**: `https://your-app.vercel.app/api/health`
- **Expected Response**: `{"status":"healthy","timestamp":...}`

### Functionality Tests
- **Frontend**: `https://your-app.vercel.app/` - React app loads
- **API**: `https://your-app.vercel.app/api/products` - Returns product data
- **Admin**: `https://your-app.vercel.app/owner` - Owner dashboard (login: ronnie123/ronnie123)

## 🚨 Troubleshooting

### Common Issues

#### ❌ "Database connection failed"
- **Check**: DATABASE_URL format and SSL requirement
- **Fix**: Ensure `?sslmode=require` in connection string

#### ❌ "Session errors" 
- **Check**: IRON_SESSION_PASSWORD length (32+ chars)
- **Fix**: Generate new secret: `openssl rand -base64 32`

#### ❌ "Stripe errors"
- **Check**: STRIPE_SECRET_KEY starts with `sk_`
- **Fix**: Copy from Stripe Dashboard → Developers → API Keys

#### ❌ "Build fails"
- **Check**: All environment variables set in Vercel
- **Fix**: Set DATABASE_URL before build (migrations run during build)

#### ❌ "API routes 404"
- **Check**: vercel.json routing configuration
- **Fix**: Ensure API calls use `/api/` prefix

### Performance Optimization
- **Cold Starts**: First request may take 2-3 seconds
- **Database**: Connection pooling handled automatically by Neon/Supabase
- **Sessions**: Stateless (cookie-based) for serverless compatibility

## ✅ Production Checklist

### Pre-Deployment
- [ ] Database created and accessible
- [ ] All environment variables configured in Vercel
- [ ] Stripe keys (live or test) configured
- [ ] Webhook endpoints set up in Stripe dashboard

### Post-Deployment  
- [ ] Health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Admin login works (ronnie123/ronnie123)
- [ ] Product catalog displays
- [ ] Cart functionality works
- [ ] Stripe checkout completes
- [ ] Database contains seeded data

## 🎯 Expected Behavior

Your SportbikeFL application will:

✅ **Serve React frontend** from root URL
✅ **Handle API requests** via serverless functions
✅ **Process payments** through Stripe integration  
✅ **Manage inventory** with real-time stock updates
✅ **Send notifications** via SMS/email (if configured)
✅ **Maintain sessions** across requests (cookie-based)
✅ **Auto-scale** based on traffic (Vercel serverless)

**🎉 Your SportbikeFL e-commerce platform is now production-ready on Vercel!**

---

## 📞 Need Help?

If deployment fails:
1. **Check Vercel build logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test database connection** independently
4. **Confirm Stripe webhook** URL and secret
5. **Review this guide** for any missed steps

**The application is designed to work exactly like your Replit preview once deployed to Vercel.**