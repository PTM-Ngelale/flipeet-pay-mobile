import { useFavoriteEmails } from "@/app/contexts/FavoriteEmailsContext";
import { useToken } from "@/app/contexts/TokenContext";
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

const EmailComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [email, setEmail] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const { selectedToken } = useToken();
  const {
    addFavoriteEmail,
    removeFavoriteEmail,
    isEmailFavorite,
    favoriteEmails,
    selectedEmailFromFavorite,
    clearSelectedEmailFromFavorite,
  } = useFavoriteEmails();

  // Handle selected email from favorites
  useEffect(() => {
    if (selectedEmailFromFavorite) {
      setEmail(selectedEmailFromFavorite);
      clearSelectedEmailFromFavorite();
    }
  }, [selectedEmailFromFavorite, clearSelectedEmailFromFavorite]);

  // Check if current email is already in favorites when email changes
  useEffect(() => {
    if (email) {
      setIsFavorite(isEmailFavorite(email));
    } else {
      setIsFavorite(false);
    }
  }, [email, isEmailFavorite]);

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handleFavoriteToggle = (value: boolean) => {
    setIsFavorite(value);
    if (value && email) {
      addFavoriteEmail(email);
    } else if (!value && email) {
      // Find and remove the email from favorites
      const favoriteEmail = favoriteEmails.find((fav) => fav.email === email);
      if (favoriteEmail) {
        removeFavoriteEmail(favoriteEmail.id);
      }
    }
  };

  const handleFavoritesPress = () => {
    router.push("/(action)/favorites-page");
  };

  const exchangeRate = 1.5802;
  const dailyLimit = 1000;
  const usedLimit = 0;

  const handlePayAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setPayAmount(numericValue);

    if (numericValue && !isNaN(parseFloat(numericValue))) {
      const calculatedReceive = (
        parseFloat(numericValue) * exchangeRate
      ).toFixed(2);
      setReceiveAmount(calculatedReceive);
    } else {
      setReceiveAmount("");
    }
  };

  const handleReceiveAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setReceiveAmount(numericValue);

    if (numericValue && !isNaN(parseFloat(numericValue))) {
      const calculatedPay = (parseFloat(numericValue) / exchangeRate).toFixed(
        6
      );
      setPayAmount(calculatedPay);
    } else {
      setPayAmount("");
    }
  };

  const handleHalf = () => {
    const halfBalance = (0.00678 / 2).toString();
    setPayAmount(halfBalance);
    setReceiveAmount((parseFloat(halfBalance) * exchangeRate).toFixed(2));
  };

  const handleMax = () => {
    setPayAmount("0.00678");
    setReceiveAmount((0.00678 * exchangeRate).toFixed(2));
  };

  const handleSync = () => {
    setPayAmount("");
    setReceiveAmount("");
  };

  const handleSwap = () => {
    if (payAmount && receiveAmount && email) {
      // Navigate to review transaction page with parameters
      router.push({
        pathname: "/(action)/review-transaction",
        params: {
          payAmount,
          receiveAmount,
          payCurrency: "USDC",
          receiveCurrency: "NGN",
          network: "Solana",
          exchangeRate: exchangeRate.toString(),
          recipientEmail: email,
        },
      });
    }
  };

  const isSwapDisabled =
    !payAmount || !receiveAmount || parseFloat(payAmount) === 0 || !email;

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
            {/* Email Section */}
            <View style={styles.emailSection}>
              <View style={styles.emailHeader}>
                <Text style={styles.emailLabel}>Enter email address</Text>
                <TouchableOpacity
                  style={styles.favoritesButton}
                  onPress={handleFavoritesPress}
                >
                  <StarIcon />
                  <Text style={styles.favoritesText}>Favorites</Text>
                  <Ionicons name="chevron-down" color="#4A9DFF" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.emailInput}
                placeholder="Enter email address"
                placeholderTextColor="#757B85"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.favoriteToggle}>
                <Text style={styles.favoriteToggleText}>
                  {isFavorite ? "Remove from favorite" : "Add to favorite"}
                </Text>
                <Switch
                  trackColor={{ false: "#000", true: "#4B5563" }}
                  thumbColor={isFavorite ? "#B0BACB" : "#9CA3AF"}
                  ios_backgroundColor="#4B5563"
                  onValueChange={handleFavoriteToggle}
                  value={isFavorite}
                  style={styles.switch}
                />
              </View>
            </View>

            {/* Amount Controls */}
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
              <TouchableOpacity onPress={handleSync}>
                <Ionicons name="sync" size={20} color="#B0BACB" />
              </TouchableOpacity>
            </View>

            {/* Amount Section */}
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
                      style={styles.walletIcon}
                    />
                    <Text style={styles.balanceText}>0.00678 USDC</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Send Button at Bottom */}
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
            <Text style={styles.swapButtonText}>
              {/* {!email ? "Enter Email Address" : "Send"} */}
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EmailComponent;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    marginTop: 30,
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
  },
  emailSection: {
    marginBottom: 24,
  },
  emailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  emailLabel: {
    color: "#B0BACB",
    fontSize: 16,
  },
  favoritesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  favoritesText: {
    color: "#E2E6F0",
    fontSize: 14,
  },
  emailInput: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  favoriteToggle: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  favoriteToggleText: {
    color: "#E2E6F0",
    fontSize: 14,
  },
  switch: {
    transform: [{ scale: 0.8 }],
  },
  amountControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  amountButtons: {
    flexDirection: "row",
    gap: 16,
  },
  amountButton: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  amountButtonText: {
    color: "#B0BACB",
    fontSize: 14,
  },
  section: {
    padding: 16,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    marginBottom: 16,
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
    alignItems: "flex-end",
  },
  sectionLabel: {
    color: "#E2E6F0",
    fontSize: 16,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    color: "white",
    fontSize: 24,
    marginRight: 4,
    fontWeight: "600",
  },
  amountInput: {
    color: "#fff",
    fontSize: 24,
    padding: 0,
    margin: 0,
    fontWeight: "600",
    minWidth: 120,
  },
  tokenSelector: {
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tokenName: {
    color: "#E2E6F0",
    fontWeight: "700",
    fontSize: 14,
  },
  tokenNetwork: {
    color: "#757B85",
    fontSize: 12,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 13,
    height: 13,
  },
  balanceText: {
    color: "#E2E6F0",
    fontSize: 12,
    marginLeft: 4,
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
});
