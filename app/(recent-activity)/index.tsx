import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchTransactions } from "../store/authSlice";

// Types
interface Activity {
  id: string;
  txRef?: string;
  type: "swap" | "received" | "sent" | "bridge";
  title: string;
  description: string;
  amount: string;
  secondaryAmount?: string;
  icon: any;
  date: string;
  time: string;
  amountColor: string;
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
  scrollView: {
    flex: 1,
    marginTop: 40,
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateText: {
    color: "#757B85",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  focusedActivityItem: {
    borderWidth: 1,
    borderColor: "#4A9DFF",
    backgroundColor: "#202736",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "bold",
  },
  activityDescription: {
    color: "#E2E6F0",
    fontSize: 14,
    fontWeight: "400",
    marginTop: 4,
  },
  activityDate: {
    color: "#757B85",
    fontSize: 12,
    marginTop: 4,
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  activitySecondaryAmount: {
    color: "#34D058",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateText: {
    color: "#757B85",
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    color: "#757B85",
    textAlign: "center",
    marginTop: 8,
  },
  spacer: {
    width: 24,
  },
});

export default function RecentActivity() {
  const router = useRouter();
  const params = useLocalSearchParams<{ txRef?: string }>();
  const focusedTxRef = String(params?.txRef || "")
    .trim()
    .toLowerCase();
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);

  // Get transactions from Redux
  const transactions = useSelector(
    (state: RootState) => state.auth.transactions,
  );
  const transactionsLoading = useSelector(
    (state: RootState) => state.auth.transactionsLoading,
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const lastBridgeActivity = useSelector(
    (state: RootState) => state.transaction.lastBridgeActivity,
  );

  // Fetch transactions on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchTransactions());
    }
  }, [dispatch, token]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTransactions());
    setRefreshing(false);
  };

  // Helper function to format date
  const formatDate = (dateValue: string | number) => {
    if (dateValue === null || dateValue === undefined) {
      return "Unknown date";
    }

    const numeric =
      typeof dateValue === "number"
        ? dateValue
        : Number.isFinite(Number(dateValue))
          ? Number(dateValue)
          : null;

    const date =
      numeric !== null
        ? new Date(numeric < 1e12 ? numeric * 1000 : numeric)
        : new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateValue: string | number) => {
    if (dateValue === null || dateValue === undefined) {
      return "";
    }

    const numeric =
      typeof dateValue === "number"
        ? dateValue
        : Number.isFinite(Number(dateValue))
          ? Number(dateValue)
          : null;

    const date =
      numeric !== null
        ? new Date(numeric < 1e12 ? numeric * 1000 : numeric)
        : new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Helper function to shorten address
  const shortenAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Map API transactions to activity data
  const activityData = useMemo((): Activity[] => {
    const baseTransactions = Array.isArray(transactions) ? transactions : [];
    const existingRefs = new Set(
      baseTransactions
        .map((tx: any) =>
          String(
            tx.txRef ||
              tx.tx_ref ||
              tx.reference ||
              tx.id ||
              tx._id ||
              tx.transactionId ||
              "",
          ),
        )
        .filter(Boolean),
    );

    const hydratedTransactions = [...baseTransactions];

    if (
      lastBridgeActivity?.txRef &&
      !existingRefs.has(lastBridgeActivity.txRef)
    ) {
      hydratedTransactions.unshift({
        id: lastBridgeActivity.txRef,
        txRef: lastBridgeActivity.txRef,
        type: "bridge",
        amount: lastBridgeActivity.amount,
        fromAsset: lastBridgeActivity.fromAsset,
        toAsset: lastBridgeActivity.toAsset,
        fromNetwork: lastBridgeActivity.fromNetwork,
        toNetwork: lastBridgeActivity.toNetwork,
        createdAt: lastBridgeActivity.createdAt,
      });
    }

    return hydratedTransactions.map((tx: any) => {
      const type = (tx.type || tx.transactionType || "transfer").toLowerCase();
      const directionRaw = String(
        tx.direction ||
          tx.flow ||
          tx.side ||
          tx.entryType ||
          tx.transactionDirection ||
          "",
      ).toLowerCase();
      const amount = parseFloat(tx.amount || 0);
      const userId = user?.id || user?.userId || user?._id;
      const userEmail = String(user?.email || "").toLowerCase();
      const actorEmail = String(tx.actorEmail || "").toLowerCase();
      const senderId =
        tx.senderId || tx.fromUserId || tx.userId || tx.sender?.id;
      const receiverId =
        tx.receiverId || tx.toUserId || tx.recipientId || tx.receiver?.id;
      const senderEmail = String(
        tx.senderEmail || tx.fromEmail || tx.sender?.email || "",
      ).toLowerCase();
      const receiverEmail = String(
        tx.receiverEmail ||
          tx.toEmail ||
          tx.recipientEmail ||
          tx.receiver?.email ||
          "",
      ).toLowerCase();
      const asset = (
        tx.asset ||
        tx.currency ||
        tx.symbol ||
        "USDC"
      ).toUpperCase();
      const rawDate =
        tx.createdAt ||
        tx.created_at ||
        tx.timestamp ||
        tx.timeStamp ||
        tx.date ||
        tx.updatedAt ||
        tx.updated_at ||
        tx.time ||
        tx.processedAt ||
        tx.completedAt ||
        tx.created ||
        tx?.metadata?.createdAt ||
        tx?.meta?.createdAt;
      const date = formatDate(rawDate);
      const time = formatTime(rawDate);

      // Determine transaction type and format accordingly
      let title = "Transaction";
      let description = "";
      let amountColor = "#757B85";
      let displayAmount = `${amount} ${asset}`;
      let secondaryAmount: string | undefined;

      if (type.includes("bridge")) {
        title = "Bridged";
        const fromAsset = tx.fromAsset || tx.fromCurrency || asset;
        const toAsset = tx.toAsset || tx.toCurrency || "USDC";
        const fromNetwork = tx.fromNetwork || tx.network || "";
        const toNetwork = tx.toNetwork || "";
        const networkInfo = [fromNetwork, toNetwork].filter(Boolean).length
          ? ` (${[fromNetwork, toNetwork].filter(Boolean).join(" → ")})`
          : "";
        description = `${fromAsset} to ${toAsset}${networkInfo}`;
        displayAmount = `-${Math.abs(amount)} ${fromAsset}`;
        if (tx.toAmount) {
          secondaryAmount = `+${tx.toAmount} ${toAsset}`;
        }
      } else if (type.includes("swap") || type.includes("exchange")) {
        title = "Swapped";
        const fromAsset = tx.fromAsset || tx.fromCurrency || asset;
        const toAsset = tx.toAsset || tx.toCurrency || "NGN";
        description = `${fromAsset} to ${toAsset}`;
        displayAmount = `-${Math.abs(amount)} ${fromAsset}`;
        if (tx.toAmount) {
          secondaryAmount = `+${tx.toAmount} ${toAsset}`;
        }
      } else {
        if (type.includes("sell") || type.includes("offramp")) {
          title = "Sold";
          description = `${asset} to ${tx.currency || "NGN"}`;
          displayAmount = `-${Math.abs(amount)} ${asset}`;
          if (tx.fiatAmount) {
            secondaryAmount = `+${tx.fiatAmount} ${tx.currency || "NGN"}`;
          }
        } else {
          const isOutgoingByType =
            type.includes("send") ||
            type.includes("sent") ||
            type.includes("withdrawal") ||
            type.includes("debit") ||
            type.includes("transfer_out");
          const isIncomingByType =
            type.includes("receive") ||
            type.includes("received") ||
            type.includes("deposit") ||
            type.includes("credit") ||
            type.includes("onramp") ||
            type.includes("transfer_in");
          const isOutgoingByDirection =
            directionRaw.includes("out") ||
            directionRaw.includes("debit") ||
            directionRaw.includes("withdraw");
          const isIncomingByDirection =
            directionRaw.includes("in") ||
            directionRaw.includes("credit") ||
            directionRaw.includes("deposit");
          const isSenderMatch =
            (!!userId && !!senderId && String(senderId) === String(userId)) ||
            (!!userEmail && !!senderEmail && senderEmail === userEmail) ||
            (!!userEmail && !!actorEmail && actorEmail === userEmail);
          const isReceiverMatch =
            (!!userId &&
              !!receiverId &&
              String(receiverId) === String(userId)) ||
            (!!userEmail && !!receiverEmail && receiverEmail === userEmail);

          const explicitOutgoing = isOutgoingByType || isOutgoingByDirection;
          const explicitIncoming = isIncomingByType || isIncomingByDirection;

          const isOutgoing =
            (explicitOutgoing && !explicitIncoming) ||
            (isSenderMatch && !isReceiverMatch);
          const isIncoming =
            (explicitIncoming && !explicitOutgoing) ||
            (isReceiverMatch && !isSenderMatch);

          if (isOutgoing) {
            title = "Sent";
            description = "Sent funds";
            displayAmount = `-${Math.abs(amount)} ${asset}`;
            amountColor = "#FF5F5F";
          } else if (isIncoming) {
            title = "Received";
            const from = tx.from || tx.sender || tx.fromAddress;
            description = from
              ? `From ${shortenAddress(from)}`
              : "Received funds";
            displayAmount = `+${Math.abs(amount)} ${asset}`;
            amountColor = "#34D058";
          } else if (amount < 0) {
            title = "Sent";
            description = "Sent funds";
            displayAmount = `-${Math.abs(amount)} ${asset}`;
            amountColor = "#FF5F5F";
          } else {
            title = "Received";
            const from = tx.from || tx.sender || tx.fromAddress;
            description = from
              ? `From ${shortenAddress(from)}`
              : "Received funds";
            displayAmount = `+${Math.abs(amount)} ${asset}`;
            amountColor = "#34D058";
          }
        }
      }

      return {
        id: tx.id || tx._id || tx.transactionId || Math.random().toString(),
        txRef: String(
          tx.txRef || tx.tx_ref || tx.reference || tx.transactionRef || "",
        ),
        type: type as any,
        title,
        description,
        amount: displayAmount,
        secondaryAmount,
        icon: require("@/assets/images/bnb-chain.png"),
        date,
        time,
        amountColor,
      };
    });
  }, [transactions]);

  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const grouped: { [key: string]: Activity[] } = {};

    activityData.forEach((activity) => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(activity);
    });

    return grouped;
  }, [activityData]);

  // Reusable Activity Item Component
  const ActivityItem = ({ activity }: { activity: Activity }) => {
    const isFocused =
      !!focusedTxRef &&
      String(activity.txRef || "")
        .trim()
        .toLowerCase() === focusedTxRef;

    return (
      <TouchableOpacity
        style={[styles.activityItem, isFocused && styles.focusedActivityItem]}
        onPress={() => {}}
        disabled
      >
        <View style={styles.activityLeft}>
          <Image
            source={activity.icon}
            style={styles.activityIcon}
            resizeMode="contain"
          />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>
              {activity.description}
            </Text>
            <Text style={styles.activityDate}>{activity.time}</Text>
          </View>
        </View>

        <View style={styles.activityRight}>
          <Text
            style={[styles.activityAmount, { color: activity.amountColor }]}
          >
            {activity.amount}
          </Text>
          {activity.secondaryAmount && (
            <Text style={styles.activitySecondaryAmount}>
              {activity.secondaryAmount}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Reusable Date Section Component
  const DateSection = ({
    date,
    activities,
  }: {
    date: string;
    activities: Activity[];
  }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateText}>{date}</Text>
      <View style={{ gap: 12 }}>
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </View>
    </View>
  );

  // Header Component
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={{ color: "#757B85", fontSize: 20, fontWeight: "bold" }}>
        Recent Activity
      </Text>

      <View style={{ opacity: 0 }}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#757B85"
              colors={["#4A9DFF"]}
            />
          }
        >
          <View style={styles.content}>
            {transactionsLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color="#4A9DFF" />
                <Text style={styles.emptyStateText}>
                  Loading transactions...
                </Text>
              </View>
            ) : activityData.length > 0 ? (
              Object.entries(activitiesByDate).map(([date, activities]) => (
                <DateSection key={date} date={date} activities={activities} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color="#757B85" />
                <Text style={styles.emptyStateText}>No activities yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your recent transactions will appear here
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
