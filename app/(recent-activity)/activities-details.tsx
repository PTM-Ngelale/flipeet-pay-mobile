import BaseNet from "@/assets/images/networks/base.svg";
import BnbNet from "@/assets/images/networks/bnb.svg";
import SolanaNet from "@/assets/images/networks/solana.svg";
import { Header } from "@/components/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import { shareAsync } from "expo-sharing";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { convertPaymentAmount, getTransactionByTxRef } from "../constants/api";
import type { RootState } from "../store";

import USDCIcon from "@/assets/images/tokens/usdc.svg";
import USDTIcon from "@/assets/images/tokens/usdt.svg";

import ReceiveIcon from "@/assets/images/receive-icon.svg";
import SendIcon from "@/assets/images/send-icon.svg";
import AirtimeIcon from "@/assets/images/services-icons/airtime.svg";
import DataIcon from "@/assets/images/services-icons/data.svg";
import ElectricityIcon from "@/assets/images/services-icons/electricity.svg";
import SwapIcon from "@/assets/images/swap-icon.svg";

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
  activityIconWrapper: {
    width: 40,
    height: 40,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    zIndex: 1,
  },
  activityActionBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#111827",
    zIndex: 2,
  },
  activityNetworkBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#111827",
    zIndex: 2,
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

// Activity details are built dynamically from a fetched transaction or Redux state.

export default function ActivityDetailsScreen() {
  const router = useRouter();
  const { id, txRef } = useLocalSearchParams<{ id?: string; txRef?: string }>();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remoteTx, setRemoteTx] = useState<any | null>(null);
  const [nairaValue, setNairaValue] = useState<string | null>(null);
  const token = useSelector((s: RootState) => s.auth.token);
  const transactions = useSelector((s: RootState) => s.auth.transactions);

  // Resolve source transaction (remote fetch > redux store)
  const foundTx =
    (txRef &&
      (Array.isArray(transactions)
        ? transactions.find(
            (t: any) =>
              String(t.txRef || t.reference || t.id || t._id) === String(txRef),
          )
        : null)) ||
    (id &&
      (Array.isArray(transactions)
        ? transactions.find((t: any) => String(t.id || t._id) === String(id))
        : null));

  const sourceTx = remoteTx || foundTx || null;

  const formatDate = (v: any) => {
    if (!v) return "Unknown date";
    const n =
      typeof v === "number" || /^\\d+$/.test(String(v)) ? Number(v) : null;
    const d = n ? new Date(n < 1e12 ? n * 1000 : n) : new Date(String(v));
    if (Number.isNaN(d.getTime())) return "Unknown date";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (v: any) => {
    if (!v) return "";
    const n =
      typeof v === "number" || /^\d+$/.test(String(v)) ? Number(v) : null;
    const d = n ? new Date(n < 1e12 ? n * 1000 : n) : new Date(String(v));
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const hydrateActivity = (tx: any) => {
    if (!tx) return null;
    const rawDate =
      tx.createdAt ||
      tx.created_at ||
      tx.timestamp ||
      tx.time ||
      tx.date ||
      tx.processedAt ||
      tx.completedAt ||
      tx.created;
    const date = formatDate(rawDate);
    const time = formatTime(rawDate);
    const rawAmount = tx.amount != null ? tx.amount : tx.value || 0;
    const n = Number(rawAmount) || 0;
    const rounded = Number.isFinite(n)
      ? n < 0
        ? -Math.ceil(Math.abs(n))
        : Math.ceil(Math.abs(n))
      : n;
    const asset = tx.asset || tx.currency || tx.symbol || "";
    // icon and badges: pick token/network/action icons similar to RecentActivity
    const tokenIconMap: Record<string, React.ComponentType<any>> = {
      usdc: USDCIcon,
      usdt: USDTIcon,
    };

    const networkIconMap: Record<string, React.ComponentType<any>> = {
      solana: SolanaNet,
      base: BaseNet,
      "bnb-smart-chain": BnbNet,
      bnb: BnbNet,
    };
    const amountStr = `${rounded}${asset ? ` ${asset}` : ""}`.trim();
    // determine main icon (token icon) and badges/action icons
    let mainIcon: any = tx.icon || null;

    const typeStr = String(tx.type || tx.transactionType || "").toLowerCase();
    const metadata = tx.metadata || tx.meta || {};
    const productStr = String(
      tx.product || tx.service || metadata.service || metadata.product || "",
    ).toLowerCase();

    // Service icons take priority over token icons
    if (typeStr.includes("airtime") || productStr.includes("airtime")) {
      mainIcon = AirtimeIcon;
    } else if (typeStr.includes("data") || productStr.includes("data")) {
      mainIcon = DataIcon;
    } else if (
      typeStr.includes("electricity") ||
      productStr.includes("electricity") ||
      tx.biller
    ) {
      mainIcon = ElectricityIcon;
    } else {
      try {
        mainIcon =
          tokenIconMap[(String(asset) || "").toLowerCase()] || mainIcon;
      } catch (e) {
        /* ignore */
      }
    }
    let actionIcon: any = null;
    let badgeIcon: any = null;

    if (typeStr.includes("bridge")) {
      actionIcon = SwapIcon;
      badgeIcon =
        networkIconMap[
          String(tx.toNetwork || tx.to_network || tx.to || "").toLowerCase()
        ] || null;
    } else if (typeStr.includes("swap") || typeStr.includes("exchange")) {
      actionIcon = SwapIcon;
      badgeIcon =
        tokenIconMap[String(tx.toAsset || tx.toCurrency || "").toLowerCase()] ||
        null;
    } else if (typeStr.includes("sell") || typeStr.includes("offramp")) {
      actionIcon = SendIcon;
      badgeIcon =
        networkIconMap[String(tx.network || "").toLowerCase()] || null;
    } else {
      // infer incoming/outgoing
      const directionRaw = String(
        tx.direction ||
          tx.flow ||
          tx.side ||
          tx.entryType ||
          tx.transactionDirection ||
          "",
      ).toLowerCase();
      const isOutgoingByType =
        typeStr.includes("send") ||
        typeStr.includes("sent") ||
        typeStr.includes("withdrawal") ||
        typeStr.includes("debit") ||
        typeStr.includes("transfer_out");
      const isIncomingByType =
        typeStr.includes("receive") ||
        typeStr.includes("received") ||
        typeStr.includes("deposit") ||
        typeStr.includes("credit") ||
        typeStr.includes("onramp") ||
        typeStr.includes("transfer_in");
      const isOutgoingByDirection =
        directionRaw.includes("out") ||
        directionRaw.includes("debit") ||
        directionRaw.includes("withdraw");
      const isIncomingByDirection =
        directionRaw.includes("in") ||
        directionRaw.includes("credit") ||
        directionRaw.includes("deposit");

      const isOutgoing =
        (isOutgoingByType && !isIncomingByType) || isOutgoingByDirection;
      const isIncoming =
        (isIncomingByType && !isOutgoingByType) || isIncomingByDirection;

      if (isOutgoing) {
        actionIcon = SendIcon;
        badgeIcon =
          networkIconMap[String(tx.network || "").toLowerCase()] || null;
      } else if (isIncoming) {
        actionIcon = ReceiveIcon;
        badgeIcon =
          networkIconMap[String(tx.network || "").toLowerCase()] || null;
      }
    }

    return {
      id: tx.id || tx._id || tx.transactionId || String(txRef || id || ""),
      type: typeStr,
      title:
        tx.title || tx.description || tx.product || tx.service || "Transaction",
      description: tx.description || tx.note || tx.memo || "",
      amount: amountStr,
      secondaryAmount: tx.secondaryAmount || tx.toAmount || tx.fiatAmount,
      icon: mainIcon || require("@/assets/images/bnb-chain.png"),
      date,
      time,
      amountColor: tx.amountColor || "#757B85",
      status:
        tx.status ||
        (tx.successful ? "successful" : tx.pending ? "pending" : "failed"),
      network: tx.network || tx.networkName || "",
      networkIcon: tx.networkIcon || require("@/assets/images/bnb-chain.png"),
      currencyIcon: tx.currencyIcon || require("@/assets/images/usdc.png"),
      transactionHash: tx.transactionHash || tx.hash || "",
      recipient:
        tx.recipient || tx.to || tx.toAddress || tx.beneficiary || tx.msisdn,
      sender: tx.sender || tx.from || tx.fromAddress,
      transactionFee: tx.fee || tx.transactionFee || "",
      totalValue: tx.totalValue || tx.settledAmount || "",
      referenceId:
        tx.txRef || tx.tx_ref || tx.reference || tx.referenceId || tx.id || "",
      raw: tx,
      actionIcon,
      badgeIcon,
    };
  };

  const activity = hydrateActivity(sourceTx);
  useEffect(() => {
    let mounted = true;
    const fetchTx = async () => {
      const authToken = String(token ?? "").trim();
      if (
        !txRef ||
        !authToken ||
        authToken === "undefined" ||
        authToken === "null" ||
        authToken.length < 10
      )
        return;
      setLoading(true);
      try {
        const res = await getTransactionByTxRef(String(txRef), authToken);
        const data = res?.data || res || null;
        if (mounted) setRemoteTx(data);
      } catch (e) {
        console.log("Failed to fetch transaction by txRef", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTx();

    return () => {
      mounted = false;
    };
  }, [txRef, token]);

  useEffect(() => {
    let mounted = true;
    const resolveNaira = async () => {
      const raw = sourceTx;
      if (!raw) return;
      // Prefer explicit fields from backend
      const explicit =
        raw.totalValue || raw.fiatAmount || raw.settledAmount || raw.fiat_value;
      if (explicit) {
        if (mounted) setNairaValue(String(explicit));
        return;
      }

      // Attempt server-side conversion if amount and asset available
      const amt =
        raw.amount != null ? Number(raw.amount) : Number(raw.value || 0);
      const asset = raw.asset || raw.currency || raw.symbol || "";
      const assetStr = String(asset ?? "").trim();
      const assetLower = assetStr.toLowerCase();
      if (
        !Number.isFinite(amt) ||
        !assetStr ||
        assetLower === "undefined" ||
        assetLower === "null" ||
        assetLower === "" ||
        !["usdc", "usdt"].includes(assetLower)
      )
        return;

      try {
        const res = await convertPaymentAmount({
          amount: Math.abs(amt),
          asset: assetStr,
          currency: "NGN",
        }, token);
        const d = res?.data || res || null;
        const value = d?.converted || d?.amount || d?.fiatAmount || null;
        if (mounted && value) setNairaValue(String(value));
      } catch (e) {
        console.log("Failed to convert to NGN", e);
      }
    };

    resolveNaira();
    return () => {
      mounted = false;
    };
  }, [sourceTx]);

  // Copy to clipboard function with visual feedback
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await Clipboard.setStringAsync(String(text));
    } catch (e) {
      console.log("Clipboard error", e);
    }
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

  const truncateRef = (ref: string) => {
    if (!ref) return "N/A";
    const s = String(ref);
    if (s.length <= 12) return s;
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
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

  // Download / Generate PDF receipt
  const downloadReceipt = async () => {
    if (!activity) return;

    const statusColor =
      activity.status === "successful"
        ? "#34D058"
        : activity.status === "pending"
          ? "#FFB800"
          : "#FF3B30";

    const rows = [
      ["Date", activity.date],
      ["Time", activity.time],
      [
        "Status",
        activity.status.charAt(0).toUpperCase() + activity.status.slice(1),
      ],
      ["Amount", activity.amount],
      ...(activity.secondaryAmount
        ? [["Secondary Amount", activity.secondaryAmount]]
        : []),
      ...(activity.network ? [["Network", activity.network]] : []),
      ...(activity.recipient ? [["Recipient", activity.recipient]] : []),
      ...(activity.sender ? [["Sender", activity.sender]] : []),
      ...(activity.transactionFee ? [["Fee", activity.transactionFee]] : []),
      ...(activity.totalValue ? [["Total Value", activity.totalValue]] : []),
      ...(nairaValue ? [["NGN Value", `₦${nairaValue}`]] : []),
      ["Reference ID", activity.referenceId],
      ...(activity.transactionHash
        ? [["Tx Hash", activity.transactionHash]]
        : []),
    ];

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: #fff; color: #111; padding: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #4A9DFF; margin-bottom: 4px; }
            .subtitle { font-size: 13px; color: #757B85; margin-bottom: 32px; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; }
            tr:nth-child(even) { background: #F7F8FA; }
            td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #E5E7EB; }
            td:first-child { color: #757B85; width: 40%; }
            td:last-child { font-weight: 600; color: #111; text-align: right; }
            .status { color: ${statusColor}; }
            .footer { margin-top: 40px; font-size: 12px; color: #9CA3AF; text-align: center; }
          </style>
        </head>
        <body>
          <div class="logo">Flipeet Pay</div>
          <div class="subtitle">Transaction Receipt</div>
          <div class="title">${activity.title}</div>
          <table>
            ${rows
              .map(
                ([label, value]) =>
                  `<tr>
                    <td>${label}</td>
                    <td class="${label === "Status" ? "status" : ""}">${value}</td>
                  </tr>`,
              )
              .join("")}
          </table>
          <div class="footer">Generated by Flipeet Pay · ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Receipt",
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      console.log("Receipt generation failed", e);
    }
  };
  // Contact support: opens mail app with transaction prefilled
  const contactSupport = () => {
    try {
      const email = "support@flipeet.com";
      const subject = encodeURIComponent(
        `Support request: transaction ${activity.id}`,
      );
      const body = encodeURIComponent(
        `I need help with transaction ${activity.id}`,
      );
      Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
    } catch (e) {
      console.log("Failed to open mail app", e);
    }
  };
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
          <TouchableOpacity onPress={() => copyToClipboard(value, label)}>
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
      {(() => {
        const s = activity.status;
        let bg = "#3886655C";
        let textColor = "#FFFFFF";
        let iconName: any = null;

        if (s === "successful") {
          bg = "#34D058"; // success background
          textColor = "#E2E6F0"; // success text
          iconName = "checkmark-circle";
        } else if (s === "pending") {
          bg = "#FFB800"; // pending background
          textColor = "#0B1220"; // pending text (dark)
          iconName = "time-outline";
        } else if (s === "failed") {
          bg = "#FF3B30"; // failed background
          textColor = "#E2E6F0"; // failed text
          iconName = "close-circle";
        }

        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              backgroundColor: bg,
              padding: 6,
              borderRadius: 6,
            }}
          >
            {iconName && (
              <Ionicons
                name={iconName}
                size={16}
                color={textColor}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={[styles.detailValue, { color: textColor }]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </View>
        );
      })()}
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Header
          title="Transaction Details"
          // rightComponent={(() => {
          //   const HeaderRight = () => {
          //     if (!activity) return <View style={{ width: 24 }} />;
          //     return (
          //       <View
          //         style={{
          //           width: 36,
          //           height: 36,
          //           position: "relative",
          //           alignItems: "center",
          //           justifyContent: "center",
          //         }}
          //       >
          //         {typeof activity.icon === "function" ? (
          //           // @ts-ignore
          //           <activity.icon width={24} height={24} />
          //         ) : (
          //           <Image
          //             source={activity.icon}
          //             style={{ width: 24, height: 24 }}
          //             resizeMode="contain"
          //           />
          //         )}

          //         {activity.actionIcon ? (
          //           <View
          //             style={{
          //               position: "absolute",
          //               right: -4,
          //               top: -4,
          //               width: 16,
          //               height: 16,
          //               borderRadius: 16,
          //               backgroundColor: "#0B1220",
          //               alignItems: "center",
          //               justifyContent: "center",
          //               borderWidth: 1,
          //               borderColor: "#111827",
          //               zIndex: 3,
          //             }}
          //           >
          //             {typeof activity.actionIcon === "function" ? (
          //               // @ts-ignore
          //               <activity.actionIcon width={10} height={10} />
          //             ) : (
          //               <Image
          //                 source={activity.actionIcon}
          //                 style={{ width: 10, height: 10 }}
          //                 resizeMode="contain"
          //               />
          //             )}
          //           </View>
          //         ) : null}

          //         {activity.badgeIcon ? (
          //           <View
          //             style={{
          //               position: "absolute",
          //               right: -4,
          //               bottom: -4,
          //               width: 14,
          //               height: 14,
          //               borderRadius: 14,
          //               backgroundColor: "#0B1220",
          //               alignItems: "center",
          //               justifyContent: "center",
          //               borderWidth: 1,
          //               borderColor: "#111827",
          //               zIndex: 3,
          //             }}
          //           >
          //             {typeof activity.badgeIcon === "function" ? (
          //               // @ts-ignore
          //               <activity.badgeIcon width={10} height={10} />
          //             ) : (
          //               <Image
          //                 source={activity.badgeIcon}
          //                 style={{ width: 10, height: 10 }}
          //                 resizeMode="contain"
          //               />
          //             )}
          //           </View>
          //         ) : null}
          //       </View>
          //     );
          //   };

          //   return <HeaderRight />;
          // })()}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Transaction Header */}
          <View style={styles.transactionHeader}>
            <View style={styles.transactionHeaderContent}>
              <View style={styles.transactionIconContainer}>
                <View style={styles.activityIconWrapper}>
                  {typeof activity.icon === "function" ? (
                    // @ts-ignore - dynamic SVG component
                    <activity.icon width={28} height={28} />
                  ) : (
                    <Image
                      source={activity.icon}
                      style={styles.activityIcon}
                      resizeMode="contain"
                    />
                  )}
                  {activity.actionIcon ? (
                    <View style={styles.activityActionBadge}>
                      {typeof activity.actionIcon === "function" ? (
                        // @ts-ignore - dynamic SVG component
                        <activity.actionIcon width={10} height={10} />
                      ) : (
                        <Image
                          source={activity.actionIcon}
                          style={{ width: 10, height: 10 }}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  ) : null}
                  {activity.badgeIcon ? (
                    <View style={styles.activityNetworkBadge}>
                      {typeof activity.badgeIcon === "function" ? (
                        // @ts-ignore - dynamic SVG component
                        <activity.badgeIcon width={10} height={10} />
                      ) : (
                        <Image
                          source={activity.badgeIcon}
                          style={{ width: 10, height: 10 }}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  ) : null}
                </View>
                <Text style={styles.transactionTitle}>
                  {activity?.title || "Transaction"}
                </Text>
              </View>
            </View>
          </View>

          {/* Transaction Details */}
          <View style={styles.transactionDetails}>
            {/* Date and Time */}
            <DetailRow label="Date" value={activity.date} />
            <DetailRow label="Time" value={activity.time} />

            {/* Status with Checkmark */}
            <StatusRow />

            <DetailRow
              icon={activity.currencyIcon}
              label="Amount"
              value={`${activity.amount} `}
            />

            {/* Transaction Fee and Total Value hidden temporarily */}

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
                    : truncateRef(activity.referenceId)}
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

          {/* If remote transaction contains a meter token/voucher, show it */}
          {remoteTx &&
            (() => {
              const possibleToken =
                remoteTx.token ||
                remoteTx.voucher ||
                remoteTx.meterToken ||
                remoteTx.pin ||
                remoteTx.voucherCode ||
                remoteTx.voucher_pin ||
                remoteTx.voucher_code ||
                remoteTx?.metadata?.token ||
                remoteTx?.data?.token ||
                null;

              if (!possibleToken) return null;

              return (
                <View style={{ marginTop: 12 }}>
                  <DetailRow
                    label="Meter Token"
                    value={String(possibleToken)}
                    copyable={true}
                  />
                </View>
              );
            })()}

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
