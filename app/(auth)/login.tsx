import GoogleLogo from "@/assets/images/google-logo.svg";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
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

  console.log(redirectUri);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await promptAsync({ useProxy });
      if (result.type !== "success") return;

      const authCode = result.params?.code;
      if (!authCode) {
        throw new Error("Authorization code not returned by Google");
      }

      await dispatch(
        googleSignIn({
          token: authCode,
        }),
      ).unwrap();
      if (keepLoggedIn) {
        await AsyncStorage.setItem("auth_keep_logged_in", "true");
      } else {
        await AsyncStorage.removeItem("auth_keep_logged_in");
      }
      router.replace("/home");
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
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
    // Authenticate with email+password
    dispatch(setAuthEmail(email));

    try {
      const result = await dispatch(signIn({ email, password })).unwrap();
      console.log("Login successful, result:", result);
      // Only navigate if we have a successful response
      router.replace(`/home`);
    } catch (err: any) {
      // Error is already set in Redux by the thunk rejection
      // The AuthErrorModal will display it automatically
      console.error("Login failed:", err);
      // Stay on login screen when authentication fails
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/sign-up");
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

            {/* Google Login Button */}
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

            <View style={{ marginBottom: 30 }}>
              <Text style={{ color: "#E2E6F0", fontSize: 20, fontWeight: 700 }}>
                Login with email
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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

            {/* Keep me logged in */}
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setKeepLoggedIn(!keepLoggedIn)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    keepLoggedIn && styles.checkboxChecked,
                  ]}
                >
                  {keepLoggedIn && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
              <Text style={styles.rememberMeText}>
                Keep me logged in on this device
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (isLoginDisabled || isEmailLoading) &&
                  styles.loginButtonDisabled,
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
                  Log In
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Sign up</Text>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    // alignItems: "center",
    marginBottom: 40,
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#757B85",
    fontSize: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1C",
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    marginBottom: 24,
    gap: 12,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#374151",
  },
  dividerText: {
    color: "#757B85",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1C1C1C",
    color: "#FFFFFF",
    fontSize: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  passwordInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    padding: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#757B85",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#28A745",
    borderColor: "#28A745",
  },
  rememberMeText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: "#374151",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButtonTextDisabled: {
    color: "#9CA3AF",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signUpText: {
    color: "#757B85",
    fontSize: 14,
  },
  signUpLink: {
    color: "#4A9DFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
