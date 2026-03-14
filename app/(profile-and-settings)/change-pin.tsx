import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
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

export default function ChangePINScreen() {
  const [currentPin, setCurrentPin] = useState(["", "", "", "", "", ""]);
  const router = useRouter();
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handlePinChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedPin = text.split("").slice(0, 6);
      const newPin = [...currentPin];
      pastedPin.forEach((char, i) => {
        if (i < 6) newPin[i] = char;
      });
      setCurrentPin(newPin);

      // Focus last input
      const lastIndex = Math.min(pastedPin.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newPin = [...currentPin];
    newPin[index] = text;
    setCurrentPin(newPin);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !currentPin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    // Store current PIN and navigate to create new PIN
    const pinString = currentPin.join("");
    router.push({
      pathname: "/create-new-pin",
      params: { oldPin: pinString },
    });
  };

  const isContinueDisabled = currentPin.some((digit) => !digit);

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
          <Text style={styles.headerTitle}>Change PIN</Text>
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
              <Text style={styles.description}>Enter PIN</Text>

              <View style={styles.pinContainer}>
                {currentPin.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
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

              <TouchableOpacity style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't get the code?{" "}
                  <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              isContinueDisabled && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={isContinueDisabled}
          >
            <Text
              style={[
                styles.continueButtonText,
                isContinueDisabled && styles.continueButtonTextDisabled,
              ]}
            >
              Proceed
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
    color: "#757B85",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
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
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  continueButton: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#374151",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
