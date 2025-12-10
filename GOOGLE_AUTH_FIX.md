# Fixing "Authorization Error" for Google OAuth

## The Issue

You're getting an "Authorization Error" because Google OAuth requires proper redirect URIs to be configured in the Google Cloud Console.

## Solution

### Step 1: Get Your Expo Username

Run this command:

```bash
npx expo whoami
```

### Step 2: Update Redirect URI in Code

Replace `@your-expo-username` in both files with your actual Expo username:

**File: `app/(auth)/login.tsx` (line 38)**

```typescript
redirectUri: "https://auth.expo.io/@YOUR_ACTUAL_USERNAME/flipeet-pay",
```

**File: `app/(auth)/sign-up.tsx` (line 37)**

```typescript
redirectUri: "https://auth.expo.io/@YOUR_ACTUAL_USERNAME/flipeet-pay",
```

### Step 3: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://auth.expo.io/@YOUR_ACTUAL_USERNAME/flipeet-pay
   ```
6. Click **Save**

### Step 4: Alternative - Use Development Build

For better OAuth support, you can use Expo Development Build:

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Create development build
npx expo run:android
# or
npx expo run:ios
```

Then update the redirect URI to use your custom scheme:

```typescript
redirectUri: "flipeetpay://oauth/redirect",
```

And add this to Google Cloud Console authorized redirect URIs:

```
flipeetpay://oauth/redirect
```

### Step 5: Test the Fix

1. Restart your Expo development server
2. Try the Google login again
3. You should now see the Google account selection screen

## Common Issues

### "Invalid redirect URI"

- Make sure the redirect URI in your code matches exactly what's in Google Cloud Console
- No trailing slashes
- Check for typos in your Expo username

### "Access blocked: This app's request is invalid"

- Your OAuth consent screen might not be configured
- Go to **OAuth consent screen** in Google Cloud Console
- Add test users (your Gmail) if in testing mode

### Still not working?

Try using the implicit flow by removing the redirect URI parameter completely:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId:
    "289967638710-tjaaoepq7d43hkukdnt4r7acnv09raop.apps.googleusercontent.com",
});
```

This uses the default Expo redirect URI which should work in development.
