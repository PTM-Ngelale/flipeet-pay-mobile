import { useToken } from "@/app/contexts/TokenContext";
import { AppDispatch, RootState } from "@/app/store";
import { fundWallet } from "@/app/store/transactionSlice";
import BaseIcon from "@/assets/images/base-icon.svg";
import BinanceIcon from "@/assets/images/binance-icon.svg";
import QrCodeIcon from "@/assets/images/qr-code-icon.svg";
import ReceiveUserIcon from "@/assets/images/receive-user-icon.svg";
import SolanaIcon from "@/assets/images/solana-icon.svg";
import WalletIcon from "@/assets/images/wallet-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

// Supported networks with their icons
const NETWORK_CONFIG: {
  [key: string]: { icon: React.ComponentType<any>; displayName: string };
} = {
  Solana: { icon: SolanaIcon, displayName: "Solana" },
  Base: { icon: BaseIcon, displayName: "Base" },
  Binance: { icon: BinanceIcon, displayName: "Binance" },
};

const SUPPORTED_NETWORKS = ["Solana", "Base", "Binance"];

const CustomDropdown = ({
  title,
  icon,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <TouchableOpacity onPress={onToggle} style={styles.dropdownContainer}>
    <View style={styles.dropdownHeader}>
      <View style={styles.dropdownHeaderLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.dropdownTitle}>{title}</Text>
      </View>
      <Ionicons
        name={isExpanded ? "chevron-up" : "chevron-down"}
        size={24}
        color="#4A9DFF"
      />
    </View>

    {/* Dropdown Content */}
    {isExpanded && <View style={styles.dropdownContent}>{children}</View>}
  </TouchableOpacity>
);

const CustomDropdownItem = ({
  icon,
  title,
  subtitle,
  itemId,
  data,
  showQR = false,
  copiedItem,
  onCopy,
  onShowQR,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  itemId: string;
  data: string;
  showQR?: boolean;
  copiedItem: string | null;
  onCopy: (text: string, itemId: string) => void;
  onShowQR: (data: string) => void;
}) => {
  return (
    <View style={styles.dropdownItem}>
      <View style={styles.dropdownItemLeft}>
        {icon}
        <View style={styles.dropdownItemText}>
          <Text style={styles.dropdownItemTitle}>{title}</Text>
          <View style={styles.dropdownItemSubtitle}>
            {copiedItem === itemId ? (
              <>
                <Ionicons name="checkmark" size={16} color="#4A9DFF" />
                <Text style={styles.copiedText}>Copied</Text>
              </>
            ) : (
              <Text style={styles.dropdownItemSubtitleText}>{subtitle}</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.dropdownItemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onCopy(data, itemId)}
        >
          <Ionicons
            name="copy-outline"
            size={20}
            color={copiedItem === itemId ? "#4A9DFF" : "#757B85"}
          />
        </TouchableOpacity>
        {showQR && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShowQR(data)}
          >
            <QrCodeIcon />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function ReceiveScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedToken } = useToken();
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(
    new Set(),
  );
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [walletAddresses, setWalletAddresses] = useState<{
    [key: string]: string;
  }>({});
  const [loadingNetwork, setLoadingNetwork] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  // Memoized functions
  const toggleDropdown = useCallback((dropdownName: string) => {
    setExpandedDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dropdownName)) {
        newSet.delete(dropdownName);
      } else {
        newSet.add(dropdownName);
      }
      return newSet;
    });
  }, []);

  // Fetch wallet address for a network
  const fetchWalletAddress = useCallback(
    async (network: string) => {
      if (!token) {
        Alert.alert("Error", "Please log in to view wallet addresses");
        return;
      }

      const normalizeNetwork = (value: string) => {
        const normalized = (value || "").toLowerCase().replace(/\s+/g, "-");
        if (
          normalized === "binance" ||
          normalized === "bnb" ||
          normalized === "bsc" ||
          normalized === "bnb-chain" ||
          normalized === "bnb-smart-chain"
        ) {
          return "bnb-smart-chain";
        }
        return normalized;
      };

      // Check if already cached
      if (walletAddresses[network]) return;

      try {
        setLoadingNetwork(network);
        const result = await dispatch(
          fundWallet({ network: normalizeNetwork(network) }),
        );

        if (fundWallet.fulfilled.match(result)) {
          const data = result.payload as any;
          setWalletAddresses((prev) => ({
            ...prev,
            [network]: data.walletAddress || data.address || "N/A",
          }));
        } else {
          Alert.alert(
            "Error",
            "Failed to load wallet address. Please try again.",
          );
        }
      } catch (error) {
        console.error("Error fetching wallet address:", error);
        Alert.alert("Error", "Failed to load wallet address");
      } finally {
        setLoadingNetwork(null);
      }
    },
    [dispatch, token, walletAddresses],
  );

  // Load wallet addresses when dropdown expands
  const handleWalletDropdownToggle = useCallback(
    (dropdownName: string) => {
      toggleDropdown(dropdownName);

      // Fetch addresses for all supported networks when wallet dropdown opens
      if (dropdownName === "wallet" && !expandedDropdowns.has("wallet")) {
        SUPPORTED_NETWORKS.forEach((network) => {
          if (!walletAddresses[network]) {
            fetchWalletAddress(network);
          }
        });
      }
    },
    [toggleDropdown, expandedDropdowns, walletAddresses, fetchWalletAddress],
  );

  const truncateAddress = useCallback((address: string, type?: string) => {
    if (address.length <= 16) return address;

    if (type === "base") {
      return `${address.slice(0, 6)}...${address.slice(-5)}`;
    } else if (type === "binance") {
      return `${address.slice(0, 6)}...${address.slice(-5)}`;
    } else {
      // Default to Solana truncation
      return `${address.slice(0, 5)}...${address.slice(-5)}`;
    }
  }, []);

  const truncateEmail = useCallback((email: string) => {
    const [username, domain] = email.split("@");
    const [domainName, tld] = domain.split(".");

    if (username.length <= 3) return email;

    return `${username.slice(0, 3)}...@${domainName.slice(0, 0)}...${tld}`;
  }, []);

  // Copy to clipboard function with visual feedback
  const copyToClipboard = useCallback(async (text: string, itemId: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedItem(itemId);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  }, []);

  // Navigate to QR page
  const showQRCode = useCallback(
    (data: string, network?: string) => {
      router.push({
        pathname: "/qr-screen",
        params: { qrData: data, network },
      });
    },
    [router],
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receive</Text>
          <View style={{ opacity: 0 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </View>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.content}>
            {/* Wallet Address Dropdown */}
            <CustomDropdown
              title="Receive to Wallet Address"
              icon={<WalletIcon />}
              isExpanded={expandedDropdowns.has("wallet")}
              onToggle={() => handleWalletDropdownToggle("wallet")}
            >
              {loadingNetwork ? (
                <View
                  style={{
                    padding: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="#4A9DFF" />
                  <Text style={{ color: "#B0BACB", marginTop: 12 }}>
                    Loading wallet addresses...
                  </Text>
                </View>
              ) : (
                SUPPORTED_NETWORKS.map((network) => {
                  const NetworkIcon =
                    NETWORK_CONFIG[network]?.icon || SolanaIcon;
                  const address = walletAddresses[network] || "N/A";

                  return (
                    <CustomDropdownItem
                      key={network}
                      icon={<NetworkIcon />}
                      title={network}
                      subtitle={truncateAddress(address, network.toLowerCase())}
                      itemId={network.toLowerCase()}
                      data={address}
                      showQR={address !== "N/A"}
                      copiedItem={copiedItem}
                      onCopy={copyToClipboard}
                      onShowQR={(value) => showQRCode(value, network)}
                    />
                  );
                })
              )}
            </CustomDropdown>

            {/* Flipeet User Dropdown */}
            <CustomDropdown
              title="Receive from Flipeet user"
              icon={<ReceiveUserIcon />}
              isExpanded={expandedDropdowns.has("flipeet")}
              onToggle={() => toggleDropdown("flipeet")}
            >
              <CustomDropdownItem
                title="Email"
                subtitle={truncateEmail(user?.email || "your@email.com")}
                itemId="email"
                data={user?.email || ""}
                copiedItem={copiedItem}
                onCopy={copyToClipboard}
                onShowQR={showQRCode}
              />
              <CustomDropdownItem
                title="Username"
                subtitle={user?.username || "@username"}
                itemId="username"
                data={user?.username || ""}
                copiedItem={copiedItem}
                onCopy={copyToClipboard}
                onShowQR={showQRCode}
              />
            </CustomDropdown>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 0,
  },
  headerTitle: {
    color: "#757B85",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerPlaceholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    marginTop: 40,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    flexDirection: "column",
    gap: 20,
  },
  dropdownContainer: {
    backgroundColor: "#1C1C1C",
    borderRadius: 10,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 65,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dropdownHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    backgroundColor: "black",
    padding: 8,
    borderRadius: 20,
  },
  dropdownTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownContent: {
    paddingHorizontal: 10,
    paddingBottom: 16,
    flexDirection: "column",
    gap: 20,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownItemText: {
    flex: 1,
    marginLeft: 12,
  },
  dropdownItemTitle: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  dropdownItemSubtitle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dropdownItemSubtitleText: {
    color: "#E2E6F0",
    fontSize: 14,
  },
  copiedText: {
    color: "#4A9DFF",
    fontSize: 14,
    marginLeft: 4,
  },
  dropdownItemActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "black",
    padding: 8,
    borderRadius: 20,
  },
});
