import { useFavoriteWallets } from "@/app/contexts/FavoriteWalletsContext";
import { useToken } from "@/app/contexts/TokenContext";
import { RootState } from "@/app/store";
import ScanIcon from "@/assets/images/scan-icon.svg";
import StarIcon from "@/assets/images/star-icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
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
  const [isFavorite, setIsFavorite] = useState(false);
  const { selectedToken } = useToken();
  const balances = useSelector((state: RootState) => state.auth.balances);
  const {
    addFavoriteWallet,
    removeFavoriteWallet,
    isWalletFavorite,
    favoriteWallets,
    selectedWalletFromFavorite,
    clearSelectedWalletFromFavorite,
  } = useFavoriteWallets();

  // Get balance for Solana tokens only
  const getTokenBalance = (symbol: string) => {
    if (!balances || !Array.isArray(balances)) return 0;
    const balance = balances.find(
      (b: any) => b.token === symbol && b.network === "Solana"
    );
    return balance?.balance || 0;
  };

  const tokenBalance = getTokenBalance(selectedToken?.symbol || "USDC");

  // Handle selected wallet from favorites
  useEffect(() => {
    if (selectedWalletFromFavorite) {
      setWalletAddress(selectedWalletFromFavorite);
      clearSelectedWalletFromFavorite();
    }
  }, [selectedWalletFromFavorite, clearSelectedWalletFromFavorite]);

  // Check if current wallet address is already in favorites when it changes
  useEffect(() => {
    if (walletAddress) {
      setIsFavorite(isWalletFavorite(walletAddress));
    } else {
      setIsFavorite(false);
    }
  }, [walletAddress, isWalletFavorite]);

  const handleWalletAddressChange = (text: string) => {
    setWalletAddress(text);
  };

  const handleFavoriteToggle = (value: boolean) => {
    setIsFavorite(value);
    if (value && walletAddress) {
      addFavoriteWallet(walletAddress);
    } else if (!value && walletAddress) {
      // Find and remove the wallet from favorites
      const favoriteWallet = favoriteWallets.find(
        (fav) => fav.walletAddress === walletAddress
      );
      if (favoriteWallet) {
        removeFavoriteWallet(favoriteWallet.id);
      }
    }
  };

  const handleFavoritesPress = () => {
    router.push("/(action)/favorites-wallet-page");
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
          network: "Solana", // Only Solana supported
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
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
                  onPress={handleFavoritesPress}
                >
                  <StarIcon />
                  <Text style={{ color: "#E2E6F0" }}>Favorites</Text>
                  <Ionicons name="chevron-down" color="#4A9DFF" />
                </TouchableOpacity>
              </View>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter wallet address"
                  placeholderTextColor="#757B85"
                  value={walletAddress}
                  onChangeText={handleWalletAddressChange}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={{ position: "absolute", top: "10%", right: 3 }}
                >
                  <ScanIcon />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Text style={{ color: "#E2E6F0" }}>
                  {isFavorite ? "Remove from favorite" : "Add to favorite"}
                </Text>

                <Switch
                  trackColor={{ false: "#000", true: "#4B5563" }}
                  thumbColor={isFavorite ? "#B0BACB" : "#9CA3AF"}
                  ios_backgroundColor="#4B5563"
                  onValueChange={handleFavoriteToggle}
                  value={isFavorite}
                  style={{ transform: [{ scale: 0.6 }] }}
                />
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
                <TouchableOpacity onPress={handleSync}>
                  <Ionicons name="sync" size={20} color="#B0BACB" />
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
                      placeholderTextColor="#FFFFFF"
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
                      <View>{renderTokenIcon(selectedToken.icon)}</View>
                      <View>
                        <Text style={styles.tokenName}>
                          {selectedToken.symbol}
                        </Text>
                        <Text style={styles.tokenNetwork}>
                          {selectedToken.network}
                        </Text>
                      </View>
                      <View>
                        <Ionicons name="chevron-down" color={"#4A9DFF"} />
                      </View>
                    </TouchableOpacity>
                    <View style={styles.balanceContainer}>
                      <Image
                        source={require("@/assets/images/wallet-icon.png")}
                        style={{ width: 13, height: 13 }}
                      />
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
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    color: "white",
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
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tokenName: {
    color: "#E2E6F0",
    fontWeight: "700",
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
});
