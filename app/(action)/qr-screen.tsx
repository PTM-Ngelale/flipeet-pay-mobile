import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function QRScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrData = (params.qrData as string) || "";
  const networkParam = (params.network as string) || "Solana";
  const networkName = networkParam || "Solana";
  const [copied, setCopied] = useState(false);

  const truncateAddress = useCallback((address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }, []);

  const copyToClipboard = useCallback(async () => {
    await Clipboard.setStringAsync(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [qrData]);

  const handleShare = useCallback(async () => {
    if (!qrData) {
      return;
    }
    try {
      await Share.share({
        message: qrData,
      });
    } catch (error) {
      console.error("Failed to share address:", error);
    }
  }, [qrData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your {networkName} Address</Text>
          <View style={{ opacity: 0 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.qrContainer}>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={14} color="#FFD369" />
              <Text style={styles.infoText}>
                Use this address to receive tokens on {networkName}
              </Text>
            </View>

            <View style={styles.qrImageContainer}>
              {qrData ? (
                <QRCode value={qrData} size={280} />
              ) : (
                <Ionicons name="alert-circle" size={48} color="#757B85" />
              )}
            </View>

            <View style={styles.addressContainer}>
              <View style={styles.addressBox}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {truncateAddress(qrData)}
                </Text>
                <TouchableOpacity onPress={copyToClipboard}>
                  <Ionicons
                    name={copied ? "checkmark" : "copy-outline"}
                    size={20}
                    color={copied ? "#4A9DFF" : "#757B85"}
                  />
                </TouchableOpacity>
              </View>
              {copied && (
                <Text style={styles.copiedText}>Copied to clipboard!</Text>
              )}
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              disabled={!qrData}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  headerTitle: {
    color: "#757B85",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerPlaceholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  qrContainer: {
    borderColor: "#30343C",
    borderWidth: 1,
    padding: 12,
    borderRadius: 15,
  },
  infoBanner: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3c382f",
    marginBottom: 24,
    borderRadius: 5,
    paddingVertical: 8,
  },
  infoText: {
    color: "#FFD369",
    fontSize: 12,
    marginLeft: 8,
  },
  qrImageContainer: {
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  qrImage: {
    width: 280,
    height: 280,
  },
  addressContainer: {
    marginBottom: 24,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "black",
    borderRadius: 8,
    padding: 16,
    borderColor: "#30343C",
    borderWidth: 1,
  },
  addressText: {
    color: "#B0BACB",
    fontSize: 16,
    textAlign: "center",
  },
  copiedText: {
    color: "#4A9DFF",
    textAlign: "center",
    marginTop: 8,
  },
  shareButton: {
    backgroundColor: "#0A66D3",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  shareButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
