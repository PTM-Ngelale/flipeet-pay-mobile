import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ReviewTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    payAmount,
    receiveAmount,
    payCurrency = "USDC",
    receiveCurrency = "NGN",
    network = "Solana",
    exchangeRate = "1.5802",
  } = params;

  // Calculate transaction fee (you can modify this logic as needed)
  const transactionFee = "0.50";
  const totalValue = parseFloat(payAmount).toFixed(6);

  const handleConfirm = () => {
    // console.log("Transaction confirmed");
    router.push("/(action)/success-screen");
    // You can navigate to a success screen or back to swap
    // router.push("/transaction-success");
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
              <Text style={styles.detailValue}>Zenith PLC -226••••742</Text>
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
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm Swap</Text>
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
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
