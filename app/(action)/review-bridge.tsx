import USDCIcon from "@/assets/images/review-icons/usdc-icon.svg";
import USDTIcon from "@/assets/images/review-icons/usdt-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ReviewBridgeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    payAmount,
    receiveAmount,
    payCurrency = "$",
    receiveCurrency = "ETH",
    fromNetwork = "USDC",
    toNetwork = "USDT",
    exchangeRate = "1.0062",
  } = params;

  // Calculate total value in USDT (you can modify this logic as needed)
  const totalValue = (parseFloat(payAmount) || 0).toFixed(2);

  const handleConfirm = () => {
    // console.log("Bridge transaction confirmed");
    router.push("/(action)/success-screen");
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
                ${payAmount}
                {/* {payCurrency} */}
              </Text>
            </View>

            {/* From */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>From</Text>
              <View style={styles.networkDetail}>
                {/* <Text style={styles.detailValue}>{payCurrency}</Text> */}
                <USDCIcon />
                <Text style={styles.networkText}>
                  {/* on  {fromNetwork} */}
                  USDC
                </Text>
              </View>
            </View>

            {/* To */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To</Text>
              <View style={styles.networkDetail}>
                {/* <Text style={styles.detailValue}>{receiveCurrency}</Text> */}
                <USDTIcon />
                <Text style={styles.networkText}>
                  {/* on {toNetwork} */}
                  USDT
                </Text>
              </View>
            </View>

            {/* Value (in USDT) */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Value (In USDT)</Text>
              <Text style={styles.detailValue}>${totalValue}</Text>
            </View>
          </View>

          {/* Information Banner */}

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
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingVertical: 4,
  },
  detailLabel: {
    color: "#B0BACB",
    fontSize: 16,
    flex: 1,
  },
  detailValue: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
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
    fontSize: 18,
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
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
