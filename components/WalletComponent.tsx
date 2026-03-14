import { useToken } from "@/app/contexts/TokenContext";
import { RootState } from "@/app/store";
import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Solana from "@/assets/images/networks/solana.svg";
import ScanIcon from "@/assets/images/scan-icon.svg";
import SyncIcon from "@/assets/images/sync-icon.svg";
import WalletIcon from "@/assets/images/wallet-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const WalletComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { selectedToken } = useToken();
  const balances = useSelector((state: RootState) => state.auth.balances);

  const shortenNetworkName = (value?: string) => {
    const raw = (value || "").trim();
    const normalized = raw.toLowerCase().replace(/\s+/g, "-");

    if (
      normalized === "bnb-smart-chain" ||
      normalized === "bnb-chain" ||
      normalized === "binance-smart-chain" ||
      normalized === "bsc" ||
      normalized === "bnb"
    ) {
      return "BNB";
    }

    if (normalized === "solana") {
      return "Solana";
    }

    if (normalized === "base") {
      return "Base";
    }

    return raw;
  };

  // Get balance for selected token/network (case-insensitive)
  const getTokenBalance = (symbol: string) => {
    if (!balances || !Array.isArray(balances)) return 0;
    const targetSymbol = (symbol || "").toLowerCase();
    const targetNetwork = (selectedToken?.network || "Solana").toLowerCase();
    const balance = balances.find((b: any) => {
      const bSymbol = (b.token || b.asset || "").toLowerCase();
      const bNetwork = (b.network || "").toLowerCase();
      return bSymbol === targetSymbol && bNetwork === targetNetwork;
    });
    return balance?.balance || 0;
  };

  const tokenBalance = getTokenBalance(selectedToken?.symbol || "USDC");

  const handleWalletAddressChange = (text: string) => {
    setWalletAddress(text);
  };

  const handleOpenScanner = async () => {
    const result = await requestPermission();
    const granted = result?.granted;
    if (!granted) {
      Alert.alert(
        "Camera permission required",
        "Enable camera access to scan a wallet QR code.",
      );
      return;
    }
    setIsScanning(false);
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (isScanning) return;
    setIsScanning(true);
    if (typeof data === "string") {
      setWalletAddress(data.trim());
    }
    setShowScanner(false);
    setTimeout(() => setIsScanning(false), 300);
  };

  const handlePayAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setPayAmount(numericValue);
    // For wallet-to-wallet, send amount = receive amount (same crypto)
    setReceiveAmount(numericValue);
  };

  const handleHalf = () => {
    const halfBalance = (tokenBalance / 2).toFixed(6);
    setPayAmount(halfBalance);
    setReceiveAmount(halfBalance);
  };

  const handleMax = () => {
    const maxBalance = tokenBalance.toFixed(6);
    setPayAmount(maxBalance);
    setReceiveAmount(maxBalance);
  };

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
  };

  const handleSwap = () => {
    if (payAmount && walletAddress) {
      router.push({
        pathname: "/(action)/review-transaction",
        params: {
          payAmount,
          receiveAmount: payAmount, // Same amount for crypto-to-crypto
          payCurrency: selectedToken?.symbol || "USDC",
          receiveCurrency: selectedToken?.symbol || "USDC",
          network: selectedToken?.network || "Solana",
          walletAddress,
          recipientType: "wallet",
        },
      });
    }
  };

  const isSwapDisabled =
    !payAmount ||
    parseFloat(payAmount) === 0 ||
    parseFloat(payAmount) > tokenBalance ||
    !walletAddress;

  const renderTokenIcon = (IconComponent: React.ComponentType<any>) => {
    return <IconComponent width={30} height={30} />;
  };

  const getNetworkIcon = (network?: string) => {
    const id = (network || "").toLowerCase().replace(/\s+/g, "-");
    if (id.includes("solana")) return Solana;
    if (id.includes("base")) return Base;
    if (id.includes("bnb")) return Bnb;
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={{ flexDirection: "column", gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#B0BACB", fontSize: 16 }}>
                  Recipient wallet address
                </Text>
              </View>
              <View style={styles.walletInputWrapper}>
                <TextInput
                  style={[styles.emailInput, styles.walletInput]}
                  placeholder=""
                  placeholderTextColor="#757B85"
                  value={walletAddress}
                  onChangeText={handleWalletAddressChange}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleOpenScanner}
                >
                  <ScanIcon width={28} height={28} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.amountControls}>
              <View style={styles.amountButtons}>
                <TouchableOpacity
                  onPress={handleHalf}
                  style={styles.amountButton}
                >
                  <Text style={styles.amountButtonText}>Half</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleMax}
                  style={styles.amountButton}
                >
                  <Text style={styles.amountButtonText}>Max</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  onPress={handleSync}
                  style={styles.syncButton}
                >
                  <SyncIcon />
                  {/* <Ionicons name="sync" size={20} color="#B0BACB" /> */}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionLeft}>
                  <Text style={styles.sectionLabel}>Amount</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      placeholderTextColor="#757B85"
                      value={payAmount}
                      onChangeText={handlePayAmountChange}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                </View>
                <View style={styles.sectionRight}>
                  <View>
                    <TouchableOpacity
                      style={styles.tokenSelector}
                      onPress={() => router.push("/(action)/token-selector")}
                    >
                      <View style={styles.tokenIconWrapper}>
                        {selectedToken?.icon ? (
                          <selectedToken.icon width={30} height={30} />
                        ) : null}
                        {selectedToken?.network &&
                          (() => {
                            const Net = getNetworkIcon(selectedToken.network);
                            return Net ? (
                              <View style={styles.networkBadge}>
                                <Net width={14} height={14} />
                              </View>
                            ) : null;
                          })()}
                      </View>
                      <View>
                        <Text style={styles.tokenName}>
                          {selectedToken.symbol}
                        </Text>
                        <Text style={styles.tokenNetwork}>
                          {shortenNetworkName(selectedToken.network)}
                        </Text>
                      </View>
                      <View>
                        <Ionicons name="chevron-down" color={"#4A9DFF"} />
                      </View>
                    </TouchableOpacity>
                    <View style={styles.balanceContainer}>
                      {/* <Image
                        source={require("@/assets/images/wallet-icon.png")}
                        style={{ width: 13, height: 13 }}
                      /> */}
                      <WalletIcon width={15} height={15} />
                      <Text style={styles.balanceText}>
                        {tokenBalance.toFixed(6)}{" "}
                        {selectedToken?.symbol || "USDC"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.swapButtonContainer}>
          <TouchableOpacity
            style={[
              styles.swapButton,
              isSwapDisabled
                ? styles.swapButtonDisabled
                : styles.swapButtonActive,
            ]}
            onPress={handleSwap}
            disabled={isSwapDisabled}
          >
            <Text style={[styles.swapButtonText]}>Send</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showScanner}
          animationType="slide"
          onRequestClose={handleCloseScanner}
        >
          <View style={styles.scannerContainer}>
            <CameraView
              onBarcodeScanned={showScanner ? handleBarCodeScanned : undefined}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.scannerTopBar}>
              <TouchableOpacity onPress={handleCloseScanner}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.scannerTitle}>Scan wallet QR</Text>
              <View style={{ width: 28 }} />
            </View>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerHint}>
              Align the QR code within the frame
            </Text>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default WalletComponent;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    marginTop: 30,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  content: {
    flex: 1,
  },
  syncButton: {
    backgroundColor: "#121212",
    padding: 7,
    borderRadius: 6,
    borderColor: "#2A2A2A",
    borderWidth: 1,
  },
  swapButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  swapButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  swapButtonActive: {
    backgroundColor: "#3B82F6",
  },
  swapButtonDisabled: {
    backgroundColor: "#3B82F6",
    opacity: 0.4,
  },
  swapButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTopBar: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scannerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scannerFrame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: "#4A9DFF",
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scannerHint: {
    position: "absolute",
    bottom: 80,
    color: "#E2E6F0",
    fontSize: 14,
  },

  amountControls: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountButtons: {
    flexDirection: "row",
    gap: 20,
  },
  amountButton: {
    backgroundColor: "#2A2A2A",
    padding: 4,
    borderRadius: 6,
  },
  amountButtonText: {
    color: "#B0BACB",
  },
  section: {
    padding: 16,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    marginTop: 16,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLeft: {
    flex: 1,
  },
  sectionRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  sectionLabel: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: 500,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    color: "#E2E6F0",
    fontSize: 32,
    marginRight: 4,
  },
  amountInput: {
    color: "white",
    fontSize: 32,
    padding: 0,
    margin: 0,
  },
  tokenSelector: {
    backgroundColor: "#121212",
    borderColor: "#2A2A2A",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tokenName: {
    color: "#E2E6F0",
    fontWeight: "500",
  },
  tokenNetwork: {
    color: "#757B85",
    fontSize: 12,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  balanceText: {
    color: "#E2E6F0",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 500,
  },
  emailInput: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  walletInputWrapper: {
    position: "relative",
  },
  walletInput: {
    paddingRight: 48,
  },
  scanButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 2,
  },
  tokenIconWrapper: {
    width: 40,
    height: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  networkBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#111827",
  },
});
