# Google OAuth Setup Guide

## Overview

Google Sign-In has been integrated with email validation. Users can only sign in with Google if their email already exists in the database.

## What Was Implemented

### 1. Redux Store (authSlice.ts)

- **New thunk**: `googleSignIn` - validates OAuth token with backend
- **Endpoint**: `POST /auth/oauth/validate` with `{ token }`
- **Error handling**: Shows "No account found with this Google account. Please sign up first." when email not in database

### 2. Login Screen (login.tsx)

- Integrated `expo-auth-session` for Google OAuth
- Google button now triggers OAuth flow with `promptAsync()`
- On successful OAuth, sends token to backend for validation
- Only navigates to `/home` if email exists in database
- Shows error modal if account not found

### 3. Sign Up Screen (sign-up.tsx)

- Same Google OAuth integration as login
- Validates that email exists before allowing Google sign-in
- Error message guides users to create account first

## Configuration Required

### Step 1: Get Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. For Expo apps, you need:
   - **Web client ID** (for backend validation)
   - **iOS client ID** (if deploying to iOS)
   - **Android client ID** (if deploying to Android)

### Step 2: Update Client IDs in Code

**File: `app/(auth)/login.tsx` (lines 32-34)**

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId:
    "289967638710-tjaaoepq7d43hkukdnt4r7acnv09raop.apps.googleusercontent.com",
});
```

**File: `app/(auth)/sign-up.tsx` (lines 28-30)**

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId:
    "289967638710-tjaaoepq7d43hkukdnt4r7acnv09raop.apps.googleusercontent.com",
});
```

Replace `YOUR_GOOGLE_CLIENT_ID` with your actual client ID.

### Step 3: Configure app.json

Add the following to your `app.json`:

```json
{
  "expo": {
    "scheme": "flipeetpay",
    "ios": {
      "bundleIdentifier": "com.flipeet.pay"
    },
    "android": {
      "package": "com.flipeet.pay"
    }
  }
}
```

### Step 4: Backend Endpoint

Ensure your backend has the OAuth validation endpoint:

- **URL**: `https://api.pay.flipeet.io/api/v1/auth/oauth/validate`
- **Method**: POST
- **Payload**: `{ token: string }`
- **Response on success**:
  ```json
  {
    "user": { ... },
    "accessToken": "...",
    "email": "user@example.com"
  }
  ```
- **Response on failure (email not found)**:
  ```json
  {
    "error": "User not found" // or similar
  }
  ```

## How It Works

### Login Flow

1. User clicks "Continue with Google" button
2. `promptAsync()` opens Google OAuth browser window
3. User selects Google account and grants permissions
4. OAuth returns access token to app
5. App sends token to backend `/auth/oauth/validate`
6. Backend validates token with Google and checks if email exists in database
7. If email exists: User is logged in, navigates to `/home`
8. If email not found: Error modal shows "No account found with this Google account. Please sign up first."

### Sign Up Flow

1. User clicks "Continue with Google" button on sign-up screen
2. Same OAuth flow as login
3. If email exists: User is logged in (navigates to `/home`)
4. If email not found: Error modal tells user to create account first with email/password

## Security Features

- No auto-registration via Google OAuth
- Backend validates OAuth token authenticity
- Only existing database emails can use Google sign-in
- Network errors handled gracefully
- Token validation on server side prevents spoofing

## Testing Checklist

- [ ] Replace placeholder client IDs with real ones
- [ ] Test Google sign-in with existing email (should succeed)
- [ ] Test Google sign-in with non-existent email (should show error)
- [ ] Test network errors (airplane mode)
- [ ] Test cancelling Google OAuth flow
- [ ] Verify backend returns proper error messages

## Next Steps

1. Add your Google OAuth client IDs
2. Update `app.json` with scheme and bundle identifiers
3. Test on physical device (Google OAuth doesn't work well in simulators)
4. Configure redirect URIs in Google Cloud Console
5. Consider adding token persistence with SecureStore
