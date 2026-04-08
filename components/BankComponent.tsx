import { useCurrency } from "@/app/contexts/CurrencySelectorContext";
import { useToken } from "@/app/contexts/TokenContext";
import { AppDispatch, RootState } from "@/app/store";
import { fetchBanks, verifyBankAccount } from "@/app/store/bankAccountSlice";
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
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const BankComponent = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [accountName, setAccountName] = useState("");
  const { selectedToken } = useToken();
  const { savedCurrency } = useCurrency();
  const balances = useSelector((state: RootState) => state.auth.balances);
  const token = useSelector((state: RootState) => state.auth.token);
  const banks = useSelector((state: RootState) => state.bankAccount.banks);
  const banksLoading = useSelector(
    (state: RootState) => state.bankAccount.banksLoading,
  );
  const verifying = useSelector(
    (state: RootState) => state.bankAccount.verifying,
  );
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState<boolean>(false);

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

  // Fetch banks on mount
  useEffect(() => {
    if (token && banks.length === 0 && !banksLoading) {
      console.log("[BankComponent] Dispatching fetchBanks");
      dispatch(fetchBanks())
        .unwrap()
        .then((banks) => {
          console.log("[BankComponent] Banks loaded:", banks.length);
        })
        .catch((error) => {
          console.error("[BankComponent] Failed to load banks:", error);
          Alert.alert(
            "Failed to Load Banks",
            `Could not fetch bank list: ${error}. Please check your internet connection.`,
            [
              { text: "OK" },
              {
                text: "Retry",
                onPress: () => dispatch(fetchBanks()),
              },
            ],
          );
        });
    }
  }, [token, dispatch, banks.length, banksLoading]);

  // Get balance for selected token/network (case-insensitive)
  const getTokenBalance = (symbol: string) => {
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

    const network = normalizeNetwork(selectedToken?.network || "solana");
    const tokenSymbol = (symbol || "").toLowerCase();
    const balance = balances.find((b: any) => {
      const bNetwork = normalizeNetwork(b.network || "");
      const bToken = (b.token || b.asset || "").toLowerCase();
      return bNetwork === network && bToken === tokenSymbol;
    });
    return balance?.balance || 0;
  };

  const tokenBalance = getTokenBalance(selectedToken?.symbol || "USDC");

  // Validate account number when bank or account number changes
  useEffect(() => {
    const verifyAccount = async () => {
      if (selectedBank && accountNumber.length === 10 && token) {
        try {
          const result = await dispatch(
            verifyBankAccount({
              accountNumber,
              bankCode: selectedBank.code,
              bankName: selectedBank.name,
              currency: "NGN",
            }),
          ).unwrap();

          if (result.accountName) {
            setAccountName(result.accountName);
          }
        } catch (error) {
          console.error("Account verification failed:", error);
          setAccountName("");
        }
      } else {
        setAccountName("");
      }
    };

    verifyAccount();
  }, [selectedBank, accountNumber, dispatch, token]);

  const handleAccountNumberChange = (number: string) => {
    // Only allow numbers
    const numericValue = number.replace(/[^0-9]/g, "");
    setAccountNumber(numericValue);
  };

  const handleBankSelect = (bank: {
    id: number;
    name: string;
    code: string;
  }) => {
    setSelectedBank(bank);
    setShowBankDropdown(false);
    setBankSearchQuery("");
  };

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()),
  );

  const renderBankLogo = (bank: any) => {
    if (bank?.logoUrl) {
      return (
        <Image
          source={{ uri: bank.logoUrl }}
          style={styles.bankLogo}
          resizeMode="contain"
        />
      );
    }

    const initial = (bank?.name || "?").trim().charAt(0).toUpperCase();
    return (
      <View style={styles.bankLogoFallback}>
        <Text style={styles.bankLogoFallbackText}>{initial}</Text>
      </View>
    );
  };

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
        const asset = (selectedToken?.symbol || "USDC").toLowerCase();
        const amount = 1;
        const provider = "bread";

        const url = `https://api.pay.flipeet.io/api/v1/ramp/rate?amount=${amount}&asset=${encodeURIComponent(asset)}&currency=${encodeURIComponent(
          currency,
        )}&provider=${encodeURIComponent(provider)}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Exchange rate response:", data);
          const rawRate =
            (typeof data?.data === "number" ? data.data : null) ??
            data?.data?.rate ??
            data?.rate ??
            data?.data?.exchangeRate ??
            data?.exchangeRate ??
            data?.data?.value ??
            data?.value ??
            null;
          const normalizedRate =
            typeof rawRate === "string" ? rawRate.replace(/,/g, "") : rawRate;
          const parsedRate =
            normalizedRate !== null && normalizedRate !== undefined
              ? parseFloat(normalizedRate.toString())
              : NaN;
          if (Number.isFinite(parsedRate)) {
            setExchangeRate(parsedRate);
          } else {
            setExchangeRate(null);
          }
          console.log("Exchange rate fetched:", parsedRate);
        } else {
          const raw = await response.text();
          console.log("Failed to fetch exchange rate:", {
            status: response.status,
            statusText: response.statusText,
            body: raw,
          });
          setExchangeRate(null);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        setExchangeRate(null);
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, [token, selectedToken?.symbol, savedCurrency]);

  const handlePayAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setPayAmount(numericValue);

    if (
      numericValue &&
      !isNaN(parseFloat(numericValue)) &&
      Number.isFinite(exchangeRate)
    ) {
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

    if (
      numericValue &&
      !isNaN(parseFloat(numericValue)) &&
      Number.isFinite(exchangeRate)
    ) {
      const calculatedPay = (parseFloat(numericValue) / exchangeRate).toFixed(
        6,
      );
      setPayAmount(calculatedPay);
    } else {
      setPayAmount("");
    }
  };

  const handleHalf = () => {
    const halfBalance = (tokenBalance / 2).toFixed(6);
    setPayAmount(halfBalance);
    if (exchangeRate) {
      setReceiveAmount((parseFloat(halfBalance) * exchangeRate).toFixed(2));
    }
  };

  const handleMax = () => {
    const maxBalance = tokenBalance.toFixed(6);
    setPayAmount(maxBalance);
    if (exchangeRate) {
      setReceiveAmount((tokenBalance * exchangeRate).toFixed(2));
    }
  };

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
  };

  const handleSwap = () => {
    if (!Number.isFinite(exchangeRate)) {
      Alert.alert(
        "Rate unavailable",
        "Exchange rate is not available. Please try again shortly.",
      );
      return;
    }

    const amountNumber = parseFloat(payAmount || "0");

    if (amountNumber > tokenBalance) {
      Alert.alert(
        "Insufficient Balance",
        "You do not have enough balance to complete this transaction. Please reduce the amount or fund your wallet.",
      );
      return;
    }

    if (payAmount && selectedBank && accountNumber && accountName) {
      const derivedReceiveAmount = Number.isFinite(exchangeRate)
        ? (parseFloat(payAmount) * exchangeRate).toFixed(2)
        : payAmount;
      router.push({
        pathname: "/(action)/review-transaction",
        params: {
          payAmount,
          receiveAmount: receiveAmount || derivedReceiveAmount,
          payCurrency: selectedToken?.symbol || "USDC",
          receiveCurrency: savedCurrency || "NGN",
          network: selectedToken?.network || "Solana",
          exchangeRate: exchangeRate ? exchangeRate.toString() : "0",
          recipient: `${accountName} - ${accountNumber}`,
          recipientType: "bank",
          bankName: selectedBank.name,
          bankCode: selectedBank.code,
          accountNumber,
          accountName,
        },
      });
    }
  };

  const amountNumber = parseFloat(payAmount || "0");
  const hasInsufficientBalance =
    !isNaN(amountNumber) && amountNumber > tokenBalance;

  const isSwapDisabled =
    !payAmount ||
    amountNumber === 0 ||
    !selectedBank ||
    !accountNumber ||
    !accountName ||
    hasInsufficientBalance ||
    !Number.isFinite(exchangeRate);

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
        return "₦";
    }
  };

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
            {/* Bank Selection Section */}
            <View style={{ flexDirection: "column", gap: 3, marginBottom: 35 }}>
              <Text style={{ color: "#B0BACB", fontSize: 16, fontWeight: 600 }}>
                Select a Bank
              </Text>

              <View style={styles.bankSelectContainer}>
                <TouchableOpacity
                  style={styles.bankSelect}
                  onPress={() => setShowBankDropdown(!showBankDropdown)}
                >
                  <View style={styles.bankSelectRow}>
                    {selectedBank ? renderBankLogo(selectedBank) : null}
                    <Text
                      style={{
                        color: selectedBank ? "#FFFFFF" : "#757B85",
                        fontSize: 14,
                      }}
                    >
                      {selectedBank ? selectedBank.name : "Pick an option"}
                    </Text>
                  </View>
                  <Ionicons
                    name={showBankDropdown ? "chevron-up" : "chevron-down"}
                    color={"#4A9DFF"}
                    size={16}
                  />
                </TouchableOpacity>

                {/* Currency Icon positioned absolutely */}
                <TouchableOpacity
                  style={styles.currencyIconContainer}
                  onPress={() => router.push("/(action)/currency-selector")}
                >
                  <View style={styles.currencyIconWrapper}>
                    {renderCurrencyIcon()}
                    <View style={styles.currencyTextContainer}>
                      <Text style={styles.currencyName}>
                        {savedCurrency || "NGN"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" color={"#4A9DFF"} size={16} />
                  </View>
                </TouchableOpacity>

                {/* Bank Dropdown */}
                {showBankDropdown && (
                  <View style={styles.bankDropdown}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                      <Ionicons
                        name="search"
                        size={16}
                        color="#757B85"
                        style={styles.searchIcon}
                      />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search banks..."
                        placeholderTextColor="#757B85"
                        value={bankSearchQuery}
                        onChangeText={setBankSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {bankSearchQuery.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setBankSearchQuery("")}
                        >
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color="#757B85"
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Bank List */}
                    <ScrollView
                      style={styles.bankList}
                      nestedScrollEnabled={true}
                    >
                      {banksLoading ? (
                        <View style={{ padding: 20, alignItems: "center" }}>
                          <ActivityIndicator size="small" color="#4A9DFF" />
                          <Text style={{ color: "#757B85", marginTop: 8 }}>
                            Loading banks...
                          </Text>
                        </View>
                      ) : filteredBanks.length > 0 ? (
                        filteredBanks.map((bank) => (
                          <TouchableOpacity
                            key={bank.id}
                            style={[
                              styles.bankOption,
                              selectedBank?.id === bank.id &&
                                styles.selectedBankOption,
                            ]}
                            onPress={() => handleBankSelect(bank)}
                          >
                            <View style={styles.bankOptionRow}>
                              {renderBankLogo(bank)}
                              <Text
                                style={[
                                  styles.bankOptionText,
                                  selectedBank?.id === bank.id &&
                                    styles.selectedBankOptionText,
                                ]}
                              >
                                {bank.name}
                              </Text>
                            </View>
                            {selectedBank?.id === bank.id && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#34D058"
                              />
                            )}
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={{ padding: 20, alignItems: "center" }}>
                          <Text style={{ color: "#757B85" }}>
                            No banks found
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* Account Number Section */}
            <View style={{ flexDirection: "column", gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#B0BACB", fontSize: 16 }}>
                  Enter Account Number
                </Text>
              </View>

              <View>
                <TextInput
                  style={[
                    styles.emailInput,
                    accountName && styles.validAccountInput,
                  ]}
                  placeholder=""
                  placeholderTextColor="#757B85"
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  keyboardType="numeric"
                />

                {/* Verifying State */}
                {verifying && (
                  <View style={styles.accountNameContainer}>
                    <ActivityIndicator size="small" color="#4A9DFF" />
                    <Text style={styles.accountNameText}>
                      Verifying account...
                    </Text>
                  </View>
                )}

                {/* Account Name Display */}
                {!verifying && accountName && (
                  <View style={styles.accountNameContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#34D058"
                    />
                    <Text style={styles.accountNameText}>{accountName}</Text>
                  </View>
                )}

                {/* Validation Error */}
                {!verifying &&
                  selectedBank &&
                  accountNumber.length === 10 &&
                  !accountName && (
                    <View style={styles.accountErrorContainer}>
                      <Ionicons
                        name="information-circle"
                        size={16}
                        color="#EF4444"
                      />
                      <Text style={styles.accountErrorText}>
                        Could not verify account. Please check account number.
                      </Text>
                    </View>
                  )}
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
                <TouchableOpacity
                  onPress={handleSync}
                  style={styles.syncButton}
                >
                  {/* <Ionicons name="sync" size={20} color="#B0BACB" /> */}
                  <SyncIcon />
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
                      placeholderTextColor="#757B85"
                      value={payAmount}
                      onChangeText={handlePayAmountChange}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                  {receiveAmount ? (
                    <Text style={styles.amountSubValue}>
                      ₦{receiveAmount}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.sectionRight}>
                  <View>
                    <TouchableOpacity
                      style={styles.tokenSelector}
                      onPress={() => router.push("/(action)/token-selector")}
                    >
                      <View style={styles.tokenIconWrapper}>
                        {selectedToken?.icon ? (
                          <selectedToken.icon width={30} height={30} />
                        ) : null}
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
                        <Text style={styles.tokenName}>
                          {selectedToken.symbol}
                        </Text>
                        <Text style={styles.tokenNetwork}>
                          {shortenNetworkName(selectedToken.network)}
                        </Text>
                      </View>
                      <View>
                        <Ionicons name="chevron-down" color={"#4A9DFF"} />
                      </View>
                    </TouchableOpacity>
                    <View style={styles.balanceContainer}>
                      {/* <Image
                        source={require("@/assets/images/wallet-icon.png")}
                        style={{ width: 13, height: 13 }}
                      /> */}
                      <WalletIcon width={15} height={15} />
                      <Text style={styles.balanceText}>
                        {tokenBalance.toFixed(6)}{" "}
                        {selectedToken?.symbol || "USDC"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

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
            <Text style={[styles.swapButtonText, isSwapDisabled]}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default BankComponent;

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
    paddingBottom: 80,
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
  syncButton: {
    backgroundColor: "#121212",
    padding: 7,
    borderRadius: 6,
    borderColor: "#2A2A2A",
    borderWidth: 1,
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
    marginTop: 30,
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
  amountSubValue: {
    marginTop: 6,
    color: "#B0BACB",
    fontSize: 14,
    fontWeight: "500",
  },
  tokenSelector: {
    backgroundColor: "#121212",
    borderColor: "#2A2A2A",
    borderWidth: 1,
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
    fontWeight: 500,
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

  // Bank Selection Styles
  bankSelectContainer: {
    position: "relative",
  },
  bankSelect: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bankSelectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  // Currency Icon positioned absolutely
  currencyIconContainer: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 10,
  },
  currencyIconWrapper: {
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currencyTextContainer: {
    marginLeft: 4,
  },
  currencyName: {
    color: "#E2E6F0",
    fontWeight: "700",
    fontSize: 14,
  },
  bankDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    marginTop: 8,
    zIndex: 1000,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    padding: 0,
  },
  bankList: {
    maxHeight: 200,
  },
  bankOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  bankOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedBankOption: {
    backgroundColor: "#1C1C1C",
  },
  bankOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  selectedBankOptionText: {
    color: "#4A9DFF",
    fontWeight: "600",
  },
  bankLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#111111",
  },
  bankLogoFallback: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  bankLogoFallbackText: {
    color: "#E2E6F0",
    fontSize: 10,
    fontWeight: "700",
  },

  emailInput: {
    backgroundColor: "#2A2A2A",
    // borderWidth: 1,
    // borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#FFFFFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  validAccountInput: {
    borderColor: "#34D058",
  },
  accountNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  accountNameText: {
    color: "#34D058",
    fontSize: 14,
    fontWeight: "500",
  },
  accountErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  accountErrorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
});
