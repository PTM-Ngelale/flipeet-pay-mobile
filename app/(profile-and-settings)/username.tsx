import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
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
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { updateUsername } from "../store/authSlice";

export default function UsernameScreen() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const currentUsername = useSelector(
    (state: RootState) => state.auth.user?.name,
  );

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    try {
      await dispatch(updateUsername(username.trim())).unwrap();
      Alert.alert("Success", "Username updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error || "Failed to update username");
    }
  };

  const isSaveButtonDisabled = !username.trim();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add a username</Text>
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
              {/* <Text style={styles.title}>Choose your username</Text>
              <Text style={styles.description}>
                This username will be visible to other users.
              </Text> */}

              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="#757B85"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={
                  !isSaveButtonDisabled ? handleSaveUsername : undefined
                }
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSaveButtonDisabled || loading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveUsername}
            disabled={isSaveButtonDisabled || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  isSaveButtonDisabled && styles.saveButtonTextDisabled,
                ]}
              >
                {currentUsername ? "Update" : "Add"}
              </Text>
            )}
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
    // paddingTop: 40,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    color: "#757B85",
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#1C1C1C",
    color: "#FFFFFF",
    fontSize: 16,
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  saveButton: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#374151",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
