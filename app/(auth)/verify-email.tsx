import VerifyEmailIcon from "@/assets/images/verify-email.svg";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
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
import { useDispatch } from "react-redux";
import * as secure from "../services/secure";
import { requestOtp, verifyOtp } from "../store/authSlice";

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const flow = (params.flow as string) || ""; // 'signup' or 'login'
  const email = (params.email as string) || "";
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const dispatch = useDispatch<any>();

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      const pastedOtp = text.split("").slice(0, 6);
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);

      const lastIndex = Math.min(pastedOtp.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!email) {
      router.back();
      return;
    }
    const code = otp.join("");
    setIsSubmitting(true);
    try {
      await dispatch(verifyOtp({ email, code })).unwrap();

      if (flow === "signup") {
        router.replace("/login");
      } else if (flow === "login") {
        // Offer biometrics setup if supported but not yet enabled
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const alreadyEnabled = await secure.isBiometricsEnabled();
        if (hasHardware && isEnrolled && !alreadyEnabled) {
          Alert.alert(
            "Enable Biometrics",
            "Would you like to use Face ID / fingerprint to sign in next time?",
            [
              { text: "Not now", style: "cancel", onPress: () => router.replace("/home") },
              {
                text: "Enable",
                onPress: async () => {
                  await secure.setBiometricsEnabled(true);
                  router.replace("/home");
                },
              },
            ],
          );
        } else {
          router.replace("/home");
        }
      } else {
        router.back();
      }
    } catch (err: any) {
      Alert.alert("Verification Failed", err?.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    try {
      const type = flow === "login" ? "login" : "signup";
      await dispatch(requestOtp({ email, type })).unwrap();
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (err: any) {
      Alert.alert("Failed to resend", err?.message || "Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isVerifyDisabled = otp.some((digit) => !digit) || isSubmitting;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
          </TouchableOpacity>
          {/* <Text style={styles.headerTitle}>Verify Email</Text> */}
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.inputSection}>
              <VerifyEmailIcon />
              <Text style={styles.title}>Verify your email address</Text>
              <Text style={styles.description}>
                {/* We've sent a 6-digit code to your email address. Enter it below
                to verify. */}
                Please input the 6 digit code that was sent to your email
                address to verify your email
              </Text>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity style={styles.resendContainer} onPress={handleResend} disabled={isResending}>
                <Text style={styles.resendText}>
                  Didn't get the code?{" "}
                  <Text style={styles.resendLink}>{isResending ? "Sending..." : "Resend"}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isVerifyDisabled && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={isVerifyDisabled}
          >
            <Text
              style={[
                styles.verifyButtonText,
                isVerifyDisabled && styles.verifyButtonTextDisabled,
              ]}
            >
              {isSubmitting ? "Verifying..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    color: "#B0BACB",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  otpInput: {
    backgroundColor: "#2A2A2A",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    width: 50,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    // borderColor: "#374151",
  },
  resendContainer: {
    marginBottom: 32,
  },
  resendText: {
    color: "#B0BACB",
    fontSize: 16,
    textAlign: "center",
  },
  resendLink: {
    color: "#4A9DFF",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  verifyButton: {
    backgroundColor: "#0056D2",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: "#F2F4F8",
    fontSize: 16,
    fontWeight: "600",
  },
  verifyButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
