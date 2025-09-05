# Test Email Templates Guide

## 🧪 How to Test Which Email Template is Being Used

### Method 1: Check Supabase Email Templates
1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. You should see these templates:
   - **Confirm signup** (for regular signups with password)
   - **Magic Link** (for passwordless OTP signups)
   - **Invite user** 
   - **Reset password**

### Method 2: Test Both Registration Methods

#### Test "Register with Email Link" (should use "Confirm signup" template):
1. Fill name, email, password
2. Click "Register with Email Link"
3. Check email - should show: "Confirm your signup" with a clickable link

#### Test "Register with 6-Digit Code" (should use "Magic Link" template):
1. Fill only name and email
2. Click "Register with 6-Digit Code"  
3. Check email - should show OTP code if configured correctly

## 🔧 Fix for OTP Codes

### Update Magic Link Template in Supabase:
1. Go to **Authentication** → **Email Templates**
2. Select **"Magic Link"** template
3. Replace with this code-focused template:

```html
<h2>Your Login Code</h2>

<p>Hi there!</p>

<p>Your verification code is:</p>

<div style="text-align: center; margin: 30px 0;">
  <div style="display: inline-block; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px 30px; font-family: 'Courier New', monospace;">
    <h1 style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #495057;">{{ .Token }}</h1>
  </div>
</div>

<p>This code will expire in 10 minutes.</p>

<p>Alternatively, you can click this link: <a href="{{ .ConfirmationURL }}" style="color: #007bff; text-decoration: none;">Complete verification</a></p>

<p>If you didn't request this, you can safely ignore this email.</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
<p style="color: #6c757d; font-size: 14px;">This email was sent by Penny Peak - Your Personal Expense Tracker</p>
```

### Alternative: Disable Email Confirmation (Quick Fix)
If you just want to test the app functionality:

1. Go to **Authentication** → **Settings**
2. Turn OFF **"Enable email confirmations"**
3. Both registration methods will work immediately without email verification
4. Users will be logged in right after registration

## 🎯 Expected Behavior After Fix:

### "Register with Email Link":
- Email: "Confirm your signup" with clickable link
- User clicks link → redirected to app → logged in

### "Register with 6-Digit Code":  
- Email: "Your Login Code" with large 6-digit code
- User enters code on verification page → logged in

## 🚀 Quick Test Commands:
```bash
# Test in browser console to see what's happening:
console.log('Testing OTP signup...');

# Check network tab for API calls to see which endpoint is being used:
# - /auth/v1/signup (regular signup)
# - /auth/v1/otp (magic link/OTP)
```
