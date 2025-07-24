# Google OAuth Setup Guide for Mobius One

## Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept Terms of Service if prompted

## Step 2: Create or Select a Project

1. **Create New Project** (or select existing):
   - Click the project dropdown in the top navigation bar
   - Click "New Project"
   - Enter project name: `Mobius One Authentication`
   - Click "Create"
   - Wait for project creation to complete

## Step 3: Enable Google+ API

1. **Navigate to APIs & Services**:
   - In the left sidebar, click "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on "Google+ API"
   - Click "Enable"

2. **Also enable People API** (recommended):
   - Search for "People API"
   - Click on "People API"
   - Click "Enable"

## Step 4: Configure OAuth Consent Screen

1. **Navigate to OAuth consent screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (allows any Google user)
   - Click "Create"

2. **Fill out App Information**:
   - **App name**: `Mobius One Collections Engine`
   - **User support email**: Your email address
   - **App logo**: (optional) Upload your Mobius logo
   - **Application homepage**: `http://localhost:5000`
   - **Application privacy policy**: `http://localhost:5000/privacy` (optional)
   - **Application terms of service**: `http://localhost:5000/terms` (optional)
   - **Authorized domains**: Add `localhost` (for development)
   - **Developer contact information**: Your email address

3. **Click "Save and Continue"**

4. **Scopes** (Step 2):
   - Click "Add or Remove Scopes"
   - Search and add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

5. **Test Users** (Step 3):
   - Add your email address
   - Add any other test users
   - Click "Save and Continue"

6. **Summary** (Step 4):
   - Review your settings
   - Click "Back to Dashboard"

## Step 5: Create OAuth Client Credentials

1. **Navigate to Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "+ Create Credentials"
   - Select "OAuth client ID"

2. **Configure Web Application**:
   - **Application type**: Web application
   - **Name**: `Mobius One Web Client`
   
3. **Add Authorized JavaScript Origins**:
   - `http://localhost:5000`
   - `http://127.0.0.1:5000`
   
4. **Add Authorized Redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://127.0.0.1:5000/api/auth/google/callback`

5. **Click "Create"**

## Step 6: Get Your Credentials

1. **Download Credentials**:
   - A dialog will appear with your Client ID and Client Secret
   - **IMPORTANT**: Copy these immediately - the secret is only shown once!
   - You can also download the JSON file for backup

2. **Your credentials will look like**:
   ```
   Client ID: 1234567890-abcdefghijklmnop.apps.googleusercontent.com
   Client Secret: GOCSPX-abcdefghijklmnopqrstuvwxyz
   ```

## Step 7: Configure Environment Variables

**For Development (Replit)**:
1. In your Replit project, go to the "Secrets" tab
2. Add these environment variables:
   - Key: `GOOGLE_CLIENT_ID`
   - Value: Your Client ID from step 6
   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: Your Client Secret from step 6

**For Local Development**:
Create a `.env` file in your project root:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Step 8: Test OAuth Setup

1. **Restart your application** after adding the environment variables
2. **Go to the login page**: `http://localhost:5000/login`
3. **Click "Continue with Google"**
4. **You should see the OAuth consent screen**
5. **Grant permissions and test the login flow**

## Security Notes

- **Never commit secrets to version control**
- **Use HTTPS in production** (update redirect URIs)
- **Store secrets securely** in production environments
- **Regularly rotate client secrets**

## Production Setup

When ready for production:
1. **Update authorized domains** in OAuth consent screen
2. **Update redirect URIs** to use HTTPS
3. **Submit for OAuth verification** if using sensitive scopes
4. **Use proper secret management** (Google Secret Manager, etc.)

## Troubleshooting

- **`redirect_uri_mismatch`**: Check that your redirect URI exactly matches what's configured
- **`invalid_client`**: Verify your client ID and secret are correct
- **`access_denied`**: User denied permission or app not verified
- **`invalid_request`**: Check that all required parameters are included

## Support

If you encounter issues:
1. Check the Google Cloud Console error logs
2. Verify your OAuth consent screen is properly configured
3. Ensure all required APIs are enabled
4. Check that your redirect URIs are exactly correct

Your Mobius One application is now ready for Google OAuth authentication!