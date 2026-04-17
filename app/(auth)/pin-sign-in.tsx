import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import pinApi from "../services/pinApi";
import * as secure from "../services/secure";
import { loadAuthState } from "../store/authSlice";

const BLUE = "#4A9DFF";
const PIN_LENGTH = 6;

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["biometrics", "0", "delete"],
];

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export default function PinSignIn() {
  const router = useRouter();
  const dispatch = useDispatch<any>();

  const [pin, setPin] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const storedEmail = await AsyncStorage.getItem("auth_email");
      if (storedEmail) setEmail(storedEmail);

      const userJson = await AsyncStorage.getItem("auth_user");
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          const name =
            user.username ||
            user.firstName ||
            user.name ||
            storedEmail?.split("@")[0] ||
            "";
          setUsername(name);
        } catch {}
      } else if (storedEmail) {
        setUsername(storedEmail.split("@")[0]);
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricsEnabled = await secure.isBiometricsEnabled();
      if (hasHardware && isEnrolled && biometricsEnabled) {
        setBiometricsAvailable(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (pin.length === PIN_LENGTH && !loading) {
      handleSubmit(pin.join(""));
    }
  }, [pin]);

  const handleKeyPress = (key: string) => {
    if (loading) return;
    if (key === "delete") {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < PIN_LENGTH) {
      setPin((prev) => [...prev, key]);
    }
  };

  const triggerBiometrics = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Sign in to Flipeet Pay",
      fallbackLabel: "Use PIN",
      cancelLabel: "Cancel",
    });
    if (!result.success) return;

    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      Alert.alert(
        "Session expired",
        "Please sign in with your PIN or email and password.",
      );
      return;
    }
    await dispatch(loadAuthState());
    router.replace("/home");
  };

  const offerBiometricsSetup = () => {
    Alert.alert(
      "Enable Biometrics",
      "Would you like to use Face ID / fingerprint to sign in next time?",
      [
        {
          text: "Not now",
          style: "cancel",
          onPress: () => router.replace("/home"),
        },
        {
          text: "Enable",
          onPress: async () => {
            await secure.setBiometricsEnabled(true);
            router.replace("/home");
          },
        },
      ],
    );
  };

  const handleSubmit = async (code: string) => {
    if (!email) {
      Alert.alert("Missing email", "Please sign in with email first.");
      setPin([]);
      return;
    }
    setLoading(true);
    try {
      const res = await pinApi.pinSignIn(email, parseInt(code, 10));
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "PIN sign-in failed");
      }
      const body = await res.json().catch(() => ({}));
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

      if (!token) throw new Error("No auth token returned from server");

      await AsyncStorage.setItem("auth_token", token);
      if (user) {
        const existingUserJson = await AsyncStorage.getItem("auth_user");
        const existingUser = existingUserJson
          ? JSON.parse(existingUserJson)
          : null;
        const existingAvatar = existingUser?.avatar;
        if (
          user.avatar === "default" &&
          existingAvatar &&
          existingAvatar !== "default"
        ) {
          user.avatar = existingAvatar;
        }
        await AsyncStorage.setItem("auth_user", JSON.stringify(user));
      }
      await AsyncStorage.setItem("auth_email", email);
      await dispatch(loadAuthState()).unwrap();

      if (biometricsAvailable) {
        const alreadyEnabled = await secure.isBiometricsEnabled();
        if (!alreadyEnabled) {
          offerBiometricsSetup();
          return;
        }
      }
      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Sign-in failed", err?.message || String(err));
      setPin([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoWrap}>
        <Image
          source={require("@/assets/images/flipeet-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Greeting */}
      <View style={styles.greetingWrap}>
        <Text style={styles.greeting}>
          Hello{username ? `, ${capitalize(username)}` : ""}
        </Text>
        <Text style={styles.subtitle}>Enter your Passcode to Unlock</Text>
      </View>

      {/* PIN dot boxes */}
      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View key={i} style={styles.dotBox}>
            <View style={[styles.dot, i < pin.length && styles.dotFilled]} />
          </View>
        ))}
      </View>

      {/* Forgot Passcode / Loading indicator */}
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={BLUE} />
          <Text style={styles.loadingText}>Signing you in…</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => router.push("/(auth)/request-pin-otp")}
          style={styles.forgotWrap}
        >
          <Text style={styles.forgotText}>Forgot Passcode?</Text>
        </TouchableOpacity>
      )}

      <View style={{ flex: 1 }} />

      {/* Keypad */}
      <View style={[styles.keypad, loading && styles.keypadDisabled]}>
        {KEYPAD_ROWS.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key) => {
              if (key === "biometrics") {
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.keyButton,
                      styles.keyButtonGhost,
                      !biometricsAvailable && styles.keyButtonInvisible,
                    ]}
                    onPress={triggerBiometrics}
                    disabled={!biometricsAvailable || loading}
                  >
                    <Ionicons name="finger-print" size={30} color={BLUE} />
                  </TouchableOpacity>
                );
              }
              if (key === "delete") {
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.keyButton, styles.keyButtonGhost]}
                    onPress={() => handleKeyPress("delete")}
                    disabled={loading}
                  >
                    <Ionicons name="backspace-outline" size={26} color="#E2E6F0" />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.keyButton}
                  onPress={() => handleKeyPress(key)}
                  disabled={loading}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    paddingBottom: 16,
  },
  logoWrap: {
    marginTop: 32,
    marginBottom: 24,
    alignItems: "center",
  },
  logo: {
    width: 56,
    height: 56,
  },
  greetingWrap: {
    alignItems: "center",
    gap: 6,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 30,
    fontWeight: "800",
    color: "#E2E6F0",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: BLUE,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  dotBox: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  dotFilled: {
    backgroundColor: BLUE,
  },
  loadingRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: "500",
  },
  forgotWrap: {
    marginTop: 4,
  },
  keypadDisabled: {
    opacity: 0.35,
  },
  forgotText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  keypad: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 10,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  keyButton: {
    flex: 1,
    height: 68,
    borderRadius: 14,
    backgroundColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
  },
  keyButtonGhost: {
    backgroundColor: "transparent",
  },
  keyButtonInvisible: {
    opacity: 0,
    pointerEvents: "none",
  },
  keyText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#E2E6F0",
  },
});
