# 🚀 Supabase Setup Guide

Follow these steps to connect your expense tracker to Supabase database.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `expense-tracker` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be set up (takes ~2 minutes)

## Step 2: Run SQL Commands

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy and paste the entire content from `supabase-setup.sql` file
4. Click "Run" to execute all the SQL commands
5. You should see success messages for each table and policy created

## Step 3: Get Your Project Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 4: Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
```

⚠️ **Important**: Replace the example values with your actual Supabase URL and key!

## Step 5: Enable Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Make sure **Enable email confirmations** is turned OFF for development
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to: `http://localhost:5173` (for development)
5. Add **Redirect URLs**: `http://localhost:5173/**`

## Step 6: Update Your App (Optional)

The app is already configured to work with both localStorage and Supabase. To switch to Supabase:

1. Update `src/contexts/AppContext.tsx` to use the Supabase services instead of local storage
2. Replace imports in components to use Supabase services

## Step 7: Test the Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:5173`
3. Try creating a new account
4. Add some transactions and savings goals
5. Check your Supabase dashboard → **Table Editor** to see the data

## Database Schema Overview

Your database will have these tables:

### 📊 **Tables Created:**

1. **`profiles`** - User profile information
   - Extends the built-in `auth.users` table
   - Stores display name and avatar

2. **`transactions`** - All income and expense records
   - Links to user via `user_id`
   - Stores amount, category, description, date

3. **`savings_goals`** - User's financial goals
   - Target amount, current progress
   - Deadline and color coding

4. **`categories`** - Predefined transaction categories
   - Pre-populated with common categories
   - Includes icons and colors

### 🔒 **Security Features:**

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Automatic profile creation on signup
- Secure authentication with Supabase Auth

### 📈 **Analytics Views:**

- `monthly_summaries` - Monthly spending/income totals
- `category_summaries` - Spending breakdown by category

## Troubleshooting

### Common Issues:

1. **"Missing environment variables" error**
   - Make sure `.env.local` file exists with correct values
   - Restart your dev server after adding env variables

2. **Authentication not working**
   - Check if email confirmations are disabled in Supabase
   - Verify redirect URLs are correctly set

3. **Database queries failing**
   - Ensure all SQL commands ran successfully
   - Check RLS policies are created properly

4. **CORS errors**
   - Add your development URL to allowed origins in Supabase

### Need Help?

- Check the Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- View your project logs in Supabase dashboard
- Check browser console for error messages

## Production Deployment

When deploying to production:

1. Update environment variables in your hosting platform
2. Add production URL to Supabase Auth settings
3. Consider enabling email confirmations for security
4. Set up proper backup strategies

---

🎉 **You're all set!** Your expense tracker now has a powerful, scalable database backend with real-time capabilities and secure authentication.
