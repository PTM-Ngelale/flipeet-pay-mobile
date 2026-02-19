import {
  getCommerceDiscoPrices,
  getTransactionByTxRef,
  initializeCommerceDataTv,
  normalizeAuthToken,
} from "@/app/constants/api";
import NineMobileIcon from "@/assets/images/network-providers-icons/9mobile-icon.svg";
import AirtelIcon from "@/assets/images/network-providers-icons/airtel-icon.svg";
import GloIcon from "@/assets/images/network-providers-icons/glo-icon.svg";
import MTNIcon from "@/assets/images/network-providers-icons/mtn-icon.svg";
import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Solana from "@/assets/images/networks/solana.svg";
import NGNFlag from "@/assets/images/ngn-flag.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

const FX_RATE_NGN_PER_USD = 1600;

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

const DATA_PLANS: DataPlan[] = [
  {
    id: "0",
    title: "150 MB",
    amount: 100,
    subtitle1: "Mini Daily Plan",
    subtitle2: "valid for 24 hours",
    tariffClass: "default",
    disco: "MTN",
    number: "0",
  },
  {
    id: "0b",
    title: "500 MB",
    amount: 200,
    subtitle1: "Daily Plan",
    subtitle2: "valid for 24 hours",
    tariffClass: "default",
    disco: "MTN",
    number: "0b",
  },
  {
    id: "0c",
    title: "750 MB",
    amount: 300,
    subtitle1: "Daily Plus Plan",
    subtitle2: "valid for 24 hours",
    tariffClass: "default",
    disco: "MTN",
    number: "0c",
  },
  {
    id: "1",
    title: "1.8 GB",
    amount: 500,
    subtitle1: "Extradta 1.8GB+10 mins",
    subtitle2: "valid for 30 days",
    tariffClass: "default",
    disco: "MTN",
    number: "1",
  },
  {
    id: "2",
    title: "1GB",
    amount: 500,
    subtitle1: "1GB Daily Plan + 1.5mins.",
    tariffClass: "default",
    disco: "MTN",
    number: "2",
  },
  {
    id: "3",
    title: "2GB",
    amount: 750,
    subtitle1: "2GB 2-Day Plan",
    tariffClass: "default",
    disco: "MTN",
    number: "3",
  },
  {
    id: "4",
    title: "2GB",
    amount: 800,
    subtitle1: "1GB + 1GB YouTube Night +",
    subtitle2: "100MB YouTube Music Weekly Plan",
    tariffClass: "default",
    disco: "MTN",
    number: "4",
  },
  {
    id: "5",
    title: "5GB",
    amount: 1500,
    subtitle1: "5GB Weekly Booster",
    tariffClass: "default",
    disco: "MTN",
    number: "5",
  },
  {
    id: "6",
    title: "10GB",
    amount: 3000,
    subtitle1: "10GB Monthly Plan",
    tariffClass: "default",
    disco: "MTN",
    number: "6",
  },
];

export default function DataScreen() {
  const router = useRouter();
  const { selectedToken } = useToken();
  const token = useSelector((state: RootState) => state.auth.token);
  const balances = useSelector((state: RootState) => state.auth.balances);

  const [localPhone, setLocalPhone] = useState("");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption>(
    NETWORKS[0],
  );
  const [dataPlans, setDataPlans] = useState<DataPlan[]>(DATA_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [debugResponse, setDebugResponse] = useState<any>(null);
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

  const isPhoneValid = localPhone.length === 10;
  const canPay =
    isPhoneValid &&
    amountNumber > 0 &&
    !!selectedNetwork &&
    !!selectedPlanId &&
    !isSubmitting;

  const detectNetworkFromPhone = (phoneDigits: string) => {
    if (!phoneDigits || phoneDigits.length < 3) return null;

    const prefix = phoneDigits.slice(0, 3);
    const matchedNetworkId = Object.entries(NETWORK_PREFIXES).find(
      ([, prefixes]) => prefixes.includes(prefix),
    )?.[0];

    if (!matchedNetworkId) return null;
    return NETWORKS.find((network) => network.id === matchedNetworkId) || null;
  };

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
  const normalizedToken = normalizeAuthToken(token);
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

  const normalizePaymentNetwork = (value: string) => {
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

  const parsePlansFromResponse = (response: any, fallbackDisco: string) => {
    const rawList =
      response?.data?.data ||
      response?.data?.prices ||
      response?.data?.plans ||
      response?.prices ||
      response?.plans ||
      response?.data ||
      [];

    if (!Array.isArray(rawList)) return [] as DataPlan[];

    const parsedPlans = rawList
      .map((item: any, index: number) => {
        const amount = Number(item?.amount || item?.price || item?.value || 0);
        if (!Number.isFinite(amount) || amount <= 0) return null;

        const size = String(
          item?.size ||
            item?.name ||
            item?.title ||
            item?.bundle ||
            item?.plan ||
            "",
        ).trim();

        const subtitle1 = String(
          item?.description ||
            item?.desc ||
            item?.validity ||
            item?.details ||
            "",
        ).trim();

        const subtitle2 = String(item?.extra || item?.meta || "").trim();

        const tariffClass = String(
          item?.tariffClass ||
            item?.tariff ||
            item?.class ||
            item?.planType ||
            "default",
        ).trim();

        const disco = String(
          item?.disco || item?.provider || fallbackDisco,
        ).trim();
        const number = String(
          item?.number || item?.code || item?.id || item?.planId || index + 1,
        ).trim();

        return {
          id: String(
            item?.id || `${disco}-${tariffClass}-${number}-${amount}-${index}`,
          ),
          title: size || `Plan ${index + 1}`,
          amount,
          subtitle1: subtitle1 || `Data plan (${disco})`,
          subtitle2: subtitle2 || undefined,
          tariffClass,
          disco,
          number,
        } as DataPlan;
      })
      .filter(Boolean) as DataPlan[];

    return sortPlansByAmount(parsedPlans);
  };

  useEffect(() => {
    if (!normalizedToken) {
      try {
        console.log(
          "[data] fetchPlans skipped — no auth token present (normalizedToken falsy)",
        );
      } catch {}
      return;
    }

    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const response = await getCommerceDiscoPrices(
          {
            service: "DATA",
            disco: selectedNetwork.name,
          },
          normalizedToken,
        );
        // Save raw response for debugging when plans are missing
        setDebugResponse(response);
        try {
          console.log("[data] disco/prices response", response);
          console.log("[data] selectedNetwork", selectedNetwork.name);
          console.log("[data] normalizedToken present", !!normalizedToken);
        } catch {}

        const parsed = parsePlansFromResponse(response, selectedNetwork.name);
        setDataPlans(parsed);
        setSelectedPlanId(null);
      } catch {
        setDebugResponse({ error: "request_failed" });
        setDataPlans([]);
        setSelectedPlanId(null);
      } finally {
        setLoadingPlans(false);
      }
    };

    void fetchPlans();
  }, [selectedNetwork, normalizedToken]);

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 10);
    setLocalPhone(cleaned);

    const matchedNetwork = detectNetworkFromPhone(cleaned);
    if (matchedNetwork) {
      try {
        console.log(
          "[data] detectNetworkFromPhone matched",
          matchedNetwork?.id,
        );
      } catch {}
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

    if (!normalizedToken) {
      Alert.alert("Authentication required", "Please sign in and try again.");
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
        const response = await initializeCommerceDataTv(
          {
            number: selectedPlan.number,
            disco: selectedPlan.disco || selectedNetwork.name,
            tariffClass: selectedPlan.tariffClass || "default",
            amount: amountNumber,
            phoneNumber: normalizedPhone,
            type: "DATA",
            asset: (displayTokenSymbol || "USDC").toLowerCase(),
            network: normalizePaymentNetwork(displayTokenNetwork || "solana"),
          },
          normalizedToken,
        );

        const statusText = String(
          response?.status || response?.data?.status || "",
        ).toLowerCase();
        const responseMessage =
          response?.message || response?.data?.message || "";
        const txRef =
          response?.data?.txRef ||
          response?.data?.reference ||
          response?.txRef ||
          response?.reference ||
          response?.data?.transactionRef ||
          response?.transactionRef;

        const isExplicitFailure =
          response?.success === false ||
          response?.data?.success === false ||
          statusText.includes("fail") ||
          statusText.includes("error") ||
          statusText.includes("declined");

        if (isExplicitFailure) {
          throw new Error(
            responseMessage ||
              "Transaction was not created. Please verify and try again.",
          );
        }

        const isExplicitSuccess =
          response?.success === true ||
          response?.data?.success === true ||
          statusText.includes("success") ||
          statusText.includes("pending") ||
          statusText.includes("created");

        if (!txRef) {
          throw new Error(
            "No transaction reference returned. Please try again.",
          );
        }

        if (!isExplicitSuccess) {
          throw new Error(
            "Unable to confirm that the transaction was created. Please check recent activity.",
          );
        }

        let purchaseState: "pending" | "successful" = "pending";

        try {
          const transaction = await getTransactionByTxRef(
            txRef,
            normalizedToken,
          );
          const txStatus = String(
            transaction?.data?.status || transaction?.status || "",
          ).toLowerCase();

          const isFailedStatus =
            txStatus.includes("fail") ||
            txStatus.includes("cancel") ||
            txStatus.includes("expire") ||
            txStatus.includes("error");

          if (isFailedStatus) {
            throw new Error(
              `Transaction was not successful (status: ${txStatus || "failed"}).`,
            );
          }

          const isSuccessStatus =
            txStatus.includes("success") || txStatus.includes("complete");

          if (isSuccessStatus) {
            purchaseState = "successful";
          }
        } catch (verificationError: any) {
          const message = String(
            verificationError?.message || "",
          ).toLowerCase();
          const looksLikeAuthHeaderIssue =
            message.includes("authorization") || message.includes("header");

          if (!looksLikeAuthHeaderIssue) {
            throw verificationError;
          }
        }

        router.push({
          pathname: "/(action)/success-screen",
          params: {
            network: normalizePaymentNetwork(displayTokenNetwork || "solana"),
            txRef,
            title:
              purchaseState === "successful"
                ? "Data Purchase Successful"
                : "Data Purchase Initiated",
            description:
              purchaseState === "successful"
                ? `Phone: ${normalizedPhone} • ${selectedNetwork.name} • ₦${amountNumber.toFixed(2)} • Ref: ${txRef}`
                : `Your data request was created and is processing. Ref: ${txRef}`,
            viewText: "View Transaction",
          },
        });

        setLocalPhone("");
        setSelectedPlanId(null);
        setAmountInput("");
      } catch (error: any) {
        Alert.alert(
          "Purchase failed",
          error?.message ||
            "Unable to initialize data purchase. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    void submit();
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
            <View style={styles.iconButtonPlaceholder} />
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
                  const id = (selectedNetwork.id || "").toLowerCase();
                  const Local = providerIconMap[id];
                  if (Local) return <Local width={18} height={18} />;
                  return (
                    <View
                      style={[
                        styles.networkDot,
                        { backgroundColor: selectedNetwork.color || "#6C7486" },
                      ]}
                    >
                      <Text style={styles.networkDotText}>
                        {selectedNetwork.name.slice(0, 3)}
                      </Text>
                    </View>
                  );
                })()}
                <Text style={styles.networkText}>{selectedNetwork.name}</Text>
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
                const isActive = selectedNetwork.id === network.id;
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
            <TouchableOpacity onPress={() => setShowAllPlans((prev) => !prev)}>
              <Text style={styles.viewAllText}>
                {showAllPlans ? "Show less" : "View all"}
              </Text>
            </TouchableOpacity>
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
  flagStub: {
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#2BA84A",
  },
  flagImage: {
    width: 18,
    height: 12,
    borderRadius: 2,
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
    color: "#9BA5B6",
    fontSize: 16,
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
    borderColor: "#2B313D",
    backgroundColor: "#13161B",
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2B313D",
    backgroundColor: "#13161B",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 4,
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
  planCardSelected: {
    borderColor: "#34D058",
    backgroundColor: "#152019",
  },
  planBadge: {
    alignSelf: "flex-end",
    borderRadius: 4,
    backgroundColor: "#1B9C62",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  planBadgeText: {
    color: "#E9FFF3",
    fontSize: 10,
    fontWeight: "600",
  },
  planTitle: {
    color: "#E6EBF5",
    fontSize: 26,
    fontWeight: "700",
  },
  planSubtitle: {
    color: "#7D8799",
    fontSize: 12,
    lineHeight: 16,
  },
  amountCard: {
    marginTop: 18,
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
  amountSubValue: {
    marginTop: 6,
    color: "#9DA7B9",
    fontSize: 16,
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
