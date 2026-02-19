import { verifyPinAvailability } from "@/app/constants/api";
import { useToken } from "@/app/contexts/TokenContext";
import { RootState } from "@/app/store";
import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Solana from "@/assets/images/networks/solana.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
import { useSelector } from "react-redux";

const EmailComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [email, setEmail] = useState("");
  const { selectedToken } = useToken();
  const balances = useSelector((state: RootState) => state.auth.balances);

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

  const [registrationStatus, setRegistrationStatus] = useState<
    "unknown" | "checking" | "registered" | "unregistered"
  >("unknown");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Get balance for selected token/network (case-insensitive)
  const getTokenBalance = (symbol: string) => {
    if (!balances || !Array.isArray(balances)) return 0;
    const network = (selectedToken?.network || "solana").toLowerCase();
    const tokenSymbol = (symbol || "").toLowerCase();
    const balance = balances.find((b: any) => {
      const bNetwork = (b.network || "").toLowerCase();
      const bToken = (b.token || b.asset || "").toLowerCase();
      return bNetwork === network && bToken === tokenSymbol;
    });
    return balance?.balance || 0;
  };

  const tokenBalance = getTokenBalance(selectedToken?.symbol || "USDC");

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  // Debounced registration check
  useEffect(() => {
    // reset state when email empty
    if (!email) {
      setRegistrationStatus("unknown");
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }

    // basic email validation
    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail) {
      setRegistrationStatus("unregistered");
      return;
    }

    setRegistrationStatus("checking");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await verifyPinAvailability(email);
        setRegistrationStatus("registered");
      } catch (err) {
        setRegistrationStatus("unregistered");
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email]);

  const handlePayAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setPayAmount(numericValue);
    // For email send, amount is in crypto
    setReceiveAmount(numericValue);
  };

  const handleHalf = () => {
    const halfBalance = (tokenBalance / 2).toFixed(6);
    setPayAmount(halfBalance);
    setReceiveAmount(halfBalance);
  };

  const handleMax = () => {
    const maxBalance = tokenBalance.toFixed(6);
    setPayAmount(maxBalance);
    setReceiveAmount(maxBalance);
  };

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
  };

  const handleSwap = () => {
    const proceed = async () => {
      if (!payAmount || !email) return;

      try {
        // Try lightweight registration check. If API responds OK, assume registered.
        await verifyPinAvailability(email);
      } catch (err) {
        // If check fails, inform user and abort
        Alert.alert(
          "Unregistered Email",
          "The email you entered is not registered on Flipeet Pay. Please invite the user or use bank transfer.",
        );
        return;
      }

      // Navigate to review transaction page with parameters
      router.push({
        pathname: "/(action)/review-transaction",
        params: {
          payAmount,
          receiveAmount: payAmount,
          payCurrency: selectedToken?.symbol || "USDC",
          receiveCurrency: selectedToken?.symbol || "USDC",
          network: selectedToken?.network || "Solana",
          recipient: email,
          recipientType: "email",
        },
      });
    };

    void proceed();
  };

  const isSwapDisabled =
    !payAmount ||
    parseFloat(payAmount) === 0 ||
    parseFloat(payAmount) > tokenBalance ||
    !email;

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
            {/* Email Section */}
            <View style={styles.emailSection}>
              <View style={styles.emailHeader}>
                <Text style={styles.emailLabel}>Enter email address</Text>
              </View>
              <TextInput
                style={styles.emailInput}
                placeholder="Enter email address"
                placeholderTextColor="#757B85"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {/* Inline registration status */}
              {registrationStatus === "checking" && (
                <Text style={{ color: "#B0BACB", marginTop: 8 }}>
                  Checking registration...
                </Text>
              )}
              {registrationStatus === "registered" && (
                <Text style={{ color: "#34D058", marginTop: 8 }}>
                  Registered user
                </Text>
              )}
              {registrationStatus === "unregistered" && (
                <Text style={{ color: "#EF4444", marginTop: 8 }}>
                  Email not registered
                </Text>
              )}
            </View>

            {/* Amount Controls */}
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
              <TouchableOpacity onPress={handleSync}>
                <Ionicons name="sync" size={20} color="#B0BACB" />
              </TouchableOpacity>
            </View>

            {/* Amount Section */}
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
                </View>
                <View style={styles.sectionRight}>
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
                    <Image
                      source={require("@/assets/images/wallet-icon.png")}
                      style={styles.walletIcon}
                    />
                    <Text style={styles.balanceText}>
                      {tokenBalance.toFixed(6)}{" "}
                      {selectedToken?.symbol || "USDC"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Send Button at Bottom */}
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
            <Text style={styles.swapButtonText}>
              {/* {!email ? "Enter Email Address" : "Send"} */}
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
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  content: {
    flex: 1,
  },
  emailSection: {
    marginBottom: 24,
  },
  emailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  emailLabel: {
    color: "#B0BACB",
    fontSize: 16,
  },
  favoritesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  favoritesText: {
    color: "#E2E6F0",
    fontSize: 14,
  },
  emailInput: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  favoriteToggle: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  favoriteToggleText: {
    color: "#E2E6F0",
    fontSize: 14,
  },
  switch: {
    transform: [{ scale: 0.8 }],
  },
  amountControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  amountButtons: {
    flexDirection: "row",
    gap: 16,
  },
  amountButton: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  amountButtonText: {
    color: "#B0BACB",
    fontSize: 14,
  },
  section: {
    padding: 16,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    marginBottom: 16,
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
  currencySymbol: {
    color: "white",
    fontSize: 24,
    marginRight: 4,
    fontWeight: "600",
  },
  amountInput: {
    color: "#fff",
    fontSize: 24,
    padding: 0,
    margin: 0,
    fontWeight: "600",
    minWidth: 120,
  },
  tokenSelector: {
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tokenName: {
    color: "#E2E6F0",
    fontWeight: "700",
    fontSize: 14,
  },
  tokenNetwork: {
    color: "#757B85",
    fontSize: 12,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 13,
    height: 13,
  },
  balanceText: {
    color: "#E2E6F0",
    fontSize: 12,
    marginLeft: 4,
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
});
