import {
  API_ROOT_URL,
  getCommerceAirtimeCompanies,
  getRampRate,
  initializeCommerceAirtime,
  normalizeAuthToken,
} from "@/app/constants/api";
import { useToken } from "@/app/contexts/TokenContext";
import { RootState } from "@/app/store";
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

const TOP_UP_OPTIONS = [
  { amount: 50, label: "₦50", cashback: "₦2.5 Cashback" },
  { amount: 100, label: "₦100", cashback: "₦5 Cashback" },
  { amount: 200, label: "₦200", cashback: "₦10 Cashback" },
  { amount: 500, label: "₦500", cashback: "₦10 Cashback" },
  { amount: 1000, label: "₦1000", cashback: "₦20 Cashback" },
  { amount: 2000, label: "₦2000", cashback: "₦40 Cashback" },
];

type NetworkProvider = {
  id: string;
  name: string;
  provider: string;
  disco: string;
  logoUrl: string;
  color: string;
};

const FALLBACK_NETWORKS: NetworkProvider[] = [
  {
    id: "mtn",
    name: "MTN",
    provider: "MTN",
    disco: "MTN",
    logoUrl: "",
    color: "#F8C312",
  },
  {
    id: "airtel",
    name: "Airtel",
    provider: "Airtel",
    disco: "Airtel",
    logoUrl: "",
    color: "#E60012",
  },
  {
    id: "glo",
    name: "Glo",
    provider: "Glo",
    disco: "Glo",
    logoUrl: "",
    color: "#2BA84A",
  },
  {
    id: "9mobile",
    name: "9mobile",
    provider: "9mobile",
    disco: "9mobile",
    logoUrl: "",
    color: "#8DC63F",
  },
];

const NETWORK_COLORS: Record<string, string> = {
  mtn: "#F8C312",
  airtel: "#E60012",
  glo: "#2BA84A",
  "9mobile": "#8DC63F",
  etisalat: "#8DC63F",
};

const MAX_TOP_UP = Math.max(...TOP_UP_OPTIONS.map((item) => item.amount));

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
  etisalat: ["809", "817", "818", "908", "909"],
};

export default function AirtimeScreen() {
  const router = useRouter();
  const { selectedToken } = useToken();
  const token = useSelector((state: RootState) => state.auth.token);
  const balances = useSelector((state: RootState) => state.auth.balances);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [networkProviders, setNetworkProviders] =
    useState<NetworkProvider[]>(FALLBACK_NETWORKS);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkProvider>(
    FALLBACK_NETWORKS[0],
  );
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState<number | null>(
    null,
  );
  const [amountInput, setAmountInput] = useState("");
  const [loadingNetworks, setLoadingNetworks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ngnRate, setNgnRate] = useState<number | null>(null);
  const [failedLogoIds, setFailedLogoIds] = useState<string[]>([]);

  const displayTokenSymbol = selectedToken?.symbol || "USDC";
  const displayTokenNetwork = selectedToken?.network || "Solana";
  const normalizedToken = normalizeAuthToken(token);

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

  const tokenBalance = getTokenBalance(displayTokenSymbol, displayTokenNetwork);

  const handlePhoneNumberChange = (text: string) => {
    let cleaned = text.replace(/\D/g, "");

    if (cleaned.startsWith("234")) {
      cleaned = cleaned.slice(3);
    }

    cleaned = cleaned.slice(0, 11);
    setPhoneNumber(cleaned);

    const detected = detectNetworkFromPhone(cleaned, networkProviders);
    if (detected) {
      setSelectedNetwork(detected);
    }
  };

  const handleNetworkSelect = (network: NetworkProvider) => {
    setSelectedNetwork(network);
    setShowNetworkDropdown(false);
  };

  const hasFailedLogo = (providerId: string) =>
    failedLogoIds.includes(providerId);

  const markLogoAsFailed = (providerId: string) => {
    setFailedLogoIds((prev) =>
      prev.includes(providerId) ? prev : [...prev, providerId],
    );
  };

  const renderNetworkLogo = (network: NetworkProvider) => {
    if (!hasFailedLogo(network.id) && network.logoUrl) {
      return (
        <Image
          source={getNetworkLogoSource(network.logoUrl)}
          style={styles.networkLogo}
          resizeMode="contain"
          onError={() => markLogoAsFailed(network.id)}
        />
      );
    }

    const initial = (network?.name || "?").trim().charAt(0).toUpperCase();
    return (
      <View style={styles.networkLogoFallback}>
        <Text style={styles.networkLogoFallbackText}>{initial}</Text>
      </View>
    );
  };

  const handleTopUpSelect = (amount: number) => {
    setSelectedTopUpAmount(amount);
    setAmountInput(String(amount));
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
      setSelectedTopUpAmount(null);
      return;
    }

    const matchedTopUp = TOP_UP_OPTIONS.find((item) => item.amount === numeric);
    setSelectedTopUpAmount(matchedTopUp ? matchedTopUp.amount : null);
  };

  const normalizePhoneNumber = (raw: string) => {
    const input = (raw || "").trim();
    const digitsOnly = input.replace(/\D/g, "");

    if (!digitsOnly) return "";

    if (input.startsWith("+") && digitsOnly.startsWith("234")) {
      return `+${digitsOnly}`;
    }

    if (digitsOnly.startsWith("234")) {
      return `+${digitsOnly}`;
    }

    if (digitsOnly.startsWith("0") && digitsOnly.length === 11) {
      return `+234${digitsOnly.slice(1)}`;
    }

    if (digitsOnly.length === 10) {
      return `+234${digitsOnly}`;
    }

    return `+${digitsOnly}`;
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

  const detectNetworkFromPhone = (
    rawPhone: string,
    providers: NetworkProvider[],
  ) => {
    const local = normalizeLocalPhone(rawPhone);
    if (local.length < 3) return null;

    const prefix = local.slice(0, 3);
    const matchedKey = Object.keys(NETWORK_PREFIXES).find((key) =>
      NETWORK_PREFIXES[key].includes(prefix),
    );

    if (!matchedKey) return null;

    return (
      providers.find((provider) => {
        const haystack = [
          provider.id,
          provider.name,
          provider.provider,
          provider.disco,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (matchedKey === "9mobile" || matchedKey === "etisalat") {
          return haystack.includes("9mobile") || haystack.includes("etisalat");
        }

        return haystack.includes(matchedKey);
      }) || null
    );
  };

  const parseNetworkProviders = (payload: any): NetworkProvider[] => {
    const extractLogoValue = (value: any): string => {
      if (!value) return "";

      if (typeof value === "string") {
        return value.trim();
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          const extracted = extractLogoValue(item);
          if (extracted) return extracted;
        }
        return "";
      }

      if (typeof value === "object") {
        const candidateKeys = [
          "url",
          "secure_url",
          "logoUrl",
          "logo",
          "src",
          "path",
          "file",
          "icon",
          "image",
        ];

        for (const key of candidateKeys) {
          const extracted = extractLogoValue((value as any)[key]);
          if (extracted) return extracted;
        }
      }

      return "";
    };

    const normalizeLogoUrl = (
      rawLogo: unknown,
      providerName: string,
      id: string,
    ) => {
      const fallback = "";

      const extractedLogo = extractLogoValue(rawLogo);
      if (!extractedLogo) {
        return fallback;
      }

      const logo = extractedLogo;
      if (logo.startsWith("http://") || logo.startsWith("https://")) {
        return logo;
      }

      if (logo.startsWith("//")) {
        return `https:${logo}`;
      }

      if (logo.startsWith("/")) {
        return `${API_ROOT_URL}${logo}`;
      }

      return `${API_ROOT_URL}/${logo.replace(/^\/+/, "")}`;
    };

    const candidates = [
      payload?.data?.companies,
      payload?.data?.providers,
      payload?.data?.items,
      payload?.data,
      payload?.companies,
      payload?.providers,
      payload,
    ];

    const rawList = candidates.find((entry) => Array.isArray(entry));
    if (!Array.isArray(rawList)) {
      return [];
    }

    const mapped = rawList
      .map((item: any) => {
        const name =
          item?.name ||
          item?.providerName ||
          item?.discoName ||
          item?.provider ||
          item?.disco ||
          item?.code;
        const provider = item?.provider || item?.disco || item?.code || name;
        const disco = item?.disco || item?.provider || item?.code || name;
        const rawLogo =
          item?.logoUrl ||
          item?.logo ||
          item?.image ||
          item?.icon ||
          item?.assets ||
          item?.media;

        if (!name || !provider) return null;

        const id = String(item?.id || provider || name)
          .trim()
          .toLowerCase();
        const color =
          NETWORK_COLORS[id] ||
          NETWORK_COLORS[String(name).toLowerCase()] ||
          "#4A9DFF";
        const logoUrl = normalizeLogoUrl(rawLogo, String(name), id);

        return {
          id,
          name: String(name).trim(),
          provider: String(provider).trim(),
          disco: String(disco).trim(),
          logoUrl,
          color,
        } as NetworkProvider;
      })
      .filter(Boolean) as NetworkProvider[];

    const dedupedById = new Map<string, NetworkProvider>();
    mapped.forEach((provider) => {
      const existing = dedupedById.get(provider.id);
      if (!existing) {
        dedupedById.set(provider.id, provider);
        return;
      }

      if (
        (!existing.logoUrl ||
          existing.logoUrl.includes("/commons/5/59/Empty.png")) &&
        provider.logoUrl
      ) {
        dedupedById.set(provider.id, {
          ...existing,
          logoUrl: provider.logoUrl,
        });
      }
    });

    return Array.from(dedupedById.values());
  };

  const getNetworkLogoSource = (logoUrl: string) => {
    if (!logoUrl) return { uri: "" };

    const isApiHosted = logoUrl.startsWith(API_ROOT_URL);
    if (isApiHosted && normalizedToken) {
      return {
        uri: logoUrl,
        headers: {
          Authorization: `Bearer ${normalizedToken}`,
        },
      };
    }

    return { uri: logoUrl };
  };

  useEffect(() => {
    const loadAirtimeProviders = async () => {
      if (!normalizedToken) return;

      try {
        setLoadingNetworks(true);
        const airtimeResponse =
          await getCommerceAirtimeCompanies(normalizedToken);
        const providers = parseNetworkProviders(airtimeResponse);

        if (providers.length > 0) {
          setNetworkProviders(providers);
          setSelectedNetwork((current) => {
            const matched = providers.find(
              (provider) => provider.id === current.id,
            );
            return matched || providers[0];
          });
          return;
        }

        setNetworkProviders(FALLBACK_NETWORKS);
      } catch (error) {
        setNetworkProviders(FALLBACK_NETWORKS);
      } finally {
        setLoadingNetworks(false);
      }
    };

    void loadAirtimeProviders();
  }, [normalizedToken]);

  useEffect(() => {
    if (!phoneNumber) return;
    const detected = detectNetworkFromPhone(phoneNumber, networkProviders);
    if (detected) {
      setSelectedNetwork(detected);
    }
  }, [phoneNumber, networkProviders]);

  useEffect(() => {
    const loadNgnRate = async () => {
      if (!normalizedToken) return;

      try {
        const response = await getRampRate(
          {
            amount: 1,
            asset: displayTokenSymbol.toLowerCase(),
            currency: "NGN",
            provider: "bread",
          },
          normalizedToken,
        );

        const rawRate =
          (typeof response?.data === "number" ? response.data : null) ??
          response?.data?.rate ??
          response?.rate ??
          response?.data?.exchangeRate ??
          response?.exchangeRate ??
          null;

        const parsed =
          rawRate != null
            ? Number(String(rawRate).replace(/,/g, ""))
            : Number.NaN;

        setNgnRate(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
      } catch {
        setNgnRate(null);
      }
    };

    void loadNgnRate();
  }, [displayTokenSymbol, normalizedToken]);

  const handlePay = async () => {
    if (!normalizedToken) {
      Alert.alert(
        "Authentication required",
        "Please log in again to continue.",
      );
      return;
    }

    const amount = parseFloat(amountInput || "0");
    if (amount <= 0) {
      Alert.alert("Amount required", "Select a top up amount to continue.");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!/^\+234\d{10}$/.test(normalizedPhone)) {
      Alert.alert(
        "Invalid phone number",
        "Enter a valid Nigerian phone number.",
      );
      return;
    }

    if (!selectedNetwork?.provider) {
      Alert.alert("Network required", "Select a mobile network provider.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        provider: selectedNetwork.provider,
        phoneNumber: normalizedPhone,
        disco: selectedNetwork.disco,
        amount,
        asset: displayTokenSymbol.toLowerCase(),
        network: normalizeTokenNetwork(displayTokenNetwork),
      };

      const response = await initializeCommerceAirtime(
        payload,
        normalizedToken,
      );
      const txRef =
        response?.data?.txRef ||
        response?.data?.reference ||
        response?.txRef ||
        response?.reference;

      setPhoneNumber("");
      setSelectedTopUpAmount(null);
      setAmountInput("");

      router.push({
        pathname: "/(action)/success-screen",
        params: {
          network: normalizeTokenNetwork(displayTokenNetwork),
          txRef: txRef || "",
          title: "Airtime Purchase Successful",
          description: txRef
            ? `Your airtime request was created successfully. Ref: ${txRef}`
            : "Your airtime request was created successfully.",
          viewText: "View Transaction",
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Purchase failed",
        error?.message || "Unable to complete airtime purchase right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountNumber = parseFloat(amountInput || "0");

  const usdEquivalent = useMemo(() => {
    if (!Number.isFinite(amountNumber) || amountNumber <= 0 || !ngnRate) {
      return 0;
    }

    return amountNumber / ngnRate;
  }, [amountNumber, ngnRate]);

  const formattedUsdEquivalent = `$${usdEquivalent.toFixed(2)}`;

  const balanceLabel = useMemo(() => {
    if (!Number.isFinite(tokenBalance)) return `0.00000 ${displayTokenSymbol}`;
    return `${tokenBalance.toFixed(5)} ${displayTokenSymbol}`;
  }, [tokenBalance, displayTokenSymbol]);

  const TokenIcon = selectedToken?.icon;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Airtime</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Phone number</Text>
          </View>

          <View style={styles.phoneSelectContainer}>
            <View style={styles.phoneSelect}>
              <View style={styles.phoneSelectRow}>
                <Text style={styles.phonePrefix}>+234</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder=""
                  placeholderTextColor="#757B85"
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.networkIconContainer}
              onPress={() => setShowNetworkDropdown(!showNetworkDropdown)}
              disabled={loadingNetworks}
            >
              <View style={styles.networkIconWrapper}>
                {renderNetworkLogo(selectedNetwork)}
                <Text style={styles.networkText}>{selectedNetwork.name}</Text>
                {loadingNetworks ? (
                  <ActivityIndicator size="small" color="#4A9DFF" />
                ) : (
                  <Ionicons
                    name={showNetworkDropdown ? "chevron-up" : "chevron-down"}
                    color="#4A9DFF"
                    size={16}
                  />
                )}
              </View>
            </TouchableOpacity>

            {showNetworkDropdown && (
              <View style={styles.networkDropdown}>
                <ScrollView style={styles.networkList} nestedScrollEnabled>
                  {networkProviders.map((network) => (
                    <TouchableOpacity
                      key={network.id}
                      style={[
                        styles.networkOption,
                        selectedNetwork.id === network.id &&
                          styles.selectedNetworkOption,
                      ]}
                      onPress={() => handleNetworkSelect(network)}
                    >
                      <View style={styles.networkOptionRow}>
                        {renderNetworkLogo(network)}
                        <Text
                          style={[
                            styles.networkOptionText,
                            selectedNetwork.id === network.id &&
                              styles.selectedNetworkOptionText,
                          ]}
                        >
                          {network.name}
                        </Text>
                      </View>
                      {selectedNetwork.id === network.id && (
                        <Ionicons name="checkmark" size={16} color="#34D058" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.topUpSection}>
            <Text style={styles.sectionTitle}>Choose top up</Text>
            <View style={styles.topUpGrid}>
              {TOP_UP_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.topUpCard,
                    selectedTopUpAmount === item.amount &&
                      styles.selectedTopUpCard,
                  ]}
                  onPress={() => handleTopUpSelect(item.amount)}
                >
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackLabel}>💵 {item.cashback}</Text>
                  </View>
                  <Text style={styles.topUpAmount}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.amountCard}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionLeft}>
                <Text style={styles.amountLabel}>Enter amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#AAB3C3"
                    value={amountInput}
                    onChangeText={handleAmountChange}
                    keyboardType="decimal-pad"
                  />
                </View>
                <Text style={styles.amountSubValue}>
                  {formattedUsdEquivalent}
                </Text>
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

          <TouchableOpacity
            style={[styles.payButton, isSubmitting && styles.payButtonDisabled]}
            onPress={handlePay}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#EAF0FB" />
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
    backgroundColor: "black",
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    marginTop: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    color: "#757B85",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerPlaceholder: {
    width: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#B9C4D8",
    fontSize: 16,
    fontWeight: "600",
  },
  phoneSelectContainer: {
    marginTop: 12,
    position: "relative",
  },
  phoneSelect: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 140,
    justifyContent: "center",
  },
  phoneSelectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phonePrefix: {
    color: "#B0BACB",
    fontSize: 14,
    fontWeight: "600",
  },
  phoneInput: {
    color: "#FFFFFF",
    fontSize: 14,
    padding: 0,
    margin: 0,
    flex: 1,
  },
  networkIconContainer: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 10,
  },
  networkIconWrapper: {
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  networkDot: {
    minWidth: 22,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  networkLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },
  networkLogoFallback: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  networkLogoFallbackText: {
    color: "#E2E6F0",
    fontSize: 10,
    fontWeight: "700",
  },
  networkDotLabel: {
    color: "#0F1728",
    fontSize: 7.5,
    fontWeight: "800",
  },
  networkText: {
    color: "#E2E6F0",
    fontSize: 14,
    fontWeight: "600",
  },
  networkDropdown: {
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
    maxHeight: 220,
  },
  networkList: {
    maxHeight: 220,
  },
  networkOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  networkOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  networkOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  selectedNetworkOption: {
    backgroundColor: "#1C1C1C",
  },
  selectedNetworkOptionText: {
    color: "#4A9DFF",
    fontWeight: "600",
  },
  topUpSection: {
    marginTop: 24,
    gap: 12,
  },
  topUpGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  topUpCard: {
    width: "31%",
    minHeight: 82,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#262A33",
    backgroundColor: "#121419",
    paddingHorizontal: 6,
    paddingVertical: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedTopUpCard: {
    borderColor: "#34D058",
    backgroundColor: "#1A2230",
  },
  cashbackBadge: {
    borderRadius: 6,
    backgroundColor: "#1B9C62",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cashbackLabel: {
    color: "#E8FFF2",
    fontSize: 12,
    fontWeight: "600",
  },
  topUpAmount: {
    color: "#E3E9F5",
    fontSize: 18,
    fontWeight: "700",
  },
  amountCard: {
    marginTop: 20,
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
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 13,
    height: 13,
  },
  amountSubValue: {
    marginTop: 6,
    color: "#9DA7B9",
    fontSize: 16,
    fontWeight: "500",
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
    backgroundColor: "#0B4A9D",
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: "#EAF0FB",
    fontSize: 18,
    fontWeight: "600",
  },
});
