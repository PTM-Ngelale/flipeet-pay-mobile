# API Integration Roadmap

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Status:** In Progress

---

## Table of Contents

1. [Integration Phases](#integration-phases)
2. [Phase 1: Security & Account Management](#phase-1-security--account-management)
3. [Phase 2: Transaction Processing](#phase-2-transaction-processing)
4. [Phase 3: Advanced Ramp Features](#phase-3-advanced-ramp-features)
5. [Implementation Guidelines](#implementation-guidelines)
6. [File Structure](#file-structure)
7. [Testing Checklist](#testing-checklist)

---

## Integration Phases

### Phase 1: Security & Account Management (PRIORITY: HIGH)

- PIN Login System
- Email Management
- Password Management
- Account Deletion

### Phase 2: Transaction Processing (PRIORITY: HIGH)

- Initialize Payment
- Process Payment
- Individual Fund/Withdrawal
- Internal Transfer
- Bridge/Swap

### Phase 3: Advanced Ramp Features (PRIORITY: MEDIUM)

- Off-Ramp Orders
- Send Orders
- Wallet Management
- Transaction Receipts

---

## Phase 1: Security & Account Management

### 1.1 PIN Sign-In

**Endpoint:** `POST /api/v1/auth/mobile/pin/sign-in`

**Priority:** HIGH  
**Dependency:** None (independent)

#### Implementation Location:

- File: `app/(auth)/pin.tsx`
- Redux: New action in `authSlice.ts`

#### Request Payload:

```typescript
{
  email: string;
  pin: number;
}
```

#### Response Format:

```typescript
{
  credentials: {
    accessToken: string;
    expiresIn: string;
    schema: string;
  }
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
    // ... other user fields
  }
}
```

#### Redux Action Required:

```typescript
export const pinSignIn = createAsyncThunk(
  "auth/pinSignIn",
  async ({ email, pin }: { email: string; pin: number }, thunkAPI: any) => {
    // Implementation
  },
);
```

#### UI Updates Required:

- [pin.tsx](<app/(auth)/pin.tsx>) - Add error handling and loading state
- Show success screen on successful login

#### Error Handling:

- Invalid PIN (400)
- User not found (404)
- Account locked (429)

---

### 1.2 PIN Availability Check

**Endpoint:** `GET /api/v1/auth/mobile/verify-pin-availablility`

**Priority:** MEDIUM  
**Dependency:** None

#### Implementation Location:

- File: `app/(auth)/pin.tsx` or `app/contexts/AuthContext.tsx`
- Redux: New action in `authSlice.ts`

#### Query Parameters:

```typescript
email: string(required);
```

#### Response Format:

```typescript
{
  pinAvailable: boolean;
  message: string;
}
```

#### Usage:

Call this when user first enters PIN login screen to check if PIN login is available for their account.

---

### 1.3 Email Change OTP Request

**Endpoint:** `GET /api/v1/user/email/otp/request`

**Priority:** HIGH  
**Dependency:** User must be authenticated

#### Implementation Location:

- File: `app/(profile-and-settings)/change-email.tsx`
- Redux: New action in `authSlice.ts`

#### Query Parameters:

```typescript
email: string (required) - new email to change to
```

#### Response Format:

```typescript
{
  message: string;
  otpSent: boolean;
}
```

#### Redux Action Required:

```typescript
export const requestEmailChangeOtp = createAsyncThunk(
  "auth/requestEmailChangeOtp",
  async (newEmail: string, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Flow:

1. User enters new email
2. Request OTP
3. Show OTP verification screen
4. Verify OTP with next endpoint

---

### 1.4 Email Change OTP Verification

**Endpoint:** `PATCH /api/v1/user/email/otp/verify`

**Priority:** HIGH  
**Dependency:** 1.3 Email Change OTP Request

#### Implementation Location:

- File: `app/(profile-and-settings)/verify-email.tsx`
- Redux: New action in `authSlice.ts`

#### Request Payload:

```typescript
{
  email: string; // new email
  code: string; // OTP code from email
}
```

#### Response Format:

```typescript
{
  message: string;
  success: boolean;
  email: string; // confirmed new email
}
```

#### Redux Action Required:

```typescript
export const verifyEmailChangeOtp = createAsyncThunk(
  "auth/verifyEmailChangeOtp",
  async ({ email, code }: { email: string; code: string }, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Update after Success:

- Update user email in Redux state
- Update AsyncStorage
- Show success screen
- Redirect to profile settings

---

### 1.5 Password Update

**Endpoint:** `PATCH /api/v1/user/password/update`

**Priority:** HIGH  
**Dependency:** User must be authenticated

#### Implementation Location:

- File: `app/(profile-and-settings)/change-pin.tsx` or new `change-password.tsx`
- Redux: New action in `authSlice.ts`

#### Request Payload:

```typescript
{
  password: string; // new password
  repeatPassword: string; // confirmation
}
```

#### Response Format:

```typescript
{
  message: string;
  success: boolean;
}
```

#### Validation Required:

- Password length minimum 8 characters
- Password and confirm password match
- Current password verification (if required by backend)

#### Redux Action Required:

```typescript
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (
    { password, repeatPassword }: { password: string; repeatPassword: string },
    thunkAPI: any,
  ) => {
    // Implementation
  },
);
```

---

### 1.6 PIN Change OTP Request

**Endpoint:** `GET /api/v1/user/mobile/pin/otp/request`

**Priority:** MEDIUM  
**Dependency:** User must be authenticated

#### Implementation Location:

- File: `app/(profile-and-settings)/create-new-pin.tsx`
- Redux: New action in `authSlice.ts`

#### Query Parameters:

```typescript
email: string (required) - user's current email
```

#### Response Format:

```typescript
{
  message: string;
  otpSent: boolean;
}
```

#### Flow:

1. User selects "Change PIN"
2. Request OTP (sent to their email)
3. Show OTP verification screen
4. Verify OTP + provide new PIN

---

### 1.7 PIN Change OTP Verification

**Endpoint:** `PATCH /api/v1/user/mobile/pin/otp/verify`

**Priority:** MEDIUM  
**Dependency:** 1.6 PIN Change OTP Request

#### Implementation Location:

- File: `app/(profile-and-settings)/create-new-pin.tsx`
- Redux: New action in `authSlice.ts`

#### Request Payload:

```typescript
{
  pin: number; // new PIN (4 digits)
  code: string; // OTP code from email
}
```

#### Response Format:

```typescript
{
  message: string;
  success: boolean;
}
```

#### Redux Action Required:

```typescript
export const verifyPinChangeOtp = createAsyncThunk(
  "auth/verifyPinChangeOtp",
  async ({ pin, code }: { pin: number; code: string }, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Validation Required:

- PIN must be 4 digits
- PIN should not match old PIN (if available)

---

### 1.8 Account Deletion

**Endpoint:** `DELETE /api/v1/user/delete`

**Priority:** LOW  
**Dependency:** User must be authenticated

#### Implementation Location:

- File: `app/(profile-and-settings)/security.tsx` or new settings screen
- Redux: New action in `authSlice.ts`

#### Request Payload:

None (user ID from authentication token)

#### Response Format:

```typescript
{
  message: string;
  success: boolean;
}
```

#### Redux Action Required:

```typescript
export const deleteUserAccount = createAsyncThunk(
  "auth/deleteUserAccount",
  async (_, thunkAPI: any) => {
    // Implementation
  },
);
```

#### After Success:

- Clear all user data
- Clear AsyncStorage
- Clear Redux state
- Logout and redirect to login screen

#### Safety Measures:

- Show confirmation dialog
- Require password/PIN re-entry
- Show warning about data loss
- Add undo grace period (if backend supports)

---

## Phase 2: Transaction Processing

### 2.1 Initialize Payment

**Endpoint:** `POST /api/v1/transaction/initialize`

**Priority:** HIGH  
**Dependency:** User authenticated + bank account selected

#### Implementation Location:

- File: `app/(action)/review-transaction.tsx`
- Redux: New action in `transactionSlice.ts` (create new file)

#### Request Payload:

```typescript
{
  amount: number; // Amount to send
  currency: string; // NGN, USD, etc.
  email: string; // Recipient email (optional)
  memo: string; // Transaction description (optional)
  reference: string; // Unique reference ID
  redirectUrl: string; // URL to redirect after payment
  theme: "light" | "dark"; // UI theme
}
```

#### Response Format:

```typescript
{
  data: {
    id: string;
    reference: string;
    status: string;
    authorizationUrl?: string;
  };
  message: string;
}
```

#### Redux Action Required:

```typescript
export const initializePayment = createAsyncThunk(
  "transaction/initializePayment",
  async (payload: PaymentInitPayload, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Validation:

- Amount > 0
- Currency valid
- Reference unique
- At least recipient email OR bank account

---

### 2.2 Process Payment

**Endpoint:** `POST /api/v1/transaction/process`

**Priority:** HIGH  
**Dependency:** 2.1 Initialize Payment

#### Implementation Location:

- File: `app/(action)/review-transaction.tsx`
- Redux: New action in `transactionSlice.ts`

#### Request Payload:

```typescript
{
  asset: string; // USDC, USDT, etc.
  network: string; // solana, arbitrum, etc.
  reference: string; // From initialization
}
```

#### Response Format:

```typescript
{
  data: {
    id: string;
    txRef: string;
    status: "completed" | "pending" | "failed";
    receipt?: string;
  };
  message: string;
}
```

#### Redux Action Required:

```typescript
export const processPayment = createAsyncThunk(
  "transaction/processPayment",
  async (
    { asset, network, reference }: ProcessPaymentPayload,
    thunkAPI: any,
  ) => {
    // Implementation
  },
);
```

#### Flow:

1. User initiates payment (initialize)
2. Shows transaction details
3. User confirms
4. Process the payment
5. Show success/failure screen

---

### 2.3 Fund Individual Wallet

**Endpoint:** `POST /api/v1/transaction/individual/fund`

**Priority:** HIGH  
**Dependency:** User authenticated

#### Implementation Location:

- File: `app/(action)/receive.tsx`
- Redux: New action in `transactionSlice.ts`

#### Request Payload:

```typescript
{
  network: string; // solana, arbitrum, etc. (required)
}
```

#### Response Format:

```typescript
{
  data: {
    walletAddress: string;
    network: string;
    amount?: number;
    fee?: number;
  };
  message: string;
}
```

#### Redux Action Required:

```typescript
export const fundWallet = createAsyncThunk(
  "transaction/fundWallet",
  async (network: string, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Usage:

- Generate receive address for user
- Show QR code or copy-able address
- Display deposit instructions

---

### 2.4 Withdraw from Individual Wallet

**Endpoint:** `POST /api/v1/transaction/individual/withdrawal`

**Priority:** HIGH  
**Dependency:** User authenticated + balance available

#### Implementation Location:

- File: `app/(action)/send.tsx`
- Redux: New action in `transactionSlice.ts`

#### Request Payload:

```typescript
{
  amount: number; // Amount to withdraw
  asset: string; // USDC, USDT, etc.
  network: string; // solana, arbitrum, etc.
  payoutAddress: string; // Destination wallet address
  favorite: boolean; // Save as favorite
}
```

#### Response Format:

```typescript
{
  data: {
    id: string;
    txRef: string;
    status: "initiated" | "processing";
  }
  message: string;
}
```

#### Redux Action Required:

```typescript
export const withdrawWallet = createAsyncThunk(
  "transaction/withdrawWallet",
  async (payload: WithdrawalPayload, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Validation:

- Amount > 0
- Amount <= available balance
- Valid wallet address for network
- Valid asset for network

---

### 2.5 Internal Transfer

**Endpoint:** `POST /api/v1/transaction/internal/transfer`

**Priority:** HIGH  
**Dependency:** User authenticated + recipient has Flipeet account

#### Implementation Location:

- File: `app/(action)/send.tsx` (when recipient type = email)
- Redux: New action in `transactionSlice.ts`

#### Request Payload:

```typescript
{
  email: string; // Recipient email
  amount: number; // Amount to transfer
  asset: string; // USDC, USDT, etc.
  network: string; // solana, arbitrum, etc.
  favorite: boolean; // Save recipient as favorite
}
```

#### Response Format:

```typescript
{
  data: {
    id: string;
    txRef: string;
    status: "completed" | "pending";
    recipient: string;
  }
  message: string;
}
```

#### Redux Action Required:

```typescript
export const internalTransfer = createAsyncThunk(
  "transaction/internalTransfer",
  async (payload: InternalTransferPayload, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Validation:

- Recipient email exists
- Recipient email != user email
- Amount > 0
- Amount <= available balance

---

### 2.6 Bridge/Swap Quota

**Endpoint:** `POST /api/v1/transaction/bridge/quota`

**Priority:** HIGH  
**Dependency:** None (but called before 2.7)

#### Implementation Location:

- File: `app/(action)/review-bridge.tsx`
- Redux: New action in `transactionSlice.ts`

#### Request Payload:

```typescript
{
  amount: number; // Amount to swap
  fromAsset: string; // USDC, USDT
  toAsset: string; // USDC, USDT
  fromNetwork: string; // solana, arbitrum, etc.
  toNetwork: string; // solana, arbitrum, etc.
}
```

#### Response Format:

```typescript
{
  data: {
    fromAmount: number;
    toAmount: number;
    rate: number;
    fee: number;
    minAmount: number;
    maxAmount: number;
  }
  message: string;
}
```

#### Redux Action Required:

```typescript
export const getBridgeQuota = createAsyncThunk(
  "transaction/getBridgeQuota",
  async (payload: BridgeQuotaPayload, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Usage:

- Show user how much they'll receive after bridge
- Display fees and rate
- Verify amount is within limits

---

### 2.7 Execute Bridge/Swap

**Endpoint:** `POST /api/v1/transaction/bridge/execute`

**Priority:** HIGH  
**Dependency:** 2.6 Bridge/Swap Quota

#### Implementation Location:

- File: `app/(action)/review-bridge.tsx`
- Redux: New action in `transactionSlice.ts`

#### Request Payload:

```typescript
{
  amount: number; // Amount to swap
  fromAsset: string; // USDC, USDT
  toAsset: string; // USDC, USDT
  fromNetwork: string; // solana, arbitrum, etc.
  toNetwork: string; // solana, arbitrum, etc.
}
```

#### Response Format:

```typescript
{
  data: {
    id: string;
    txRef: string;
    status: "initiated" | "processing" | "completed";
    toAmount: number;
  }
  message: string;
}
```

#### Redux Action Required:

```typescript
export const executeBridge = createAsyncThunk(
  "transaction/executeBridge",
  async (payload: BridgeExecutePayload, thunkAPI: any) => {
    // Implementation
  },
);
```

#### Flow:

1. Get quota (2.6)
2. Show preview with fees
3. User confirms
4. Execute bridge
5. Show success with tx details

---

## Phase 3: Advanced Ramp Features

### 3.1 Off-Ramp Quota

**Endpoint:** `POST /api/v1/ramp/off/quota`

**Priority:** MEDIUM  
**Dependency:** None

#### Implementation Location:

- File: `app/(action)/sell.tsx` (new component)
- Redux: New action in `rampSlice.ts` (create new file)

#### Request Payload:

```typescript
{
  amount: number; // Amount in crypto
  asset: string; // USDC, USDT
  currency: string; // NGN, USD, etc.
  network: string; // solana, arbitrum, etc.
  provider: string; // bread, paycrest, etc.
}
```

#### Response Format:

```typescript
{
  data: {
    amount: number;
    rate: number;
    localCurrencyAmount: number;
    fee: number;
    minAmount: number;
    maxAmount: number;
  }
  message: string;
}
```

#### Redux Action Required:

```typescript
export const getOffRampQuota = createAsyncThunk(
  "ramp/getOffRampQuota",
  async (payload: OffRampQuotaPayload, thunkAPI: any) => {
    // Implementation
  },
);
```

---

### 3.2 Off-Ramp Initialize

**Endpoint:** `POST /api/v1/ramp/off/initialize`

**Priority:** MEDIUM  
**Dependency:** 3.1 Off-Ramp Quota + 1.1 Bank Account must exist

#### Implementation Location:

- File: `app/(action)/sell.tsx`
- Redux: New action in `rampSlice.ts`

#### Request Payload:

```typescript
{
  localBankId: string; // ID of saved bank account
  amount: number; // Amount in crypto
  asset: string; // USDC, USDT
  rate: number; // Rate from quota
  network: string; // solana, arbitrum, etc.
  provider: string; // bread, paycrest, etc.
}
```

#### Response Format:

```typescript
{
  data: {
    id: string;
    txRef: string;
    status: "initiated";
  }
  message: string;
}
```

#### Redux Action Required:

```typescript
export const initializeOffRamp = createAsyncThunk(
  "ramp/initializeOffRamp",
  async (payload: OffRampInitPayload, thunkAPI: any) => {
    // Implementation
  },
);
```

---

### 3.3 Send Order Initialize

**Endpoint:** `POST /api/v1/ramp/send/initialize`

**Priority:** MEDIUM  
**Dependency:** Bank account + exchange rate

#### Implementation Location:

- File: `app/(action)/send.tsx` (when type = bank)
- Redux: New action in `rampSlice.ts`

#### Request Payload:

```typescript
{
  accountNumber: string; // Bank account number
  accountName: string; // Account holder name
  bankCode: string; // Bank code
  bankName: string; // Bank name
  amount: number; // Amount to send
  asset: string; // USDC, USDT
  rate: number; // Exchange rate
  network: string; // solana, arbitrum, etc.
  currency: string; // NGN, USD, etc.
  favorite: boolean; // Save bank as favorite
  provider: string; // bread, paycrest, etc.
}
```

#### Response Format:

```typescript
{
  data: {
    id: string;
    txRef: string;
    status: "initiated" | "processing";
  }
  message: string;
}
```

#### Redux Action Required:

```typescript
export const initializeSendOrder = createAsyncThunk(
  "ramp/initializeSendOrder",
  async (payload: SendOrderPayload, thunkAPI: any) => {
    // Implementation
  },
);
```

---

### 3.4 Local Wallets

**Endpoint:** `GET /api/v1/ramp/local/wallets`

**Priority:** LOW  
**Dependency:** None

#### Implementation Location:

- File: `app/(action)/token-selector.tsx` or wallet management
- Redux: New action in `rampSlice.ts`

#### Query Parameters:

```typescript
provider: string (required)  // bread, paycrest, etc.
page: number (optional)      // Page number
limit: number (optional)     // Items per page
walletId?: string            // Filter by specific wallet
```

#### Response Format:

```typescript
{
  data: [
    {
      id: string;
      walletAddress: string;
      network: string;
      balance: number;
      currency: string;
    }
  ];
  message: string;
}
```

#### Redux Action Required:

```typescript
export const fetchLocalWallets = createAsyncThunk(
  "ramp/fetchLocalWallets",
  async ({ provider, page, limit }: FetchWalletsPayload, thunkAPI: any) => {
    // Implementation
  },
);
```

---

### 3.5 Transaction Receipt

**Endpoint:** `GET /api/v1/transaction/{txRef}/receipt`

**Priority:** MEDIUM  
**Dependency:** Transaction completed

#### Implementation Location:

- File: `app/(action)/success-screen.tsx` or activities details
- Direct fetch (not Redux action needed)

#### URL Parameters:

```typescript
txRef: string(required); // Transaction reference
```

#### Response Format:

```
Binary PDF file or JSON with receipt data
```

#### Implementation:

```typescript
const downloadReceipt = async (txRef: string) => {
  const response = await fetch(
    `https://api.pay.flipeet.io/api/v1/transaction/${txRef}/receipt`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  // Handle download or display
};
```

---

## Implementation Guidelines

### General Rules

1. **Always use Redux thunks** for async API calls
2. **Always include error handling** with user-friendly messages
3. **Always show loading states** (spinners, disabled buttons)
4. **Always validate inputs** before sending to API
5. **Always clear sensitive data** after logout
6. **Always use AsyncStorage** for persistence where appropriate
7. **Always add console logs** for debugging

### Error Handling Pattern

```typescript
// Standard error handling pattern
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json();
    return thunkAPI.rejectWithValue(
      errorData.message || `Error ${response.status}`,
    );
  }

  const data = await response.json();
  return data;
} catch (err: any) {
  console.error("[ActionName] Error:", err);
  return thunkAPI.rejectWithValue(err.message || "Unknown error occurred");
}
```

### Redux Action Pattern

```typescript
export const actionName = createAsyncThunk(
  "slice/actionName",
  async (payload: PayloadType, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("Not authenticated");
      }

      const response = await fetch(url, {
        method: "POST/GET/DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(error.message);
      }

      return await response.json();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  },
);
```

### Redux Slice Pattern

```typescript
const slice = createSlice({
  name: "sliceName",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actionName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actionName.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(actionName.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
```

---

## File Structure

### New Redux Files to Create

```
app/store/
├── bankAccountSlice.ts (existing)
├── authSlice.ts (existing)
├── transactionSlice.ts (NEW)
└── rampSlice.ts (NEW)
```

### New Context Files to Create

```
app/contexts/
├── TransactionContext.tsx (NEW)
└── RampContext.tsx (NEW)
```

### UI Components to Create/Update

```
app/(auth)/
├── pin.tsx (UPDATE)

app/(profile-and-settings)/
├── change-email.tsx (UPDATE)
├── change-pin.tsx (UPDATE)
├── verify-email.tsx (UPDATE)
├── success-email.tsx (UPDATE)
├── success-pin.tsx (UPDATE)

app/(action)/
├── send.tsx (UPDATE)
├── sell.tsx (CREATE NEW)
├── review-transaction.tsx (UPDATE)
├── review-bridge.tsx (UPDATE)
├── success-screen.tsx (UPDATE)
```

---

## Testing Checklist

### Phase 1 Testing

- [ ] PIN Sign-In works with valid PIN
- [ ] PIN Sign-In fails with invalid PIN
- [ ] PIN Sign-In shows proper error messages
- [ ] Email change OTP is sent
- [ ] Email change OTP can be verified
- [ ] New email is updated in user profile
- [ ] Password can be changed
- [ ] Password change requires current password verification
- [ ] PIN can be changed
- [ ] Account deletion shows confirmation
- [ ] Account deletion clears all data

### Phase 2 Testing

- [ ] Payment initialization creates transaction ID
- [ ] Payment processing completes successfully
- [ ] Wallet funding generates deposit address
- [ ] Wallet withdrawal sends correct amount
- [ ] Internal transfer to valid email works
- [ ] Internal transfer to invalid email fails gracefully
- [ ] Bridge quota shows accurate rates
- [ ] Bridge execution swaps tokens correctly
- [ ] All transactions show in history

### Phase 3 Testing

- [ ] Off-ramp quote shows correct conversion
- [ ] Off-ramp initialization to bank works
- [ ] Send order to bank account works
- [ ] Wallet list fetches correctly
- [ ] Receipt download works for completed transactions

---

## Priority Implementation Order

**Week 1:**

1. PIN Sign-In (1.1)
2. PIN Availability Check (1.2)
3. Email Change (1.3 + 1.4)

**Week 2:** 4. Password Update (1.5) 5. PIN Change (1.6 + 1.7) 6. Account Deletion (1.8)

**Week 3:** 7. Initialize Payment (2.1) 8. Process Payment (2.2) 9. Fund Wallet (2.3)

**Week 4:** 10. Withdraw Wallet (2.4) 11. Internal Transfer (2.5) 12. Bridge Quota (2.6)

**Week 5:** 13. Execute Bridge (2.7) 14. Off-Ramp Quota (3.1) 15. Off-Ramp Initialize (3.2)

**Week 6:** 16. Send Order (3.3) 17. Local Wallets (3.4) 18. Transaction Receipt (3.5)

---

## Acceptance Criteria

All endpoints must meet these criteria before marking complete:

✓ Redux action created and tested  
✓ Error handling implemented  
✓ Loading states implemented  
✓ UI updated with proper UX  
✓ Data persisted to AsyncStorage if needed  
✓ User-friendly error messages  
✓ Console logs for debugging  
✓ Type safety (TypeScript)  
✓ Manual testing completed  
✓ Edge cases handled

---

## Notes

- Always test with real backend before marking complete
- Keep error messages user-friendly
- Avoid exposing technical error details to users
- Test on both iOS and Android simulators
- Verify offline handling (if applicable)
- Test with slow network conditions
- Document any backend inconsistencies

---

**Last Review Date:** January 29, 2026  
**Next Review:** After Phase 1 completion
