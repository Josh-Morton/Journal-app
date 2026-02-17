# Set up Google Cloud for OAuth

To enable Google Sign-In, you need to create credentials in Google Cloud Console.

## Step 1: Create a Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → Name it "Journal App"
3. Select the project

## Step 2: Enable Google Drive API
1. Go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click **Enable**

## Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → Click **Create**
3. Fill in:
   - App name: `Journal App`
   - User support email: (your email)
   - Developer email: (your email)
4. Click **Save and Continue** through all steps

## Step 4: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Journal App Web`
5. Add Authorized redirect URI:
   - `https://auth.expo.io/@YOUR_EXPO_USERNAME/Journal-app`
6. Click **Create**
7. Copy the **Client ID**

## Step 5: Add to App
Create a `.env` file in your project root:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## Need Help?
Let me know once you have the Client ID, and I'll help configure it!
