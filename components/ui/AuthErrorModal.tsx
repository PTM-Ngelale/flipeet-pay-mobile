import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { clearError } from "../../app/store/authSlice";

export default function AuthErrorModal() {
  const dispatch = useDispatch<any>();
  const error = useSelector((s: RootState) => s.auth.error);
  const visible = Boolean(error);

  const close = () => dispatch(clearError());

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Authentication Error</Text>
          <Text style={styles.message}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={close}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#0B0B0B",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    color: "#E2E6F0",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
