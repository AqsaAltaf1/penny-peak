# 🔧 Fix Supabase Authentication Errors

## The Problem
You're getting authentication errors because:
1. **429 Rate Limit Error**: Too many signup attempts (email rate limit exceeded)
2. **Redirect URL mismatch**: Trying to use port 8080 instead of 8081
3. **Email service**: Not properly configured

## 🚀 Quick Fixes

### 1. **IMMEDIATE FIX: Use Demo Mode**
The rate limit will reset in a few minutes, but you can test the app instantly:
- Click **"Try Demo (No Signup)"** button
- No authentication required, works immediately
- Full app functionality with sample data

### 2. Wait for Rate Limit Reset (5-10 minutes)
Supabase has email rate limits. After waiting, you can try registration again.

### 3. Update Redirect URLs in Supabase

Go to your Supabase Dashboard:
1. Navigate to **Authentication > URL Configuration**
2. Add these URLs to **Redirect URLs**:
   ```
   http://localhost:8080/auth/callback
   http://localhost:8081/auth/callback
   http://localhost:8082/auth/callback
   http://localhost:3000/auth/callback
   ```
   (This covers different ports Vite might use)

### 2. Check Email Settings

Go to **Authentication > Settings**:
1. **Enable email confirmations** should be ON
2. **Secure email change** should be ON  
3. Check if **Resend** is properly configured in **SMTP settings**

### 3. Alternative: Disable Email Confirmation (Development Only)

If you want to skip email confirmation for development:
1. Go to **Authentication > Settings**
2. **Disable** "Enable email confirmations"
3. Users will be automatically confirmed

### 4. Test with Demo Mode

If Supabase registration still fails, users can always use the **"Try Demo (No Signup)"** button which works instantly without any authentication.

## 🧪 Testing Steps

1. Try registering with a test email
2. Check browser console for the redirect URL being used
3. Make sure that URL is in your Supabase allowed redirects
4. If still failing, try demo mode as fallback

## 📧 Email Service Status

The error suggests your Resend configuration might need attention. Check:
- API key is correct in Supabase settings
- Domain is verified in Resend dashboard
- No rate limits exceeded
