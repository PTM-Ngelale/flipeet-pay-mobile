import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import pinApi from "../services/pinApi";
import * as secure from "../services/secure";
import { RootState } from "../store";

const SecurityAndPrivacy = () => {
  const router = useRouter();
  const email = useSelector(
    (state: RootState) =>
      state.auth.user?.email || state.auth.email || "Not set",
  );
  const [pinExists, setPinExists] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricsSupported, setBiometricsSupported] = useState(false);

  useEffect(() => {
    if (!email || email === "Not set") return;
    pinApi.isPinAvailable(email)
      .then((res) => res.json().catch(() => null))
      .then((body) => {
        if (body?.data?.pinExists === true) setPinExists(true);
      })
      .catch(() => {});

    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        setBiometricsSupported(true);
        const enabled = await secure.isBiometricsEnabled();
        setBiometricsEnabled(enabled);
      }
    })();
  }, [email]);

  const handleBiometricsToggle = async (value: boolean) => {
    if (value) {
      // Confirm identity before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm your identity to enable biometric login",
        cancelLabel: "Cancel",
      });
      if (!result.success) return;
    }
    await secure.setBiometricsEnabled(value);
    setBiometricsEnabled(value);
    Alert.alert(
      value ? "Biometrics enabled" : "Biometrics disabled",
      value
        ? "You can now sign in using Face ID or fingerprint."
        : "Biometric login has been turned off.",
      [{ text: "OK" }],
    );
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
        {/* <View style={styles.sectionContainer}>
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
        </View> */}

        {/* Mobile PIN Setup */}
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Mobile PIN Login</Text>
                <Text style={styles.description}>
                  Sign in quickly with a 6-digit PIN
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#1A212A",
                  padding: 10,
                  borderRadius: 7,
                }}
                onPress={() => router.push(pinExists ? "/change-pin" : "/setup-mobile-pin")}
              >
                <Text style={{ color: "#4A9DFF", fontWeight: 600 }}>
                  {pinExists ? "Change" : "Set up"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Biometric Login */}
        {biometricsSupported && (
          <View style={styles.sectionContainer}>
            <View style={styles.section}>
              <View style={styles.row}>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Biometric Login</Text>
                  <Text style={styles.description}>
                    Sign in with Face ID or fingerprint
                  </Text>
                </View>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={handleBiometricsToggle}
                  trackColor={{ false: "#374151", true: "#0A66D3" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

        {/* PIN Authentication Section */}
        {/* <View style={styles.sectionContainer}>
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
        </View> */}
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
