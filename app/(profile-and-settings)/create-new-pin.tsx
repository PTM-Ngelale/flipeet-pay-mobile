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

export default function CreateNewPINScreen() {
  const [newPin, setNewPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const router = useRouter();
  const newPinRefs = useRef<Array<TextInput | null>>([]);
  const confirmPinRefs = useRef<Array<TextInput | null>>([]);

  const handleNewPinChange = (text: string, index: number) => {
    if (text.length > 1) {
      const pastedPin = text.split("").slice(0, 6);
      const updatedPin = [...newPin];
      pastedPin.forEach((char, i) => {
        if (i < 6) updatedPin[i] = char;
      });
      setNewPin(updatedPin);

      const lastIndex = Math.min(pastedPin.length - 1, 5);
      newPinRefs.current[lastIndex]?.focus();
      return;
    }

    const updatedPin = [...newPin];
    updatedPin[index] = text;
    setNewPin(updatedPin);

    if (text && index < 5) {
      newPinRefs.current[index + 1]?.focus();
    }

    // Auto-focus confirm PIN when new PIN is complete
    if (text && index === 5 && updatedPin.every((digit) => digit)) {
      confirmPinRefs.current[0]?.focus();
    }
  };

  const handleConfirmPinChange = (text: string, index: number) => {
    if (text.length > 1) {
      const pastedPin = text.split("").slice(0, 6);
      const updatedPin = [...confirmPin];
      pastedPin.forEach((char, i) => {
        if (i < 6) updatedPin[i] = char;
      });
      setConfirmPin(updatedPin);

      const lastIndex = Math.min(pastedPin.length - 1, 5);
      confirmPinRefs.current[lastIndex]?.focus();
      return;
    }

    const updatedPin = [...confirmPin];
    updatedPin[index] = text;
    setConfirmPin(updatedPin);

    if (text && index < 5) {
      confirmPinRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number, type: "new" | "confirm") => {
    const refs = type === "new" ? newPinRefs : confirmPinRefs;
    const pin = type === "new" ? newPin : confirmPin;

    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleSetPIN = () => {
    // Set new PIN logic would go here
    router.push("/success-pin");
  };

  const isNewPinComplete = newPin.every((digit) => digit);
  const isConfirmPinComplete = confirmPin.every((digit) => digit);
  const pinsMatch = newPin.join("") === confirmPin.join("");
  const isSetPinDisabled =
    !isNewPinComplete || !isConfirmPinComplete || !pinsMatch;

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
          <Text style={styles.headerTitle}>Create New PIN</Text>
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
              {/* New PIN Section */}
              <View style={styles.pinSection}>
                <Text style={styles.pinLabel}>Entire new PIN</Text>
                <View style={styles.pinContainer}>
                  {newPin.map((digit, index) => (
                    <TextInput
                      key={`new-${index}`}
                      ref={(ref) => (newPinRefs.current[index] = ref)}
                      style={styles.pinInput}
                      value={digit}
                      onChangeText={(text) => handleNewPinChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index, "new")}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      secureTextEntry
                    />
                  ))}
                </View>
              </View>

              {/* Confirm PIN Section */}
              <View style={styles.pinSection}>
                <Text style={styles.pinLabel}>Confirm new PIN</Text>
                <View style={styles.pinContainer}>
                  {confirmPin.map((digit, index) => (
                    <TextInput
                      key={`confirm-${index}`}
                      ref={(ref) => (confirmPinRefs.current[index] = ref)}
                      style={[
                        styles.pinInput,
                        isConfirmPinComplete &&
                          !pinsMatch &&
                          styles.pinInputError,
                      ]}
                      value={digit}
                      onChangeText={(text) =>
                        handleConfirmPinChange(text, index)
                      }
                      onKeyPress={(e) => handleKeyPress(e, index, "confirm")}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      secureTextEntry
                    />
                  ))}
                </View>
                {isConfirmPinComplete && !pinsMatch && (
                  <Text style={styles.errorText}>PINs do not match</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.setPinButton,
              isSetPinDisabled && styles.setPinButtonDisabled,
            ]}
            onPress={handleSetPIN}
            disabled={isSetPinDisabled}
          >
            <Text
              style={[
                styles.setPinButtonText,
                isSetPinDisabled && styles.setPinButtonTextDisabled,
              ]}
            >
              Create
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
  pinSection: {
    marginBottom: 32,
    // alignItems: "center",
  },
  pinLabel: {
    color: "#B0BACB",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
    // textAlign: "center",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
  pinInputError: {
    borderColor: "#FF5F5F",
  },
  errorText: {
    color: "#FF5F5F",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  setPinButton: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  setPinButtonDisabled: {
    backgroundColor: "#374151",
  },
  setPinButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  setPinButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
