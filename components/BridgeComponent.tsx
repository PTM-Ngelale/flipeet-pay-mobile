import { useToken } from "@/app/contexts/TokenContext";
import ExchangeIcon from "@/assets/images/exchange-icon.svg";
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

import { useBridgeToken } from "@/app/contexts/BridgeTokenContext";

const BridgeComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [showPayDropdown, setShowPayDropdown] = useState(false);
  const [showReceiveDropdown, setShowReceiveDropdown] = useState(false);
  const [selectedReceiveCurrency, setSelectedReceiveCurrency] = useState("ETH");
  const { selectedToken } = useToken();
  const { fromToken, toToken, setFromToken, setToToken } = useBridgeToken();

  const exchangeRate = 1.0062;
  const dailyLimit = 5000;
  const usedLimit = 0;

  const handlePayAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setPayAmount(numericValue);

    if (numericValue && !isNaN(numericValue)) {
      const calculatedReceive = (
        parseFloat(numericValue) * exchangeRate
      ).toFixed(6);
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
        2
      );
      setPayAmount(calculatedPay);
    } else {
      setPayAmount("");
    }
  };

  const handleHalf = () => {
    const halfBalance = (1000 / 2).toString();
    setPayAmount(halfBalance);
    setReceiveAmount((parseFloat(halfBalance) * exchangeRate).toFixed(6));
  };

  const handleMax = () => {
    setPayAmount("1000");
    setReceiveAmount((1000 * exchangeRate).toFixed(6));
  };

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
  };

  const handleBridge = () => {
    if (payAmount && receiveAmount) {
      // Navigate to review bridge transaction page with parameters
      router.push({
        pathname: "/(action)/review-bridge",
        params: {
          payAmount,
          receiveAmount,
          payCurrency: fromToken.symbol,
          receiveCurrency: toToken.symbol,
          fromNetwork: fromToken.network,
          toNetwork: toToken.network,
          exchangeRate: exchangeRate.toString(),
        },
      });
    }
  };

  const isBridgeDisabled =
    !payAmount || !receiveAmount || parseFloat(payAmount) === 0;

  const receiveCurrencies = [
    { id: "ETH", name: "ETH", network: "Ethereum" },
    { id: "BNB", name: "BNB", network: "BSC" },
    { id: "MATIC", name: "MATIC", network: "Polygon" },
  ];

  const handleFromTokenSelect = () => {
    router.push({
      pathname: "/(action)/token-bridge-selector",
      params: { selectionType: "from" },
    });
  };

  const handleToTokenSelect = () => {
    router.push({
      pathname: "/(action)/token-bridge-selector",
      params: { selectionType: "to" },
    });
  };

  const renderTokenIcon = (IconComponent: React.ComponentType<any>) => {
    return <IconComponent width={30} height={30} />;
  };

  const renderBridgeTokenIcon = (IconComponent: React.ComponentType<any>) => {
    return <IconComponent width={30} height={30} />;
  };

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
          <TouchableOpacity onPress={handleSync}>
            <Ionicons name="sync" size={20} color="#B0BACB" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        {/* From Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionLabel}>From</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#FFFFFF"
                  value={payAmount}
                  onChangeText={handlePayAmountChange}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.usdEquivalent}>$0.00</Text>
            </View>
            <View style={styles.sectionRight}>
              <View>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={handleFromTokenSelect}
                >
                  <View>
                    {fromToken.icon
                      ? renderTokenIcon(fromToken.icon)
                      : // <View style={styles.tokenIconPlaceholder}>
                        //   <Text style={styles.tokenIconText}>
                        //     {fromToken.symbol.charAt(0)}
                        //   </Text>
                        // </View>
                        ""}
                  </View>
                  <View>
                    <Text style={styles.tokenName}>{fromToken.symbol}</Text>
                    <Text style={styles.tokenNetwork}>{fromToken.network}</Text>
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
                  <Text style={styles.balanceText}>
                    0.00678 {fromToken.symbol}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.exchangeIconContainer}>
          <ExchangeIcon />
        </View>

        {/* To Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionLabel}>To</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#E2E6F0"
                  value={receiveAmount}
                  onChangeText={handleReceiveAmountChange}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.usdEquivalent}>$0.00</Text>
            </View>
            <View style={styles.sectionRight}>
              <View>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={handleToTokenSelect}
                >
                  <View>
                    {toToken.icon
                      ? renderTokenIcon(toToken.icon)
                      : // <View style={styles.tokenIconPlaceholder}>
                        //   <Text style={styles.tokenIconText}>
                        //     {toToken.symbol.charAt(0)}
                        //   </Text>
                        // </View>
                        ""}
                  </View>
                  <View>
                    <Text style={styles.tokenName}>{toToken.symbol}</Text>
                    <Text style={styles.tokenNetwork}>{toToken.network}</Text>
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
                  <Text style={styles.balanceText}>0.00678 USDT</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Exchange Rate */}
        <View style={styles.exchangeRateContainer}>
          <Text style={styles.exchangeRateText}>
            1 USDT = {exchangeRate} USDC
          </Text>
        </View>

        {/* Button at Bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.bridgeButton,
              isBridgeDisabled
                ? styles.bridgeButtonDisabled
                : styles.bridgeButtonActive,
            ]}
            onPress={handleBridge}
            disabled={isBridgeDisabled}
          >
            <Text
              style={[
                styles.bridgeButtonText,
                isBridgeDisabled ,
              ]}
            >
              Swap
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

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
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountInput: {
    color: "white",
    fontSize: 32,
    padding: 0,
    margin: 0,
    minWidth: 120,
  },
  usdEquivalent: {
    color: "#B0BACB",
    fontSize: 14,
    marginTop: 4,
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
  exchangeRateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exchangeRateText: {
    color: "#757B85",
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 20,
    width: "100%",
  },
  bridgeButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  bridgeButtonActive: {
    backgroundColor: "#3B82F6",
  },
  bridgeButtonDisabled: {
    backgroundColor: "#3B82F6", 
    opacity: 0.4, 
  },
  bridgeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  tokenIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4A9DFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tokenIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default BridgeComponent;
