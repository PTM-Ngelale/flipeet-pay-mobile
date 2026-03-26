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
    heading: "ACCESS AND USE OF THE SERVICES",
    body: `The Services Description: Flipeet Pay provides a platform (the "Platform") that enables individuals and businesses (collectively, the "Users") to accept payments in stablecoins ("Stablecoin Payments"), and to convert ("onramp" or "offramp") stablecoins into various fiat currencies and vice versa. The Platform facilitates the secure and compliant transfer of value using blockchain-based stablecoins and integrates with fiat banking systems and crypto wallets to support seamless transactions. Through Flipeet Pay, Users can initiate, receive, manage, and reconcile stablecoin payments for goods, services, or other purposes, subject to applicable laws and compliance requirements.

Transaction Fees: Flipeet Pay charges a transaction fee for each Stablecoin Payment processed through the Platform, including for onramp and offramp conversions. The applicable fees may vary depending on the type of transaction, volume, region, or User tier, and will be clearly disclosed prior to confirmation of each transaction. By using the Platform, Users agree to pay all applicable fees and authorize Flipeet Pay to deduct such fees automatically from the transaction amount or the User's balance. Flipeet Pay reserves the right to update its fee structure at any time, with notice provided to Users via the Platform or registered communication channels.`,
  },
  {
    heading: "Definitions",
    body: `For the purposes of these Terms of Service, the following definitions apply:

Company: Refers to Paycrest, Inc., the entity that provides the Services described in these Terms.

Services: Encompasses all products and services provided by the Company, including but not limited to Paycrest Protocol, noblocks.xyz, and any future offerings developed by the Company.

Service: Refers to an individual product or service provided by the Company, as specified in particular clauses of these Terms.

User: Any individual or entity that accesses or uses the Services provided by the Company.

Third-Party Providers: Entities or services that are not directly operated by the Company but are involved in the operation of the Services, including those providing technological support, identity verification, and other related functions.

Transaction: Any action initiated through the Services that involves the transfer or exchange of value, whether in cryptocurrency or other forms.

Provider: The decentralized system or group of entities involved in the processing, conversion, or transfer of value within the scope of the Services.

Recipient: The individual or entity designated to receive the outcome of a transaction initiated through the Services.`,
  },
  {
    heading: "1. Introduction",
    body: `1.1 Services Overview
Paycrest, Inc. ("the Company") provides a suite of decentralized financial Services built on blockchain technology. Our primary offering, Paycrest Protocol, is a decentralized network designed to securely and efficiently route payment instructions to liquidity provision nodes.

One of the Services built on top of Paycrest Protocol is noblocks.xyz, an interface that allows senders create payment intents for Paycrest Protocol. These Terms of Use govern your access to and use of all Paycrest, Inc. products, including Paycrest Protocol, noblocks.xyz, and any future Services developed by Paycrest, Inc. ("the Services"), except where we expressly state that separate terms (and not these) apply.

1.2 Legal Entity
Paycrest, Inc. which is registered in Delaware, is the official legal entity accountable for delivering and managing the Services. All legal responsibilities and obligations related to the Services are held by the Company.`,
  },
  {
    heading: "2. Eligibility",
    body: `2.1 User Requirement
To use the Services, you must meet the following criteria:

a. Age Requirement: You must be at least 18 years old, or of legal age in your jurisdiction, to enter into a legally binding agreement.

b. Legal Capacity: You must have the legal capacity and authority to enter into and be bound by these Terms.

c. Compliance with Laws: You must comply with all applicable local, national, and international laws, regulations, and guidelines related to the use of the Services, including any financial and anti-money laundering regulations.

d. Account Accuracy: When using the Services, you agree to provide accurate, current, and complete information, and to update this information as necessary to ensure it remains accurate.

2.2 Restrictions for Users of noblocks.xyz
a. Geographical Restrictions: noblocks.xyz is not available in the United States or countries flagged for terrorism concerns, including but not limited to those listed by the U.S. Department of State or OFAC (North Korea, Iran, Syria, Sudan, Afghanistan, Iraq, Libya, Yemen).

b. Politically Exposed Persons (PEPs): The Company imposes restrictions on transactions involving Politically Exposed Persons, including Heads of State or Government, senior politicians, senior executives of state-owned enterprises, high-ranking military officials, and their immediate family members or close associates.

2.3 Disclaimer of Liability for Users of noblocks.xyz
By accessing or using noblocks.xyz, you affirm that you are not located in any restricted location. Accessing or using the Service from restricted locations is not authorized, and users who do so take on full responsibility for any consequences.

2.4 By using the Services, you represent and warrant that you meet these requirements and that you will comply with all applicable laws and regulations.

2.5 Wallet Connection
To fully access and utilize the Services, you must connect your cryptocurrency wallet. By connecting your wallet, you are responsible for the accuracy and security of your wallet information and compliance with any legal or regulatory requirements.

2.6 User Responsibility
You are solely responsible for ensuring the accuracy of all recipient information provided during a transaction.`,
  },
  {
    heading: "3. Use of the Services",
    body: `3.1 You are permitted to use the Services solely for lawful purposes and in compliance with these Terms. Specifically, you agree:

a. Not to use the Services in any manner that would breach any applicable laws or regulations.

b. Not to engage in any fraudulent, unlawful, or harmful activity, including money laundering, terrorist financing, or any other illegal activities.

c. To use the Services in a manner that is ethical and respectful of others' rights.

d. Not to engage in any activity that could damage, disable, or impair the Services.

e. Not to attempt to gain unauthorized access to any portion of the Services.

f. Not to contravene any financial regulations, including those related to currency control, sanctions, and anti-money laundering (AML) laws.

3.2 Any misuse of the Services may result in the suspension or termination of your account, as well as potential legal action.`,
  },
  {
    heading: "4. Use of noblocks.xyz Service",
    body: `4.1 When you initiate a transaction through the Service, your digital assets are transferred to a Gateway smart contract, where they are securely held in escrow until confirmation of receipt of the equivalent funds from the payment service provider.

4.2 Transaction Timing
Transactions are typically completed within 30 seconds. However, actual completion times may vary due to network congestion, blockchain confirmation times, or other factors beyond the Company's control.

4.3 Transaction Limits and Refunds
The Service does not enforce specific transaction limits, but successful completion is contingent upon the availability of sufficient liquidity. If liquidity is unavailable, the cryptocurrency escrowed will be promptly refunded to your wallet.

4.4 Value Conversion
The value applied to your transaction is determined at the moment of conversion. The Company does not guarantee that the value applied will be the most favorable, and cannot be contested or adjusted once a transaction is initiated.

4.4 Costs and Donations
The Service is designed to be free to use. However, any contributions or transaction-related costs will be clearly disclosed to you before you complete each transaction.`,
  },
  {
    heading: "5. Terms for Providers",
    body: `5.1 Engagement with Providers
Providers are third-party entities that supply rates and facilitate the conversion of digital assets to local value within the network.

5.2 Responsibilities of Providers
Providers are responsible for delivering accurate and timely information regarding rates and availability of local value.

5.3 Obligations of Providers
Providers agree to maintain the confidentiality of all transaction data and user information and must promptly address any issues or discrepancies.

5.4 Limitations and Liability
The Company is not liable for any actions or omissions by Providers.

5.5 Termination and Suspension
The Company reserves the right to terminate or suspend the engagement of any Provider that fails to comply with these Terms.

5.6 Changes and Updates
The Company may update the terms and conditions applicable to Providers from time to time.

5.7 Third-Party Involvement
The Services utilize third-party providers within a peer-to-peer network to handle key aspects of value conversion, fund transfers, and identity verification. The Company cannot control and is not responsible for the actions, decisions, or omissions of these third-party providers.

5.8 Third-Party Terms
Your use of third-party services is subject to additional terms set by those third parties. The Company does not endorse or assume responsibility for the content, quality, or reliability of third-party providers.`,
  },
  {
    heading: "6. Use of Paycrest Protocol",
    body: `6.1 Paycrest Protocol operates on a decentralized network. The Company does not control these entities or the transactions once they are initiated on the blockchain.

6.2 The Company does not take custody of, store, or manage any assets.

6.3 Users are solely responsible for securing their digital wallets, private keys, and any access credentials.

6.4 Independent entities within the network must comply with legal requirements in their respective locations. The Company is not responsible for their actions or failures.

6.5 All transactions through Paycrest Protocol are irreversible once confirmed on the blockchain.

6.6 Paycrest Protocol is not registered with the U.S. Securities and Exchange Commission (SEC) or any other regulatory body, as it does not handle or manage user funds or custody assets.

6.7 Paycrest Protocol may impose fees for using the network, which are transparent and disclosed at the time a transaction request is submitted.`,
  },
  {
    heading: "7. Intellectual Property",
    body: `7.1 Company IP
All intellectual property rights in the Services, including trademarks, logos, and content, are owned by Paycrest, Inc. You are granted a limited, non-exclusive, non-transferable license to use the Services solely for personal, non-commercial purposes.

7.2 User Submissions
By submitting any materials to the Services, you grant the Company a worldwide, royalty-free, and non-exclusive license to use, reproduce, modify, and distribute those materials for purposes related to the operation, maintenance, improvement, and promotion of the Services.`,
  },
  {
    heading: "8. Privacy and Data Protection",
    body: `8.1 Data Collection
Please refer to our Privacy Policy for information about how we collect, use, and share information from and/or about you. By submitting your information through our Services, you agree to the terms of our Privacy Policy.

8.2 Data Security
The Company implements reasonable and appropriate technical and organizational measures to protect the limited data we retain. However, no system can be completely secure. The Company is not liable for any unauthorized access or use of the limited data we retain that occurs despite our efforts to protect it.`,
  },
  {
    heading: "9. Security Measures and User Responsibility",
    body: `9.1 The Company is committed to ensuring robust security for users and their transactions. Users must take specific steps to safeguard their wallets and transactions:

a. Wallet Security: Keep your cryptocurrency wallet private keys and recovery phrases confidential.

b. Strong Security Practices: Use strong, unique passwords for your wallet Services, and enable two-factor authentication (2FA) wherever possible.

c. Regular Monitoring: Frequently review your wallet and transaction history for any signs of unauthorized activity.

d. Phishing Awareness: Be cautious of phishing attempts. The Company will never request your wallet keys or personal information through unsolicited messages.

e. Reporting Suspicious Activity: If you suspect any unauthorized access or suspicious activity, notify the Company immediately.

9.2 You acknowledge that the ultimate responsibility for safeguarding your wallet and transactions lies with you.`,
  },
  {
    heading: "10. Limitation of Liability",
    body: `10.1 No Warranty
The Services are provided on an "as is" and "as available" basis. The Company makes no warranties, either express or implied, regarding the Services. The Company does not promise the Services will be free from defects, continuously available, or protected from all security threats.

10.2 To the maximum extent permitted by applicable law, the Company will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenues, data, use, goodwill, or other intangible losses. This includes damages arising from:

a. Use or Inability to Use the Services.
b. Unauthorized Access to our servers or any personal information stored on them.
c. Interruption or Cessation of Transmission.`,
  },
  {
    heading: "11. Governing Law and Dispute Resolution",
    body: `11.1 Governing Law
These Terms of Service shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles.

11.2 Dispute Resolution
Any dispute arising out of or relating to these Terms of Service shall be resolved exclusively through binding arbitration conducted in Delaware, in accordance with the rules of the American Arbitration Association (AAA). The arbitrator's decision shall be final, binding, and enforceable in any court of competent jurisdiction.

11.3 User Responsibility for Legal Compliance
You are solely responsible for ensuring that your use of the Services adheres to all applicable local laws, regulations, and guidelines.

11.4 Waiver of Class Actions and Jury Trial
You agree that any disputes will be resolved on an individual basis and not through class, consolidated, or representative actions. You also waive any right to a jury trial.

11.5 Severability
If any provision of this clause is deemed invalid or unenforceable, the remaining provisions shall remain in full force and effect.`,
  },
  {
    heading: "12. Modification to the Services and Terms",
    body: `12.1 Changes to the Services
The Company retains the right to modify, suspend, or discontinue any aspect of the Services at its sole discretion, with or without prior notice. Your continued use of the Services following any changes constitutes your acceptance of such modifications.

12.2 Changes to the Terms
The Company reserves the right to modify or revise these Terms at any time. Any changes will be reflected in an updated version of the Terms with a revised "Last Updated" date. It is your responsibility to review the Terms regularly.`,
  },
  {
    heading: "13. Termination",
    body: `13.1 Termination by the Company
The Company reserves the right to terminate or suspend your account and access to the Services at any time, with or without prior notice, including for violation of these Terms, suspected fraudulent activity, or conduct deemed harmful to the Services.

13.2 Termination by You
You have the right to terminate your account and discontinue your use of the Services at any time by following the instructions provided within the Services.

13.3 Effect of Termination
Upon termination, your right to access and use the Services will immediately end. All provisions of these Terms intended to survive termination — including ownership rights, disclaimers of warranties, indemnities, and limitations of liability — will remain in full effect.`,
  },
  {
    heading: "14. Miscellaneous",
    body: `14.1 These Terms, along with the Privacy Policy and any other legal notices published on the Services, represent the complete and exclusive agreement between you and the Company concerning your use of the Services.

14.2 Severability
If any provision of these Terms is determined to be invalid or unenforceable, that provision will be deemed severed from the rest of these Terms without affecting the validity of the remaining provisions.

14.3 Waiver
No waiver of any term or condition of these Terms by the Company shall be considered a continuing waiver of that term or any other term. If the Company chooses not to enforce any right or provision at any time, this shall not be interpreted as a waiver of the Company's right to enforce that provision in the future.`,
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
        <Text style={styles.updatedDate}>Updated March 17, 2025</Text>
        <Text style={styles.pageTitle}>Our Terms of Service</Text>
        <Text style={styles.pageSubtitle}>
          Read our Terms below to learn more about your rights and
          responsibilities as a Flipeet Pay user.
        </Text>

        <Text style={styles.introParagraph}>
          Subject to these Terms of Service, as amended from time to time
          ("Terms of Service"), Flipeet Pay LTD provides the Flipeet Pay
          platform to you through its website at www.pay.flipeet.io and
          attendant mobile applications (collectively, with any new features and
          applications, the "Platform") and the Flipeet Pay community and
          related services (collectively, with the Platform, including any new
          features and applications, the "Services"). For purposes of the
          following Terms of Service, "Flipeet Pay", "we", "us", "our" and
          other similar terms, shall refer to the party with whom you are
          contracting.{"\n\n"}We reserve the right, at our sole discretion, to
          change or modify portions of these Terms of Service at any time. Where
          possible we will provide 30 days' notice of substantive changes to
          these Terms of Service. Your continued use of the Services after the
          date of any such changes constitutes your acceptance of the new Terms
          of Service.
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
