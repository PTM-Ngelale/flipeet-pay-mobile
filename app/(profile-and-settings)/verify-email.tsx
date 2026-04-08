import { Ionicons } from "@expo/vector-icons";
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
import { useDispatch, useSelector } from "react-redux";
import { requestEmailChangeOtp, verifyEmailChangeOtp } from "../constants/api";
import { RootState } from "../store";
import { logout } from "../store/authSlice";

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || "";
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const token = useSelector((state: RootState) => state.auth.token);
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
    const code = otp.join("");
    setIsSubmitting(true);
    try {
      await verifyEmailChangeOtp({ email, code }, token!);
      dispatch(logout());
      router.replace("/(profile-and-settings)/success-email");
    } catch (err: any) {
      Alert.alert(
        "Verification Failed",
        err?.message || "Invalid or expired code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      await requestEmailChangeOtp(email, token!);
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
          <Text style={styles.headerTitle}>Verify Email</Text>
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
              <Text style={styles.description}>
                We've sent a 6-digit code to{" "}
                <Text style={styles.emailHighlight}>{email}</Text>. Enter it
                below to verify.
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

              <TouchableOpacity
                style={styles.resendContainer}
                onPress={handleResend}
                disabled={isResending}
              >
                <Text style={styles.resendText}>
                  Didn't get the code?{" "}
                  <Text style={styles.resendLink}>
                    {isResending ? "Sending..." : "Resend"}
                  </Text>
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
  },
  description: {
    color: "#757B85",
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 24,
  },
  emailHighlight: {
    color: "#B0BACB",
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  otpInput: {
    backgroundColor: "#1C1C1C",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    width: 50,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  resendContainer: {
    marginBottom: 32,
  },
  resendText: {
    color: "#757B85",
    fontSize: 14,
  },
  resendLink: {
    color: "#4A9DFF",
    fontWeight: "600",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  verifyButton: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyButtonDisabled: {
    backgroundColor: "#374151",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  verifyButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
