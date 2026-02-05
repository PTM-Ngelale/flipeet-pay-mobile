# Phase 2 Implementation Guide - Transaction Processing

**Status:** Ready for Implementation  
**Created:** January 29, 2026  
**Redux Slice:** ✅ Created (`app/store/transactionSlice.ts`)  
**Store Integration:** ✅ Added to `app/store/index.ts`

---

## Overview

All 7 Phase 2 transaction APIs have been implemented in Redux. This guide shows how to integrate them into your UI components.

### Available Actions:

1. `initializePayment` - Initialize payment transaction
2. `processPayment` - Process the payment
3. `fundWallet` - Generate deposit address
4. `withdrawWallet` - Withdraw from wallet
5. `internalTransfer` - Send to another user's email
6. `getBridgeQuota` - Get bridge/swap rates
7. `executeBridge` - Execute bridge/swap transaction

---

## Component Integration Examples

### Example 1: Review Transaction (Payment Initialize + Process)

**File:** `app/(action)/review-transaction.tsx`

```typescript
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  initializePayment,
  processPayment,
  clearPaymentInit,
  clearProcessedPayment
} from "../store/transactionSlice";

export default function ReviewTransactionScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, paymentInit, processedPayment } = useSelector(
    (state: RootState) => state.transaction
  );
  const { token } = useSelector((state: RootState) => state.auth);

  const handleInitializePayment = async () => {
    if (!token) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    try {
      const payload = {
        amount: parseFloat(payAmount),
        currency: receiveCurrency,
        email: recipientEmail,
        memo: `Payment for ${recipientName}`,
        reference: `FLIP-${Date.now()}`, // Unique reference
        redirectUrl: "flipeetpay://success",
        theme: "dark",
      };

      const result = await dispatch(initializePayment(payload)).unwrap();
      console.log("Payment initialized:", result);

      // Now process the payment
      handleProcessPayment(result.reference);
    } catch (err: any) {
      Alert.alert("Error", err || "Failed to initialize payment");
    }
  };

  const handleProcessPayment = async (reference: string) => {
    try {
      const payload = {
        asset: selectedToken.symbol,
        network: selectedToken.network.toLowerCase(),
        reference: reference,
      };

      const result = await dispatch(processPayment(payload)).unwrap();
      console.log("Payment processed:", result);

      // Navigate to success screen
      router.replace({
        pathname: "/(action)/success-screen",
        params: {
          transactionId: result.id || result.txRef,
          amount: payAmount,
          currency: selectedToken.symbol,
          type: "payment",
        },
      });
    } catch (err: any) {
      Alert.alert("Error", err || "Failed to process payment");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Transaction Details */}
      <View style={styles.details}>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.amount}>{payAmount} {selectedToken.symbol}</Text>

        <Text style={styles.label}>Recipient</Text>
        <Text style={styles.recipient}>{recipientEmail}</Text>

        <Text style={styles.label}>Network Fee</Text>
        <Text style={styles.fee}>~${networkFee}</Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleInitializePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm & Pay</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
```

---

### Example 2: Receive (Fund Wallet)

**File:** `app/(action)/receive.tsx`

```typescript
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fundWallet } from "../store/transactionSlice";
import QRCode from "react-qr-code"; // You may need to install this

export default function ReceiveScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, fundWalletResponse } = useSelector(
    (state: RootState) => state.transaction
  );
  const [selectedNetwork, setSelectedNetwork] = useState("solana");

  useEffect(() => {
    handleFundWallet();
  }, [selectedNetwork]);

  const handleFundWallet = async () => {
    try {
      const result = await dispatch(
        fundWallet({ network: selectedNetwork })
      ).unwrap();
      console.log("Wallet funded:", result);
    } catch (err: any) {
      console.error("Error funding wallet:", err);
    }
  };

  const copyToClipboard = () => {
    if (fundWalletResponse?.walletAddress) {
      Clipboard.setString(fundWalletResponse.walletAddress);
      Alert.alert("Copied", "Wallet address copied to clipboard");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Receive Funds</Text>

      {/* Network Selector */}
      <View style={styles.networkSelector}>
        {["solana", "arbitrum", "polygon"].map((network) => (
          <TouchableOpacity
            key={network}
            style={[
              styles.networkButton,
              selectedNetwork === network && styles.networkButtonActive,
            ]}
            onPress={() => setSelectedNetwork(network)}
          >
            <Text style={styles.networkButtonText}>{network}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* QR Code */}
      {fundWalletResponse?.walletAddress && !loading && (
        <View style={styles.qrContainer}>
          <QRCode
            value={fundWalletResponse.walletAddress}
            size={200}
          />
        </View>
      )}

      {/* Wallet Address */}
      {fundWalletResponse?.walletAddress && (
        <View style={styles.addressContainer}>
          <Text style={styles.label}>Wallet Address</Text>
          <Text style={styles.address}>{fundWalletResponse.walletAddress}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyToClipboard}
          >
            <Text style={styles.copyButtonText}>Copy Address</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
```

---

### Example 3: Send (Internal Transfer)

**File:** `app/(action)/send.tsx`

```typescript
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  internalTransfer,
  withdrawWallet
} from "../store/transactionSlice";

export default function SendScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    transferLoading,
    withdrawalLoading,
    error,
    transfer,
    withdrawal
  } = useSelector((state: RootState) => state.transaction);

  const [recipientType, setRecipientType] = useState<"email" | "wallet">("email");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleEmailTransfer = async () => {
    if (!recipient || !amount) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const result = await dispatch(internalTransfer({
        email: recipient,
        amount: parseFloat(amount),
        asset: selectedToken.symbol,
        network: selectedToken.network.toLowerCase(),
        favorite: false,
      })).unwrap();

      console.log("Transfer successful:", result);
      Alert.alert("Success", `Sent ${amount} ${selectedToken.symbol} to ${recipient}`);

      // Navigate to success screen
      router.replace({
        pathname: "/(action)/success-screen",
        params: {
          transactionId: result.id,
          amount,
          currency: selectedToken.symbol,
          type: "transfer",
          recipient,
        },
      });
    } catch (err: any) {
      Alert.alert("Error", err || "Failed to transfer funds");
    }
  };

  const handleWalletWithdrawal = async () => {
    if (!recipient || !amount) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const result = await dispatch(withdrawWallet({
        amount: parseFloat(amount),
        asset: selectedToken.symbol,
        network: selectedToken.network.toLowerCase(),
        payoutAddress: recipient,
        favorite: false,
      })).unwrap();

      console.log("Withdrawal successful:", result);
      Alert.alert("Success", `Withdrawal initiated for ${amount} ${selectedToken.symbol}`);

      router.replace({
        pathname: "/(action)/success-screen",
        params: {
          transactionId: result.id,
          amount,
          currency: selectedToken.symbol,
          type: "withdrawal",
        },
      });
    } catch (err: any) {
      Alert.alert("Error", err || "Failed to withdraw");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Recipient Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            recipientType === "email" && styles.typeButtonActive,
          ]}
          onPress={() => setRecipientType("email")}
        >
          <Text>Send to Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            recipientType === "wallet" && styles.typeButtonActive,
          ]}
          onPress={() => setRecipientType("wallet")}
        >
          <Text>Withdraw to Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Recipient Input */}
      <TextInput
        style={styles.input}
        placeholder={
          recipientType === "email"
            ? "Recipient email"
            : "Wallet address"
        }
        value={recipient}
        onChangeText={setRecipient}
      />

      {/* Amount Input */}
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Send Button */}
      <TouchableOpacity
        style={[
          styles.button,
          (transferLoading || withdrawalLoading) && styles.buttonDisabled,
        ]}
        onPress={
          recipientType === "email"
            ? handleEmailTransfer
            : handleWalletWithdrawal
        }
        disabled={transferLoading || withdrawalLoading}
      >
        {transferLoading || withdrawalLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {recipientType === "email" ? "Send" : "Withdraw"}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
```

---

### Example 4: Bridge/Swap

**File:** `app/(action)/review-bridge.tsx`

```typescript
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  getBridgeQuota,
  executeBridge,
  clearBridgeQuota
} from "../store/transactionSlice";

export default function ReviewBridgeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    bridgeQuotaLoading,
    bridgeLoading,
    error,
    bridgeQuota,
    bridgeExecution
  } = useSelector((state: RootState) => state.transaction);

  const [amount, setAmount] = useState("");
  const [showQuota, setShowQuota] = useState(false);

  const handleGetQuota = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const result = await dispatch(getBridgeQuota({
        amount: parseFloat(amount),
        fromAsset: fromToken.symbol,
        toAsset: toToken.symbol,
        fromNetwork: fromToken.network.toLowerCase(),
        toNetwork: toToken.network.toLowerCase(),
      })).unwrap();

      console.log("Bridge quota:", result);
      setShowQuota(true);
    } catch (err: any) {
      Alert.alert("Error", err || "Failed to get bridge quote");
    }
  };

  const handleExecuteBridge = async () => {
    try {
      const result = await dispatch(executeBridge({
        amount: parseFloat(amount),
        fromAsset: fromToken.symbol,
        toAsset: toToken.symbol,
        fromNetwork: fromToken.network.toLowerCase(),
        toNetwork: toToken.network.toLowerCase(),
      })).unwrap();

      console.log("Bridge executed:", result);

      router.replace({
        pathname: "/(action)/success-screen",
        params: {
          transactionId: result.id,
          amount: result.toAmount,
          currency: toToken.symbol,
          type: "bridge",
        },
      });
    } catch (err: any) {
      Alert.alert("Error", err || "Failed to execute bridge");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Amount Input */}
      <TextInput
        style={styles.input}
        placeholder="Amount to send"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      {/* Network Info */}
      <View style={styles.networkInfo}>
        <Text style={styles.label}>From</Text>
        <Text>{fromToken.symbol} on {fromToken.network}</Text>

        <Text style={styles.label}>To</Text>
        <Text>{toToken.symbol} on {toToken.network}</Text>
      </View>

      {/* Get Quote Button */}
      {!showQuota && (
        <TouchableOpacity
          style={[styles.button, bridgeQuotaLoading && styles.buttonDisabled]}
          onPress={handleGetQuota}
          disabled={bridgeQuotaLoading}
        >
          {bridgeQuotaLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Quote</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Quote Details */}
      {showQuota && bridgeQuota && (
        <View style={styles.quoteBox}>
          <View style={styles.quoteLine}>
            <Text>You send</Text>
            <Text>{bridgeQuota.fromAmount} {fromToken.symbol}</Text>
          </View>

          <View style={styles.quoteLine}>
            <Text>You receive</Text>
            <Text style={styles.receiveAmount}>
              {bridgeQuota.toAmount} {toToken.symbol}
            </Text>
          </View>

          <View style={styles.quoteLine}>
            <Text>Rate</Text>
            <Text>1 {fromToken.symbol} = {bridgeQuota.rate} {toToken.symbol}</Text>
          </View>

          <View style={styles.quoteLine}>
            <Text>Fee</Text>
            <Text>${bridgeQuota.fee}</Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.button, bridgeLoading && styles.buttonDisabled]}
            onPress={handleExecuteBridge}
            disabled={bridgeLoading}
          >
            {bridgeLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirm Bridge</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
```

---

## Available Redux Hooks

```typescript
// In any component:
const dispatch = useDispatch<AppDispatch>();
const {
  loading,
  error,
  paymentInit,
  processedPayment,
  fundWalletResponse,
  withdrawal,
  withdrawalLoading,
  transfer,
  transferLoading,
  bridgeQuota,
  bridgeQuotaLoading,
  bridgeExecution,
  bridgeLoading,
} = useSelector((state: RootState) => state.transaction);

// Clear specific data when needed:
dispatch(clearPaymentInit());
dispatch(clearProcessedPayment());
dispatch(clearBridgeQuota());
dispatch(clearError());
```

---

## Integration Checklist

### Setup (✅ Completed)

- [x] Create `transactionSlice.ts` with all 7 thunks
- [x] Add transaction reducer to Redux store
- [x] Export all actions and types

### UI Components to Update

- [ ] `app/(action)/review-transaction.tsx` - Add Payment Initialize + Process
- [ ] `app/(action)/receive.tsx` - Add Fund Wallet
- [ ] `app/(action)/send.tsx` - Add Internal Transfer + Withdraw Wallet
- [ ] `app/(action)/review-bridge.tsx` - Add Get Bridge Quota + Execute Bridge
- [ ] `app/(action)/success-screen.tsx` - Update to show transaction details

### Validation Required

- [ ] Amount validation (> 0)
- [ ] Email validation for transfers
- [ ] Wallet address validation for withdrawals
- [ ] Network selection validation
- [ ] Asset pair validation for bridge

### Error Handling

- [ ] Network error handling
- [ ] Insufficient balance error
- [ ] Invalid recipient error
- [ ] Rate limit error
- [ ] Transaction timeout error

### User Experience

- [ ] Loading spinners during API calls
- [ ] Disable buttons while loading
- [ ] Success notifications
- [ ] Error alerts with retry option
- [ ] Clear error messages

---

## Testing Guide

### Local Testing

1. Test with valid amounts
2. Test with invalid amounts (0, negative)
3. Test with empty recipients
4. Test network switching
5. Test error states

### Backend Testing Endpoints

- Use Postman or curl to test endpoints first
- Verify response formats match expected structure
- Test with real auth tokens
- Check error responses

### Edge Cases to Test

- [ ] Very large amounts
- [ ] Very small amounts
- [ ] Rapid successive requests
- [ ] Network timeout scenarios
- [ ] Invalid recipient emails
- [ ] Invalid wallet addresses
- [ ] Insufficient balance
- [ ] Rate limits exceeded

---

## Next Steps

1. **Week 1:** Integrate into Review Transaction & Receive screens
2. **Week 2:** Integrate into Send screen
3. **Week 3:** Integrate into Bridge screen & Success screen
4. **Week 4:** Full testing & bug fixes

All Redux infrastructure is ready. You can now focus 100% on UI implementation!
