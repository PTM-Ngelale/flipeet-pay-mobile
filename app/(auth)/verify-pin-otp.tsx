import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import * as secure from "../services/secure";

export default function VerifyPinOtp() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const email = (params.email as string) ?? "";

  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim() || !pin.trim()) return Alert.alert("Missing fields", "Enter OTP code and desired PIN.");
    setLoading(true);
    try {
      const res = await pinApi.verifyPinOtp(parseInt(pin, 10), code.trim());
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "OTP verification failed");
      }

      // Mark pin enabled for this device
      try {
        await secure.setPinEnabled(true);
      } catch (e) {
        console.warn("Failed to set pinEnabled", e);
      }

      Alert.alert("Success", "PIN set successfully. You can now sign in with your PIN.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (err: any) {
      Alert.alert("Verification failed", err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify OTP & Set PIN</Text>
          <Text style={styles.hint}>We sent a verification code to {email || "your email"}.</Text>

          <TextInput
            style={styles.input}
            placeholder="OTP Code"
            placeholderTextColor="#757B85"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={8}
          />

          <TextInput
            style={styles.input}
            placeholder="Choose 6-digit PIN"
            placeholderTextColor="#757B85"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry
          />

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerify} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & Set PIN"}</Text>
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
