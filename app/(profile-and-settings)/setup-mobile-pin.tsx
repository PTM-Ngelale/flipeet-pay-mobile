import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as secure from "../services/secure";
import { useDispatch, useSelector } from "react-redux";
import { setPin as setAuthPin } from "../store/authSlice";
import { apiRequest } from "../constants/api";
import type { RootState } from "../store";

export default function SetupMobilePin() {
  const router = useRouter();

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirm, setConfirm] = useState(["", "", "", "", "", ""]);
  const pinRefs = useRef<Array<TextInput | null>>([]);
  const confirmRefs = useRef<Array<TextInput | null>>([]);
  const dispatch = useDispatch<any>();
  const loading = useSelector((s: RootState) => s.auth.loading);
  const token = useSelector((s: RootState) => s.auth.token);

  const join = (arr: string[]) => arr.join("");

  const handleChange = (
    arrSetter: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<Array<TextInput | null>>,
    newArr: string[],
    index: number,
  ) => {
    arrSetter(newArr);
    if (newArr[index] && index < 5) refs.current[index + 1]?.focus();
  };

  const handleSave = async () => {
    const pinCode = join(pin);
    const confirmCode = join(confirm);
    if (pinCode.length !== 6) {
      Alert.alert("Invalid PIN", "Enter a 6-digit PIN.");
      return;
    }
    if (pinCode !== confirmCode) {
      Alert.alert("PIN mismatch", "PINs do not match.");
      return;
    }
    try {
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Try creating PIN via POST /user/pin
      await apiRequest(`/user/pin`, {
        method: "POST",
        body: { newPin: pinCode },
        token,
      });

      // Mark PIN as enabled for this device (do NOT persist raw PIN)
      try {
        await secure.setPinEnabled(true);
      } catch (e) {
        console.warn("Failed to set pinEnabled in secure store", e);
      }

      // Store in redux state (in-memory) but avoid persisting the raw PIN
      dispatch(setAuthPin(pinCode));
      Alert.alert("Success", "Mobile PIN saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.warn("Failed to set mobile PIN", err);
      const msg = err?.message || String(err) || "Failed to save PIN. Try again.";
      Alert.alert("Error", msg);
    }
  };

  const isDisabled = pin.some((d) => !d) || confirm.some((d) => !d);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.ka}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Set Mobile PIN</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.hint}>Create a 6-digit PIN to quick sign-in</Text>

          <View style={styles.row}>
            {pin.map((digit, i) => (
              <TextInput
                key={`p-${i}`}
                ref={(r) => (pinRefs.current[i] = r)}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(t) => {
                  const next = [...pin];
                  next[i] = t.slice(-1);
                  handleChange(setPin, pinRefs, next, i);
                }}
                secureTextEntry
              />
            ))}
          </View>

          <Text style={[styles.hint, { marginTop: 20 }]}>Confirm PIN</Text>
          <View style={styles.row}>
            {confirm.map((digit, i) => (
              <TextInput
                key={`c-${i}`}
                ref={(r) => (confirmRefs.current[i] = r)}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(t) => {
                  const next = [...confirm];
                  next[i] = t.slice(-1);
                  handleChange(setConfirm, confirmRefs, next, i);
                }}
                secureTextEntry
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.save, isDisabled && styles.saveDisabled]}
            onPress={handleSave}
            disabled={isDisabled}
          >
            <Text style={styles.saveText}>Save PIN</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  ka: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  back: { padding: 4 },
  title: { color: "#E2E6F0", fontSize: 18, fontWeight: "700" },
  content: { padding: 20, alignItems: "center" },
  hint: { color: "#9AA6B6", fontSize: 14, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", width: 280 },
  input: {
    width: 44,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#0B1220",
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  save: {
    marginTop: 28,
    backgroundColor: "#4A9DFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  saveDisabled: { backgroundColor: "#374151" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
