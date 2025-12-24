# Backend API Requirements - Bank Account Integration

This document outlines all the backend API requirements for the bank account management system in the Flipeet Pay mobile app.

## Base URL
```
https://api.pay.flipeet.io/api/v1
```

## Authentication
All requests must include:
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 1. Fetch Available Banks

**Endpoint:** `GET /ramp/banks`

**Purpose:** Retrieve list of all supported banks for account verification and transactions.

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Access Bank",
      "code": "044"
    },
    {
      "id": 2,
      "name": "Guaranty Trust Bank",
      "code": "058"
    }
    // ... more banks
  ]
}
```

**Alternative Response Structures (should handle all):**
```json
// Option 1
{
  "banks": [...],
  "success": true
}

// Option 2
[
  { "id": 1, "bankName": "...", "bankCode": "..." }
]
```

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "message": "Error message"
}
```

**Required Bank Fields:**
- `id` (number): Unique identifier
- `name` or `bankName` (string): Display name
- `code` or `bankCode` (string): Bank code for verification

---

## 2. Verify Bank Account

**Endpoint:** `POST /ramp/local/verify-account`

**Purpose:** Verify bank account ownership and retrieve account holder name.

**Request Body:**
```json
{
  "accountNumber": "1234567890",
  "bankCode": "044",
  "bankName": "Access Bank",
  "currency": "NGN"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "bankCode": "044",
    "bankName": "Access Bank"
  }
}
```

**Alternative Account Name Fields (should handle):**
- `data.accountName`
- `data.account_name`
- `data.name`

**Error Response (400/404):**
```json
{
  "success": false,
  "message": "Account not found",
  "error": "ACCOUNT_NOT_FOUND"
}
```

**Common Error Scenarios:**
- Invalid account number format
- Account doesn't exist
- Bank service unavailable (504 Gateway Timeout)
- Invalid bank code

**Important Notes:**
- Account verification may take 2-5 seconds
- Should handle 504 errors gracefully (backend timeout with external bank API)
- The `provider` field is optional - backend should use default if not provided

---

## 3. Fetch User's Saved Bank Accounts

**Endpoint:** `GET /user/{userId}/bank-accounts`

**Purpose:** Retrieve all bank accounts saved by the user.

**URL Parameters:**
- `userId` (string): User's unique identifier

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "account-uuid-1",
      "bankName": "Access Bank",
      "accountNumber": "1234567890",
      "accountName": "John Doe",
      "bankCode": "044",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
    // ... more accounts
  ]
}
```

**Error Response (401/404):**
```json
{
  "success": false,
  "message": "User not found or unauthorized"
}
```

**Required Account Fields:**
- `id` (string): Unique account identifier
- `bankName` (string): Bank name
- `accountNumber` (string): 10-digit account number
- `accountName` (string): Account holder name
- `bankCode` (string): Bank code

**Optional Fields:**
- `createdAt` (ISO 8601 datetime)
- `updatedAt` (ISO 8601 datetime)

---

## 4. Save Bank Account

**Endpoint:** `POST /user/{userId}/bank-accounts`

**Purpose:** Save a new verified bank account to user's profile.

**URL Parameters:**
- `userId` (string): User's unique identifier

**Request Body:**
```json
{
  "bankName": "Access Bank",
  "accountNumber": "1234567890",
  "accountName": "John Doe",
  "bankCode": "044"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Bank account saved successfully",
  "data": {
    "id": "account-uuid-1",
    "bankName": "Access Bank",
    "accountNumber": "1234567890",
    "accountName": "John Doe",
    "bankCode": "044",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (400/409):**
```json
{
  "success": false,
  "message": "Account already exists",
  "error": "DUPLICATE_ACCOUNT"
}
```

**Validation Requirements:**
- Account number must be exactly 10 digits
- Account must be verified before saving
- No duplicate accounts (same bank + account number)

---

## 5. Delete Bank Account

**Endpoint:** `DELETE /user/{userId}/bank-accounts/{accountId}`

**Purpose:** Remove a saved bank account from user's profile.

**URL Parameters:**
- `userId` (string): User's unique identifier
- `accountId` (string): Unique account identifier

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Bank account deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Bank account not found"
}
```

---

## Error Handling Requirements

### Standard Error Response Format
All error responses should follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "ERROR_CODE" // optional
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing/invalid auth token
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error
- `504 Gateway Timeout` - External API timeout (bank verification)

### Common Error Scenarios

**Bank Verification (504 Timeout):**
This is expected when external bank APIs are slow. The app should:
- Show user-friendly message
- Allow manual retry
- Not block the user flow

**Rate Limiting:**
If implemented, return:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60 // seconds
}
```

---

## Data Persistence Requirements

1. **User-Bank Account Relationship:**
   - One user can have multiple bank accounts
   - Each account is unique per user (no duplicates)
   - Accounts persist across app sessions

2. **Security:**
   - Sensitive account data should be encrypted at rest
   - Only authenticated users can access their own accounts
   - Account verification should be rate-limited to prevent abuse

3. **Data Validation:**
   - Account numbers: Must be exactly 10 digits (Nigerian standard)
   - Bank codes: Must match registered banks
   - Account names: Must match verification response

---

## Current Known Issues

### 1. Bank Verification 504 Errors
**Symptom:** Verification API returns 504 Gateway Timeout  
**Cause:** External bank API slow response  
**Status:** Backend issue - needs timeout optimization or caching  
**Workaround:** App handles gracefully with retry option

### 2. Missing User ID Context
**Question:** How to get `userId` for API calls?  
**Current Implementation:** Using Redux `state.auth.userId`  
**Needs Confirmation:** Is this field populated correctly after login?

---

## Redux State Management

The app uses Redux Toolkit for state management with the following slice:

### Bank Account Slice State
```typescript
interface BankAccountState {
  banks: Bank[];                    // Available banks from API
  savedAccounts: BankAccount[];     // User's saved accounts
  selectedAccount: BankAccount | null;
  loading: boolean;                 // General loading state
  banksLoading: boolean;            // Loading banks list
  verifying: boolean;               // Verifying account name
  error: string | null;
}
```

### Async Thunks
1. `fetchBanks()` - Calls GET /ramp/banks
2. `verifyBankAccount()` - Calls POST /ramp/local/verify-account
3. `fetchSavedBankAccounts()` - Calls GET /user/{userId}/bank-accounts
4. `saveBankAccount()` - Calls POST /user/{userId}/bank-accounts
5. `deleteBankAccount()` - Calls DELETE /user/{userId}/bank-accounts/{accountId}

---

## Testing Checklist

### Backend Team Should Test:

- [ ] GET /ramp/banks returns consistent data structure
- [ ] Bank verification works for all supported banks
- [ ] 504 timeout handling for slow bank APIs
- [ ] Duplicate account prevention works correctly
- [ ] Account deletion doesn't affect other users
- [ ] User can only access their own accounts (authorization)
- [ ] Empty savedAccounts array returned for new users
- [ ] Account name fields are consistent (accountName vs account_name)
- [ ] Rate limiting (if implemented) returns proper retry headers

### Frontend Integration Tests:

- [ ] Banks load on app launch
- [ ] Account verification shows loading state
- [ ] Verified accounts can be saved
- [ ] Saved accounts persist across app restarts
- [ ] Account deletion updates UI immediately
- [ ] Error messages display user-friendly text
- [ ] Offline behavior gracefully handled

---

## Questions for Backend Team

1. **User ID Source:** Where should the app get `userId` for API calls?
   - Is it in the auth token payload?
   - Should it come from a `/me` endpoint?
   - Is it in the Redux auth state after login?

2. **Bank Verification Timeouts:** 
   - What's the expected response time for account verification?
   - Should we implement client-side timeout (e.g., 30 seconds)?
   - Can we add polling for async verification?

3. **Rate Limiting:**
   - Are there rate limits on bank verification?
   - Should we cache verification results?

4. **Data Migration:**
   - Any existing test accounts in the database?
   - Should we preserve dummy accounts for testing?

5. **Bank List Updates:**
   - How often is the bank list updated?
   - Should the app cache banks list?
   - Is there a version or last-updated field?

---

## Summary

All dummy data and hardcoded values have been removed from:
- ✅ `app/(action)/add-bank-account.tsx`
- ✅ `components/BankComponent.tsx`
- ✅ `app/contexts/BankAccountContext.tsx` (now Redux-backed)
- ✅ Redux slice created with full API integration
- ✅ Error handling implemented
- ✅ Loading states connected to UI

The app is now ready for full backend API integration testing.
