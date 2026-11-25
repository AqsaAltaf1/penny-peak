# Supabase OTP Configuration Guide

## Problem
Your Supabase is sending email confirmation links instead of 6-digit OTP codes for the "Register with 6-Digit Code" method.

## Solution: Configure Supabase for OTP Codes

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `eijutrdxpvckfqgwdoio`
3. Go to **Authentication** → **Settings**

### Step 2: Enable OTP/Magic Link Settings
1. Scroll down to **"Magic Link"** section
2. Make sure **"Enable Magic Link"** is **ON**
3. Look for **"OTP Expiry"** setting - set it to **600 seconds** (10 minutes)

### Step 3: Configure Email Templates (IMPORTANT!)
1. Go to **Authentication** → **Email Templates**
2. Find **"Magic Link"** template
3. **Replace the template** with this OTP-focused version:

```html
<h2>Your Verification Code</h2>

<p>Your 6-digit verification code is:</p>
<h1 style="font-size: 32px; font-weight: bold; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px; letter-spacing: 8px;">{{ .Token }}</h1>

<p>This code will expire in 10 minutes.</p>

<p>If you didn't request this code, you can safely ignore this email.</p>

<p>Alternatively, you can also click this link: <a href="{{ .ConfirmationURL }}">Confirm your account</a></p>
```

### Step 4: Test Configuration
1. **Save** the email template
2. Go back to your app
3. Try "Register with 6-Digit Code"
4. Check your email - you should now see both:
   - A large 6-digit code to copy
   - A backup confirmation link

## Alternative: Use Different Supabase Method

If the above doesn't work, we can modify the code to use a different approach:

### Option A: Use `signUp` with OTP verification
Instead of `signInWithOtp`, use regular `signUp` but request OTP after signup.

### Option B: Disable email confirmation temporarily
1. Go to **Authentication** → **Settings**
2. Turn OFF **"Enable email confirmations"**
3. Users will be created immediately without email verification

## Current Email Template Issue
Your current template:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

This is the **signup confirmation** template, not the **magic link** template. We need to update the **Magic Link** template to show the OTP code.

## Next Steps
1. Try updating the Magic Link email template first
2. If that doesn't work, let me know and I'll modify the code to use a different approach
3. Test both registration methods to ensure they work as expected
