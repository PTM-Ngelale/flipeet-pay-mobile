import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Solana from "@/assets/images/networks/solana.svg";
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

type ProviderOption = {
  id: string;
  name: string;
};

type MeterType = "Prepaid" | "Postpaid";

const FX_RATE_NGN_PER_USD = 1600;

const AMOUNT_PRESETS = [1000, 2000, 3000, 5000, 10000, 20000];

const PROVIDERS: ProviderOption[] = [
  { id: "ikeja-electric", name: "Ikeja Electric" },
  { id: "eko-electric", name: "Eko Electric" },
  { id: "abuja-electric", name: "Abuja Electric" },
  { id: "ibadan-electric", name: "Ibadan Electric" },
  { id: "kaduna-electric", name: "Kaduna Electric" },
  { id: "portharcourt-electric", name: "Port Harcourt Electric" },
];

const METER_TYPES: MeterType[] = ["Prepaid", "Postpaid"];

export default function ElectricityScreen() {
  const router = useRouter();
  const { selectedToken } = useToken();
  const balances = useSelector((state: RootState) => state.auth.balances);

  const [selectedProvider, setSelectedProvider] =
    useState<ProviderOption | null>(null);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [meterType, setMeterType] = useState<MeterType>("Prepaid");
  const [showMeterTypeDropdown, setShowMeterTypeDropdown] = useState(false);
  const [meterNumber, setMeterNumber] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState("");

  const amountNumber = useMemo(() => {
    const numeric = parseFloat(amountInput);
    return Number.isFinite(numeric) ? numeric : 0;
  }, [amountInput]);

  const usdAmount = useMemo(() => {
    if (!amountNumber) return 0;
    return amountNumber / FX_RATE_NGN_PER_USD;
  }, [amountNumber]);

  const meterIsValid = meterNumber.length >= 10;
  const canPay = !!selectedProvider && meterIsValid && amountNumber > 0;

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

  const handleMeterChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 13);
    setMeterNumber(cleaned);
  };

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
      Alert.alert(
        "Incomplete details",
        "Select provider, enter a valid meter number and amount.",
      );
      return;
    }

    Alert.alert(
      "Electricity payment ready",
      `Provider: ${selectedProvider?.name}\nMeter: ${meterNumber}\nType: ${meterType}\nAmount: ₦${amountNumber.toFixed(2)}`,
    );
  };

  const getNetworkIcon = (network?: string) => {
    const id = (network || "").toLowerCase().replace(/\s+/g, "-");
    if (id.includes("solana")) return Solana;
    if (id.includes("base")) return Base;
    if (id.includes("bnb")) return Bnb;
    return null;
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
            <Text style={styles.headerTitle}>Electricity</Text>
            <View style={styles.iconButton} />
          </View>

          <Text style={styles.sectionLabel}>Service Provider</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowProviderDropdown((prev) => !prev)}
          >
            <Text
              style={[
                styles.placeholder,
                selectedProvider ? styles.selectValueText : null,
              ]}
            >
              {selectedProvider?.name || "Select a provider"}
            </Text>
            <View style={styles.rightTag}>
              <Ionicons
                name={showProviderDropdown ? "chevron-up" : "chevron-down"}
                size={14}
                color="#4A9DFF"
              />
            </View>
          </TouchableOpacity>

          {showProviderDropdown && (
            <View style={styles.dropdownMenu}>
              {PROVIDERS.map((provider) => {
                const isActive = selectedProvider?.id === provider.id;
                return (
                  <TouchableOpacity
                    key={provider.id}
                    style={[
                      styles.dropdownItem,
                      isActive && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedProvider(provider);
                      setShowProviderDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{provider.name}</Text>
                    {isActive ? (
                      <Ionicons name="checkmark" size={15} color="#34D058" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
            Meter Number
          </Text>
          <View style={styles.selectInput}>
            <TextInput
              value={meterNumber}
              onChangeText={handleMeterChange}
              placeholder="Enter serial number"
              placeholderTextColor="#757B85"
              keyboardType="number-pad"
              style={styles.meterInput}
            />
            <TouchableOpacity
              style={styles.rightTypePill}
              onPress={() => setShowMeterTypeDropdown((prev) => !prev)}
            >
              <Text style={styles.rightTypeText}>{meterType}</Text>
              <Ionicons
                name={showMeterTypeDropdown ? "chevron-up" : "chevron-down"}
                size={12}
                color="#4A9DFF"
              />
            </TouchableOpacity>
          </View>

          {showMeterTypeDropdown && (
            <View style={styles.dropdownMenu}>
              {METER_TYPES.map((type) => {
                const isActive = meterType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownItem,
                      isActive && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setMeterType(type);
                      setShowMeterTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{type}</Text>
                    {isActive ? (
                      <Ionicons name="checkmark" size={15} color="#34D058" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {!meterIsValid && meterNumber.length > 0 ? (
            <Text style={styles.helperText}>
              Meter number should be at least 10 digits.
            </Text>
          ) : null}

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
                  <View style={styles.tokenIconWrapper}>
                    {TokenIcon ? (
                      <TokenIcon width={30} height={30} />
                    ) : (
                      <Ionicons name="ellipse" size={24} color="#4A9DFF" />
                    )}
                    {displayTokenNetwork &&
                      (() => {
                        const Net = getNetworkIcon(displayTokenNetwork);
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
  sectionLabel: {
    color: "#B0BACB",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  sectionSpacing: {
    marginTop: 14,
  },
  selectInput: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 10,
    minHeight: 46,
    paddingLeft: 10,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  placeholder: {
    color: "#757B85",
    fontSize: 15,
  },
  selectValueText: {
    color: "#E2E6F0",
  },
  meterInput: {
    flex: 1,
    color: "#E2E6F0",
    fontSize: 15,
    paddingVertical: 0,
  },
  rightTag: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: "#111418",
    borderWidth: 1,
    borderColor: "#2D3440",
    alignItems: "center",
    justifyContent: "center",
  },
  rightTypePill: {
    height: 30,
    borderRadius: 7,
    backgroundColor: "#111418",
    borderWidth: 1,
    borderColor: "#2D3440",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rightTypeText: {
    color: "#E2E6F0",
    fontSize: 13,
    fontWeight: "500",
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2D3440",
    backgroundColor: "#111418",
    overflow: "hidden",
  },
  dropdownItem: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1B2330",
  },
  dropdownItemActive: {
    backgroundColor: "#151D29",
  },
  dropdownText: {
    color: "#D6DCEA",
    fontSize: 14,
  },
  helperText: {
    marginTop: 8,
    color: "#D07A7A",
    fontSize: 12,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  amountPreset: {
    width: "31%",
    minHeight: 52,
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
    fontSize: 23,
    fontWeight: "600",
  },
  amountCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A303B",
    backgroundColor: "#181B21",
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    marginTop: 6,
    color: "#9DA7B9",
    fontSize: 16,
    fontWeight: "500",
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
  tokenName: {
    color: "#E2E6F0",
    fontSize: 14,
    fontWeight: "700",
  },
  tokenNetwork: {
    color: "#757B85",
    fontSize: 12,
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
  payButton: {
    marginTop: 62,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#0B4A9D",
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
