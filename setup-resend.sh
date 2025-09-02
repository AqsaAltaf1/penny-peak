#!/bin/bash

# 🚀 Resend Email Service Setup Script
# This script helps you configure Resend for your Expense Tracker

echo "📧 Setting up Resend Email Service for Expense Tracker"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials first."
    exit 1
fi

echo "✅ Found .env.local file"
echo ""

# Instructions
echo "🔧 RESEND SETUP INSTRUCTIONS:"
echo ""
echo "1. Go to https://resend.com and create an account"
echo "2. Create an API key in the Resend dashboard"
echo "3. Copy your API key (starts with 're_')"
echo ""

# Get API key from user
read -p "📝 Enter your Resend API key: " RESEND_API_KEY

if [ -z "$RESEND_API_KEY" ]; then
    echo "❌ Error: No API key provided"
    exit 1
fi

# Validate API key format
if [[ ! $RESEND_API_KEY =~ ^re_ ]]; then
    echo "⚠️  Warning: API key doesn't start with 're_' - are you sure it's correct?"
    read -p "Continue anyway? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Add to .env.local if not already there
if grep -q "VITE_RESEND_API_KEY" .env.local; then
    echo "📝 Updating existing RESEND_API_KEY in .env.local"
    sed -i "s/VITE_RESEND_API_KEY=.*/VITE_RESEND_API_KEY=$RESEND_API_KEY/" .env.local
else
    echo "📝 Adding RESEND_API_KEY to .env.local"
    echo "" >> .env.local
    echo "# Resend Email Service" >> .env.local
    echo "VITE_RESEND_API_KEY=$RESEND_API_KEY" >> .env.local
fi

echo ""
echo "✅ Resend API key added to .env.local"
echo ""

# Next steps
echo "🎯 NEXT STEPS:"
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to: Settings → Authentication → SMTP Settings"
echo "3. Configure with these values:"
echo ""
echo "   SMTP Host: smtp.resend.com"
echo "   SMTP Port: 587"
echo "   SMTP User: resend"
echo "   SMTP Pass: $RESEND_API_KEY"
echo "   Sender Name: Expense Tracker"
echo "   Sender Email: noreply@resend.dev"
echo ""
echo "4. Save the SMTP settings"
echo "5. Test by registering a new account in your app"
echo ""
echo "📖 For detailed instructions, see RESEND_TEST.md"
echo ""
echo "🚀 Setup complete! Your app now has professional email delivery."
