import { useBankAccount } from "@/app/contexts/BankAccountContext";
import { useCurrency } from "@/app/contexts/CurrencySelectorContext";
import { useToken } from "@/app/contexts/TokenContext";
import ExchangeIcon from "@/assets/images/exchange-icon.svg";
import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Solana from "@/assets/images/networks/solana.svg";
import NGNFlag from "@/assets/images/ngn-flag.svg";
import SyncIcon from "@/assets/images/sync-icon.svg";
import WalletIcon from "@/assets/images/wallet-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

const SellComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [showPayDropdown, setShowPayDropdown] = useState(false);
  const [showReceiveDropdown, setShowReceiveDropdown] = useState(false);
  const [paySectionHeight, setPaySectionHeight] = useState(0);
  const { selectedAccount } = useBankAccount();
  const { savedCurrency } = useCurrency();
  const { selectedToken } = useToken();
  const token = useSelector((state: RootState) => state.auth.token);
  const balances = useSelector((state: RootState) => state.auth.balances);
  const displayTokenSymbol = selectedToken?.symbol || "USDC";
  const displayTokenNetwork = selectedToken?.network || "Solana";

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

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState<boolean>(false);
  const dailyLimit = 1000;
  const usedLimit = 0;

  // Get user balance for selected token/network (case-insensitive)
  const getTokenBalance = (symbol: string, network: string) => {
    if (!balances || !Array.isArray(balances)) return 0;
    const targetSymbol = (symbol || "").toLowerCase();
    const targetNetwork = (network || "").toLowerCase();
    const balance = balances.find((b: any) => {
      const bSymbol = (b.token || b.asset || "").toLowerCase();
      const bNetwork = (b.network || "").toLowerCase();
      return bSymbol === targetSymbol && bNetwork === targetNetwork;
    });
    return balance?.balance || 0;
  };

  const tokenBalance = getTokenBalance(displayTokenSymbol, displayTokenNetwork);

  // Fetch exchange rate from API
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

        const url = `https://api.pay.flipeet.io/api/v1/ramp/rate?amount=${amount}&asset=${asset}&currency=${currency}&provider=${provider}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Exchange rate API response:", data);

        if (!response.ok) {
          console.error("API error:", data);
          throw new Error(data.message || "Failed to fetch exchange rate");
        }

        // The rate is directly in data property
        const rate = data.data || data.rate || data.exchangeRate;
        if (rate) {
          setExchangeRate(rate);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, [selectedToken, savedCurrency, token]);

  const handlePayAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setPayAmount(numericValue);

    if (numericValue && !isNaN(parseFloat(numericValue)) && exchangeRate) {
      const calculatedReceive = (
        parseFloat(numericValue) * exchangeRate
      ).toFixed(2);
      setReceiveAmount(calculatedReceive);
    } else {
      setReceiveAmount("");
    }
  };

  const handleReceiveAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setReceiveAmount(numericValue);

    if (numericValue && !isNaN(parseFloat(numericValue)) && exchangeRate) {
      const calculatedPay = (parseFloat(numericValue) / exchangeRate).toFixed(
        6,
      );
      setPayAmount(calculatedPay);
    } else {
      setPayAmount("");
    }
  };

  const handleHalf = () => {
    if (!exchangeRate) return;
    const halfBalance = (tokenBalance / 2).toString();
    setPayAmount(halfBalance);
    setReceiveAmount((parseFloat(halfBalance) * exchangeRate).toFixed(2));
  };

  const handleMax = () => {
    if (!exchangeRate) return;
    setPayAmount(tokenBalance.toString());
    setReceiveAmount((tokenBalance * exchangeRate).toFixed(2));
  };

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
  };

  const handleSwap = () => {
    if (payAmount && receiveAmount && selectedAccount) {
      // Navigate to review transaction page with parameters
      router.push({
        pathname: "/(action)/review-transaction",
        params: {
          payAmount,
          receiveAmount,
          payCurrency: selectedToken?.symbol || "USDC",
          receiveCurrency: savedCurrency || "NGN",
          network: selectedToken?.network || "Solana",
          exchangeRate: exchangeRate ? exchangeRate.toString() : "0",
          recipient: `${selectedAccount.accountName} - ${selectedAccount.accountNumber}`,
          recipientType: "bank",
          bankName: selectedAccount.bankName,
          bankCode: selectedAccount.bankCode,
          accountNumber: selectedAccount.accountNumber,
          accountName: selectedAccount.accountName,
        },
      });
    }
  };

  const isSwapDisabled =
    !payAmount ||
    !receiveAmount ||
    parseFloat(payAmount) === 0 ||
    !exchangeRate ||
    !selectedAccount;

  // Get currency symbol based on selected currency
  const getCurrencySymbol = () => {
    switch (savedCurrency) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "KES":
        return "KSh";
      case "GHS":
        return "GH₵";
      case "BRL":
        return "R$";
      case "ARS":
        return "$";
      default:
        return "₦"; // Default to NGN symbol
    }
  };

  // Get currency flag/icon based on selected currency
  const renderCurrencyIcon = () => {
    switch (savedCurrency) {
      case "NGN":
        return <NGNFlag />;
      default:
        return <NGNFlag />;
    }
  };

  const renderTokenIcon = (IconComponent: React.ComponentType<any>) => {
    return <IconComponent width={30} height={30} />;
  };

  const getNetworkIcon = (network?: string) => {
    const id = (network || "").toLowerCase().replace(/\s+/g, "-");
    if (id.includes("solana")) return Solana;
    if (id.includes("base")) return Base;
    if (id.includes("bnb")) return Bnb;
    return null;
  };

  const exchangeIconTop = paySectionHeight
    ? Math.max(paySectionHeight - 18, 0)
    : 140;

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
          <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
            {/* <Ionicons name="sync" size={24} color="#B0BACB" /> */}
            <SyncIcon />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.exchangeStack}>
          {/* Pay Section */}
          <View
            style={styles.section}
            onLayout={(event) =>
              setPaySectionHeight(event.nativeEvent.layout.height)
            }
          >
            <View style={styles.sectionRow}>
              <View style={styles.sectionLeft}>
                <Text style={styles.sectionLabel}>Pay</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#757B85"
                    value={payAmount}
                    onChangeText={handlePayAmountChange}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.sectionRight}>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={() => router.push("/(action)/token-selector")}
                >
                  <View style={styles.tokenIconWrapper}>
                    {selectedToken?.icon ? (
                      <selectedToken.icon width={30} height={30} />
                    ) : (
                      <Ionicons name="ellipse" size={24} color="#4A9DFF" />
                    )}
                    {selectedToken?.network &&
                      (() => {
                        const Net = getNetworkIcon(selectedToken.network);
                        return Net ? (
                          <View style={styles.networkBadge}>
                            <Net width={14} height={14} />
                          </View>
                        ) : null;
                      })()}
                  </View>
                  <View>
                    <Text style={styles.tokenName}>{displayTokenSymbol}</Text>
                    <Text style={styles.tokenNetwork}>
                      {shortenNetworkName(displayTokenNetwork)}
                    </Text>
                  </View>
                  <View>
                    <Ionicons name="chevron-down" color={"#4A9DFF"} />
                  </View>
                </TouchableOpacity>
                <View style={{ minWidth: "84%" }}>
                  <View style={styles.balanceContainer}>
                    {/* <Image
                      source={require("@/assets/images/wallet-icon.png")}
                      style={{ width: 13, height: 13 }}
                    /> */}
                    <WalletIcon width={15} height={15} />
                    <Text style={styles.balanceText}>
                      {tokenBalance.toFixed(6)} {displayTokenSymbol}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View
            style={[styles.exchangeIconContainer, { top: exchangeIconTop }]}
          >
            <ExchangeIcon />
          </View>

          {/* Receive Section */}
          <View style={[styles.section, styles.receiveSection]}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionLeft}>
                <Text style={styles.sectionLabel}>Receive</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>
                    {getCurrencySymbol()}
                  </Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#757B85"
                    value={receiveAmount}
                    onChangeText={handleReceiveAmountChange}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.sectionRight}>
                {selectedAccount ? (
                  <TouchableOpacity
                    style={styles.savedAccountButton}
                    onPress={() => router.push("/(action)/saved-bank-accounts")}
                  >
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountNumber}>
                        {selectedAccount.accountNumber.slice(0, 7)}...
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#4A9DFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.addBankButton}
                    onPress={() => router.push("/(action)/add-bank-account")}
                  >
                    <Text style={styles.addBankText}>+ Add Bank Account</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.currencySelector}
                  onPress={() => router.push("/(action)/currency-selector")}
                >
                  <View>{renderCurrencyIcon()}</View>
                  <View>
                    <Text style={styles.currencyName}>
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

        {/* Daily Swap Limit */}
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
            <Text style={styles.swapButtonText}>Swap</Text>
          </TouchableOpacity>
        </View>
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

  syncButton: {
    backgroundColor: "#121212",
    padding: 7,
    borderRadius: 6,
    borderColor: "#2A2A2A",
    borderWidth: 1,
  },

  amountButtonText: {
    color: "#B0BACB",
    fontSize: 16,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  content: {
    marginTop: 16,
    flexDirection: "column",
    gap: 16,
    position: "relative",
    flex: 1,
  },
  exchangeStack: {
    position: "relative",
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
    fontWeight: 500,
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
    backgroundColor: "#121212",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderColor: "#2A2A2A",
    borderWidth: 1,
  },
  tokenName: {
    color: "#E2E6F0",
    fontWeight: "700",
  },
  tokenNetwork: {
    color: "#E2E6F0",
    fontSize: 10,
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
    fontWeight: 500,
  },
  exchangeIconContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
    position: "absolute",
    left: 0,
    right: 0,
  },
  receiveSection: {
    marginTop: 16,
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
    fontSize: 14,
    fontWeight: 600,
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
    fontSize: 14,
    fontWeight: 700,
  },
  limitRemaining: {
    color: "#757B85",
    fontSize: 14,
    fontWeight: 700,
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
  savedAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 11,
  },
  accountInfo: {
    // flex: 1,
  },
  bankName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  accountNumber: {
    color: "#B0BACB",
    fontSize: 16,
    fontWeight: 500,
  },
  tokenIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A9DFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tokenIconText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  tokenIconWrapper: {
    width: 40,
    height: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  networkBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#111827",
  },
});

export default SellComponent;
