// Integrate API: load providers, verify meter and initialize purchases
import HistoryIcon from "@/assets/images/history-icon.svg";
import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Solana from "@/assets/images/networks/solana.svg";
import WalletIcon from "@/assets/images/wallet-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  fetchCommerceElectricityMeterInfo,
  getCommerceElectricityCompanies,
  initializeCommerceElectricity,
  verifyCommerceElectricityMeter,
} from "../constants/api";
import { useToken } from "../contexts/TokenContext";
import { RootState } from "../store";

type ProviderOption = {
  id: string;
  name: string;
  raw?: any;
};

type MeterType = "Prepaid" | "Postpaid";

const FX_RATE_NGN_PER_USD = 1600;
const AMOUNT_PRESETS = [1000, 2000, 3000, 5000, 10000, 20000];
const METER_TYPES: MeterType[] = ["Prepaid", "Postpaid"];

export default function ElectricityScreen() {
  const token = useSelector((state: RootState) => state.auth.token);
  const balances = useSelector((state: RootState) => state.auth.balances);
  const userPhone = useSelector(
    (state: RootState) =>
      state.auth.user?.phone || state.auth.user?.phoneNumber || "",
  );
  const { selectedToken } = useToken();
  const router = useRouter();

  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderOption | null>(null);
  const [providerMeterTypes, setProviderMeterTypes] = useState<string[]>([]);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [meterType, setMeterType] = useState<string | null>("Prepaid");
  const [showMeterTypeDropdown, setShowMeterTypeDropdown] = useState(false);
  const [meterNumber, setMeterNumber] = useState("");
  const [meterInfo, setMeterInfo] = useState<{
    name: string;
    address?: string;
  } | null>(null);
  const [meterError, setMeterError] = useState<string | null>(null);
  const [verifyingMeter, setVerifyingMeter] = useState(false);
  const [verifyDisabled, setVerifyDisabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string>(userPhone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadProviders = async () => {
      try {
        const res = await getCommerceElectricityCompanies(token);
        const raw = res?.data || res?.companies || res || [];
        const parsed = Array.isArray(raw)
          ? raw.map((p: any, i: number) => ({
              id: String(p.id ?? p.code ?? p.name ?? `provider-${i}`),
              name: String(
                p.name ?? p.displayName ?? p.code ?? JSON.stringify(p),
              ),
              raw: p,
            }))
          : [];
        if (mounted) setProviders(parsed);
      } catch (err) {
        console.warn("[electricity] load providers error", err);
        if (mounted) setProviders([]);
      }
    };

    loadProviders();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (verifyTimer.current) clearTimeout(verifyTimer.current);
    setMeterInfo(null);
    setMeterError(null);
    setVerifyingMeter(false);

    if (!selectedProvider || meterNumber.length < 6) return;

    setVerifyingMeter(true);
    verifyTimer.current = setTimeout(
      () => verifyWithProviderIdentifiers(),
      700,
    );
    return () => {
      if (verifyTimer.current) clearTimeout(verifyTimer.current);
    };
  }, [meterNumber, selectedProvider, meterType]);

  const buildProviderCandidates = () => {
    if (!selectedProvider) return [] as string[];
    const raw = selectedProvider.raw || {};
    const candidates = [
      selectedProvider.id,
      selectedProvider.name,
      raw.code,
      raw.disco,
      raw.provider,
      raw.id,
    ];
    return Array.from(new Set(candidates.filter(Boolean).map(String)));
  };

  const verifyWithProviderIdentifiers = async () => {
    if (!selectedProvider || meterNumber.length < 6) {
      setVerifyingMeter(false);
      return;
    }
    setMeterError(null);
    setMeterInfo(null);
    setVerifyDisabled(true);
    try {
      const candidates = buildProviderCandidates();
      let found = false;
      for (const candidate of candidates.length
        ? candidates
        : [selectedProvider.id || selectedProvider.name]) {
        const params = {
          provider: candidate,
          meterNumber,
          meterType: meterType || undefined,
        };
        try {
          const res = await fetchCommerceElectricityMeterInfo(params, token);
          const data = res?.data || res;
          const name =
            data?.name ||
            data?.customerName ||
            data?.customer ||
            data?.accountName;
          const address =
            data?.address || data?.customerAddress || data?.addressLine;
          if (name) {
            setMeterInfo({ name, address });
            setMeterError(null);
            found = true;
            break;
          }
        } catch (getErr) {
          console.warn(
            "[electricity] fetchMeter GET failed for",
            candidate,
            getErr,
          );
        }

        try {
          const verifyRes = await verifyCommerceElectricityMeter(params, token);
          const data = verifyRes?.data || verifyRes;
          const name =
            data?.name ||
            data?.customerName ||
            data?.customer ||
            data?.accountName;
          const address =
            data?.address || data?.customerAddress || data?.addressLine;
          if (name) {
            setMeterInfo({ name, address });
            setMeterError(null);
            found = true;
            break;
          }
        } catch (postErr) {
          console.warn(
            "[electricity] verify POST failed for",
            candidate,
            postErr,
          );
        }
      }

      if (!found) {
        setMeterInfo(null);
        setMeterError("Meter not found or invalid.");
      }
    } finally {
      setVerifyingMeter(false);
      setVerifyDisabled(false);
    }
  };

  const amountNumber = useMemo(() => {
    const numeric = parseFloat(amountInput);
    return Number.isFinite(numeric) ? numeric : 0;
  }, [amountInput]);

  const usdAmount = useMemo(() => {
    if (!amountNumber) return 0;
    return amountNumber / FX_RATE_NGN_PER_USD;
  }, [amountNumber]);

  const meterIsValid = meterNumber.length >= 6 && !!meterInfo?.name;
  const canPay =
    !!selectedProvider && meterIsValid && amountNumber > 0 && !isSubmitting;

  const normalizeTokenNetwork = (value: string) => {
    const normalized = (value || "").toLowerCase().replace(/\s+/g, "-");
    if (
      normalized === "bnb-chain" ||
      normalized === "bnb" ||
      normalized === "bsc"
    )
      return "bnb-smart-chain";
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

  const shortenNetworkName = (network: string) => {
    const raw = (network || "").trim();
    if (!raw) return "";
    const normalized = raw.toLowerCase();
    if (normalized === "bnb-smart-chain") return "BNB Smart";
    if (normalized === "base") return "Base";
    return raw;
  };

  const getNetworkIcon = (network?: string) => {
    const id = (network || "").toLowerCase().replace(/\s+/g, "-");
    if (id.includes("solana")) return Solana;
    if (id.includes("base")) return Base;
    if (id.includes("bnb")) return Bnb;
    return null;
  };

  const handleMeterChange = (text: string) =>
    setMeterNumber(text.replace(/\D/g, ""));
  const handlePhoneChange = (text: string) =>
    setPhoneNumber(text.replace(/[^0-9+]/g, ""));

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
    setSelectedPreset(
      Number.isFinite(numeric) && AMOUNT_PRESETS.includes(numeric)
        ? numeric
        : null,
    );
  };

  const handlePay = async () => {
    if (!canPay) {
      Alert.alert(
        "Incomplete details",
        "Select provider, enter a valid meter number and amount.",
      );
      return;
    }

    if (!meterInfo?.name) {
      Alert.alert(
        "Purchase failed",
        "Meter details not verified. Please verify meter before purchasing.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        provider:
          selectedProvider?.raw?.code ||
          selectedProvider?.id ||
          selectedProvider?.name,
        discoName:
          selectedProvider?.raw?.disco ||
          selectedProvider?.raw?.discoName ||
          selectedProvider?.name,
        meterNumber,
        meterType: meterType || undefined,
        type: meterType || undefined,
        amount: amountNumber,
        phoneNumber: phoneNumber || userPhone || undefined,
        asset: (displayTokenSymbol || "usdt").toLowerCase(),
        network: normalizeTokenNetwork(displayTokenNetwork || "solana"),
      };

      // Log payload for easier debugging
      try {
        console.log("[electricity] initialize payload", payload);
      } catch {}

      const res = await initializeCommerceElectricity(payload, token);
      const txRef =
        res?.data?.txRef ||
        res?.txRef ||
        res?.reference ||
        `local-${Date.now()}`;

      // Attempt to surface any returned meter token/voucher so the user sees it immediately
      const possibleToken =
        res?.data?.token ||
        res?.data?.voucher ||
        res?.data?.voucherCode ||
        res?.data?.meterToken ||
        res?.data?.vendToken ||
        res?.data?.pin ||
        res?.token ||
        res?.voucher ||
        res?.voucherCode ||
        null;

      router.push({
        pathname: "/(action)/success-screen",
        params: {
          network: normalizeTokenNetwork(displayTokenNetwork || "solana"),
          txRef,
          title: "Electricity Purchase Successful",
          description: `Meter: ${meterNumber} • ${selectedProvider?.name} • ₦${amountNumber.toFixed(2)}`,
          viewText: "View Transaction",
          meterToken: possibleToken || undefined,
        },
      });

      setMeterNumber("");
      setAmountInput("");
      setSelectedPreset(null);
      setMeterInfo(null);
    } catch (err: any) {
      try {
        console.warn(
          "[electricity] initialize failed",
          err && (err.body || err),
        );
      } catch (_) {}
      const errMsg =
        (err &&
          (err.message ||
            (typeof err.body === "string"
              ? err.body
              : JSON.stringify(err.body || {})))) ||
        String(err) ||
        "Unable to complete electricity purchase.";
      Alert.alert("Purchase failed", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerIconMap: Record<string, any> = {
    mtn: null,
    airtel: null,
    glo: null,
    etisalat: null,
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
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
              <TouchableOpacity
                onPress={() => router.push("/(recent-activity)")}
              >
                <HistoryIcon width={25} height={25} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 6 }]}>
              Phone Number
            </Text>
            <View style={[styles.selectInput, { marginBottom: 14 }]}>
              <TextInput
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder="Enter Phone Number"
                placeholderTextColor="#757B85"
                keyboardType="phone-pad"
                style={styles.meterInput}
              />
            </View>

            <Text style={[styles.sectionLabel]}>Service Provider</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowProviderDropdown((prev) => !prev)}
            >
              <Text
                style={[
                  styles.placeholder,
                  selectedProvider && styles.selectValueText,
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
                {providers.map((provider) => {
                  const key =
                    provider.id || provider.name || JSON.stringify(provider);
                  const isActive = selectedProvider?.id === provider.id;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.dropdownItem,
                        isActive && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedProvider(provider);
                        setShowProviderDropdown(false);
                        setMeterInfo(null);
                        const raw = provider.raw || {};
                        const types =
                          raw.vendTypes || raw.meterTypes || raw.types || [];
                        const normalizedTypes = Array.isArray(types)
                          ? types.map((t: any) => String(t))
                          : [];
                        setProviderMeterTypes(normalizedTypes);
                        setMeterType("Prepaid");
                      }}
                    >
                      <Text style={styles.dropdownText}>{provider.name}</Text>
                      {isActive && (
                        <Ionicons name="checkmark" size={15} color="#34D058" />
                      )}
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
                placeholder="Enter meter number"
                placeholderTextColor="#757B85"
                keyboardType="number-pad"
                style={styles.meterInput}
              />
              <TouchableOpacity
                style={styles.rightTypePill}
                onPress={() => setShowMeterTypeDropdown((prev) => !prev)}
              >
                <Text style={styles.rightTypeText}>
                  {meterType || "Select"}
                </Text>
                <Ionicons
                  name={showMeterTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={12}
                  color="#4A9DFF"
                />
              </TouchableOpacity>
            </View>

            {showMeterTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {(providerMeterTypes.length > 0
                  ? providerMeterTypes
                  : METER_TYPES
                ).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownItem,
                      meterType === type && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setMeterType(type);
                      setShowMeterTypeDropdown(false);
                      setMeterInfo(null);
                    }}
                  >
                    <Text style={styles.dropdownText}>{String(type)}</Text>
                    {meterType === type && (
                      <Ionicons name="checkmark" size={15} color="#34D058" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {verifyingMeter && (
              <ActivityIndicator
                size="small"
                color="#34D058"
                style={{ marginTop: 8 }}
              />
            )}
            {meterInfo && !verifyingMeter && (
              <View style={styles.meterInfoBox}>
                <Text style={styles.meterInfoName}>{meterInfo.name}</Text>
              </View>
            )}
            {!meterInfo && !verifyingMeter && meterNumber.length > 0 && (
              <Text style={styles.helperText}>
                {meterError || "Meter not found or invalid."}
              </Text>
            )}

            <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
              Choose amount
            </Text>
            <View style={styles.amountGrid}>
              {AMOUNT_PRESETS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.amountPreset,
                    selectedPreset === item && styles.amountPresetSelected,
                  ]}
                  onPress={() => setAmountValue(item)}
                >
                  <Text style={styles.amountPresetText}>₦{item}</Text>
                </TouchableOpacity>
              ))}
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
                    {/* <Image
                    source={require("@/assets/images/wallet-icon.png")}
                    style={styles.walletIcon}
                  /> */}
                    <WalletIcon width={15} height={15} />
                    <Text style={styles.balanceText}>{balanceLabel}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Verification is automatic once provider + meter are populated */}

            <TouchableOpacity
              style={[styles.payButton, !canPay && styles.payButtonDisabled]}
              onPress={handlePay}
              disabled={!canPay}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.payButtonText}>Pay</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    marginTop: 30,
  },
  container: { flex: 1, backgroundColor: "#121212", paddingHorizontal: 16 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 24 },
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
  headerTitle: { color: "#757B85", fontSize: 20, fontWeight: "bold" },
  sectionLabel: {
    color: "#B0BACB",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  sectionSpacing: { marginTop: 14 },
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
  placeholder: { color: "#757B85", fontSize: 15 },
  selectValueText: { color: "#E2E6F0" },
  meterInput: { flex: 1, color: "#E2E6F0", fontSize: 15, paddingVertical: 0 },
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
  rightTypeText: { color: "#E2E6F0", fontSize: 13, fontWeight: "500" },
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
  dropdownItemActive: { backgroundColor: "#151D29" },
  dropdownText: { color: "#D6DCEA", fontSize: 14 },
  helperText: { marginTop: 8, color: "#D07A7A", fontSize: 12 },
  meterInfoBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  meterInfoName: { color: "#34D058", fontSize: 16, fontWeight: "600" },
  meterInfoAddress: { color: "#9DA7B9", fontSize: 14, marginTop: 4 },
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
    borderColor: "#1C1C1C",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 6,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  amountPresetSelected: { borderColor: "#34D058", backgroundColor: "#152019" },
  amountPresetText: { color: "#E2E6F0", fontSize: 18, fontWeight: "500" },
  amountCard: {
    marginTop: 18,
    padding: 16,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLeft: { flex: 1 },
  sectionRight: { alignItems: "flex-end" },
  amountLabel: { color: "#E2E6F0", fontSize: 16, marginBottom: 8 },
  amountInputContainer: { flexDirection: "row", alignItems: "center" },
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
    backgroundColor: "#121212",
    borderColor: "#2A2A2A",
    borderWidth: 1,
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
  tokenName: { color: "#E2E6F0", fontSize: 14, fontWeight: "700" },
  tokenNetwork: { color: "#757B85", fontSize: 12 },
  balanceContainer: { flexDirection: "row", alignItems: "center" },
  walletIcon: { width: 13, height: 13 },
  balanceText: { color: "#E2E6F0", fontSize: 12, marginLeft: 4 },
  payButton: {
    marginTop: 62,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#0B4A9D",
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonDisabled: { opacity: 0.5 },
  payButtonText: { color: "#EAF0FB", fontSize: 18, fontWeight: "600" },
  verifyButton: {
    backgroundColor: "#2B6CB0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonDisabled: { opacity: 0.6 },
  verifyButtonText: { color: "#fff", fontWeight: "700" },
  clearButton: {
    backgroundColor: "#111418",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: { color: "#9DA7B9", fontWeight: "700" },
});
