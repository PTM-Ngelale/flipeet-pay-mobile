import { apiRequest } from "@/app/constants/api";
import { useToken } from "@/app/contexts/TokenContext";
import { RootState } from "@/app/store";
import ExchangeIcon from "@/assets/images/exchange-icon.svg";
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
  const token = useSelector((state: RootState) => state.auth.token);
  const balances = useSelector((state: RootState) => state.auth.balances);

  const [exchangeRate, setExchangeRate] = useState<number>(1.0);
  const [loadingRate, setLoadingRate] = useState<boolean>(false);
  const [pairSupported, setPairSupported] = useState<boolean>(true);
  const [pairError, setPairError] = useState<string | null>(null);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [checkingPair, setCheckingPair] = useState<boolean>(false);
  const dailyLimit = 5000;
  const usedLimit = 0;

  // Get user balance for selected tokens (case-insensitive)
  const getTokenBalance = (symbol: string, network: string) => {
    if (!balances || !Array.isArray(balances)) return 0;
    const normalizeNetwork = (value: string) => {
      const normalized = (value || "").toLowerCase().replace(/\s+/g, "-");
      if (
        normalized === "bnb-chain" ||
        normalized === "bnb" ||
        normalized === "bsc"
      ) {
        return "bnb-smart-chain";
      }
      return normalized;
    };

    const targetSymbol = (symbol || "").toLowerCase();
    const targetNetwork = normalizeNetwork(network || "");
    const balance = balances.find((b: any) => {
      const bSymbol = (b.token || b.asset || "").toLowerCase();
      const bNetwork = normalizeNetwork(b.network || "");
      return bSymbol === targetSymbol && bNetwork === targetNetwork;
    });
    return balance?.balance || 0;
  };

  const fromBalance = getTokenBalance(fromToken.symbol, fromToken.network);
  const toBalance = getTokenBalance(toToken.symbol, toToken.network);

  // Fetch real-time swap rate from API
  useEffect(() => {
    if (!token || !fromToken?.symbol || !toToken?.symbol) {
      return;
    }

    const fetchSwapRate = async () => {
      try {
        setLoadingRate(true);
        const fromAsset = (fromToken.symbol || "").toLowerCase();
        const toAsset = (toToken.symbol || "").toLowerCase();
        const amount = 1;

        // Using bridge/swap rate endpoint
        const url = `https://api.pay.flipeet.io/api/v1/transaction/bridge/quote?fromAsset=${encodeURIComponent(
          fromAsset,
        )}&toAsset=${encodeURIComponent(toAsset)}&amount=${amount}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const rawRate =
            (typeof data?.data === "number" ? data.data : null) ??
            data?.data?.rate ??
            data?.rate ??
            data?.data?.exchangeRate ??
            data?.exchangeRate ??
            data?.data?.value ??
            data?.value ??
            1.0;
          const parsedRate = Number.isFinite(Number(rawRate))
            ? Number(rawRate)
            : 1.0;
          setExchangeRate(parsedRate);
          console.log("Swap rate fetched:", parsedRate);
        } else {
          const raw = await response.text();
          console.log("Failed to fetch swap rate, using default 1.0", {
            status: response.status,
            statusText: response.statusText,
            body: raw,
          });
          setExchangeRate(1.0);
        }
      } catch (error) {
        console.error("Error fetching swap rate:", error);
        setExchangeRate(1.0);
      } finally {
        setLoadingRate(false);
      }
    };

    fetchSwapRate();
  }, [token, fromToken?.symbol, toToken?.symbol]);

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
        2,
      );
      setPayAmount(calculatedPay);
    } else {
      setPayAmount("");
    }
  };

  const handleHalf = () => {
    const halfBalance = (fromBalance / 2).toString();
    setPayAmount(halfBalance);
    setReceiveAmount((parseFloat(halfBalance) * exchangeRate).toFixed(6));
  };

  const handleMax = () => {
    setPayAmount(fromBalance.toString());
    setReceiveAmount((fromBalance * exchangeRate).toFixed(6));
  };

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
  };

  const handleBridge = () => {
    if (payAmount && receiveAmount) {
      const amountValue = parseFloat(payAmount);

      if (Number.isFinite(amountValue) && minAmount != null) {
        if (amountValue < minAmount) {
          Alert.alert(
            "Amount too small",
            `Minimum bridge amount is ${minAmount} ${fromToken.symbol}.`,
          );
          return;
        }
      }

      if (!pairSupported) {
        Alert.alert(
          "Unsupported pair",
          pairError ||
            "This token/network pair is not supported for bridge. Please choose a different combination.",
        );
        return;
      }

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

  const isBridgeDisabled =
    !payAmount ||
    !receiveAmount ||
    parseFloat(payAmount) === 0 ||
    !pairSupported ||
    (minAmount != null && parseFloat(payAmount) < minAmount) ||
    (maxAmount != null && parseFloat(payAmount) > maxAmount);

  useEffect(() => {
    const checkPairSupport = async () => {
      if (!token || !fromToken?.symbol || !toToken?.symbol) {
        setPairSupported(true);
        setPairError(null);
        setMinAmount(null);
        setMaxAmount(null);
        return;
      }

      try {
        setCheckingPair(true);
        const amountValue = parseFloat(payAmount || "1");
        const amount =
          Number.isFinite(amountValue) && amountValue > 0 ? amountValue : 1;
        const payload = {
          amount,
          fromAsset: (fromToken.symbol || "").toLowerCase(),
          toAsset: (toToken.symbol || "").toLowerCase(),
          fromNetwork: normalizeNetwork(fromToken.network),
          toNetwork: normalizeNetwork(toToken.network),
        };

        const data = await apiRequest(`/transaction/bridge/quota`, {
          method: "POST",
          body: payload,
          token,
        });

        setPairSupported(true);
        setPairError(null);
        const quota = data?.data || data;
        const min = Number.isFinite(Number(quota?.minAmount))
          ? Number(quota.minAmount)
          : null;
        const max = Number.isFinite(Number(quota?.maxAmount))
          ? Number(quota.maxAmount)
          : null;
        setMinAmount(min);
        setMaxAmount(max);
      } catch (error: any) {
        setPairSupported(false);
        setPairError(error?.message || "Pair not supported");
        setMinAmount(null);
        setMaxAmount(null);
      } finally {
        setCheckingPair(false);
      }
    };

    checkPairSupport();
  }, [
    token,
    fromToken.symbol,
    fromToken.network,
    toToken.symbol,
    toToken.network,
    payAmount,
  ]);

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
              <Text style={styles.usdEquivalent}>
                ${payAmount ? (parseFloat(payAmount) * 1).toFixed(2) : "0.00"}
              </Text>
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
                    {fromBalance.toFixed(6)} {fromToken.symbol}
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
              <Text style={styles.usdEquivalent}>
                $
                {receiveAmount
                  ? (parseFloat(receiveAmount) * 1).toFixed(2)
                  : "0.00"}
              </Text>
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
                  <Text style={styles.balanceText}>
                    {toBalance.toFixed(6)} {toToken.symbol}
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
          ) : (
            <Text style={styles.exchangeRateText}>
              1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
            </Text>
          )}
        </View>

        {/* Button at Bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.bridgeButton,
              isBridgeDisabled || checkingPair
                ? styles.bridgeButtonDisabled
                : styles.bridgeButtonActive,
            ]}
            onPress={handleBridge}
            disabled={isBridgeDisabled || checkingPair}
          >
            {checkingPair ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.bridgeButtonText}>Swap</Text>
            )}
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
