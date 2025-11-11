import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const About = () => {
  const router = useRouter();

  //   const handleWebsitePress = () => {

  //     Linking.openURL("https://www.flipeetpay.com");
  //   };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Flipeet Pay</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Privacy Policy Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.section}
            onPress={() => router.push("/")}
          >
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Privacy Policy</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Terms of Service Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.section}
            onPress={() => router.push("/")}
          >
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Terms of Service</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Visit our Website Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.section}>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Visit our Website</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 16,
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
  sectionContainer: {
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    marginBottom: 16,
  },
  section: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  description: {
    color: "#757B85",
    fontSize: 14,
  },
});
