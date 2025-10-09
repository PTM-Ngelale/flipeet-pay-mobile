import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Types
interface Activity {
  id: string;
  type: "swap" | "received" | "sent";
  title: string;
  description: string;
  amount: string;
  secondaryAmount?: string;
  icon: any;
  date: string;
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

  // Activity data
  const activityData = useMemo(
    (): Activity[] => [
      {
        id: "1",
        type: "swap",
        title: "Swap successful",
        description: "USDC to NGN",
        amount: "-100 USDC",
        secondaryAmount: "+ N142,500",
        icon: require("@/assets/images/bnb-chain.png"),
        date: "June 9, 2025",
        amountColor: "#757B85",
      },
      {
        id: "2",
        type: "received",
        title: "Received",
        description: "From 7afm...5dMM",
        amount: "+360 USDC",
        icon: require("@/assets/images/bnb-chain.png"),
        date: "June 9, 2025",
        amountColor: "#34D058",
      },
      {
        id: "3",
        type: "sent",
        title: "Sent",
        description: "To 7afm...5dMM",
        amount: "-60 USDC",
        icon: require("@/assets/images/bnb-chain.png"),
        date: "June 2, 2025",
        amountColor: "#757B85",
      },
      {
        id: "4",
        type: "swap",
        title: "Swap successful",
        description: "USDT to USDC",
        amount: "-200 USDT",
        secondaryAmount: "+100 USDC",
        icon: require("@/assets/images/bnb-chain.png"),
        date: "June 2, 2025",
        amountColor: "#757B85",
      },
    ],
    []
  );

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
  const ActivityItem = ({ activity }: { activity: Activity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => router.push(`/activities-details?id=${activity.id}`)}
    >
      <View style={styles.activityLeft}>
        <Image
          source={activity.icon}
          style={styles.activityIcon}
          resizeMode="contain"
        />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDescription}>{activity.description}</Text>
        </View>
      </View>

      <View style={styles.activityRight}>
        <Text style={[styles.activityAmount, { color: activity.amountColor }]}>
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
      <Text style={{ color: "#757B85", fontSize: 16, fontWeight: "bold" }}>
        Recent Activity
      </Text>
      {/* <View style={styles.spacer} /> */}
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
        >
          <View style={styles.content}>
            {Object.entries(activitiesByDate).map(([date, activities]) => (
              <DateSection key={date} date={date} activities={activities} />
            ))}

            {/* Empty state would go here */}
            {activityData.length === 0 && (
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
