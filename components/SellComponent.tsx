import ExchangeIcon from "@/assets/images/exchange-icon.svg";
import NGNFlag from "@/assets/images/ngn-flag.svg";
import USDCIcon from "@/assets/images/usdc-iconn.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SellComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [showPayDropdown, setShowPayDropdown] = useState(false);
  const [showReceiveDropdown, setShowReceiveDropdown] = useState(false);
  const [selectedReceiveCurrency, setSelectedReceiveCurrency] = useState("NGN");

  const exchangeRate = 1.5802;
  const dailyLimit = 1000;
  const usedLimit = 0;

  const handlePayAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setPayAmount(numericValue);

    if (numericValue && !isNaN(numericValue)) {
      const calculatedReceive = (
        parseFloat(numericValue) * exchangeRate
      ).toFixed(2);
      setReceiveAmount(calculatedReceive);
    } else {
      setReceiveAmount("");
    }
  };

  const handleReceiveAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setReceiveAmount(numericValue);

    if (numericValue && !isNaN(numericValue)) {
      const calculatedPay = (parseFloat(numericValue) / exchangeRate).toFixed(
        6
      );
      setPayAmount(calculatedPay);
    } else {
      setPayAmount("");
    }
  };

  const handleHalf = () => {
    const halfBalance = (0.00678 / 2).toString();
    setPayAmount(halfBalance);
    setReceiveAmount((parseFloat(halfBalance) * exchangeRate).toFixed(2));
  };

  const handleMax = () => {
    setPayAmount("0.00678");
    setReceiveAmount((0.00678 * exchangeRate).toFixed(2));
  };

  const handleSwap = () => {
    if (payAmount && receiveAmount) {
      // Navigate to review transaction page with parameters
      router.push({
        pathname: "/(action)/review-transaction",
        params: {
          payAmount,
          receiveAmount,
          payCurrency: "USDC",
          receiveCurrency: "NGN",
          network: "Solana",
          exchangeRate: exchangeRate.toString(),
        },
      });
    }
  };

  const isSwapDisabled =
    !payAmount || !receiveAmount || parseFloat(payAmount) === 0;

  const receiveCurrencies = [
    { id: "NGN", name: "NGN", country: "Nigeria" },
    { id: "USD", name: "USD", country: "United States" },
    { id: "EUR", name: "EUR", country: "Europe" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <View style={styles.amountControls}>
        <View style={styles.amountButtons}>
          <TouchableOpacity onPress={handleHalf} style={styles.amountButton}>
            <Text style={styles.amountButtonText}>Half</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMax} style={styles.amountButton}>
            <Text style={styles.amountButtonText}>Max</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity>
            <Ionicons name="sync" size={20} color="#B0BACB" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        {/* Pay Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionLabel}>Pay</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="$0.00"
                placeholderTextColor="#FFFFFF"
                value={payAmount}
                onChangeText={handlePayAmountChange}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.sectionRight}>
              <TouchableOpacity
                style={styles.tokenSelector}
                onPress={() => setShowPayDropdown(!showPayDropdown)}
              >
                <View>
                  <USDCIcon />
                </View>
                <View>
                  <Text style={styles.tokenName}>USDC</Text>
                  <Text style={styles.tokenNetwork}>Solana</Text>
                </View>
                <View>
                  <Ionicons name="chevron-down" color={"#4A9DFF"} />
                </View>
              </TouchableOpacity>
              <View style={styles.balanceContainer}>
                <Image
                  source={require("@/assets/images/wallet-icon.png")}
                  style={{ width: 13, height: 13 }}
                />
                <Text style={styles.balanceText}>0.00678 USDC</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.exchangeIconContainer}>
          <ExchangeIcon />
        </View>

        {/* Receive Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionLabel}>Receive</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="₦0.00"
                placeholderTextColor="#E2E6F0"
                value={receiveAmount}
                onChangeText={handleReceiveAmountChange}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.sectionRight}>
              <TouchableOpacity
                style={styles.addBankButton}
                onPress={() => setShowReceiveDropdown(!showReceiveDropdown)}
              >
                <Text style={styles.addBankText}>+ Add Bank Account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.currencySelector}>
                <View>
                  <NGNFlag />
                </View>
                <View>
                  <Text style={styles.currencyName}>NGN</Text>
                </View>
                <View>
                  <Ionicons name="chevron-down" color={"#4A9DFF"} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Exchange Rate */}
        <View style={styles.exchangeRateContainer}>
          <Text style={styles.exchangeRateText}>
            1 USDC = {exchangeRate} NGN
          </Text>
        </View>

        {/* Daily Swap Limit */}
        <View style={styles.limitContainer}>
          <View style={styles.limitBar}>
            <View
              style={[
                styles.limitProgress,
                { width: `${(usedLimit / dailyLimit) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.limitTextContainer}>
            <Text style={styles.limitUsed}>Daily Swap Limit: 1000 USD</Text>
            <Text style={styles.limitRemaining}>Remaining: 1000 USD</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.swapButton,
            isSwapDisabled
              ? styles.swapButtonDisabled
              : styles.swapButtonActive,
          ]}
          onPress={handleSwap}
          disabled={isSwapDisabled}
        >
          <Text
            style={[
              styles.swapButtonText,
              isSwapDisabled && styles.swapButtonTextDisabled,
            ]}
          >
            Swap
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ... styles remain the same ...

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  amountControls: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountButtons: {
    flexDirection: "row",
    gap: 20,
  },
  amountButton: {
    backgroundColor: "#2A2A2A",
    padding: 4,
    borderRadius: 6,
  },
  amountButtonText: {
    color: "#B0BACB",
  },
  content: {
    marginTop: 16,
    flexDirection: "column",
    gap: 16,
    position: "relative",
    flex: 1, // Add this to make content take available space
  },
  section: {
    padding: 16,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLeft: {
    flex: 1,
  },
  sectionRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  sectionLabel: {
    color: "#E2E6F0",
    fontSize: 16,
  },
  amountInput: {
    color: "white",
    fontSize: 32,
    padding: 0,
    margin: 0,
  },
  tokenSelector: {
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tokenName: {
    color: "#E2E6F0",
    fontWeight: "700",
  },
  tokenNetwork: {
    color: "#757B85",
    fontSize: 12,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  balanceText: {
    color: "#E2E6F0",
    fontSize: 12,
    marginLeft: 4,
  },
  exchangeIconContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
    position: "absolute",
    top: "22%",
  },
  addBankButton: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  addBankText: {
    color: "#B0BACB",
    fontSize: 12,
    marginTop: 4,
  },
  currencySelector: {
    marginTop: 8,
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  currencyName: {
    color: "#E2E6F0",
    fontWeight: "700",
  },
  exchangeRateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exchangeRateText: {
    color: "#757B85",
    fontSize: 12,
  },
  limitContainer: {
    padding: 16,
  },
  limitBar: {
    height: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 4,
  },
  limitProgress: {
    height: 4,
    backgroundColor: "#34D058",
    borderRadius: 4,
  },
  limitTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  limitUsed: {
    color: "#34D058",
    fontSize: 12,
  },
  limitRemaining: {
    color: "#757B85",
    fontSize: 12,
  },
  swapButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto", // This pushes the button to the bottom
    marginBottom: 20, // Add some bottom margin
  },
  swapButtonActive: {
    backgroundColor: "#3B82F6",
  },
  swapButtonDisabled: {
    backgroundColor: "#2A2A2A",
  },
  swapButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  swapButtonTextDisabled: {
    color: "#757B85",
  },
});

export default SellComponent;
