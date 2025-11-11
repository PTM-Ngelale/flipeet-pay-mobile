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

const ReauthenticateScreen = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("immediately");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [triggers, setTriggers] = useState({
    openingApp: false,
    viewingSensitiveInfo: false,
    sendingFunds: false,
    changingSettings: false,
  });

  const authenticationOptions = [
    {
      id: "immediately",
      label: "Immediately",
      description: "Require authentication for every action",
    },
    {
      id: "1min",
      label: "1 minute",
      description: "Reauthenticate after 1 minute of inactivity",
    },
    {
      id: "5min",
      label: "5 minutes",
      description: "Reauthenticate after 5 minutes of inactivity",
    },
    {
      id: "10min",
      label: "10 minutes",
      description: "Reauthenticate after 10 minutes of inactivity",
    },
    {
      id: "15min",
      label: "15 minutes",
      description: "Reauthenticate after 10 minutes of inactivity",
    },
    {
      id: "30min",
      label: "30 minutes",
      description: "Reauthenticate after 30 minutes of inactivity",
    },
    {
      id: "1hour",
      label: "1 hour",
      description: "Reauthenticate after 1 hour of inactivity",
    },
    {
      id: "4hour",
      label: "4 hours",
      description: "Reauthenticate after 1 hour of inactivity",
    },
    {
      id: "8hour",
      label: "8 hours",
      description: "Reauthenticate after 1 hour of inactivity",
    },
    {
      id: "1day",
      label: "1 day",
      description: "Reauthenticate after 1 day of inactivity",
    },
  ];

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTriggerToggle = (trigger: keyof typeof triggers) => {
    setTriggers((prev) => ({
      ...prev,
      [trigger]: !prev[trigger],
    }));
  };

  const handleSave = () => {
    // Save the selected authentication frequency
    console.log("Selected authentication frequency:", selectedOption);
    router.back();
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
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Re-authenticate PIN</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.content}>
          <Text style={{ color: "#B0BACB", paddingVertical: 10 }}>
            Authentication Frequency
          </Text>
          <View style={styles.optionsContainer}>
            {authenticationOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  index === authenticationOptions.length - 1 &&
                    styles.lastOptionItem,
                ]}
                onPress={() => handleSelectOption(option.id)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </View>

                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedOption === option.id && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedOption === option.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Event Based Triggers Dropdown */}
          <TouchableOpacity
            onPress={toggleDropdown}
            style={styles.dropdownTrigger}
          >
            <View style={{ width: "80%", gap: 7 }}>
              <Text style={styles.dropdownTriggerText}>
                Add event based triggers
              </Text>
              <Text style={{ color: "#757B85", fontSize: 12 }}>
                For your security, your PIN will be required based on the
                triggers you select.
              </Text>
            </View>
            <Ionicons
              name={isDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#757B85"
            />
          </TouchableOpacity>
          {isDropdownOpen && (
            <View style={styles.dropdownContent}>
              {/* Opening the app toggle */}
              <View style={styles.triggerItem}>
                <View style={styles.triggerTextContainer}>
                  <Text style={styles.triggerLabel}>Opening the app</Text>
                </View>
                <Switch
                  value={triggers.openingApp}
                  onValueChange={() => handleTriggerToggle("openingApp")}
                  trackColor={{ false: "#374151", true: "#28A745" }}
                  thumbColor={triggers.openingApp ? "#FFFFFF" : "#F3F4F6"}
                  ios_backgroundColor="#374151"
                  style={styles.smallSwitch}
                />
              </View>

              {/* Viewing sensitive info toggle */}
              <View style={styles.triggerItem}>
                <View style={styles.triggerTextContainer}>
                  <Text style={styles.triggerLabel}>
                    Viewing sensitive info
                  </Text>
                </View>
                <Switch
                  value={triggers.viewingSensitiveInfo}
                  onValueChange={() =>
                    handleTriggerToggle("viewingSensitiveInfo")
                  }
                  trackColor={{ false: "#374151", true: "#28A745" }}
                  thumbColor={
                    triggers.viewingSensitiveInfo ? "#FFFFFF" : "#F3F4F6"
                  }
                  ios_backgroundColor="#374151"
                  style={styles.smallSwitch}
                />
              </View>

              {/* Sending funds/completing transactions toggle */}
              <View style={styles.triggerItem}>
                <View style={styles.triggerTextContainer}>
                  <Text style={styles.triggerLabel}>
                    Sending funds/completing transactions
                  </Text>
                </View>
                <Switch
                  value={triggers.sendingFunds}
                  onValueChange={() => handleTriggerToggle("sendingFunds")}
                  trackColor={{ false: "#374151", true: "#28A745" }}
                  thumbColor={triggers.sendingFunds ? "#FFFFFF" : "#F3F4F6"}
                  ios_backgroundColor="#374151"
                  style={styles.smallSwitch}
                />
              </View>

              {/* Changing account settings toggle */}
              <View style={styles.triggerItem}>
                <View style={styles.triggerTextContainer}>
                  <Text style={styles.triggerLabel}>
                    Changing account settings
                  </Text>
                </View>
                <Switch
                  value={triggers.changingSettings}
                  onValueChange={() => handleTriggerToggle("changingSettings")}
                  trackColor={{ false: "#374151", true: "#28A745" }}
                  thumbColor={triggers.changingSettings ? "#FFFFFF" : "#F3F4F6"}
                  ios_backgroundColor="#374151"
                  style={styles.smallSwitch}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReauthenticateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
  content: {
    paddingHorizontal: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    color: "#757B85",
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  optionsContainer: {
    overflow: "hidden",
    marginBottom: 32,
    gap: 6,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#1C1C1C",
    borderRadius: 10,
  },
  lastOptionItem: {
    // borderBottomWidth: 0,
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  optionDescription: {
    color: "#757B85",
    fontSize: 14,
  },
  radioContainer: {
    padding: 4,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#757B85",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#28A745",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#28A745",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // New styles for dropdown and triggers
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 6,
  },
  dropdownTriggerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownContent: {
    gap: 6,
    marginBottom: 32,
  },
  triggerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  triggerTextContainer: {
    flex: 1,
  },
  triggerLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  smallSwitch: {
    transform: [{ scale: 0.8 }],
  },
});
