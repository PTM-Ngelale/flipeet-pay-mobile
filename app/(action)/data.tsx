// Integrate API: fetch data plans and initialize purchases
import HistoryIcon from "@/assets/images/history-icon.svg";
import NineMobileIcon from "@/assets/images/network-providers-icons/9mobile-icon.svg";
import AirtelIcon from "@/assets/images/network-providers-icons/airtel-icon.svg";
import GloIcon from "@/assets/images/network-providers-icons/glo-icon.svg";
import MTNIcon from "@/assets/images/network-providers-icons/mtn-icon.svg";
import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Solana from "@/assets/images/networks/solana.svg";
import NGNFlag from "@/assets/images/ngn-flag.svg";
import WalletIcon from "@/assets/images/wallet-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  getCommerceDiscoPrices,
  initializeCommerceDataTv,
} from "../constants/api";
import { useToken } from "../contexts/TokenContext";
import { RootState } from "../store";

type DataPlan = {
  id: string;
  title: string;
  amount: number;
  subtitle1: string;
  subtitle2?: string;
  tariffClass: string;
  disco: string;
  number: string;
};

type NetworkOption = {
  id: string;
  name: string;
  color: string;
};

const FX_RATE_NGN_PER_USD = 1600; // Should be fetched dynamically if available

const NETWORKS: NetworkOption[] = [
  { id: "mtn", name: "MTN", color: "#F8C312" },
  { id: "airtel", name: "Airtel", color: "#E60012" },
  { id: "glo", name: "Glo", color: "#2BA84A" },
  { id: "9mobile", name: "9mobile", color: "#8DC63F" },
];

const getNetworkIcon = (network?: string) => {
  const id = (network || "").toLowerCase().replace(/\s+/g, "-");
  if (id.includes("solana")) return Solana;
  if (id.includes("base")) return Base;
  if (id.includes("bnb")) return Bnb;
  return null;
};

const NETWORK_PREFIXES: Record<string, string[]> = {
  mtn: [
    "803",
    "806",
    "703",
    "706",
    "813",
    "816",
    "810",
    "814",
    "903",
    "906",
    "913",
    "916",
  ],
  airtel: [
    "802",
    "808",
    "701",
    "708",
    "812",
    "901",
    "902",
    "904",
    "907",
    "912",
  ],
  glo: ["805", "807", "705", "815", "811", "905", "915"],
  "9mobile": ["809", "817", "818", "908", "909"],
};

const normalizeLocalPhone = (raw: string) => {
  const digits = (raw || "").replace(/\D/g, "");

  if (digits.startsWith("234") && digits.length >= 13) {
    return digits.slice(3, 13);
  }

  if (digits.startsWith("0") && digits.length >= 11) {
    return digits.slice(1, 11);
  }

  if (digits.length >= 10) {
    return digits.slice(0, 10);
  }

  return digits;
};

const detectNetworkFromPhone = (rawPhone: string) => {
  const local = normalizeLocalPhone(rawPhone);
  if (local.length < 3) return null;

  const prefix = local.slice(0, 3);
  const matchedKey = Object.keys(NETWORK_PREFIXES).find((key) =>
    NETWORK_PREFIXES[key].includes(prefix),
  );

  if (!matchedKey) return null;

  return (
    NETWORKS.find((network) => {
      const hay = (network.id + " " + network.name).toLowerCase();
      if (matchedKey === "9mobile") {
        return hay.includes("9mobile") || hay.includes("etisalat");
      }
      return hay.includes(matchedKey);
    }) || null
  );
};

export default function DataScreen() {
  const router = useRouter();
  const { selectedToken } = useToken();
  const token = useSelector((state: RootState) => state.auth.token);
  const balances = useSelector((state: RootState) => state.auth.balances);

  const [localPhone, setLocalPhone] = useState("");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(
    NETWORKS.find((n) => n.id === "mtn") || null,
  );
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");

  const visiblePlans = showAllPlans ? dataPlans : dataPlans.slice(0, 4);

  const amountNumber = useMemo(() => {
    const numeric = parseFloat(amountInput);
    return Number.isFinite(numeric) ? numeric : 0;
  }, [amountInput]);

  const usdAmount = useMemo(() => {
    if (!amountNumber) return 0;
    return amountNumber / FX_RATE_NGN_PER_USD;
  }, [amountNumber]);

  const isPhoneValid = (localPhone || "").replace(/\D/g, "").length === 10;
  const canPay = isPhoneValid && amountNumber > 0 && !isSubmitting;
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

    if (normalized === "solana") return "Solana";
    if (normalized === "base") return "Base";

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

  const providerIconMap: Record<string, any> = {
    mtn: MTNIcon,
    airtel: AirtelIcon,
    glo: GloIcon,
    "9mobile": NineMobileIcon,
    etisalat: NineMobileIcon,
  };

  const normalizePhoneNumber = (raw: string) => {
    const digitsOnly = (raw || "").replace(/\D/g, "");
    if (!digitsOnly) return "";

    if (digitsOnly.startsWith("234")) {
      return `+${digitsOnly}`;
    }

    if (digitsOnly.startsWith("0") && digitsOnly.length >= 11) {
      return `+234${digitsOnly.slice(1, 11)}`;
    }

    if (digitsOnly.length === 10) {
      return `+234${digitsOnly}`;
    }

    return `+${digitsOnly}`;
  };

  const sortPlansByAmount = (plans: DataPlan[]) =>
    [...plans].sort((a, b) => a.amount - b.amount);

  // Parse plan list returned by `/commerce/disco/prices?service=DATA&disco=${disco}`.
  // The API may return plans in `response.data.data` (observed) or `response.data.prices`.
  const parsePlansFromResponse = (response: any) => {
    const rawList = response?.data?.data ?? response?.data?.prices ?? null;
    try {
      console.log("[data] parsePlansFromResponse rawList present", {
        isArray: Array.isArray(rawList),
        length: rawList?.length,
      });
      console.log("[data] parsePlansFromResponse firstItem", rawList?.[0]);
    } catch {}

    if (!Array.isArray(rawList)) return [] as DataPlan[];

    const parsed: DataPlan[] = rawList
      .map((item: any, index: number) => {
        const amount = Number(item?.price ?? item?.amount ?? item?.value);
        const title = String(
          item?.desc ||
            item?.name ||
            item?.title ||
            item?.bundle ||
            item?.size ||
            item?.plan ||
            "",
        ).trim();
        const id = item?.id ?? item?.planId ?? item?.code ?? `plan-${index}`;
        if (!id || !Number.isFinite(amount) || amount <= 0 || !title)
          return null;

        return {
          id: String(id),
          title,
          amount,
          subtitle1: String(
            item?.desc || item?.description || item?.validity || "",
          ).trim(),
          subtitle2:
            item?.meta || item?.extra
              ? String(item?.meta ?? item?.extra)
              : undefined,
          tariffClass: String(item?.tariffClass || item?.tariff || "default"),
          disco: String(item?.disco || "").trim(),
          number: String(item?.code || id),
        } as DataPlan;
      })
      .filter(Boolean) as DataPlan[];

    return sortPlansByAmount(parsed);
  };

  useEffect(() => {
    // Fetch remote plans for the selected network/provider
    if (!selectedNetwork) {
      setDataPlans([]);
      setSelectedPlanId(null);
      return;
    }

    let mounted = true;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await getCommerceDiscoPrices(
          { service: "DATA", disco: selectedNetwork.id },
          token,
        );
        const plans = parsePlansFromResponse(res);
        if (mounted) {
          setDataPlans(plans);
          setSelectedPlanId(null);
        }
      } catch (err) {
        console.warn("[data] fetch plans error", err);
        if (mounted) {
          setDataPlans([]);
          setSelectedPlanId(null);
        }
      } finally {
        if (mounted) setLoadingPlans(false);
      }
    };

    fetchPlans();
    return () => {
      mounted = false;
    };
  }, [selectedNetwork]);

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 10);
    setLocalPhone(cleaned);

    const matchedNetwork = detectNetworkFromPhone(cleaned);
    if (matchedNetwork) {
      setSelectedNetwork(matchedNetwork);
    }
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
      setSelectedPlanId(null);
      return;
    }

    const matchedPlan = dataPlans.find((item) => item.amount === numeric);
    setSelectedPlanId(matchedPlan?.id || null);
  };

  const handlePlanSelect = (plan: DataPlan) => {
    setSelectedPlanId(plan.id);
    setAmountInput(String(plan.amount));
  };

  const handlePay = () => {
    if (!canPay) {
      Alert.alert(
        "Incomplete details",
        "Enter a valid phone number and amount.",
      );
      return;
    }

    const selectedPlan = dataPlans.find((plan) => plan.id === selectedPlanId);
    if (!selectedPlan) {
      Alert.alert("Select a plan", "Please choose a valid data plan.");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(localPhone);

    const submit = async () => {
      setIsSubmitting(true);
      try {
        const selectedPlan = dataPlans.find(
          (plan) => plan.id === selectedPlanId,
        );
        const payload: any = {
          number: selectedPlan?.number || undefined,
          tariffClass: selectedPlan?.tariffClass,
          disco: selectedPlan?.disco || selectedNetwork?.id,
          amount: amountNumber,
          phoneNumber: normalizedPhone,
          type: "DATA",
          asset: (displayTokenSymbol || "usdc").toLowerCase(),
          network: normalizeTokenNetwork(displayTokenNetwork || "solana"),
        };

        const res = await initializeCommerceDataTv(payload, token);
        const txRef =
          res?.data?.txRef ||
          res?.txRef ||
          res?.reference ||
          `local-${Date.now()}`;

        router.push({
          pathname: "/(action)/success-screen",
          params: {
            network: normalizeTokenNetwork(displayTokenNetwork || "solana"),
            txRef,
            title: "Data Purchase Initiated",
            description: `Phone: ${normalizedPhone} • ${selectedNetwork?.name || "Unknown"} • ₦${amountNumber.toFixed(2)}`,
            viewText: "View Transaction",
          },
        });

        setLocalPhone("");
        setSelectedPlanId(null);
        setAmountInput("");
      } catch (error: any) {
        Alert.alert("Purchase failed", error?.message || String(error));
      } finally {
        setIsSubmitting(false);
      }
    };

    submit();
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
            <Text style={styles.headerTitle}>Data</Text>
            <TouchableOpacity onPress={() => router.push("/(recent-activity)")}>
              <HistoryIcon width={25} height={25} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Phone number</Text>

          <View style={styles.phoneSelectContainer}>
            <View style={styles.phoneSelect}>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryTag}>
                  <NGNFlag width={18} height={12} />
                  <Ionicons name="chevron-down" size={11} color="#4A9DFF" />
                </View>
                <Text style={styles.phonePrefix}>+234</Text>
                <TextInput
                  value={localPhone}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="number-pad"
                  style={styles.phoneInput}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.networkIconContainer}
              onPress={() => setShowNetworkDropdown((prev) => !prev)}
            >
              <View style={styles.networkIconWrapper}>
                {(() => {
                  const id = (selectedNetwork?.id || "").toLowerCase();
                  const Local = providerIconMap[id];
                  if (Local) return <Local width={18} height={18} />;
                  return (
                    <View
                      style={[
                        styles.networkDot,
                        {
                          backgroundColor: selectedNetwork?.color || "#6C7486",
                        },
                      ]}
                    >
                      <Text style={styles.networkDotText}>
                        {(selectedNetwork?.name || "Sel").slice(0, 3)}
                      </Text>
                    </View>
                  );
                })()}
                <Text style={styles.networkText}>
                  {selectedNetwork?.name || "Select"}
                </Text>
                <Ionicons
                  name={showNetworkDropdown ? "chevron-up" : "chevron-down"}
                  size={12}
                  color="#4A9DFF"
                />
              </View>
            </TouchableOpacity>
          </View>

          {showNetworkDropdown && (
            <View style={styles.dropdownMenu}>
              {NETWORKS.map((network) => {
                const isActive = selectedNetwork?.id === network.id;
                return (
                  <TouchableOpacity
                    key={network.id}
                    style={[
                      styles.dropdownItem,
                      isActive && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedNetwork(network);
                      setShowNetworkDropdown(false);
                    }}
                  >
                    {(() => {
                      const id = (network.id || "").toLowerCase();
                      const Local = providerIconMap[id];
                      if (Local) return <Local width={20} height={20} />;
                      return (
                        <View
                          style={[
                            styles.dropdownDot,
                            { backgroundColor: network.color },
                          ]}
                        />
                      );
                    })()}
                    <Text style={styles.dropdownText}>{network.name}</Text>
                    {isActive ? (
                      <Ionicons name="checkmark" size={15} color="#34D058" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {!isPhoneValid && localPhone.length > 0 ? (
            <Text style={styles.helperText}>
              Phone number must be 10 digits.
            </Text>
          ) : null}

          <View style={styles.planHeaderRow}>
            <Text style={styles.sectionLabel}>Choose data plan</Text>
            {dataPlans.length > 4 && (
              <TouchableOpacity
                onPress={() => setShowAllPlans((prev) => !prev)}
              >
                <Text style={styles.viewAllText}>
                  {showAllPlans ? "Show less" : "View all"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingPlans ? (
            <View style={styles.planLoader}>
              <ActivityIndicator color="#4A9DFF" />
              <Text style={styles.planLoaderText}>Loading data plans...</Text>
            </View>
          ) : dataPlans.length === 0 ? (
            <View style={styles.planLoader}>
              <Text style={styles.planLoaderText}>
                No data plans available for this provider.
              </Text>
            </View>
          ) : (
            <View style={styles.planGrid}>
              {visiblePlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                    ]}
                    onPress={() => handlePlanSelect(plan)}
                  >
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>₦{plan.amount}</Text>
                    </View>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planSubtitle}>{plan.subtitle1}</Text>
                    {!!plan.subtitle2 && (
                      <Text style={styles.planSubtitle}>{plan.subtitle2}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

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
                <Text style={styles.amountSubValue}>
                  ${usdAmount.toFixed(2)}
                </Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
  iconButtonPlaceholder: {
    width: 34,
    height: 34,
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
  },
  phoneSelectContainer: {
    marginTop: 12,
    position: "relative",
  },
  phoneSelect: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    paddingRight: 130,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111418",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#262C35",
    paddingHorizontal: 8,
    height: 28,
  },
  phonePrefix: {
    color: "#B0BACB",
    fontSize: 15,
  },
  phoneInput: {
    flex: 1,
    color: "#E2E6F0",
    fontSize: 16,
    paddingVertical: 0,
  },
  networkIconContainer: {
    position: "absolute",
    right: 8,
    top: 8,
  },
  networkIconWrapper: {
    backgroundColor: "#111418",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2D3440",
    paddingHorizontal: 8,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  networkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  networkDotText: {
    color: "#0F1728",
    fontSize: 7,
    fontWeight: "800",
  },
  networkText: {
    color: "#E2E6F0",
    fontSize: 13,
    fontWeight: "600",
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
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1B2330",
  },
  dropdownItemActive: {
    backgroundColor: "#151D29",
  },
  dropdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dropdownText: {
    flex: 1,
    color: "#D6DCEA",
    fontSize: 14,
  },
  helperText: {
    marginTop: 8,
    color: "#D07A7A",
    fontSize: 12,
  },
  planHeaderRow: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAllText: {
    color: "#E2E6F0",
    fontSize: 14,
    fontWeight: 500,
  },
  planGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  planLoader: {
    minHeight: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    backgroundColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  planLoaderText: {
    color: "#97A2B6",
    fontSize: 13,
  },
  planCard: {
    width: "48%",
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1C1C1C",
    backgroundColor: "#1C1C1C",
    paddingHorizontal: 12,
    paddingVertical: 14,
    paddingTop: 22,
    marginBottom: 12,
    gap: 6,
    position: "relative",
    // subtle shadow (iOS) and elevation (Android)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  planCardSelected: {
    borderColor: "#34D058",
    backgroundColor: "#1C1C1C",
  },
  planBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    borderRadius: 4,
    backgroundColor: "#388665",
    paddingHorizontal: 4,
    paddingVertical: 3,
    zIndex: 10,
  },
  planBadgeText: {
    color: "#E2E6F0",
    fontSize: 12,
    fontWeight: "500",
  },
  planTitle: {
    color: "#E2E6F0",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 6,
  },
  planSubtitle: {
    color: "#B0BACB",
    fontSize: 12,
    lineHeight: 16,
  },
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
  tokenName: {
    color: "#E2E6F0",
    fontSize: 14,
    fontWeight: "700",
  },
  tokenNetwork: {
    color: "#757B85",
    fontSize: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    color: "#E2E6F0",
    fontSize: 32,
    marginRight: 4,
    fontWeight: "400",
  },
  amountInput: {
    color: "#E2E6F0",
    fontSize: 32,
    padding: 0,
    margin: 0,
    fontWeight: 600,
    minWidth: 120,
  },
  amountSubValue: {
    marginTop: 6,
    color: "#B0BACB",
    fontSize: 14,
    fontWeight: "500",
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
    fontWeight: 500,
  },
  payButton: {
    marginTop: 38,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonDisabled: {
    opacity: 0.4,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
