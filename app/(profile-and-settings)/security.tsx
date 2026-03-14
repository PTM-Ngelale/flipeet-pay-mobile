import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const SecurityAndPrivacy = () => {
  const router = useRouter();
  const email = useSelector(
    (state: RootState) =>
      state.auth.user?.email || state.auth.email || "Not set",
  );

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
          <Text style={styles.headerTitle}>Security/Privacy</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Change Email Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.description}>{email}</Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#1A212A",
                  padding: 10,
                  borderRadius: 7,
                }}
                onPress={() => router.push("/change-email")}
              >
                <Text style={{ color: "#4A9DFF", fontWeight: 600 }}>
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Change PIN Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.label}>PIN</Text>
                <Text style={styles.description}>******</Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#1A212A",
                  padding: 10,
                  borderRadius: 7,
                }}
                onPress={() => router.push("/change-pin")}
              >
                <Text style={{ color: "#4A9DFF", fontWeight: 600 }}>
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PIN Authentication Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Re-authenticate PIN</Text>
                <Text style={styles.description}>Immediately</Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#1A212A",
                  padding: 10,
                  borderRadius: 7,
                }}
                onPress={() => router.push("/reauthenticate")}
              >
                <Text style={{ color: "#4A9DFF", fontWeight: 600 }}>
                  Set up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecurityAndPrivacy;

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
  textContainer: {
    flex: 1,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  description: {
    color: "#757B85",
    fontSize: 14,
  },
});
