import QrCodeIcon from "@/assets/images/qr-code-icon.svg";
import ReceiveUserIcon from "@/assets/images/receive-user-icon.svg";
import SolanaIcon from "@/assets/images/solana-icon.svg";
import WalletIcon from "@/assets/images/wallet-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Constants
const WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b8D";
const USER_EMAIL = "preciousngelale@gmail.com";
const USERNAME = "@ptm.ng";

// Custom Dropdown Components
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
            {/* <Image
              source={require("@/assets/images/qr-icon.png")}
              style={{ width: 20, height: 20 }}
            /> */}
            <QrCodeIcon />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function ReceiveScreen() {
  const router = useRouter();
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(
    new Set()
  );
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

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

  const truncateAddress = useCallback((address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }, []);

  const truncateEmail = useCallback((email: string) => {
    const [username, domain] = email.split("@");
    if (username.length <= 8) return email;
    return `${username.slice(0, 8)}...@${domain}`;
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
    (data: string) => {
      router.push({
        pathname: "/qr-screen",
        params: { qrData: data },
      });
    },
    [router]
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
              icon={
                // <Image
                //   source={require("@/assets/images/wallet-icon.png")}
                //   style={{ width: 28, height: 28 }}
                // />
                <WalletIcon />
              }
              isExpanded={expandedDropdowns.has("wallet")}
              onToggle={() => toggleDropdown("wallet")}
            >
              <CustomDropdownItem
                icon={
                  // <Image
                  //   source={require("@/assets/images/solana.png")}
                  //   style={{ width: 32, height: 32 }}
                  // />
                  <SolanaIcon />
                }
                title="Solana"
                subtitle={truncateAddress(WALLET_ADDRESS)}
                itemId="solana1"
                data={WALLET_ADDRESS}
                showQR={true}
                copiedItem={copiedItem}
                onCopy={copyToClipboard}
                onShowQR={showQRCode}
              />
              <CustomDropdownItem
                icon={
                  // <Image
                  //   source={require("@/assets/images/solana.png")}
                  //   style={{ width: 32, height: 32 }}
                  // />
                  <SolanaIcon />
                }
                title="Base"
                subtitle={truncateAddress(WALLET_ADDRESS)}
                itemId="solana2"
                data={WALLET_ADDRESS}
                showQR={true}
                copiedItem={copiedItem}
                onCopy={copyToClipboard}
                onShowQR={showQRCode}
              />
            </CustomDropdown>

            {/* Flipeet User Dropdown */}
            <CustomDropdown
              title="Receive from Flipeet user"
              icon={
                // <Image
                //   source={require("@/assets/images/receive-user-icon.png")}
                //   style={{ width: 28, height: 28 }}
                // />
                <ReceiveUserIcon />
              }
              isExpanded={expandedDropdowns.has("flipeet")}
              onToggle={() => toggleDropdown("flipeet")}
            >
              <CustomDropdownItem
                title="Email"
                subtitle={truncateEmail(USER_EMAIL)}
                itemId="email"
                data={USER_EMAIL}
                copiedItem={copiedItem}
                onCopy={copyToClipboard}
                onShowQR={showQRCode}
              />
              <CustomDropdownItem
                title="Username"
                subtitle={USERNAME}
                itemId="username"
                data={USERNAME}
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
