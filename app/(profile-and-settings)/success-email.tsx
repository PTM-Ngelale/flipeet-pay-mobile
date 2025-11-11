import SuccessIcon from "@/assets/images/success-icon.svg";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function SuccessEmail() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Main Content - Centered */}
        <View style={styles.content}>
          <SuccessIcon />
          <View style={styles.textContainer}>
            <Text style={styles.title}>New Email Added</Text>
          </View>
        </View>

        {/* Close Button at Bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  textContainer: {
    position: "absolute",
    bottom: "25%",
    alignItems: "center",
    gap: 20,
  },
  title: {
    color: "#E2E6F0",
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    color: "#B0BACB",
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    padding: 20,
  },

  view: {
    backgroundColor: "#4A9DFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 14,
  },
  viewText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  closeButton: {
    backgroundColor: "#1A212A",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#4A9DFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
