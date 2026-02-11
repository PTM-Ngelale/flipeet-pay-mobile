import USDCIcon from "@/assets/images/review-icons/usdc-icon.svg";
import USDTIcon from "@/assets/images/review-icons/usdt-icon.svg";
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
import { useBridgeToken } from "../contexts/BridgeTokenContext";
import { AppDispatch, RootState } from "../store";
import { executeBridge } from "../store/transactionSlice";

export default function ReviewBridgeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const { fromToken, toToken } = useBridgeToken();
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(false);

  const {
    payAmount,
    receiveAmount,
    payCurrency,
    receiveCurrency,
    fromNetwork,
    toNetwork,
    exchangeRate,
  } = params;

  // Calculate total value in USDT (you can modify this logic as needed)
  const totalValue = (parseFloat(payAmount as string) || 0).toFixed(2);

  const paySymbol = (payCurrency as string) || fromToken.symbol || "";
  const receiveSymbol = (receiveCurrency as string) || toToken.symbol || "";

  const iconMap: Record<string, React.ComponentType<any>> = {
    USDC: USDCIcon,
    USDT: USDTIcon,
  };

  const FromIcon = iconMap[paySymbol?.toUpperCase()] || null;
  const ToIcon = iconMap[receiveSymbol?.toUpperCase()] || null;

  const shortenNetworkName = (value?: string) => {
    const raw = (value || "").trim();
    const normalized = raw.toLowerCase().replace(/\s+/g, "-");

    if (
      normalized === "bnb-smart-chain" ||
      normalized === "bnb-chain" ||
      normalized === "binance-smart-chain" ||
      normalized === "bsc" ||
      normalized === "bnb"
    ) {
      return "BNB";
    }

    if (normalized === "solana") {
      return "Solana";
    }

    if (normalized === "base") {
      return "Base";
    }

    return raw;
  };

  const handleConfirm = async () => {
    if (!token) {
      Alert.alert("Error", "Authentication required. Please login again.");
      return;
    }

    try {
      setLoading(true);

      // Prepare bridge/swap transaction payload
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

      const recentNetwork = normalizeNetwork(
        (fromNetwork as string) || (fromToken.network as string),
      );

      const payload = {
        amount: parseFloat(payAmount as string),
        fromAsset: (fromToken.symbol as string).toLowerCase(), // API expects lowercase: "usdc", "usdt"
        toAsset: (toToken.symbol as string).toLowerCase(), // API expects lowercase: "usdc", "usdt"
        fromNetwork: normalizeNetwork(fromToken.network as string),
        toNetwork: normalizeNetwork(toToken.network as string),
      };

      console.log("Executing bridge transaction:", payload);

      const result = await dispatch(executeBridge(payload));

      console.log("Bridge transaction result:", result);

      if (executeBridge.fulfilled.match(result)) {
        const data = result.payload as any;

        router.replace({
          pathname: "/(action)/success-screen",
          params: {
            transactionId:
              data?.id || data?.transactionId || data?.txRef || "N/A",
            amount: payAmount,
            currency: fromToken.symbol,
            type: "bridge",
            network: recentNetwork,
          },
        });
      } else {
        // Handle specific error cases with user-friendly messages
        const errorMessage =
          (result.payload as string) ||
          "Failed to execute bridge transaction. Please try again.";

        if (
          errorMessage.toLowerCase().includes("daily trading limit") ||
          errorMessage.toLowerCase().includes("limit exceeded")
        ) {
          Alert.alert(
            "Daily Limit Reached",
            "You've reached your daily trading limit. Please try again tomorrow or contact support if you need a higher limit.",
          );
        } else if (
          errorMessage.toLowerCase().includes("insufficient") ||
          errorMessage.toLowerCase().includes("balance")
        ) {
          Alert.alert(
            "Insufficient Balance",
            "You don't have enough balance to complete this bridge transaction. Please reduce the amount or fund your wallet.",
          );
        } else {
          Alert.alert("Transaction Failed", errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Bridge transaction error:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
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
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Transaction Details */}
          <View className="mt-10">
            {/* Amount */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>
                {payAmount} {paySymbol}
              </Text>
            </View>

            {/* From */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>From</Text>
              <View style={styles.networkDetail}>
                {FromIcon ? <FromIcon /> : null}
                <Text style={styles.networkText}>
                  {paySymbol}
                  {fromNetwork || fromToken?.network
                    ? ` on ${shortenNetworkName(
                        String(fromNetwork || fromToken?.network || ""),
                      )}`
                    : ""}
                </Text>
              </View>
            </View>

            {/* To */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To</Text>
              <View style={styles.networkDetail}>
                {ToIcon ? <ToIcon /> : null}
                <Text style={styles.networkText}>
                  {receiveSymbol}
                  {toNetwork || toToken?.network
                    ? ` on ${shortenNetworkName(
                        String(toNetwork || toToken?.network || ""),
                      )}`
                    : ""}
                </Text>
              </View>
            </View>

            {/* Value (in USDT) */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Value {receiveSymbol ? `(In ${receiveSymbol})` : ""}
              </Text>
              <Text style={styles.detailValue}>
                {receiveAmount || totalValue} {receiveSymbol}
              </Text>
            </View>
          </View>

          {/* Information Banner */}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              loading && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Swap</Text>
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
  networkDetail: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    gap: 1,
    justifyContent: "flex-end",

    flex: 1,
  },
  networkText: {
    color: "#E2E6F0",
    fontSize: 14,
    marginTop: 2,
    fontWeight: 700,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
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
