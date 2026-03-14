import BankIcon from "@/assets/images/toggle-menu-icons/bank-icon.svg";
import EmailIcon from "@/assets/images/toggle-menu-icons/email-icon.svg";
import WalletIcon from "@/assets/images/toggle-menu-icons/wallet-icon.svg";

import HistoryIcon from "@/assets/images/history-icon.svg";
import BankIconHighlighted from "@/assets/images/toggle-menu-icons/bank-highlighted.svg";
import EmailIconHighlighted from "@/assets/images/toggle-menu-icons/email-highlighted.svg";
import WalletIconHighlighted from "@/assets/images/toggle-menu-icons/wallet-highlighted.svg";
import BankComponent from "@/components/BankComponent";
import EmailComponent from "@/components/EmailComponent";
import WalletComponent from "@/components/WalletComponent";
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

export default function SendScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("email");

  const menuItems = [
    {
      id: "email",
      label: "Email",
      icon: EmailIcon,
      highlightedIcon: EmailIconHighlighted,
    },
    {
      id: "bank",
      label: "Bank",
      icon: BankIcon,
      highlightedIcon: BankIconHighlighted,
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: WalletIcon,
      highlightedIcon: WalletIconHighlighted,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "email":
        return <EmailComponent />;
      case "bank":
        return <BankComponent />;
      case "wallet":
        return <WalletComponent />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
          </TouchableOpacity>
          <Text style={{ color: "#757B85", fontSize: 20, fontWeight: 700 }}>
            Send
          </Text>
          <TouchableOpacity onPress={() => router.push("/(recent-activity)")}>
            {/* <FontAwesome5 name="history" size={24} color="#B0BACB" /> */}
            <HistoryIcon width={25} height={25} />
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
});
