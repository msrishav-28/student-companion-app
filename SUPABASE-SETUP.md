# ⚡ Supabase Setup & Production Guide

## ✅ Status: Production-Ready

Your WingMan App is fully architected to run on **Supabase** (PostgreSQL) with a complete set of features matching the original design.

---

## 🚀 Supabase Architecture

### Core Services
- **Database**: PostgreSQL (Relational, ACID compliant)
- **Authentication**: Supabase Auth (Email/Password, Magic Links)
- **Storage**: Supabase Storage for files (documents, images)
- **Realtime**: Realtime subscriptions for live updates
- **Edge Functions**: (Optional) Server-side logic if needed

### Why Supabase?
- ✅ **Open Source** - Built on PostgreSQL
- ✅ **Relational Data** - Better data integrity for academic records
- ✅ **Row Level Security** - Fine-grained access control
- ✅ **Built-in API** - Instant REST/GraphQL API
- ✅ **Great DX** - TypeScript support out of the box

---

## 🛠️ Setup Guide (10 Minutes)

### Step 1: Create Project
1. Go to [database.new](https://database.new)
2. Sign in with GitHub
3. Create a new project
4. Save your database password!

### Step 2: Get Credentials
1. Go to **Settings** → **API**
2. Copy `Project URL`
3. Copy `anon` (public) key

### Step 3: Configure Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-your-openai-key  # Optional
```

### Step 4: Apply Database Schema
1. Go to **SQL Editor** in Supabase Dashboard.
2. Create a new query.
3. Copy the contents of your schema files (e.g., `supabase-schema.sql` or `supabase-schema-phase5.sql`).
4. Run the query to create tables, functions, and policies.

### Step 5: Configure Auth
1. Go to **Authentication** → **Providers**.
2. Enable **Email**.
3. (Optional) Disable "Confirm email" for faster testing.
4. Add Redirect URL: `http://localhost:3000/auth/callback` (and your Vercel URL).

### Step 6: Configure Storage
1. Go to **Storage**.
2. Create a new bucket named `documents` (public or private as needed).
3. Create a new bucket named `profile-pictures` (public).
4. (Note: Policies are likely handled in SQL, but verify bucket existence).

---

## 📊 Database Schema Overview

### Core Tables
- `students`: Profile data linked to `auth.users`
- `subjects`: Academic subjects
- `attendance`: Attendance logs
- `grades`: Exams and scores
- `assignments`: Tasks and to-dos

### Gamification & Social
- `xp_transactions`, `streaks`, `achievements`
- `study_groups`, `forum_threads`

### AI & Operations
- `ai_conversations`, `ai_messages`
- `predictions`, `analytics_events`

---

## 🔐 Security (Row Level Security)

Security is handled via PostgreSQL RLS Policies.
Example Policy:
```sql
CREATE POLICY "Users can view own data" ON "public"."students"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

Ensure RLS is **enabled** on all tables!

---

## 🚀 Production Deployment

### Deploy to Vercel
1. Push code to GitHub.
2. Import project in Vercel.
3. Add Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy!

### Database Backups
- Supabase enables daily backups on the Pro plan.
- You can manually export via Dashboard → Database → Backups.

---

## 📚 Resources
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

**Ready to build! 🚀**
