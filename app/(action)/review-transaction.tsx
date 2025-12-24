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
import { useSelector } from "react-redux";
import type { RootState } from "../store";

export default function ReviewTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [processing, setProcessing] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

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
  } = params;

  // Calculate transaction fee (can be dynamic from API later)
  const transactionFee = "0.50";
  const totalValue = (
    parseFloat(payAmount as string) + parseFloat(transactionFee)
  ).toFixed(6);

  const handleConfirm = async () => {
    if (!token) {
      Alert.alert("Error", "Please log in to send funds");
      return;
    }

    setProcessing(true);

    try {
      // Prepare transaction payload based on recipient type
      let endpoint = "";
      let payload: any = {
        amount: parseFloat(payAmount as string),
        asset: payCurrency,
        network: (network as string).toLowerCase(),
      };

      if (recipientType === "wallet" && walletAddress) {
        endpoint = "/transactions/send";
        payload.recipientAddress = walletAddress;
      } else if (recipientType === "email" && recipient) {
        endpoint = "/transactions/send-to-email";
        payload.recipientEmail = recipient;
      } else if (recipientType === "bank") {
        endpoint = "/ramp/sell";
        // For bank transfer/sell, include bank account details
        const { bankName, bankCode, accountNumber, accountName } = params;
        payload.currency = receiveCurrency; // Fiat currency
        payload.bankAccount = {
          bankName,
          bankCode,
          accountNumber,
          accountName,
        };
      }

      console.log("Sending transaction:", payload);

      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Transaction response:", data);

      if (response.ok) {
        router.replace({
          pathname: "/(action)/success-screen",
          params: {
            transactionId: data.data?.id || data.data?.transactionId || "N/A",
            amount: payAmount,
            currency: payCurrency,
          },
        });
      } else {
        Alert.alert(
          "Transaction Failed",
          data.message || "Failed to process transaction. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Transaction error:", error);
      Alert.alert(
        "Error",
        "Failed to send transaction. Please check your connection and try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Transaction</Text>
          <View style={{ opacity: 0 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
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
                {totalValue} {payCurrency}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network</Text>
              <Text style={styles.detailValue}>{network}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.detailValue}>
                {recipient || walletAddress || "N/A"}
              </Text>
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
    marginBottom: 12,
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
