# Holders — Firearm Maintenance Tracker

A professional web application for tracking firearm maintenance, range sessions, and collection value.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel

---

## Deployment Steps

### 1. Supabase — Storage Bucket (for document uploads)
1. Go to your Supabase project
2. Click **Storage** in the left sidebar
3. Click **New bucket**
4. Name it `documents`
5. Check **Public bucket** → Save

### 2. Push to GitHub
1. Go to github.com → click **+** → **New repository**
2. Name it `holders-app` → Create (keep it private)
3. Follow the "push existing repo" instructions GitHub shows you
   - On your computer, open Terminal/Command Prompt in the `holders-app` folder
   - Run: `git init && git add . && git commit -m "Initial commit"`
   - Then paste the two lines GitHub gives you

### 3. Deploy to Vercel
1. Go to vercel.com → **Add New Project**
2. Import your `holders-app` GitHub repo
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://oscxbvjukxzmmgdnfrsd.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy**

### 4. Connect Your Domain
1. In Vercel → your project → **Settings → Domains**
2. Add `holders.llc`
3. Vercel shows you DNS records to add
4. In GoDaddy → DNS → add those records
5. Wait 10–30 min for DNS to propagate

---

## Features
- ✅ User authentication (signup/login)
- ✅ Add and manage firearms
- ✅ Log maintenance (cleaning, lubrication, inspection, etc.)
- ✅ Range session logging with automatic round count tracking
- ✅ Inventory value tracking
- ✅ Document storage (receipts, warranties, manuals)
- ✅ Reminders system
- ✅ Dashboard with collection overview
- ✅ PWA support (installable on mobile)

## Coming in Phase 2
- PDF report generation
- Email reminders
- Parts tracking with wear indicators
- Search functionality
- Stripe memberships
- Admin panel
