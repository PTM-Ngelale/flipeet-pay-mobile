import { useCurrency } from "@/app/contexts/CurrencySelectorContext";
import { useToken } from "@/app/contexts/TokenContext";
import { RootState } from "@/app/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const BuyComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const { savedCurrency } = useCurrency();
  const { selectedToken } = useToken();
  const token = useSelector((state: RootState) => state.auth.token);
  const balances = useSelector((state: RootState) => state.auth.balances);

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState<boolean>(false);
  const dailyLimit = 10000;
  const usedLimit = 0;

  // Get user balance for selected token
  const getTokenBalance = (symbol: string, network: string) => {
    if (!balances || !Array.isArray(balances)) return 0;
    const balance = balances.find(
      (b: any) => b.token === symbol && b.network === network
    );
    return balance?.balance || 0;
  };

  const tokenBalance = getTokenBalance(
    selectedToken?.symbol || "USDC",
    selectedToken?.network || "Solana"
  );

  // Fetch exchange rate from API (buy rate)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!token) {
        console.log("No auth token available");
        return;
      }

      const currency = savedCurrency || "NGN";

      // Only NGN is supported by the backend currently
      if (currency !== "NGN") {
        console.warn(`Currency ${currency} not yet supported by backend`);
        setExchangeRate(null);
        setLoadingRate(false);
        return;
      }

      try {
        setLoadingRate(true);
        const asset = selectedToken?.symbol || "USDC";
        const amount = 1;
        const provider = "bread";

        // For buy, we use the buy rate endpoint
        const url = `https://api.pay.flipeet.io/api/v1/ramp/rate?amount=${amount}&asset=${asset}&currency=${currency}&provider=${provider}&type=buy`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const rate = data.data?.rate;
          setExchangeRate(rate);
          console.log("Buy exchange rate fetched:", rate);
        } else {
          console.log("Failed to fetch exchange rate");
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, [token, selectedToken?.symbol, savedCurrency]);

  const handlePayAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setPayAmount(numericValue);

    if (numericValue && !isNaN(parseFloat(numericValue)) && exchangeRate) {
      const calculatedReceive = (
        parseFloat(numericValue) / exchangeRate
      ).toFixed(6);
      setReceiveAmount(calculatedReceive);
    } else {
      setReceiveAmount("");
    }
  };

  const handleReceiveAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setReceiveAmount(numericValue);

    if (numericValue && !isNaN(parseFloat(numericValue)) && exchangeRate) {
      const calculatedPay = (parseFloat(numericValue) * exchangeRate).toFixed(
        2
      );
      setPayAmount(calculatedPay);
    } else {
      setPayAmount("");
    }
  };

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
  };

  const handleBuy = () => {
    if (payAmount && receiveAmount) {
      // For now, show alert that buy is coming soon
      // In future, this will navigate to payment provider or review screen
      router.push({
        pathname: "/(action)/review-transaction",
        params: {
          payAmount,
          receiveAmount,
          payCurrency: savedCurrency || "NGN",
          receiveCurrency: selectedToken?.symbol || "USDC",
          network: selectedToken?.network || "Solana",
          exchangeRate: exchangeRate ? exchangeRate.toString() : "0",
          recipientType: "buy",
        },
      });
    }
  };

  const isBuyDisabled =
    !payAmount ||
    !receiveAmount ||
    parseFloat(payAmount) === 0 ||
    !exchangeRate;

  const getCurrencySymbol = () => {
    switch (savedCurrency) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return savedCurrency || "NGN";
    }
  };

  const handleTokenSelect = () => {
    router.push("/(action)/token-selector");
  };

  const handleCurrencySelect = () => {
    router.push("/(action)/currency-selector");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <View style={styles.amountControls}>
        <View style={styles.amountButtons}>
          <TouchableOpacity style={styles.amountButton}>
            <Text style={styles.amountButtonText}>100</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.amountButton}>
            <Text style={styles.amountButtonText}>500</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.amountButton}>
            <Text style={styles.amountButtonText}>1000</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={handleSync}>
            <Ionicons name="sync" size={20} color="#B0BACB" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* You Pay Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionLabel}>You Pay</Text>
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
              <Text style={styles.usdEquivalent}>
                ≈ $
                {payAmount
                  ? (parseFloat(payAmount) / (exchangeRate || 1)).toFixed(2)
                  : "0.00"}
              </Text>
            </View>
            <View style={styles.sectionRight}>
              <View>
                <TouchableOpacity
                  style={styles.currencySelector}
                  onPress={handleCurrencySelect}
                >
                  <Text style={styles.currencySymbol}>
                    {getCurrencySymbol()}
                  </Text>
                  <View>
                    <Text style={styles.tokenName}>
                      {savedCurrency || "NGN"}
                    </Text>
                  </View>
                  <View>
                    <Ionicons name="chevron-down" color={"#4A9DFF"} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* You Receive Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionLabel}>You Receive</Text>
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
              <Text style={styles.usdEquivalent}>
                ≈ $
                {receiveAmount ? parseFloat(receiveAmount).toFixed(2) : "0.00"}
              </Text>
            </View>
            <View style={styles.sectionRight}>
              <View>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={handleTokenSelect}
                >
                  <View>
                    <Text style={styles.tokenName}>
                      {selectedToken?.symbol || "USDC"}
                    </Text>
                    <Text style={styles.tokenNetwork}>
                      {selectedToken?.network || "Solana"}
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
                  <Text style={styles.balanceText}>
                    {tokenBalance.toFixed(6)} {selectedToken?.symbol || "USDC"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Exchange Rate */}
        <View style={styles.exchangeRateContainer}>
          {loadingRate ? (
            <ActivityIndicator size="small" color="#4A9DFF" />
          ) : exchangeRate ? (
            <Text style={styles.exchangeRateText}>
              1 {selectedToken?.symbol || "USDC"} = {exchangeRate.toFixed(2)}{" "}
              {savedCurrency || "NGN"}
            </Text>
          ) : (
            <Text style={[styles.exchangeRateText, { color: "#FF6B6B" }]}>
              Unable to fetch exchange rate
            </Text>
          )}
        </View>

        {/* Daily Buy Limit */}
        <View style={{ marginTop: "auto", marginBottom: 20, width: "100%" }}>
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
              <Text style={styles.limitUsed}>
                Daily Buy Limit: {dailyLimit} {savedCurrency || "NGN"}
              </Text>
              <Text style={styles.limitRemaining}>
                {dailyLimit - usedLimit} {savedCurrency || "NGN"} remaining
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.buyButton,
              isBuyDisabled ? styles.buyButtonDisabled : styles.buyButtonActive,
            ]}
            onPress={handleBuy}
            disabled={isBuyDisabled}
          >
            <Text style={styles.buyButtonText}>Buy Crypto</Text>
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
    paddingHorizontal: 12,
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
  currencySelector: {
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencySymbol: {
    color: "#E2E6F0",
    fontSize: 24,
    fontWeight: "700",
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
    paddingHorizontal: 0,
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
  buyButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buyButtonActive: {
    backgroundColor: "#3B82F6",
  },
  buyButtonDisabled: {
    backgroundColor: "#3B82F6",
    opacity: 0.4,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});

export default BuyComponent;
