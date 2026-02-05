# Phase 2 Quick Reference

## Redux Integration Status

### ✅ COMPLETED

- Transaction Redux slice created (`app/store/transactionSlice.ts`)
- All 7 thunk actions implemented
- Redux store updated
- Full TypeScript support
- Comprehensive error handling

---

## Quick API Reference

| #   | API                                     | Function              | Status   |
| --- | --------------------------------------- | --------------------- | -------- |
| 2.1 | POST /transaction/initialize            | `initializePayment()` | ✅ Ready |
| 2.2 | POST /transaction/process               | `processPayment()`    | ✅ Ready |
| 2.3 | POST /transaction/individual/fund       | `fundWallet()`        | ✅ Ready |
| 2.4 | POST /transaction/individual/withdrawal | `withdrawWallet()`    | ✅ Ready |
| 2.5 | POST /transaction/internal/transfer     | `internalTransfer()`  | ✅ Ready |
| 2.6 | POST /transaction/bridge/quota          | `getBridgeQuota()`    | ✅ Ready |
| 2.7 | POST /transaction/bridge/execute        | `executeBridge()`     | ✅ Ready |

---

## Redux State Shape

```typescript
state.transaction = {
  // General
  loading: boolean,
  error: string | null,

  // Payment flows
  paymentInit: PaymentInitResponse | null,
  processedPayment: ProcessPaymentResponse | null,

  // Wallet operations
  fundWalletResponse: FundWalletResponse | null,
  withdrawal: WithdrawalResponse | null,
  withdrawalLoading: boolean,

  // Transfers
  transfer: InternalTransferResponse | null,
  transferLoading: boolean,

  // Bridge/Swap
  bridgeQuota: BridgeQuotaResponse | null,
  bridgeQuotaLoading: boolean,
  bridgeExecution: BridgeExecuteResponse | null,
  bridgeLoading: boolean,
};
```

---

## Basic Usage Pattern

### Step 1: Import

```typescript
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { actionName } from "../store/transactionSlice";
```

### Step 2: Setup

```typescript
const dispatch = useDispatch<AppDispatch>();
const { loading, error, dataField } = useSelector(
  (state: RootState) => state.transaction,
);
```

### Step 3: Dispatch

```typescript
try {
  const result = await dispatch(actionName(payload)).unwrap();
  // Success
} catch (err: any) {
  // Error handling
}
```

---

## Common Payloads

### Payment Initialize

```typescript
{
  amount: 100,
  currency: "NGN",
  email: "user@example.com",
  memo: "Payment memo",
  reference: "FLIP-" + Date.now(),
  redirectUrl: "flipeetpay://success",
  theme: "dark"
}
```

### Fund Wallet

```typescript
{
  network: "solana"; // or arbitrum, polygon, etc.
}
```

### Withdraw Wallet

```typescript
{
  amount: 50,
  asset: "USDC",
  network: "solana",
  payoutAddress: "wallet_address_here",
  favorite: false
}
```

### Internal Transfer

```typescript
{
  email: "recipient@example.com",
  amount: 50,
  asset: "USDC",
  network: "solana",
  favorite: false
}
```

### Bridge Quota

```typescript
{
  amount: 100,
  fromAsset: "USDC",
  toAsset: "USDT",
  fromNetwork: "solana",
  toNetwork: "arbitrum"
}
```

### Execute Bridge

```typescript
{
  amount: 100,
  fromAsset: "USDC",
  toAsset: "USDT",
  fromNetwork: "solana",
  toNetwork: "arbitrum"
}
```

---

## Error Handling

All actions reject with a string message:

```typescript
catch (err: any) {
  // err is the error message string
  Alert.alert("Error", err);
}
```

Common errors:

- `"Not authenticated"` - No token in state
- `"Amount must be greater than 0"` - Invalid amount
- `"Cannot send to your own email address"` - Self transfer
- `"Payout address is required"` - Missing wallet address
- Backend error messages (from API response)

---

## Component Integration Files

### Already Updated

- [x] `app/store/index.ts` - Added transaction reducer

### Need Updates

- `app/(action)/review-transaction.tsx`
- `app/(action)/receive.tsx`
- `app/(action)/send.tsx`
- `app/(action)/review-bridge.tsx`
- `app/(action)/success-screen.tsx`

See `PHASE2_IMPLEMENTATION_GUIDE.md` for detailed examples.

---

## Data Clearing

Clear specific data when needed:

```typescript
import {
  clearPaymentInit,
  clearProcessedPayment,
  clearBridgeQuota,
  clearError,
} from "../store/transactionSlice";

dispatch(clearPaymentInit());
dispatch(clearProcessedPayment());
dispatch(clearBridgeQuota());
dispatch(clearError());
```

---

## Console Logging

All actions log to console with `[ActionName]` prefix:

- `[initializePayment]` - Payment initialization
- `[processPayment]` - Payment processing
- `[fundWallet]` - Wallet funding
- `[withdrawWallet]` - Wallet withdrawal
- `[internalTransfer]` - Internal transfer
- `[getBridgeQuota]` - Bridge quota fetch
- `[executeBridge]` - Bridge execution

Search console for these tags to debug.

---

## Ready to Implement? ✅

All backend infrastructure is complete. You can now:

1. Open `app/(action)/review-transaction.tsx`
2. Copy the example code from `PHASE2_IMPLEMENTATION_GUIDE.md`
3. Integrate the Redux actions
4. Test with real backend

**Good luck! 🚀**
