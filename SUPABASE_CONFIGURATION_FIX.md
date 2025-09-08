# 🔧 Complete Supabase Configuration Fix

## The Current Issues

You're experiencing two main problems:
1. **500 Internal Server Error** - Email service configuration issue
2. **Wrong redirect URL** - Still trying to use port 8080 instead of 8081

## 🚀 Step-by-Step Fix

### 1. **Fix Redirect URLs in Supabase Dashboard**

Go to your Supabase project dashboard:

1. Navigate to **Authentication > URL Configuration**
2. In **Redirect URLs**, add ALL of these:
   ```
   http://localhost:3000/auth/callback
   http://localhost:8080/auth/callback
   http://localhost:8081/auth/callback
   http://localhost:8082/auth/callback
   ```
3. **Save** the configuration

### 2. **Fix Email Configuration**

#### Option A: Configure Resend Properly
1. Go to **Authentication > Settings**
2. Scroll to **SMTP Settings**
3. Make sure these are set:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP Username: resend
   SMTP Password: [Your Resend API Key]
   Sender Name: Your App Name
   Sender Email: [Your verified domain email]
   ```

#### Option B: Disable Email Confirmation (Quick Fix)
1. Go to **Authentication > Settings**
2. **TURN OFF** "Enable email confirmations"
3. **TURN OFF** "Secure email change"
4. Save settings

This allows users to register without email verification (good for development).

### 3. **Check Domain Verification (If using Resend)**

In your Resend dashboard:
1. Verify your domain is properly set up
2. Check that DNS records are configured
3. Ensure your API key has the right permissions

### 4. **Test the Fix**

After making these changes:
1. Try registering with a new email
2. Check the browser console for the correct redirect URL
3. The signup should work without 500 errors

## 🎮 **Immediate Workaround**

While fixing the configuration, users can always use:
- **"Try Demo (No Signup)"** button
- Instant access to full app functionality
- No authentication required

## 🔍 **Debug Information**

The app now logs detailed information:
- Current window location and origin
- Redirect URL being used
- Any port corrections applied

Check the browser console during signup to see these details.

## 📧 **Email Service Status**

The 500 error specifically indicates:
- SMTP configuration is incorrect
- Redirect URL is not in the allowed list
- Domain verification might be incomplete

Fix these in your Supabase dashboard for email signup to work properly.




