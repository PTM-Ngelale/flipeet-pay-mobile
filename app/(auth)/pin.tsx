import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { setPin as setAuthPin, setError, signIn } from "../store/authSlice";

export default function PinScreen() {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const flow = params.flow as string; // 'login' or 'signup'
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const dispatch = useDispatch<AppDispatch>();

  const isLoginFlow = flow === "login";
  const isSignupFlow = flow === "signup";

  const handlePinChange = (text: string, index: number) => {
    if (text.length > 1) {
      const pastedPin = text.split("").slice(0, 6);
      const newPin = [...pin];
      pastedPin.forEach((char, i) => {
        if (i < 6) newPin[i] = char;
      });
      setPin(newPin);

      const lastIndex = Math.min(pastedPin.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const email = useSelector((s: RootState) => s.auth.email);
  const storedPin = useSelector((s: RootState) => s.auth.pin);

  const handleSubmit = async () => {
    if (pin.some((digit) => !digit)) return;
    const pinCode = pin.join("");

    if (isLoginFlow) {
      // For login: compare entered PIN against stored PIN from signup flow (demo)
      if (!email) {
        console.warn("email missing for login");
        return;
      }
      if (!storedPin) {
        // Fall back to server verification if no stored PIN
        try {
          await dispatch(signIn({ email, password: pinCode })).unwrap();
          router.replace("/(tabs)");
          return;
        } catch (err) {
          console.warn("sign-in failed", err);
          dispatch(setError("Login failed. Please try again."));
          return;
        }
      }

      if (pinCode === storedPin) {
        router.replace("/(tabs)");
      } else {
        dispatch(setError("Incorrect PIN. Please try again."));
      }
    } else if (isSignupFlow) {
      // Store the PIN (account already created in sign-up screen)
      dispatch(setAuthPin(pinCode));
      router.replace("/login");
    }
  };

  const handleForgotPin = () => {
    // Navigate to reset PIN flow
    console.log("Forgot PIN pressed");
    // router.push("/reset-pin");
  };

  const isSubmitDisabled = pin.some((digit) => !digit);

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
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isLoginFlow ? "" : ""}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputSection}>
            <Text style={styles.title}>
              {isLoginFlow ? "Enter PIN" : "Create PIN"}
            </Text>
            {/* <Text style={styles.description}>
              {isLoginFlow
                ? "Enter your 6-digit PIN to access your account"
                : "Create a 6-digit PIN to secure your account"}
            </Text> */}

            <View style={styles.pinContainer}>
              {pin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.pinInput}
                  value={digit}
                  onChangeText={(text) => handlePinChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  secureTextEntry
                />
              ))}
            </View>

            {/* Forgot PIN link - only show for login flow */}
            {isLoginFlow && (
              <TouchableOpacity
                style={styles.forgotPinContainer}
                onPress={handleForgotPin}
              >
                <Text style={{ color: "#B0BACB" }}>Forgot PIN?</Text>
                <Text style={styles.forgotPinText}> Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitDisabled && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          >
            <Text
              style={[
                styles.submitButtonText,
                isSubmitDisabled && styles.submitButtonTextDisabled,
              ]}
            >
              {isLoginFlow ? "Login" : "Create PIN"}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  inputSection: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    color: "#757B85",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    marginTop: 10,
  },
  pinInput: {
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
  forgotPinContainer: {
    marginBottom: 32,
    flexDirection: "row",
  },
  forgotPinText: {
    color: "#4A9DFF",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  submitButton: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#374151",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
