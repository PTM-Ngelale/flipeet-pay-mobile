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
    heading: "1. Eligibility",
    body: `You must be at least 18 years old or the legal age of majority in your jurisdiction and have the legal capacity to enter into these Terms. Businesses must be duly organized, validly existing, and in good standing under the laws of their jurisdiction of incorporation or registration.`,
  },
  {
    heading: "2. The Services Description",
    body: `Flipeet Pay provides a stablecoin payment infrastructure that enables individuals and businesses to:
• Accept payments in supported stablecoins ("Stablecoin Payments");
• On-ramp (convert fiat to stablecoins) and off-ramp (convert stablecoins to fiat) in multiple currencies;
• Manage, track, and reconcile payments via the Platform;
• Integrate payment flows with web, mobile, and POS interfaces;
• Access real-time and historical transaction data.

The Platform supports KYC, AML, and other compliance checks to maintain regulatory alignment.`,
  },
  {
    heading: "3. Account Registration and Verification",
    body: `To use the Services, you must register for a Flipeet Pay account and complete our identity verification process. You agree to:
• Provide accurate and complete information;
• Update your account information as necessary;
• Cooperate with additional verification requests;
• Maintain the confidentiality of your account credentials;
• Notify us immediately of unauthorized use.

Flipeet may suspend or terminate access if verification is incomplete or noncompliant.`,
  },
  {
    heading: "4. Supported Assets and Currencies",
    body: `Flipeet Pay supports specific stablecoins (e.g., USDC, USDT) and fiat currencies (e.g., USD, EUR, NGN and more). We may add or remove supported currencies or assets at our discretion. You acknowledge that the value of digital assets can fluctuate and that Flipeet Pay is not liable for any losses arising from price changes or volatility.`,
  },
  {
    heading: "5. Transaction Fees",
    body: `Flipeet Pay charges transaction fees for services including:
• Processing Stablecoin Payments;
• On-ramps and off-ramps;
• Network gas fees and conversion spread fees.

Fees are disclosed before each transaction and may vary by volume, region, or account tier. By using the Services, you consent to these charges and authorize automatic deduction from your balance or transaction amount.

Flipeet Pay reserves the right to revise fees with notice posted on the Platform or sent to registered Users.`,
  },
  {
    heading: "6. Compliance and Prohibited Use",
    body: `You agree not to use the Services for illegal purposes or activities, including but not limited to:
• Money laundering or terrorism financing;
• Fraud or identity theft;
• Transactions involving illegal goods or services;
• Sanctioned entities or jurisdictions.

Flipeet Pay enforces compliance measures, including identity verification (KYC), risk scoring, and transaction monitoring. We reserve the right to report suspicious activity to relevant authorities.`,
  },
  {
    heading: "7. On-ramp and Off-ramp Transactions",
    body: `On-ramp and off-ramp services may require integration with banking providers, payment processors, or liquidity providers. All conversions are subject to:
• Real-time exchange rates;
• Applicable fees;
• Regulatory requirements in your jurisdiction.

Processing times may vary based on the chosen method, banking hours, and compliance checks.`,
  },
  {
    heading: "8. Limitation of Liability",
    body: `To the maximum extent permitted by law, Flipeet Pay shall not be liable for:
• Any indirect, incidental, special, or consequential damages;
• Loss of profits, data, or goodwill;
• Service interruptions, delays, or failures beyond our control;
• Losses due to unauthorized account access.

Total liability under these Terms shall not exceed the amount paid by you to Flipeet Pay in the three months prior to the claim.`,
  },
  {
    heading: "9. No Financial or Investment Advice",
    body: `Flipeet Pay does not provide legal, tax, financial, or investment advice. Any use of stablecoins or conversion services is solely at your own risk and discretion.`,
  },
  {
    heading: "10. Privacy and Data Use",
    body: `Your use of the Services is also governed by our Privacy Policy, which explains how we collect, use, and store your personal data. By using the Platform, you consent to our data practices.`,
  },
  {
    heading: "11. Intellectual Property",
    body: `All content, trademarks, logos, software, and technology provided through the Platform are the property of Flipeet Pay or its licensors. You may not copy, modify, distribute, sell, or create derivative works without prior written permission.`,
  },
  {
    heading: "12. Suspension and Termination",
    body: `We may suspend or terminate your access to the Services at our sole discretion, including for:
• Violation of these Terms;
• Failure to complete verification;
• Suspected unlawful activity.

Total liability under these Terms shall not exceed the amount paid by you to Flipeet Pay in the three months prior to the claim.`,
  },
  {
    heading: "13. Amendments",
    body: `We may update these Terms from time to time. Changes become effective upon posting to the Platform. Continued use after changes constitutes acceptance.`,
  },
  {
    heading: "14. Governing Law and Dispute Resolution",
    body: `These Terms are governed by the laws of Rivers State, Nigeria. Any disputes shall be resolved through binding arbitration or courts located in Port Harcourt, Nigeria, unless prohibited by local law.`,
  },
  {
    heading: "15. Contact Information",
    body: `For questions or support, contact us at:

Flipeet Labs Ltd.
Email: support@flipeet.io
Website: flipeet.io`,
  },
];

export default function TermsOfService() {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.updatedDate}>Updated June 3, 2025</Text>
        <Text style={styles.pageTitle}>Our Terms of Service</Text>
        <Text style={styles.pageSubtitle}>
          Read our Terms below to learn more about your rights and
          responsibilities as a Flipeet Pay user.
        </Text>

        <Text style={styles.introParagraph}>
          These Terms of Service ("Terms") constitute a binding legal agreement
          between you ("User," "you," or "your") and Flipeet Pay Ltd.
          ("Flipeet," "we," "us," or "our") governing your access to and use of
          Flipeet Pay (the "Platform"), including related services, technologies,
          and applications (collectively, the "Services").{"\n\n"}By accessing
          or using the Services, you acknowledge that you have read, understood,
          and agree to be bound by these Terms. If you do not agree, do not
          access or use the Services.
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
