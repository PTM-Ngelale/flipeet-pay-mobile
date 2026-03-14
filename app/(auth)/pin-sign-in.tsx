import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import pinApi from "../services/pinApi";
import { loadAuthState } from "../store/authSlice";

export default function PinSignIn() {
  const router = useRouter();
  const dispatch = useDispatch<any>();

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const refs = useRef<Array<TextInput | null>>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("auth_email");
      if (stored) setEmail(stored);
    })();
  }, []);

  const join = (arr: string[]) => arr.join("");

  const handleChange = (newArr: string[], index: number) => {
    setPin(newArr);
    if (newArr[index] && index < 5) refs.current[index + 1]?.focus();
  };

  const handleBack = () => router.back();

  const handleSubmit = async () => {
    const code = join(pin);
    if (code.length !== 6) {
      Alert.alert("Invalid PIN", "Enter your 6-digit PIN.");
      return;
    }
    if (!email) {
      Alert.alert("Missing email", "Please enter your account email.");
      return;
    }

    setLoading(true);
    try {
      const res = await pinApi.pinSignIn(email, parseInt(code, 10));
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg = err?.message || "PIN sign-in failed";
        throw new Error(msg);
      }
      const body = await res.json().catch(() => ({}));

      // Try to extract token/user similar to signIn handler
      const data = body.data || {};
      const credentials = data.credentials || {};
      const token =
        credentials.accessToken ||
        body.accessToken ||
        body.token ||
        data.accessToken ||
        data.token ||
        null;
      const user = body.user || data.user || null;

      if (!token) {
        throw new Error("No auth token returned from server");
      }

      // Persist auth state consistently with existing app
      await AsyncStorage.setItem("auth_token", token);
      if (user) await AsyncStorage.setItem("auth_user", JSON.stringify(user));
      await AsyncStorage.setItem("auth_email", email);

      // Load into redux state
      await dispatch(loadAuthState()).unwrap();

      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Sign-in failed", err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = pin.some((d) => !d) || !email;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.ka}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
          </TouchableOpacity>
          <Text style={styles.title}>Sign in with PIN</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.hint}>Enter your 6-digit PIN to sign in</Text>

          <View style={styles.row}>
            {pin.map((digit, i) => (
              <TextInput
                key={`p-${i}`}
                ref={(r) => (refs.current[i] = r)}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(t) => {
                  const next = [...pin];
                  next[i] = t.slice(-1);
                  handleChange(next, i);
                }}
                secureTextEntry
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submit, isDisabled && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={isDisabled || loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Signing in..." : "Sign in"}
            </Text>
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
  submit: {
    marginTop: 28,
    backgroundColor: "#4A9DFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  submitDisabled: { backgroundColor: "#374151" },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
