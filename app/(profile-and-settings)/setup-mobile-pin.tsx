import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import pinApi from "../services/pinApi";
import * as secure from "../services/secure";

type Step = "request" | "verify";

export default function SetupMobilePin() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const email = useSelector((state: RootState) => state.auth.email) || "";
  const token = useSelector((state: RootState) => state.auth.token) || "";

  const [step, setStep] = useState<Step>("request");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef<Array<TextInput | null>>([]);
  const confirmPinRefs = useRef<Array<TextInput | null>>([]);

  const handleRequestOtp = async () => {
    if (!email) {
      Alert.alert("Error", "No email found. Please log in again.");
      return;
    }
    setLoading(true);
    try {
      const res = await pinApi.requestPinOtp(email, token);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to send OTP");
      }
      setStep("verify");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const pinCode = pin.join("");
    const confirmCode = confirmPin.join("");
    if (!otp.trim()) {
      Alert.alert("Error", "Enter the OTP code from your email.");
      return;
    }
    if (pinCode.length !== 6) {
      Alert.alert("Error", "Enter a 6-digit PIN.");
      return;
    }
    if (pinCode !== confirmCode) {
      Alert.alert("PINs do not match", "Your PIN and confirmation PIN must be the same.");
      return;
    }
    setLoading(true);
    try {
      const res = await pinApi.verifyPinOtp(parseInt(pinCode, 10), otp.trim(), token);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Verification failed");
      }
      await secure.setPinEnabled(true, email);
      Alert.alert("PIN Created", "You can now sign in using your PIN.", [
        {
          text: "Done",
          onPress: () =>
            from === "login" ? router.replace("/home") : router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not set PIN");
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (text: string, index: number) => {
    const next = [...pin];
    next[index] = text.slice(-1);
    setPin(next);
    if (text && index < 5) {
      pinRefs.current[index + 1]?.focus();
    } else if (text && index === 5) {
      // Auto-advance to confirm PIN
      confirmPinRefs.current[0]?.focus();
    }
  };

  const handlePinBackspace = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmPinChange = (text: string, index: number) => {
    const next = [...confirmPin];
    next[index] = text.slice(-1);
    setConfirmPin(next);
    if (text && index < 5) confirmPinRefs.current[index + 1]?.focus();
  };

  const handleConfirmPinBackspace = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !confirmPin[index] && index > 0) {
      confirmPinRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Up PIN</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === "request" ? (
            <>
              <Text style={styles.title}>Secure your account</Text>
              <Text style={styles.description}>
                We'll send a verification code to your email to confirm it's you
                before creating a PIN.
              </Text>

              <View style={styles.emailBox}>
                <Ionicons name="mail-outline" size={18} color="#757B85" />
                <Text style={styles.emailText}>{email || "No email found"}</Text>
              </View>

              <TouchableOpacity
                style={[styles.button, (!email || loading) && styles.buttonDisabled]}
                onPress={handleRequestOtp}
                disabled={!email || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send verification code</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Create your PIN</Text>
              <Text style={styles.description}>
                Enter the code sent to {email}, then choose a 6-digit PIN.
              </Text>

              <Text style={styles.label}>Verification code</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter OTP"
                placeholderTextColor="#757B85"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={8}
              />

              <Text style={styles.label}>Choose a 6-digit PIN</Text>
              <View style={styles.pinRow}>
                {pin.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(r) => (pinRefs.current[i] = r)}
                    style={styles.pinInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(t) => handlePinChange(t, i)}
                    onKeyPress={(e) => handlePinBackspace(e, i)}
                    secureTextEntry
                  />
                ))}
              </View>

              <Text style={styles.label}>Confirm PIN</Text>
              <View style={styles.pinRow}>
                {confirmPin.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(r) => (confirmPinRefs.current[i] = r)}
                    style={[
                      styles.pinInput,
                      confirmPin.every((d) => d) &&
                        pin.join("") !== confirmPin.join("") &&
                        styles.pinInputError,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(t) => handleConfirmPinChange(t, i)}
                    onKeyPress={(e) => handleConfirmPinBackspace(e, i)}
                    secureTextEntry
                  />
                ))}
              </View>
              {confirmPin.every((d) => d) &&
                pin.join("") !== confirmPin.join("") && (
                  <Text style={styles.mismatchText}>PINs do not match</Text>
                )}

              <TouchableOpacity
                style={[
                  styles.button,
                  (!otp.trim() ||
                    pin.some((d) => !d) ||
                    confirmPin.some((d) => !d) ||
                    pin.join("") !== confirmPin.join("") ||
                    loading) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleVerify}
                disabled={
                  !otp.trim() ||
                  pin.some((d) => !d) ||
                  confirmPin.some((d) => !d) ||
                  pin.join("") !== confirmPin.join("") ||
                  loading
                }
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create PIN</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => setStep("request")}
              >
                <Text style={styles.resendText}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  back: { padding: 4 },
  headerTitle: { color: "#757B85", fontSize: 18, fontWeight: "600" },
  scrollView: { flex: 1 },
  content: { flexGrow: 1, padding: 24 },
  title: {
    color: "#E2E6F0",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  description: {
    color: "#9AA6B6",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },
  emailBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1C1C1C",
    padding: 14,
    borderRadius: 8,
    marginBottom: 28,
  },
  emailText: { color: "#B0BACB", fontSize: 14 },
  label: {
    color: "#B0BACB",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  otpInput: {
    backgroundColor: "#1C1C1C",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
    letterSpacing: 4,
  },
  pinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  pinInput: {
    width: 44,
    height: 54,
    borderRadius: 8,
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "#374151",
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  pinInputError: {
    borderColor: "#EF4444",
  },
  mismatchText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: -20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#374151" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  resendButton: { alignItems: "center", marginTop: 16 },
  resendText: { color: "#4A9DFF", fontSize: 14, fontWeight: "500" },
});
