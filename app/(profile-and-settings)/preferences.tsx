import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Preferences = () => {
  const router = useRouter();
  const [displayLanguage, setDisplayLanguage] = useState("English");
  const [currency, setCurrency] = useState("US Dollar");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Arabic",
  ];

  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CNY"];

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
    setShowCurrencyDropdown(false);
  };

  const toggleCurrencyDropdown = () => {
    setShowCurrencyDropdown(!showCurrencyDropdown);
    setShowLanguageDropdown(false);
  };

  const selectLanguage = (language: string) => {
    setDisplayLanguage(language);
    setShowLanguageDropdown(false);
  };

  const selectCurrency = (currency: string) => {
    setCurrency(currency);
    setShowCurrencyDropdown(false);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferences</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Display Language Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Display Language</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleLanguageDropdown}
              >
                <Text style={styles.dropdownText}>{displayLanguage}</Text>
                <Ionicons
                  name={showLanguageDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#4A9DFF"
                />
              </TouchableOpacity>
            </View>

            {showLanguageDropdown && (
              <View style={styles.dropdownList}>
                {languages.map((language, index) => (
                  <TouchableOpacity
                    key={language}
                    style={[
                      styles.dropdownItem,
                      index === languages.length - 1 && styles.dropdownItemLast,
                    ]}
                    onPress={() => selectLanguage(language)}
                  >
                    <Text style={styles.dropdownItemText}>{language}</Text>
                    {displayLanguage === language && (
                      <Ionicons name="checkmark" size={16} color="#4A9DFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Currency Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Currency</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleCurrencyDropdown}
              >
                <Text style={styles.dropdownText}>{currency}</Text>
                <Ionicons
                  name={showCurrencyDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#4A9DFF"
                />
              </TouchableOpacity>
            </View>

            {showCurrencyDropdown && (
              <View style={styles.dropdownList}>
                {currencies.map((curr, index) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.dropdownItem,
                      index === currencies.length - 1 &&
                        styles.dropdownItemLast,
                    ]}
                    onPress={() => selectCurrency(curr)}
                  >
                    <Text style={styles.dropdownItemText}>{curr}</Text>
                    {currency === curr && (
                      <Ionicons name="checkmark" size={16} color="#4A9DFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.label}>Notifications</Text>
                <Text style={styles.notificationDescription}>
                  Receive in-app notifications
                </Text>
              </View>
              <View style={styles.switchContainer}>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: "#B0BACB", true: "#34D058" }}
                  thumbColor={notificationsEnabled ? "#FFFFFF" : "#F3F4F6"}
                  ios_backgroundColor="#374151"
                  style={styles.smallSwitch}
                />
                <Text
                  style={[
                    styles.switchLabel,
                    notificationsEnabled && styles.switchLabelActive,
                  ]}
                >
                  {notificationsEnabled ? "ON" : "OFF"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Preferences;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#757B85",
    fontSize: 18,
    fontWeight: "600",
  },
  headerPlaceholder: {
    width: 32,
  },
  sectionContainer: {
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  section: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2A2A2A",

    justifyContent: "space-between",
  },
  dropdownText: {
    color: "#E2E6F0",
    fontSize: 16,
    marginRight: 8,
  },
  dropdownList: {
    backgroundColor: "#121212",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginTop: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationDescription: {
    color: "#B0BACB",
    fontSize: 12,
    marginTop: 2,
  },
  switchContainer: {
    alignItems: "center",
    gap: 5,
  },
  smallSwitch: {
    transform: [{ scale: 0.8 }],
  },
  switchLabels: {
    flexDirection: "row",
    marginTop: 4,
    gap: 8,
  },
  switchLabel: {
    color: "#757B85",
    fontSize: 12,
    fontWeight: "500",
  },
  switchLabelActive: {
    color: "#34D058",
  },
});
