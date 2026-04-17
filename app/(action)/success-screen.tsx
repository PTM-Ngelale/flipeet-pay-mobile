import SuccessIcon from "@/assets/images/success-icon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { BounceIn, FadeInUp } from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { network } = params;

  const [copied, setCopied] = useState(false);

  const asSingleValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const title =
    asSingleValue(params.title) ||
    asSingleValue(params.heading) ||
    "Transaction Successful";
  // Minimal UI: avoid showing extra transaction details
  const description =
    (Array.isArray(params.description)
      ? params.description[0]
      : params.description) || "";
  const viewText =
    (Array.isArray(params.viewText) ? params.viewText[0] : params.viewText) ||
    "";
  const txRef =
    (Array.isArray(params.txRef) ? params.txRef[0] : params.txRef) || "";
  const meterToken =
    (Array.isArray(params.meterToken)
      ? params.meterToken[0]
      : params.meterToken) || "";

  const RECENT_NETWORKS_KEY = "flipeet_recent_networks_v1";
  const MAX_RECENT_NETWORKS = 1;

  useEffect(() => {
    const normalizeNetworkId = (value: string) => {
      const normalized = (value || "").toLowerCase().replace(/\s+/g, "-");
      if (
        normalized === "bnb-chain" ||
        normalized === "bnb" ||
        normalized === "bsc"
      ) {
        return "bnb-smart-chain";
      }
      return normalized;
    };

    const updateRecentNetworks = async () => {
      if (!network) return;

      const networkId = normalizeNetworkId(String(network));
      if (!networkId) return;

      try {
        const raw = await AsyncStorage.getItem(RECENT_NETWORKS_KEY);
        const parsed = raw ? (JSON.parse(raw) as string[]) : [];
        const next = [
          networkId,
          ...parsed.filter((id) => id !== networkId),
        ].slice(0, MAX_RECENT_NETWORKS);
        await AsyncStorage.setItem(RECENT_NETWORKS_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn("Failed to update recent networks:", error);
      }
    };

    void updateRecentNetworks();
  }, [network]);

  const handleClose = () => {
    router.replace("/(tabs)");
  };

  const handleViewTransaction = () => {
    router.push({
      pathname: "/(recent-activity)",
      params: txRef ? { txRef } : undefined,
    });
  };

  const handleCopyToken = async () => {
    if (!meterToken) return;
    try {
      await Clipboard.setStringAsync(String(meterToken));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      Alert.alert("Copy failed", "Unable to copy meter token to clipboard.");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Main Content - Centered */}
        <View style={styles.content}>
          <Animated.View entering={BounceIn.delay(150).duration(900)}>
            <SuccessIcon />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}

            {meterToken ? (
              <View style={{ marginTop: 12, alignItems: "center" }}>
                <Text style={[styles.description, { marginBottom: 8 }]}>
                  Meter token
                </Text>
                <View
                  style={{
                    backgroundColor: "#0B1220",
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 220,
                  }}
                >
                  <Text style={{ color: "#E2E6F0", fontWeight: "700" }}>
                    {meterToken}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCopyToken}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ color: "#4A9DFF" }}>
                    {copied ? "Copied" : "Copy token"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Animated.View>
        </View>

        {/* Close Button at Bottom */}
        <Animated.View entering={FadeInUp.delay(850).duration(400)} style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  textContainer: {
    position: "absolute",
    bottom: "25%",
    alignItems: "center",
    gap: 20,
  },
  title: {
    color: "#E2E6F0",
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    color: "#B0BACB",
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    padding: 20,
  },

  view: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 14,
  },
  viewText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  closeButton: {
    backgroundColor: "#1A212A",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#4A9DFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
