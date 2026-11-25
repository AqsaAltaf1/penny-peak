# 🎯 Demo Account Setup Guide

## Current Demo Account Status

The "Try Demo Account" button will:

1. **Try to login** with existing demo account (`demo@pennytrack.app`)
2. **Create account** if it doesn't exist
3. **Require email verification** (this is the current limitation)

## 🔧 **To Make Demo Work Immediately:**

### Option 1: Manual Demo Account Setup
1. **Create the demo account manually** in your Supabase dashboard:
   - Go to Authentication → Users
   - Click "Add user"
   - Email: `demo@pennytrack.app`
   - Password: `Demo123!@#`
   - **Mark as verified** ✅

2. **Add demo data** to the database:
   - Run the demo data SQL in your Supabase SQL editor
   - Or use the "Load Demo" button after logging in

### Option 2: Disable Email Confirmations (Easiest)
1. **In Supabase dashboard**:
   - Go to Authentication → Settings
   - Turn **OFF** "Enable email confirmations"
   - Save changes

2. **Now demo account will work** without email verification

### Option 3: Use Your Own Email for Demo
1. **Update the demo email** to your own:
   - Change `demo@pennytrack.app` to your email
   - Use a password you know
   - You can verify with your own email

## 🎯 **Recommended Setup:**

```sql
-- Run this in Supabase SQL Editor to create verified demo user
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    'demo@pennytrack.app',
    crypt('Demo123!@#', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Demo User"}',
    false,
    'authenticated'
);
```

## 🚀 **Quick Fix for Now:**

**Simplest solution**: Turn off email confirmations in Supabase:
1. Supabase Dashboard → Authentication → Settings
2. **Disable** "Enable email confirmations"
3. Save
4. Demo button will work immediately!

## 🎮 **How Demo Works After Setup:**

1. **Click "Create Demo Account"**
2. **Logs in automatically** (no email verification needed)
3. **Shows empty dashboard** with "Load Demo" button
4. **Click "Load Demo"** to populate with sample data
5. **Full functionality** available immediately

This gives users the best demo experience! 🎉





