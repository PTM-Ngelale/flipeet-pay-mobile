import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  initializePayment,
  internalTransfer,
  withdrawWallet,
} from "../store/transactionSlice";

export default function ReviewTransactionScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const [processing, setProcessing] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const transactionError = useSelector(
    (state: RootState) => state.transaction.error,
  );

  const {
    payAmount,
    receiveAmount,
    payCurrency = "USDC",
    receiveCurrency = "NGN",
    network = "Solana",
    exchangeRate = "1.5802",
    walletAddress,
    recipient,
    recipientType, // 'wallet', 'email', or 'bank'
    bankName,
    accountNumber,
    localBankId,
  } = params;

  // Calculate transaction fee (can be dynamic from API later)
  const transactionFee = "0.50";
  const formatAccountNumber = (value?: string) => {
    const trimmed = (value || "").replace(/\s+/g, "");
    if (!trimmed) {
      return "";
    }
    if (trimmed.length <= 6) {
      return trimmed.length <= 4
        ? trimmed
        : `${trimmed.slice(0, 2)}...${trimmed.slice(-2)}`;
    }
    return `${trimmed.slice(0, 3)}...${trimmed.slice(-3)}`;
  };

  const totalValueAmount = (() => {
    const parsedReceive = parseFloat(receiveAmount as string);
    if (!Number.isNaN(parsedReceive)) {
      return parsedReceive.toFixed(2);
    }
    const parsedPay = parseFloat(payAmount as string);
    if (!Number.isNaN(parsedPay)) {
      return parsedPay.toFixed(2);
    }
    return "0.00";
  })();

  const recipientDisplay = (() => {
    if (recipientType === "bank") {
      const bankLabel = bankName ? String(bankName) : "Bank";
      const accountLabel = formatAccountNumber(String(accountNumber || ""));
      return accountLabel ? `${bankLabel} -${accountLabel}` : bankLabel;
    }

    return recipient || walletAddress || "N/A";
  })();

  const handleConfirm = async () => {
    if (!token) {
      Alert.alert("Error", "Please log in to send funds");
      return;
    }

    setProcessing(true);

    try {
      // Handle buy transactions differently - use payment initialization
      if (recipientType === "buy") {
        const reference = `txn_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const initPayload = {
          amount: parseFloat(payAmount as string),
          currency: payCurrency, // Fiat currency (NGN, KES, etc.)
          email: user?.email || "",
          memo: `Buy ${receiveAmount} ${receiveCurrency}`,
          reference,
          redirectUrl: "flipeet://payment/callback", // Deep link for mobile
          theme: "dark" as const,
        };

        console.log("Initializing payment:", initPayload);

        const result = await dispatch(initializePayment(initPayload));

        if (initializePayment.fulfilled.match(result)) {
          const data = result.payload as any;
          console.log("Payment initialization response:", data);

          if (data.paymentUrl) {
            // Navigate to WebView to complete payment
            router.push({
              pathname: "/(action)/payment-webview",
              params: {
                paymentUrl: data.paymentUrl,
                reference,
                amount: receiveAmount,
                currency: receiveCurrency,
              },
            });
          } else {
            Alert.alert(
              "Payment Error",
              "Failed to get payment URL. Please try again.",
            );
          }
        } else {
          Alert.alert(
            "Payment Error",
            (result.payload as string) ||
              "Failed to initialize payment. Please try again.",
          );
        }
        setProcessing(false);
        return;
      }

      // Prepare transaction payload based on recipient type
      let result: any;

      const normalizeNetwork = (value: string) => {
        const normalized = (value || "").toLowerCase().replace(/\s+/g, "-");
        if (
          normalized === "bnb-chain" ||
          normalized === "bnb-smart-chain" ||
          normalized === "bnb" ||
          normalized === "bsc"
        ) {
          return "bnb-smart-chain";
        }
        return normalized;
      };

      const normalizedNetwork = normalizeNetwork(network as string);

      if (recipientType === "wallet" && walletAddress) {
        const payload = {
          amount: parseFloat(payAmount as string),
          asset: (payCurrency as string).toLowerCase(), // API expects lowercase: "usdc", "usdt"
          network: normalizedNetwork,
          payoutAddress: walletAddress,
          favorite: false,
        };

        console.log("Sending withdrawal transaction:", payload);
        result = await dispatch(withdrawWallet(payload));

        if (!withdrawWallet.fulfilled.match(result)) {
          throw new Error(
            (result.payload as string) || "Failed to process withdrawal",
          );
        }
      } else if (recipientType === "email" && recipient) {
        const payload = {
          email: recipient,
          amount: parseFloat(payAmount as string),
          asset: (payCurrency as string).toLowerCase(), // API expects lowercase: "usdc", "usdt"
          network: normalizedNetwork,
          favorite: false,
        };

        console.log("Sending internal transfer transaction:", payload);
        result = await dispatch(internalTransfer(payload));

        if (!internalTransfer.fulfilled.match(result)) {
          throw new Error(
            (result.payload as string) || "Failed to process transfer",
          );
        }
      } else if (recipientType === "bank") {
        const payload = {
          localBankId: String(localBankId),
          amount: parseFloat(payAmount as string),
          asset: (payCurrency as string).toLowerCase(),
          rate: parseFloat(exchangeRate as string),
          network: normalizedNetwork,
          currency: String(receiveCurrency),
          country: "NG",
          provider: "switch",
        };

        console.log("Sending off-ramp transaction:", payload);

        const response = await fetch(
          "https://api.pay.flipeet.io/api/v1/ramp/off/initialize",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );

        const data = await response.json();
        console.log("Bank transaction response:", {
          status: response.status,
          ok: response.ok,
          data,
        });

        if (!response.ok) {
          const errorMessage =
            data?.message ||
            data?.error ||
            response.statusText ||
            "Failed to process bank transfer";
          throw new Error(`[${response.status}] ${errorMessage}`);
        }

        result = { payload: data.data || data };
      }

      // Handle success
      const data = result?.payload || result;
      console.log("Transaction response:", data);

      router.replace({
        pathname: "/(action)/success-screen",
        params: {
          transactionId:
            data?.id || data?.transactionId || data?.txRef || "N/A",
          amount: payAmount,
          currency: payCurrency,
          network: normalizedNetwork,
        },
      });
    } catch (error: any) {
      console.error("Transaction error:", error);
      const errorMessage = error.message || "Failed to process transaction";

      if (
        errorMessage.toLowerCase().includes("daily trading limit") ||
        errorMessage.toLowerCase().includes("limit exceeded")
      ) {
        Alert.alert(
          "Daily Limit Reached",
          "You've reached your daily trading limit. Please try again tomorrow or contact support.",
        );
      } else if (
        errorMessage.toLowerCase().includes("insufficient") ||
        errorMessage.toLowerCase().includes("balance")
      ) {
        Alert.alert(
          "Insufficient Balance",
          "You don't have enough balance to complete this transaction. Please reduce the amount or fund your wallet.",
        );
      } else {
        Alert.alert("Transaction Failed", errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#E2E6F0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Transaction</Text>
          <View style={{ opacity: 0 }}>
            <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Transaction Details */}
          <View style={{ marginTop: 45 }}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>
                {payAmount} {payCurrency}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction Fee</Text>
              <Text style={styles.detailValue}>
                {transactionFee} {payCurrency}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Value</Text>
              <Text style={styles.detailValue}>
                {totalValueAmount} {receiveCurrency}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network</Text>
              <Text style={styles.detailValue}>{network}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.detailValue}>{recipientDisplay}</Text>
            </View>
          </View>

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              backgroundColor: "#3c382f",
              marginTop: 24,
              borderRadius: 5,
              paddingVertical: 12,
              paddingHorizontal: 16,
              alignItems: "flex-start",
            }}
          >
            <View style={{ marginRight: 12, marginTop: 2 }}>
              <Ionicons name="information-circle" size={16} color="#FFD369" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#FFD369",
                  fontSize: 14,
                  lineHeight: 18,
                }}
              >
                Ensure the details above are correct. Failed transaction due to
                wrong details cannot be retrieved
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              processing && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Transaction</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#757B85",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    marginTop: 5,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  amountLabel: {
    color: "#B0BACB",
    fontSize: 16,
  },
  amountValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  detailLabel: {
    color: "#B0BACB",
    fontSize: 16,
  },
  detailValue: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
