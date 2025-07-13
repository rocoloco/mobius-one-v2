# Quick Google OAuth Setup for Mobius One

## Ready to Set Up Google OAuth? Let's Do This!

### What You'll Need:
- A Google account
- 10 minutes of your time
- Access to add environment variables

### Quick Setup Steps:

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create Your Project**
   - Click project dropdown → "New Project"
   - Name: "Mobius One Auth"
   - Click "Create"

3. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable: "Google+ API" and "People API"

4. **OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" → "Create"
   - Fill in:
     - App name: "Mobius One Collections Engine"
     - User support email: Your email
     - Developer contact: Your email
   - Save and continue through all steps

5. **Create OAuth Client**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Name: "Mobius One Web Client"
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with:
     - Client ID: `1234567890-xxx.apps.googleusercontent.com`
     - Client Secret: `GOCSPX-xxx`
   - Copy both values immediately!

7. **Add to Environment**
   - In Replit: Go to "Secrets" tab
   - Add `GOOGLE_CLIENT_ID` = your client ID
   - Add `GOOGLE_CLIENT_SECRET` = your client secret

### Test It Out:
1. Restart your app
2. Go to the login page
3. Click "Continue with Google"
4. You should see Google's OAuth screen!

### Need Help?
- Check the full guide: `GOOGLE_OAUTH_SETUP.md`
- Or just ask me if you get stuck!

**Ready to start? Let me know when you've got your credentials!**