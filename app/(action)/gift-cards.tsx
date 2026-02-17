import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useToken } from "../contexts/TokenContext";
import { RootState } from "../store";

const FX_RATE_NGN_PER_USD = 1600;
const AMOUNT_PRESETS = [1000, 2000, 3000, 5000, 10000, 20000];

type RecipientMode = "own" | "other";

export default function GiftCardsScreen() {
  const router = useRouter();
  const { selectedToken } = useToken();
  const balances = useSelector((state: RootState) => state.auth.balances);

  const [searchValue, setSearchValue] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("own");

  const amountNumber = useMemo(() => {
    const numeric = parseFloat(amountInput);
    return Number.isFinite(numeric) ? numeric : 0;
  }, [amountInput]);

  const usdAmount = useMemo(() => {
    if (!amountNumber) return 0;
    return amountNumber / FX_RATE_NGN_PER_USD;
  }, [amountNumber]);

  const canPay = amountNumber > 0;

  const shortenNetworkName = (network: string) => {
    const raw = (network || "").trim();
    if (!raw) return "";

    const normalized = raw.toLowerCase();

    if (normalized === "bnb-smart-chain") {
      return "BNB Smart";
    }

    if (normalized === "base") {
      return "Base";
    }

    return raw;
  };

  const normalizeTokenNetwork = (value: string) => {
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

  const getTokenBalance = (symbol: string, network: string) => {
    if (!balances || !Array.isArray(balances)) return 0;
    const targetSymbol = (symbol || "").toLowerCase();
    const targetNetwork = normalizeTokenNetwork(network || "");

    const matched = balances.find((entry: any) => {
      const entrySymbol = (entry.token || entry.asset || "").toLowerCase();
      const entryNetwork = normalizeTokenNetwork(entry.network || "");
      return entrySymbol === targetSymbol && entryNetwork === targetNetwork;
    });

    return Number(matched?.balance || 0);
  };

  const displayTokenSymbol = selectedToken?.symbol || "USDC";
  const displayTokenNetwork = selectedToken?.network || "Solana";
  const tokenBalance = getTokenBalance(displayTokenSymbol, displayTokenNetwork);
  const balanceLabel = `${tokenBalance.toFixed(6)} ${displayTokenSymbol}`;
  const TokenIcon = selectedToken?.icon;

  const setAmountValue = (value: number) => {
    setAmountInput(String(Math.max(0, value)));
    setSelectedPreset(AMOUNT_PRESETS.includes(value) ? value : null);
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const [whole = "", fraction = ""] = cleaned.split(".");
    const normalized = cleaned.includes(".")
      ? `${whole}.${fraction.slice(0, 2)}`
      : whole;

    setAmountInput(normalized);

    const numeric = parseFloat(normalized);
    if (!Number.isFinite(numeric)) {
      setSelectedPreset(null);
      return;
    }

    setSelectedPreset(AMOUNT_PRESETS.includes(numeric) ? numeric : null);
  };

  const handlePay = () => {
    if (!canPay) {
      Alert.alert("Amount required", "Enter a valid amount to continue.");
      return;
    }

    Alert.alert(
      "Gift card purchase ready",
      `Amount: ₦${amountNumber.toFixed(2)}\nRecipient: ${recipientMode === "own" ? "My email" : "Another email"}`,
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#E2E6F0" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gift Cards</Text>
            <View style={styles.iconButton} />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search-outline" size={17} color="#757B85" />
              <TextInput
                value={searchValue}
                onChangeText={setSearchValue}
                placeholder="Search by product/brand"
                placeholderTextColor="#757B85"
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.currencyPill}>
              <View style={styles.flagStub} />
              <Text style={styles.currencyText}>NGN</Text>
              <Ionicons name="chevron-down" size={12} color="#4A9DFF" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
            Choose amount
          </Text>
          <View style={styles.amountGrid}>
            {AMOUNT_PRESETS.map((item) => {
              const isSelected = selectedPreset === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.amountPreset,
                    isSelected && styles.amountPresetSelected,
                  ]}
                  onPress={() => setAmountValue(item)}
                >
                  <Text style={styles.amountPresetText}>₦{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.amountCard}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionLeft}>
                <Text style={styles.amountLabel}>Enter amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    value={amountInput}
                    onChangeText={handleAmountChange}
                    placeholder="0.00"
                    placeholderTextColor="#6D7484"
                    keyboardType="decimal-pad"
                    style={styles.amountInput}
                  />
                </View>
                <Text style={styles.amountSub}>${usdAmount.toFixed(2)}</Text>
              </View>

              <View style={styles.sectionRight}>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={() => router.push("/(action)/token-selector")}
                >
                  {TokenIcon ? (
                    <TokenIcon width={30} height={30} />
                  ) : (
                    <Ionicons name="ellipse" size={24} color="#4A9DFF" />
                  )}
                  <View>
                    <Text style={styles.tokenName}>{displayTokenSymbol}</Text>
                    <Text style={styles.tokenNetwork}>
                      {shortenNetworkName(displayTokenNetwork)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={14} color="#4A9DFF" />
                </TouchableOpacity>

                <View style={styles.balanceContainer}>
                  <Image
                    source={require("@/assets/images/wallet-icon.png")}
                    style={styles.walletIcon}
                  />
                  <Text style={styles.balanceText}>{balanceLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.recipientSection}>
            <Text style={styles.sectionLabel}>Recipient Email</Text>
            <TouchableOpacity
              style={[
                styles.radioRow,
                recipientMode === "own" && styles.radioRowActive,
              ]}
              onPress={() => setRecipientMode("own")}
            >
              <Ionicons
                name={
                  recipientMode === "own"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={18}
                color={recipientMode === "own" ? "#34D058" : "#E2E6F0"}
              />
              <Text
                style={[
                  styles.radioText,
                  recipientMode === "own" && styles.radioTextActive,
                ]}
              >
                Send to my own email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioRow,
                recipientMode === "other" && styles.radioRowActive,
              ]}
              onPress={() => setRecipientMode("other")}
            >
              <Ionicons
                name={
                  recipientMode === "other"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={18}
                color={recipientMode === "other" ? "#34D058" : "#E2E6F0"}
              />
              <Text
                style={[
                  styles.radioText,
                  recipientMode === "other" && styles.radioTextActive,
                ]}
              >
                Send to another email
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.payButton, !canPay && styles.payButtonDisabled]}
            onPress={handlePay}
            disabled={!canPay}
          >
            <Text style={styles.payButtonText}>Pay</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#111418",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#757B85",
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "#2D3440",
    borderRadius: 10,
    minHeight: 50,
    paddingLeft: 10,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#E2E6F0",
    fontSize: 14,
    paddingVertical: 0,
  },
  currencyPill: {
    height: 32,
    borderRadius: 7,
    backgroundColor: "#111418",
    borderWidth: 1,
    borderColor: "#2D3440",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flagStub: {
    width: 16,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#2BA84A",
  },
  currencyText: {
    color: "#E2E6F0",
    fontSize: 13,
    fontWeight: "500",
  },
  sectionLabel: {
    color: "#B0BACB",
    fontSize: 16,
    fontWeight: "500",
  },
  sectionSpacing: {
    marginTop: 24,
    marginBottom: 12,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  amountPreset: {
    width: "31%",
    minHeight: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2B313D",
    backgroundColor: "#13161B",
    paddingHorizontal: 6,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  amountPresetSelected: {
    borderColor: "#34D058",
    backgroundColor: "#152019",
  },
  amountPresetText: {
    color: "#DBE2EF",
    fontSize: 13,
    fontWeight: "600",
  },
  amountCard: {
    marginTop: 14,
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
    alignItems: "flex-end",
  },
  amountLabel: {
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
  amountSub: {
    color: "#9DA7B9",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 6,
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
  tokenPill: {
    backgroundColor: "#111418",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E3440",
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tokenText: {
    color: "#E4EAF7",
    fontSize: 13,
    fontWeight: "700",
  },
  tokenSubText: {
    color: "#96A0B3",
    fontSize: 10,
  },
  recipientSection: {
    marginTop: 26,
    gap: 10,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 6,
  },
  radioRowActive: {
    borderColor: "#2D3440",
    backgroundColor: "#10151D",
  },
  radioText: {
    color: "#E2E6F0",
    fontSize: 15,
    fontWeight: "400",
  },
  radioTextActive: {
    color: "#F3F6FC",
    fontWeight: "500",
  },
  payButton: {
    marginTop: 44,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: "#EAF0FB",
    fontSize: 18,
    fontWeight: "600",
  },
});
