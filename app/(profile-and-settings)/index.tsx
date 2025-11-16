import EditIcon from "@/assets/images/edit-icon";
import AboutIcon from "@/assets/images/settings-icons/about-icon.svg";
import PreferencesIcon from "@/assets/images/settings-icons/preferences-icon.svg";
import SecurityIcon from "@/assets/images/settings-icons/security-icon.svg";
import SupportIcon from "@/assets/images/settings-icons/support-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProfile } from "../contexts/ProfileContext";

const SettingsAndProfile = () => {
  const router = useRouter();
  const { username, profileImage, pickImage } = useProfile();

  const settingsData = [
    {
      title: "Preferences",
      description: "Display Language, Currency, Notifications",
      onPress: () => router.push("/preferences"),
      icon: PreferencesIcon,
    },
    {
      title: "Security/Privacy",
      description: "Email, Change Pin, Pin Authentication",
      onPress: () => router.push("/security"),
      icon: SecurityIcon,
    },
    {
      title: "Support",
      description: "Chat with a Flipeet Representative",
      onPress: () => router.push("/support"),
      icon: SupportIcon,
    },
    {
      title: "About Flipeet Pay",
      description: "Privacy Policy, Terms of Service, Visit our Website",
      onPress: () => router.push("/about"),
      icon: AboutIcon,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View
            style={{
              position: "absolute",
              zIndex: 1,
              top: -50,
            }}
          >
            <TouchableOpacity
              onPress={pickImage}
              style={{ position: "relative" }}
            >
              <View style={{ position: "absolute", zIndex: 2, right: 0 }}>
                <EditIcon width={30} height={30} />
              </View>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                // <UserProfile width={100} height={100} />
                <Ionicons
                  name="person-circle-outline"
                  size={100}
                  color="#B0BACB"
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <View style={{ marginTop: 40, backgroundColor: "#fff" }} />

            {/* Username section */}
            {username ? (
              <>
                <Text style={styles.username}>{username}</Text>

                <Text style={styles.email}>preciousngelale@gmail.com</Text>

                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <TouchableOpacity
                    style={styles.changeUsernameButton}
                    onPress={() => router.push("/username")}
                  >
                    <Text style={styles.changeUsernameText}>
                      Change Username
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.email}>preciousngelale@gmail.com</Text>
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <TouchableOpacity
                    style={styles.addUsernameButton}
                    onPress={() => router.push("/username")}
                  >
                    <Text style={styles.addUsernameText}>+ Add a username</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsSection}>
          {settingsData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingsItem,
                index === settingsData.length - 1 && styles.lastSettingsItem,
              ]}
              onPress={item.onPress}
            >
              <item.icon width={48} height={48} />

              <View style={styles.settingsContent}>
                <Text style={styles.settingsTitle}>{item.title}</Text>
                <Text style={styles.settingsDescription}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  profileSection: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#1C1C1C",
    marginHorizontal: 20,
    marginTop: 55,
    borderRadius: 16,
    gap: 16,
    position: "relative",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -25,
    zIndex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333333",
  },
  userInfo: {
    flex: 1,
    gap: 8,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  email: {
    color: "#B0BACB",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  addUsernameButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 54,
    paddingVertical: 18,
    backgroundColor: "#1A212A",
    borderRadius: 8,
  },
  addUsernameText: {
    color: "#4A9DFF",
    fontSize: 14,
    fontWeight: "500",
  },
  changeUsernameButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1A212A",
    borderRadius: 8,
  },
  changeUsernameText: {
    color: "#4A9DFF",
    fontSize: 14,
    fontWeight: "500",
  },
  settingsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#1C1C1C",
    gap: 16,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  lastSettingsItem: {
    borderBottomWidth: 0,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsContent: {
    flex: 1,
    gap: 4,
  },
  settingsTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  settingsDescription: {
    color: "#757B85",
    fontSize: 12,
    lineHeight: 18,
  },
  settingsArrow: {
    padding: 4,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  versionText: {
    color: "#757B85",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SettingsAndProfile;
