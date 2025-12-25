import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const { paymentUrl, reference, amount, currency } = params;

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log("WebView URL changed:", url);

    // Check if the URL is a redirect callback
    // Adjust the callback URL pattern based on your backend configuration
    if (url.includes("payment/callback") || url.includes("payment/success")) {
      // Extract transaction reference or status from URL
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const status = urlParams.get("status");
      const txRef = urlParams.get("reference") || reference;

      if (status === "success" || status === "completed") {
        router.replace({
          pathname: "/(action)/success-screen",
          params: {
            transactionId: txRef,
            amount: amount,
            currency: currency,
            type: "buy",
          },
        });
      } else if (status === "failed" || status === "cancelled") {
        Alert.alert(
          "Payment Failed",
          "Your payment was not successful. Please try again.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    }
  };

  const handleClose = () => {
    Alert.alert(
      "Cancel Payment",
      "Are you sure you want to cancel this payment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A9DFF" />
          <Text style={styles.loadingText}>Loading payment page...</Text>
        </View>
      )}

      <WebView
        source={{ uri: paymentUrl as string }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error:", nativeEvent);
          Alert.alert(
            "Error",
            "Failed to load payment page. Please try again.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
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
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1C",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    zIndex: 1,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontSize: 16,
  },
  webview: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
