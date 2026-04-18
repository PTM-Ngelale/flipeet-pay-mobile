import GoogleLogo from "@/assets/images/google-logo.svg";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
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
import { useDispatch } from "react-redux";
import pinApi from "../services/pinApi";
import {
  googleSignIn,
  setEmail as setAuthEmail,
  signIn,
} from "../store/authSlice";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setLocalEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch<any>();

  const useProxy = Constants.appOwnership === "expo";
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "flipeetpay",
    path: "oauth/redirect",
    useProxy,
  });
  const clientId =
    "289967638710-tjaaoepq7d43hkukdnt4r7acnv09raop.apps.googleusercontent.com";

  const [request, , promptAsync] = Google.useAuthRequest({
    clientId,
    redirectUri,
    responseType: "code",
    scopes: ["profile", "email", "openid"],
  });

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await promptAsync({ useProxy });
      if (result.type !== "success") return;

      const authCode = result.params?.code;
      if (!authCode)
        throw new Error("Authorization code not returned by Google");

      await dispatch(
        googleSignIn({ idToken: authCode, provider: "google", redirectUri }),
      ).unwrap();
      router.replace("/home");
    } catch (error: any) {
      Alert.alert(
        "Authentication Failed",
        error?.message || "Failed to sign in with Google. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsEmailLoading(true);
    dispatch(setAuthEmail(email));
    try {
      await dispatch(signIn({ email, password })).unwrap();

      try {
        const res = await pinApi.isPinAvailable(email);
        if (res.ok) {
          const body = await res.json().catch(() => ({}));
          const hasPinSet =
            body?.data?.pinExists === true ||
            body?.data?.available === true ||
            body?.data?.isPinSet === true ||
            body?.available === true;
          if (!hasPinSet) {
            router.replace(
              "/(profile-and-settings)/setup-mobile-pin?from=login",
            );
            return;
          }
        }
      } catch {
        // Network error — skip PIN check, go home
      }

      router.replace("/home");
    } catch (err: any) {
      console.error("Login failed:", err);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const isLoginDisabled = !email.trim() || !password.trim();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.subtitle}>Log in to your account</Text>
            </View>

            {/* Google Login */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isGoogleLoading || !request}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <GoogleLogo />
                  <Text style={styles.googleButtonText}>Login with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter Email</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#757B85"
                value={email}
                onChangeText={setLocalEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholderTextColor="#757B85"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#757B85"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (isLoginDisabled || isEmailLoading) && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoginDisabled || isEmailLoading}
            >
              {isEmailLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.loginButtonText,
                    isLoginDisabled && styles.loginButtonTextDisabled,
                  ]}
                >
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/sign-up")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: { marginBottom: 32 },
  welcomeText: {
    color: "#E2E6F0",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A4D8C",
    marginBottom: 24,
    gap: 12,
  },
  googleButtonText: {
    color: "#B0BACB",
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#A6B1C6" },
  dividerText: { color: "#757B85", paddingHorizontal: 16, fontSize: 16 },
  inputContainer: { marginBottom: 20 },
  inputLabel: {
    color: "#B0BACB",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
    color: "#FFFFFF",
    fontSize: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    borderWidth: 1,
  },
  passwordInput: { flex: 1, color: "#FFFFFF", fontSize: 16, padding: 16 },
  eyeIcon: { padding: 16 },
  loginButton: {
    backgroundColor: "#0A66D3",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  loginButtonTextDisabled: { color: "#F2F4F8" },
  signUpContainer: { flexDirection: "row", justifyContent: "center" },
  signUpText: { color: "#B0BACB", fontSize: 16 },
  signUpLink: { color: "#4A9DFF", fontSize: 14, fontWeight: "600" },
});
