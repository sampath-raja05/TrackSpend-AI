# TrackSpend AI Setup Guide

## 🚨 Fix Resend API Key Error

The error "Missing API key. Pass it to constructor `new Resend("re_123")`" occurs because the RESEND_API_KEY environment variable is not set.

### Quick Fix:

1. **Get Resend API Key:**
   - Go to https://resend.com
   - Sign up/login
   - Navigate to API Keys section
   - Create new API key
   - Copy the key (starts with `re_`)

2. **Add to Environment:**
   ```bash
   # Create .env file in project root
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

3. **Restart Development Server:**
   ```bash
   npm run dev
   ```

## 📧 Email Service Status

The email functionality is now **gracefully degraded**:
- ✅ PDF generation works
- ✅ Audit creation works  
- ⚠️ Email sending requires API key
- ✅ App continues working even without email

## 🔧 Environment Variables Required

Create `.env` file with:

```env
# Required for email functionality
RESEND_API_KEY=your_resend_api_key

# Optional but recommended
ANTHROPIC_API_KEY=your_anthropic_key
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Testing

After setting up API key:
1. Run an audit with your email
2. Check console for "Email sent successfully" message
3. Verify PDF arrives in your inbox

## 🐛 Troubleshooting

If email still fails:
1. Verify API key starts with `re_`
2. Check `.env` file is in project root
3. Ensure no spaces around the API key
4. Restart development server after changes

The audit functionality works completely without email - email is only for PDF delivery convenience.
