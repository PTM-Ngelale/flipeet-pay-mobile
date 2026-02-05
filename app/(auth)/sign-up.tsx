import GoogleLogo from "@/assets/images/google-logo.svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
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
import {
  googleSignIn,
  requestOtp,
  setEmail as setAuthEmail,
  signUp,
} from "../store/authSlice";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const [email, setLocalEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<any>();

  const handleGoogleSignUp = async () => {
    try {
      // Use Expo-hosted redirect URL for better compatibility
      const redirectUrl = "https://auth.expo.io/@PTM-Ngelale/flipeet-pay";
      const clientId =
        "289967638710-tjaaoepq7d43hkukdnt4r7acnv09raop.apps.googleusercontent.com";

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `response_type=token&` +
        `scope=profile email&` +
        `include_granted_scopes=true`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl,
      );

      if (result.type === "success") {
        const url = result.url;
        const accessToken = url.match(/access_token=([^&]+)/)?.[1];

        if (accessToken) {
          const response = await fetch(
            "https://api.pay.flipeet.io/api/v1/auth/oauth/validate",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: accessToken }),
            },
          );

          const data = await response.json();

          if (response.ok && data.data?.credentials?.accessToken) {
            const token = data.data.credentials.accessToken;

            await dispatch(googleSignIn({ token })).unwrap();
            router.replace("/home");
          } else {
            throw new Error(data.message || "Failed to authenticate");
          }
        }
      }
    } catch (error: any) {
      console.error("Google sign-up failed:", error);
      Alert.alert(
        "Authentication Failed",
        error?.message || "Failed to sign up with Google. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  const handleSignUp = async () => {
    // Create account with email and password
    dispatch(setAuthEmail(email));

    const payload = {
      firstname: "",
      lastname: "",
      email: email,
      phonenumber: "",
      password: password,
      isMerchant: false,
      company: "",
      companyCountry: "",
      businessType: "",
    };

    try {
      // Step 1: Create the account
      await dispatch(signUp(payload)).unwrap();
      console.log("Account created successfully");

      // Step 2: Request OTP for email verification
      await dispatch(requestOtp({ email, type: "signup" })).unwrap();
      console.log("OTP sent to email");

      // Step 3: Navigate to verify-email screen
      router.push({
        pathname: "/verify-email",
        params: { email, flow: "signup" },
      });
    } catch (err: any) {
      // Error is already set in Redux by the thunk rejection
      // The AuthErrorModal will display it automatically
      console.warn("sign-up failed", err);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const passwordsMatch = password === confirmPassword;
  const isSignUpDisabled =
    !email?.trim() ||
    !password?.trim() ||
    !confirmPassword?.trim() ||
    !passwordsMatch;

  // keep local state var name aligned
  function setEmail(v: string) {
    setLocalEmail(v);
  }

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
              <Text style={styles.welcomeText}>Create account</Text>
              <Text style={styles.subtitle}>
                Welcome to Flipeet Pay - Let's create your account{" "}
              </Text>
            </View>

            {/* Google Sign Up Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignUp}
            >
              <GoogleLogo />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text style={{ color: "#E2E6F0", fontSize: 20, fontWeight: 700 }}>
                Sign up with email
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
                onChangeText={setEmail}
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

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#757B85"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#757B85"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isSignUpDisabled && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isSignUpDisabled}
            >
              <Text
                style={[
                  styles.signUpButtonText,
                  isSignUpDisabled && styles.signUpButtonTextDisabled,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Have an existing account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Log in</Text>
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
    fontSize: 14,
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
    marginBottom: 32,
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
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },
  signUpButton: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    backgroundColor: "#374151",
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButtonTextDisabled: {
    color: "#9CA3AF",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#757B85",
    fontSize: 14,
  },
  loginLink: {
    color: "#4A9DFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
