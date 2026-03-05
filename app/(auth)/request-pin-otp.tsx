import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import pinApi from "../services/pinApi";

export default function RequestPinOtp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!email.trim()) return Alert.alert("Enter email", "Please enter your email.");
    setLoading(true);
    try {
      const res = await pinApi.requestPinOtp(email.trim());
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to request OTP");
      }
      Alert.alert("OTP Requested", "Check your email for the verification code.", [
        { text: "OK", onPress: () => router.push(`/verify-pin-otp?email=${encodeURIComponent(email.trim())}`) },
      ]);
    } catch (err: any) {
      Alert.alert("Request failed", err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Request PIN OTP</Text>
          <Text style={styles.hint}>Enter the email address for the account you want to set a PIN for.</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#757B85"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRequest} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Requesting..." : "Request OTP"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 20, marginTop: 40 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 12 },
  hint: { color: "#9AA6B6", marginBottom: 20 },
  input: {
    backgroundColor: "#0B1220",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: { backgroundColor: "#4A9DFF", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#374151" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
