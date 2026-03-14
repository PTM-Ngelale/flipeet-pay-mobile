import UsdcToNgn from "@/assets/images/usdc-ngn.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface ActivityDetails {
  id: string;
  type: "swap" | "received" | "sent";
  title: string;
  description: string;
  amount: string;
  secondaryAmount?: string;
  icon: any;
  date: string;
  time: string;
  amountColor: string;
  status: "successful" | "pending" | "failed";
  network: string;
  networkIcon: any;
  currencyIcon: any;
  transactionHash: string;
  recipient?: string;
  sender?: string;
  transactionFee: string;
  totalValue: string;
  referenceId: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  transactionHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    padding: 24,
  },
  transactionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  transactionIconContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  transactionIcon: {
    width: 86,
    height: 86,
  },
  transactionTitle: {
    color: "#B0BACB",
    fontWeight: "bold",
  },
  transactionDetails: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 10,
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    color: "#757B85",
    fontSize: 16,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    marginRight: 4,
  },
  networkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  networkContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  networkIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  networkText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
  },
  referenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  downloadButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#4A9DFF",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  helpSection: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    marginTop: 20,
  },
  helpText: {
    color: "#E2E6F0",
  },
  helpLink: {
    color: "#4A9DFF",
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  backButton: {
    marginTop: 16,
    backgroundColor: "#4A9DFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  spacer: {
    width: 24,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  amountIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
});

// Mock data
const ACTIVITY_DETAILS: { [key: string]: ActivityDetails } = {
  "1": {
    id: "1",
    type: "swap",
    title: "Swap successful",
    description: "USDC to NGN",
    amount: "-100 USDC",
    secondaryAmount: "+ N142,500",
    icon: require("@/assets/images/bnb-chain.png"),
    date: "June 9",
    time: "14:30pm",
    amountColor: "#757B85",
    status: "successful",
    network: "BNB Chain",
    networkIcon: require("@/assets/images/solana.png"),
    currencyIcon: require("@/assets/images/usdc.png"),
    transactionHash: "0x7afm3829jf74h58392d5dMM3928dn23",
    recipient: "0x893a74bC2837f29c7f2E",
    transactionFee: "0.001 BNB ($0.35)",
    totalValue: "$100.35",
    referenceId: "REF-789012",
  },
  "2": {
    id: "2",
    type: "received",
    title: "Received",
    description: "From 7afm...5dMM",
    amount: "+360 USDC",
    icon: require("@/assets/images/bnb-chain.png"),
    date: "June 9",
    time: "12:15pm",
    amountColor: "#34D058",
    status: "successful",
    network: "BNB Chain",
    networkIcon: require("@/assets/images/bnb-chain.png"),
    currencyIcon: require("@/assets/images/usdc.png"),
    transactionHash: "0x8bcn4830kg85i69303e6eNN4939eo34",
    sender: "0x7afm3829jf74h58392d5dMM3928",
    transactionFee: "0.0008 BNB ($0.28)",
    totalValue: "$360.00",
    referenceId: "REF-345678",
  },
  "3": {
    id: "3",
    type: "sent",
    title: "Sent",
    description: "To 7afm...5dMM",
    amount: "-60 USDC",
    icon: require("@/assets/images/bnb-chain.png"),
    date: "June 2",
    time: "16:45pm",
    amountColor: "#757B85",
    status: "successful",
    network: "BNB Chain",
    networkIcon: require("@/assets/images/bnb-chain.png"),
    currencyIcon: require("@/assets/images/usdc.png"),
    transactionHash: "0x9cdo5941lh96j70414f7fOO5040fp45",
    recipient: "0x7afm3829jf74h58392d5dMM3928",
    transactionFee: "0.0012 BNB ($0.42)",
    totalValue: "$60.42",
    referenceId: "REF-901234",
  },
  "4": {
    id: "4",
    type: "swap",
    title: "Swap successful",
    description: "USDT to USDC",
    amount: "-200 USDT",
    secondaryAmount: "+100 USDC",
    icon: require("@/assets/images/bnb-chain.png"),
    date: "June 2",
    time: "10:20 AM",
    amountColor: "#757B85",
    status: "pending",
    network: "BNB Chain",
    networkIcon: require("@/assets/images/bnb-chain.png"),
    currencyIcon: require("@/assets/images/usdc.png"),
    transactionHash: "0xadep6052mi07k81525g8gPP6151gq56",
    transactionFee: "0.0015 BNB ($0.53)",
    totalValue: "$200.53",
    referenceId: "REF-567890",
  },
};

export default function ActivityDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const activity = ACTIVITY_DETAILS[id || "1"];

  // Copy to clipboard function with visual feedback
  const copyToClipboard = async (text: string, itemId: string) => {
    console.log("Copied to clipboard:", text);
    setCopiedItem(itemId);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

  if (!activity) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Activity not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  // Helper function to truncate address
  const truncateAddress = (address: string) => {
    if (!address) return "N/A";
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
        return "#34D058";
      case "pending":
        return "#FFB800";
      case "failed":
        return "#FF3B30";
      default:
        return "#757B85";
    }
  };

  // Download receipt function
  const downloadReceipt = () => {
    console.log("Downloading receipt for:", activity.id);
  };

  // Contact support function
  const contactSupport = () => {
    console.log("Contacting support for transaction:", activity.id);
  };

  // Header Component
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Transaction Details</Text>
      <View style={styles.spacer} />
    </View>
  );

  // Detail Row Component
  const DetailRow = ({
    label,
    value,
    copyable = false,
    valueColor = "#FFFFFF",
    icon,
  }: {
    label: string;
    value: string;
    copyable?: boolean;
    valueColor?: string;
    icon?: any;
  }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Image source={icon} style={{ width: 18, height: 18 }} />
          <Text style={[styles.detailValue, { color: valueColor }]}>
            {value}
          </Text>
        </View>
        {copyable && (
          <TouchableOpacity
            onPress={() => copyToClipboard(value, "referenceId")}
          >
            <Ionicons name="copy-outline" size={16} color="#757B85" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Status Row Component with Checkmark
  const StatusRow = () => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>Status</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          backgroundColor: "#3886655C",
          padding: 2,
          borderRadius: 4,
        }}
      >
        {activity.status === "successful" && (
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={getStatusColor(activity.status)}
            style={{ marginRight: 6 }}
          />
        )}
        {activity.status === "pending" && (
          <Ionicons
            name="time-outline"
            size={16}
            color={getStatusColor(activity.status)}
            style={{ marginRight: 6 }}
          />
        )}
        {activity.status === "failed" && (
          <Ionicons
            name="close-circle"
            size={16}
            color={getStatusColor(activity.status)}
            style={{ marginRight: 6 }}
          />
        )}
        <Text
          style={[
            styles.detailValue,
            { color: getStatusColor(activity.status) },
          ]}
        >
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Header />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Transaction Header */}
          <View style={styles.transactionHeader}>
            <View style={styles.transactionHeaderContent}>
              <View style={styles.transactionIconContainer}>
                {/* <Image
                  source={activity.icon}
                  resizeMode="contain"
                  style={styles.transactionIcon}
                /> */}
                <UsdcToNgn />
                <Text style={styles.transactionTitle}>Sell [USDC - NGN]</Text>
              </View>
            </View>
          </View>

          {/* Transaction Details */}
          <View style={styles.transactionDetails}>
            {/* Date and Time */}
            <DetailRow
              label="Date"
              value={`${activity.date} | ${activity.time}`}
            />

            {/* Status with Checkmark */}
            <StatusRow />

            <DetailRow
              icon={activity.currencyIcon}
              label="Amount"
              value={`${activity.amount} `}
            />

            {/* Transaction Fee */}
            <DetailRow
              label="Transaction Fee"
              value={activity.transactionFee}
            />

            {/* Total Value */}
            <DetailRow label="Total Value" value={activity.totalValue} />

            {/* Network */}
            <View style={styles.networkRow}>
              <Text style={[styles.detailLabel, { fontSize: 14 }]}>
                Network
              </Text>
              <View style={styles.networkContainer}>
                <Image
                  source={activity.networkIcon}
                  style={styles.networkIcon}
                />
                <Text style={styles.networkText}>{activity.network}</Text>
              </View>
            </View>

            {/* Recipient/Sender */}
            {activity.recipient && (
              <DetailRow
                label="Recipient"
                value={truncateAddress(activity.recipient)}
                copyable={false}
              />
            )}
            {activity.sender && (
              <DetailRow
                label="Sender"
                value={truncateAddress(activity.sender)}
                copyable={false}
              />
            )}

            {/* Reference ID with Copy Feedback and Checkmark */}
            <View style={styles.referenceRow}>
              <Text style={styles.detailLabel}>Reference ID</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "flex-end",
                }}
              >
                {copiedItem === "referenceId" && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#4A9DFF"
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color:
                        copiedItem === "referenceId" ? "#4A9DFF" : "#FFFFFF",
                    },
                  ]}
                >
                  {copiedItem === "referenceId"
                    ? "Copied"
                    : activity.referenceId}
                </Text>
                {!copiedItem && (
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(activity.referenceId, "referenceId")
                    }
                  >
                    <Ionicons name="copy-outline" size={16} color="#757B85" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Download Receipt Button */}
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={downloadReceipt}
          >
            <Text style={styles.downloadButtonText}>Download Receipt</Text>
          </TouchableOpacity>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpText}>Need help? </Text>
            <TouchableOpacity onPress={contactSupport}>
              <Text style={styles.helpLink}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
