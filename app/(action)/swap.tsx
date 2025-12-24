import BridgeHighlighted from "@/assets/images/bridge-highlight.svg";
import BridgeIcon from "@/assets/images/bridge-icon.svg";
import BuyIcon from "@/assets/images/buy-icon.svg";
import HistoryIcon from "@/assets/images/history-icon.svg";
import SellHighlighted from "@/assets/images/sell-highlight.svg";
import SellIcon from "@/assets/images/sell-icon.svg";
import BridgeComponent from "@/components/BridgeComponent";
import BuyComponent from "@/components/BuyComponent";
import SellComponent from "@/components/SellComponent";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function SwapScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Sell");

  const menuItems = [
    {
      id: "Buy",
      label: "Buy",
      icon: BuyIcon,
      highlightedIcon: BridgeHighlighted,
    },
    {
      id: "Sell",
      label: "Sell",
      icon: SellIcon,
      highlightedIcon: SellHighlighted,
    },
    {
      id: "Bridge",
      label: "Bridge",
      icon: BridgeIcon,
      highlightedIcon: BridgeHighlighted,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Buy":
        return <BuyComponent />;
      case "Sell":
        return <SellComponent />;
      case "Bridge":
        return <BridgeComponent />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Swap</Text>
          <TouchableOpacity onPress={() => router.push("/(recent-activity)")}>
            <HistoryIcon />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.toggleMenu}>
            {menuItems.map((item) => {
              const IconComponent =
                activeTab === item.id ? item.highlightedIcon : item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.toggleItem,
                    activeTab === item.id && styles.activeToggleItem,
                  ]}
                  onPress={() => setActiveTab(item.id)}
                >
                  <IconComponent width={20} height={20} />
                  <Text
                    style={[
                      styles.toggleText,
                      activeTab === item.id && styles.activeToggleText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {renderContent()}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#757B85",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    marginTop: 40,
  },
  toggleMenu: {
    marginTop: 20,
    backgroundColor: "#1C1C1C",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
  },
  toggleItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  activeToggleItem: {
    backgroundColor: "#2A2A2A",
  },
  toggleText: {
    fontWeight: "500",
    color: "#757B85",
  },
  activeToggleText: {
    color: "#E2E6F0",
  },
  contentContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  contentTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contentDescription: {
    color: "#757B85",
  },
});
