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

const sections = [
  {
    heading: "1. Information We Collect",
    body: `1.1 Information You Provide
We collect the information you voluntarily provide during:
• Account registration (e.g., name, email, business name, phone number)
• Identity verification (e.g., date of birth, government-issued ID, proof of address)
• On-ramp or off-ramp transactions (e.g., bank account or crypto wallet details)
• Customer support interactions (e.g., emails, chat messages)

1.2 Information We Collect Automatically
When you use the Services, we automatically collect:
• Device and browser information
• IP address and geolocation
• Transaction metadata (e.g., amounts, timestamps, currencies used)
• Usage activity (e.g., pages visited, actions performed)

1.3 Information from Third Parties
We may collect information from:
• Identity verification providers
• Financial institutions
• Public databases
• Blockchain data providers`,
  },
  {
    heading: "2. How We Use Your Information",
    body: `We use your information to:
• Provide and maintain our Services
• Process transactions and execute conversions
• Verify your identity and comply with KYC/AML obligations
• Detect and prevent fraud or security incidents
• Communicate with you about your account, updates, and support
• Improve and personalize the user experience
• Comply with legal and regulatory requirements`,
  },
  {
    heading: "3. How We Share Your Information",
    body: `We may share your information with:
• Service Providers: e.g., payment processors, identity verification vendors, cloud providers
• Regulators and Law Enforcement: to comply with applicable laws, subpoenas, or investigations
• Business Partners: only where necessary to deliver the Service
• Corporate Transactions: if we merge, sell, or transfer assets, your information may be part of the transaction
• With Your Consent: in any case where you explicitly authorize sharing

We do not sell your personal data.`,
  },
  {
    heading: "4. Legal Bases for Processing (for EEA Users)",
    body: `If you are in the European Economic Area, we process your personal data under the following legal bases:
• Performance of a contract
• Compliance with legal obligations
• Legitimate interests (e.g., fraud prevention, service improvements)
• Consent (e.g., for marketing communications)`,
  },
  {
    heading: "5. International Data Transfers",
    body: `We may transfer your data to countries outside your jurisdiction, including the United States or countries where our partners operate. We implement safeguards such as standard contractual clauses or equivalent legal mechanisms where required by law.`,
  },
  {
    heading: "6. Data Retention",
    body: `We retain your personal information for as long as necessary to:
• Provide the Services
• Comply with legal, regulatory, tax, or accounting obligations
• Resolve disputes and enforce our agreements

Upon closure of your account, we retain data only as required by law or our legitimate interests.`,
  },
  {
    heading: "7. Your Privacy Rights",
    body: `Depending on your location, you may have the right to:
• Access your personal information
• Correct or update inaccurate data
• Request deletion of your data
• Object to or restrict processing
• Withdraw consent (where processing is based on consent)
• Port your data to another provider

To exercise your rights, contact us at support@flipeet.io. We may require verification of your identity before processing your request.`,
  },
  {
    heading: "8. Cookies and Tracking Technologies",
    body: `We use cookies and similar technologies to:
• Analyze traffic and usage trends
• Remember your preferences
• Enhance site functionality

You may control cookie preferences via browser settings or our cookie banner (if applicable).`,
  },
  {
    heading: "9. Data Security",
    body: `We implement industry-standard security measures, including:
• Data encryption (in transit and at rest)
• Role-based access control
• Secure infrastructure and storage
• Regular security audits and vulnerability testing

Despite our efforts, no method of transmission or storage is 100% secure. Use the Services at your own risk.`,
  },
  {
    heading: "10. Children's Privacy",
    body: `Flipeet Pay is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If we learn we have collected such data, we will delete it promptly.`,
  },
  {
    heading: "11. Changes to This Privacy Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Platform. Continued use after updates constitutes your acceptance.`,
  },
  {
    heading: "12. Contact Us",
    body: `For questions, concerns, or data requests, contact:

Flipeet Labs Ltd.
Email: support@flipeet.io
Website: flipeet.io`,
  },
];

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.updatedDate}>Updated June 3, 2025</Text>
        <Text style={styles.pageTitle}>Privacy Policy</Text>
        <Text style={styles.pageSubtitle}>
          Read our Privacy Policy below to learn more about your rights and
          responsibilities as a Flipeet Pay user.
        </Text>

        <Text style={styles.introParagraph}>
          Flipeet Pay Ltd. ("Flipeet," "we," "us," or "our") is committed to
          protecting your privacy. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you visit or use
          our platform ("Flipeet Pay"), including web and mobile applications
          (the "Services").{"\n\n"}By using the Services, you consent to the
          practices described in this Policy. If you do not agree, please do not
          use our Services.
        </Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  updatedDate: {
    color: "#757B85",
    fontSize: 13,
    marginBottom: 8,
  },
  pageTitle: {
    color: "#E2E6F0",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  pageSubtitle: {
    color: "#9AA6B6",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  introParagraph: {
    color: "#B0BACB",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeading: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionBody: {
    color: "#B0BACB",
    fontSize: 14,
    lineHeight: 22,
  },
});
