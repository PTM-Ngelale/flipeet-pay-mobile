import AirtimeIcon from "@/assets/images/services-icons/airtime.svg";
import DataIcon from "@/assets/images/services-icons/data.svg";
import ElectricityIcon from "@/assets/images/services-icons/electricity.svg";
import GiftCardIcon from "@/assets/images/services-icons/gift-cards.svg";
import TVIcon from "@/assets/images/services-icons/tv.svg";
import VirtualCardIcon from "@/assets/images/services-icons/virtual-card.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ServicesScreen() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
          </TouchableOpacity>
          <Text style={styles.title}>Services</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Bills Payment & Subscription
              </Text>
              <View style={styles.billsRow}>
                <TouchableOpacity
                  style={styles.billsTile}
                  onPress={() => router.push("/(action)/airtime")}
                >
                  <AirtimeIcon />
                  <Text style={styles.tileLabel}>Airtime</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.billsTile}
                  onPress={() => router.push("/(action)/data")}
                >
                  <DataIcon />
                  <Text style={styles.tileLabel}>Data</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.billsTile}
                  onPress={() => router.push("/(action)/electricity")}
                >
                  <ElectricityIcon />
                  <Text style={styles.tileLabel}>Electricity</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.billsTile, styles.tileDisabled]}
                  disabled
                >
                  <TVIcon />
                  <Text style={styles.tileLabel}>TV</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ecommerce</Text>
              <View style={styles.singleRow}>
                <TouchableOpacity
                  style={[styles.tile, styles.tileDisabled]}
                  disabled
                >
                  <GiftCardIcon />
                  <Text style={styles.tileLabel}>Gift Cards</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Others</Text>
              <View style={styles.singleRow}>
                <TouchableOpacity
                  style={[styles.tile, styles.tileDisabled]}
                  disabled
                >
                  <VirtualCardIcon />
                  <Text style={styles.tileLabel}>Virtual Card</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  title: {
    color: "#757B85",
    maxWidth: 87,
    fontSize: 20,
    fontWeight: 500,
  },
  placeholder: {
    width: 24,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    marginTop: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "#757B85",
    fontSize: 16,
    fontWeight: "600",
  },
  billsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 8,
  },
  singleRow: {
    flexDirection: "row",
    gap: 12,
  },
  tile: {
    width: "23%",
    backgroundColor: "#1A212A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  billsTile: {
    width: "23%",
    maxWidth: 87,
    backgroundColor: "#1A212A",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tileDisabled: {
    opacity: 0.45,
  },
  tileLabel: {
    color: "#B0BACB",
    fontSize: 14,
    fontWeight: "500",
  },
});
