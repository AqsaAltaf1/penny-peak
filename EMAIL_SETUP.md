# 📧 Email Service Setup for Supabase Authentication

## 🎯 Dual Verification System

Your expense tracker now supports **two ways to verify email addresses**:

1. **📧 Click Email Link** - Traditional email confirmation
2. **🔢 Enter Verification Code** - 6-digit OTP code

Users can choose their preferred method for the best experience!

---

## Option 1: Gmail SMTP (Free & Easy)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account settings
2. Security → 2-Step Verification
3. Turn on 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account → Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Name it "Expense Tracker" or similar
5. Copy the 16-character password (save it!)

### Step 3: Configure Supabase SMTP
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Authentication** → **SMTP Settings**
3. Fill in these details:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-gmail-address@gmail.com
SMTP Pass: your-16-character-app-password
Sender Name: Expense Tracker
Sender Email: your-gmail-address@gmail.com
```

### Step 4: Enable Email Auth
1. In **Settings** → **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. **Enable email confirmations** (turn ON for production, OFF for development)

---

## Option 2: Resend (Developer-Friendly)

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### Step 2: Get API Key
1. Go to API Keys in dashboard
2. Create new API key
3. Copy the key (starts with `re_`)

### Step 3: Add Domain (Optional)
1. Go to Domains in dashboard
2. Add your domain or use `resend.dev` for testing

### Step 4: Configure Supabase
1. Go to **Settings** → **Authentication** → **SMTP Settings**
2. Fill in:

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Pass: your-resend-api-key
Sender Name: Expense Tracker
Sender Email: noreply@resend.dev (or your domain)
```

---

## Option 3: SendGrid (Production Ready)

### Step 1: Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account
3. Complete verification process

### Step 2: Create API Key
1. Go to Settings → API Keys
2. Create API Key with "Restricted Access"
3. Give it "Mail Send" permissions
4. Copy the API key

### Step 3: Configure Supabase
1. Go to **Settings** → **Authentication** → **SMTP Settings**
2. Fill in:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
Sender Name: Expense Tracker
Sender Email: noreply@yourdomain.com
```

---

## 🚀 Quick Setup for Development

If you just want to test without email confirmations:

### Option A: Disable Email Confirmations
1. Go to **Settings** → **Authentication** → **Settings**
2. Turn OFF "Enable email confirmations"
3. Users can sign up and login immediately without email verification

### Option B: Use Magic Links
1. Keep email confirmations ON
2. Check your Supabase logs for magic link URLs during development
3. Copy the URL from logs to test authentication

---

## 📧 Email Templates

Supabase uses these default templates (you can customize them):

### Confirmation Email
- Sent when user signs up
- Contains magic link to verify email

### Password Reset
- Sent when user requests password reset
- Contains link to reset password

### Magic Link
- Sent for passwordless login
- Contains one-time login link

To customize templates:
1. Go to **Settings** → **Authentication** → **Email Templates**
2. Edit the HTML/text content
3. Use variables like `{{ .ConfirmationURL }}` and `{{ .SiteURL }}`

---

## 🔧 Testing Your Setup

### Test Email Delivery
1. Try signing up with a new email
2. Check if confirmation email arrives
3. Click the confirmation link
4. Verify user appears in Authentication → Users

### Debug Issues
- Check Supabase logs in dashboard
- Verify SMTP credentials are correct
- Test with a different email address
- Check spam/junk folders

---

## 💰 Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Gmail SMTP | 500/day | N/A (personal use) |
| Resend | 3,000/month | $20/month for 50k |
| SendGrid | 100/day | $15/month for 40k |

**Recommendation**: Start with **Gmail SMTP** for development, switch to **Resend** for production.

---

## 🎯 Next Steps

1. Choose your email service
2. Follow the setup steps above
3. Test with a signup/login
4. Customize email templates if needed
5. Monitor email delivery in your service dashboard

Your expense tracker will now have professional email authentication! 🎉
