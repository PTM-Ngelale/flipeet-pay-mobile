import { useToken } from "@/app/contexts/TokenContext";
import StarIcon from "@/assets/images/star-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EmailComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [showPayDropdown, setShowPayDropdown] = useState(false);
  const [showReceiveDropdown, setShowReceiveDropdown] = useState(false);
  const [selectedReceiveCurrency, setSelectedReceiveCurrency] = useState("NGN");
  const [email, setEmail] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const { selectedToken } = useToken();

  const handleEmailChange = (text) => {
    setEmail(text);
  };

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

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
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

  const renderTokenIcon = (IconComponent: React.ComponentType<any>) => {
    return <IconComponent width={30} height={30} />;
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={{ flexDirection: "column", gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#B0BACB", fontSize: 16 }}>
                  Enter email address
                </Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
                >
                  <StarIcon />
                  <Text style={{ color: "#E2E6F0" }}>Favorites</Text>
                  <Ionicons name="chevron-down" color="#4A9DFF" />
                </View>
              </View>
              <TextInput
                style={styles.emailInput}
                placeholder=""
                placeholderTextColor="#FFFFFF"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Text style={{ color: "#E2E6F0" }}>
                  {isFavorite ? "Remove from favorite" : "Add to favorite"}
                </Text>

                <Switch
                  trackColor={{ false: "#000", true: "#4B5563" }}
                  thumbColor={isFavorite ? "#B0BACB" : "#9CA3AF"}
                  ios_backgroundColor="#4B5563"
                  onValueChange={() => setIsFavorite(!isFavorite)}
                  value={isFavorite}
                  style={{ transform: [{ scale: 0.6 }] }}
                />
              </View>
            </View>

            <View style={styles.amountControls}>
              <View style={styles.amountButtons}>
                <TouchableOpacity
                  onPress={handleHalf}
                  style={styles.amountButton}
                >
                  <Text style={styles.amountButtonText}>Half</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleMax}
                  style={styles.amountButton}
                >
                  <Text style={styles.amountButtonText}>Max</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={handleSync}>
                  <Ionicons name="sync" size={20} color="#B0BACB" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionLeft}>
                  <Text style={styles.sectionLabel}>Amount</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      placeholderTextColor="#FFFFFF"
                      value={payAmount}
                      onChangeText={handlePayAmountChange}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                </View>
                <View style={styles.sectionRight}>
                  <View>
                    <TouchableOpacity
                      style={styles.tokenSelector}
                      onPress={() => router.push("/(action)/token-selector")}
                    >
                      <View>{renderTokenIcon(selectedToken.icon)}</View>

                      <View>
                        <Text style={styles.tokenName}>
                          {selectedToken.symbol}
                        </Text>
                        <Text style={styles.tokenNetwork}>
                          {selectedToken.network}
                        </Text>
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
            </View>
          </View>
        </ScrollView>

        {/* Fixed Swap Button at Bottom */}
        <View style={styles.swapButtonContainer}>
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
                isSwapDisabled ,
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EmailComponent;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    marginTop: 30,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 80, // Space for the fixed button
  },
  content: {
    flex: 1,
  },
  swapButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  swapButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  swapButtonActive: {
    backgroundColor: "#3B82F6",
  },
  swapButtonDisabled: {
    backgroundColor: "#3B82F6", 
    opacity: 0.4, 
  },
  swapButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
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
  section: {
    padding: 16,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    marginTop: 16,
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
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    color: "white",
    fontSize: 32,
    marginRight: 4,
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
  emailInput: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
