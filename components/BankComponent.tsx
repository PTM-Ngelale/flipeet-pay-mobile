import { useCurrency } from "@/app/contexts/CurrencySelectorContext";
import { useFavoriteBanks } from "@/app/contexts/FavoriteBanksContext";
import { useToken } from "@/app/contexts/TokenContext";
import NGNFlag from "@/assets/images/ngn-flag.svg";
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

const NIGERIAN_BANKS = [
  { id: 1, name: "Access Bank", code: "044" },
  { id: 2, name: "Citibank", code: "023" },
  { id: 3, name: "Diamond Bank", code: "063" },
  { id: 4, name: "Ecobank Nigeria", code: "050" },
  { id: 5, name: "Fidelity Bank", code: "070" },
  { id: 6, name: "First Bank of Nigeria", code: "011" },
  { id: 7, name: "First City Monument Bank", code: "214" },
  { id: 8, name: "Guaranty Trust Bank", code: "058" },
  { id: 9, name: "Heritage Bank", code: "030" },
  { id: 10, name: "Keystone Bank", code: "082" },
  { id: 11, name: "Polaris Bank", code: "076" },
  { id: 12, name: "Providus Bank", code: "101" },
  { id: 13, name: "Stanbic IBTC Bank", code: "221" },
  { id: 14, name: "Standard Chartered Bank", code: "068" },
  { id: 15, name: "Sterling Bank", code: "232" },
  { id: 16, name: "Suntrust Bank", code: "100" },
  { id: 17, name: "Union Bank of Nigeria", code: "032" },
  { id: 18, name: "United Bank for Africa", code: "033" },
  { id: 19, name: "Unity Bank", code: "215" },
  { id: 20, name: "Wema Bank", code: "035" },
  { id: 21, name: "Zenith Bank", code: "057" },
];

const DUMMY_BANK_ACCOUNTS = [
  {
    bankId: 1,
    bankName: "Access Bank",
    accountNumber: "1218549167",
    accountName: "Precious Ngelale",
  },
  {
    bankId: 1,
    bankName: "Access Bank",
    accountNumber: "2345678901",
    accountName: "Chinedu Okoro",
  },
  {
    bankId: 1,
    bankName: "Access Bank",
    accountNumber: "3456789012",
    accountName: "Aisha Bello",
  },
  {
    bankId: 8,
    bankName: "Guaranty Trust Bank",
    accountNumber: "4567890123",
    accountName: "Emeka Nwosu",
  },
  {
    bankId: 8,
    bankName: "Guaranty Trust Bank",
    accountNumber: "631004789",
    accountName: "Heritage Chibugwu Egwim",
  },
  {
    bankId: 18,
    bankName: "United Bank for Africa",
    accountNumber: "6789012345",
    accountName: "Oluwatobi Adekunle",
  },
  {
    bankId: 18,
    bankName: "United Bank for Africa",
    accountNumber: "7890123456",
    accountName: "Grace Okafor",
  },
  {
    bankId: 21,
    bankName: "Zenith Bank",
    accountNumber: "2268654742",
    accountName: "Heritage Egwim",
  },
  {
    bankId: 21,
    bankName: "Zenith Bank",
    accountNumber: "9012345678",
    accountName: "Jennifer Musa",
  },
  {
    bankId: 6,
    bankName: "First Bank of Nigeria",
    accountNumber: "1122334455",
    accountName: "Samuel Johnson",
  },
  {
    bankId: 6,
    bankName: "First Bank of Nigeria",
    accountNumber: "2233445566",
    accountName: "Blessing Okon",
  },
  {
    bankId: 5,
    bankName: "Fidelity Bank",
    accountNumber: "3344556677",
    accountName: "Michael Eze",
  },
  {
    bankId: 5,
    bankName: "Fidelity Bank",
    accountNumber: "4455667788",
    accountName: "Patience Aliyu",
  },
  {
    bankId: 17,
    bankName: "Union Bank of Nigeria",
    accountNumber: "5566778899",
    accountName: "Collins Ibe",
  },
  {
    bankId: 17,
    bankName: "Union Bank of Nigeria",
    accountNumber: "6677889900",
    accountName: "Ruth Adebayo",
  },
];

const BankComponent = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [accountName, setAccountName] = useState("");
  const { selectedToken } = useToken();
  const { savedCurrency } = useCurrency();
  const {
    addFavoriteBank,
    removeFavoriteBank,
    isBankFavorite,
    favoriteBanks,
    selectedBankFromFavorite,
    clearSelectedBankFromFavorite,
  } = useFavoriteBanks();

  // Handle selected bank from favorites
  useEffect(() => {
    if (selectedBankFromFavorite) {
      const { accountNumber: selectedAccountNumber, bankName } =
        selectedBankFromFavorite;

      // Set the account number
      setAccountNumber(selectedAccountNumber);

      // Find and set the corresponding bank
      const bank = NIGERIAN_BANKS.find((b) => b.name === bankName);
      if (bank) {
        setSelectedBank(bank);
      }

      // Clear the selected bank from favorites
      clearSelectedBankFromFavorite();
    }
  }, [selectedBankFromFavorite, clearSelectedBankFromFavorite]);

  // Check if current account number is already in favorites when it changes
  useEffect(() => {
    if (accountNumber) {
      setIsFavorite(isBankFavorite(accountNumber));
    } else {
      setIsFavorite(false);
    }
  }, [accountNumber, isBankFavorite]);

  // Validate account number when bank or account number changes
  useEffect(() => {
    if (selectedBank && accountNumber) {
      const matchedAccount = DUMMY_BANK_ACCOUNTS.find(
        (account) =>
          account.bankId === selectedBank.id &&
          account.accountNumber === accountNumber
      );
      setAccountName(matchedAccount?.accountName || "");
    } else {
      setAccountName("");
    }
  }, [selectedBank, accountNumber]);

  const handleAccountNumberChange = (number: string) => {
    // Only allow numbers
    const numericValue = number.replace(/[^0-9]/g, "");
    setAccountNumber(numericValue);
  };

  const handleFavoriteToggle = (value: boolean) => {
    setIsFavorite(value);
    if (value && accountNumber && selectedBank) {
      addFavoriteBank(accountNumber, selectedBank.name);
    } else if (!value && accountNumber) {
      const favoriteBank = favoriteBanks.find(
        (fav) => fav.accountNumber === accountNumber
      );
      if (favoriteBank) {
        removeFavoriteBank(favoriteBank.id);
      }
    }
  };

  const handleFavoritesPress = () => {
    router.push("/(action)/favorites-bank-page");
  };

  const handleBankSelect = (bank: {
    id: number;
    name: string;
    code: string;
  }) => {
    setSelectedBank(bank);
    setShowBankDropdown(false);
    setBankSearchQuery("");
  };

  const filteredBanks = NIGERIAN_BANKS.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

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
    if (
      payAmount &&
      receiveAmount &&
      selectedBank &&
      accountNumber &&
      accountName
    ) {
      router.push({
        pathname: "/(action)/review-transaction",
        params: {
          payAmount,
          receiveAmount,
          payCurrency: "USDC",
          receiveCurrency: "NGN",
          network: "Solana",
          exchangeRate: exchangeRate.toString(),
          bankName: selectedBank.name,
          accountNumber,
          accountName,
        },
      });
    }
  };

  const isSwapDisabled =
    !payAmount ||
    !receiveAmount ||
    parseFloat(payAmount) === 0 ||
    !selectedBank ||
    !accountNumber ||
    !accountName;

  const getCurrencySymbol = () => {
    switch (savedCurrency) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "KES":
        return "KSh";
      case "GHS":
        return "GH₵";
      case "BRL":
        return "R$";
      case "ARS":
        return "$";
      default:
        return "₦";
    }
  };

  const renderCurrencyIcon = () => {
    switch (savedCurrency) {
      case "NGN":
        return <NGNFlag />;
      default:
        return <NGNFlag />;
    }
  };

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
            {/* Bank Selection Section */}
            <View style={{ flexDirection: "column", gap: 3, marginBottom: 35 }}>
              <Text style={{ color: "#B0BACB", fontSize: 16 }}>
                Select a Bank
              </Text>

              <View style={styles.bankSelectContainer}>
                <TouchableOpacity
                  style={styles.bankSelect}
                  onPress={() => setShowBankDropdown(!showBankDropdown)}
                >
                  <Text
                    style={{
                      color: selectedBank ? "#FFFFFF" : "#757B85",
                      fontSize: 14,
                    }}
                  >
                    {selectedBank ? selectedBank.name : "Pick an option"}
                  </Text>
                  <Ionicons
                    name={showBankDropdown ? "chevron-up" : "chevron-down"}
                    color={"#4A9DFF"}
                    size={16}
                  />
                </TouchableOpacity>

                {/* Currency Icon positioned absolutely */}
                <TouchableOpacity
                  style={styles.currencyIconContainer}
                  onPress={() => router.push("/(action)/currency-selector")}
                >
                  <View style={styles.currencyIconWrapper}>
                    {renderCurrencyIcon()}
                    <View style={styles.currencyTextContainer}>
                      <Text style={styles.currencyName}>
                        {savedCurrency || "NGN"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" color={"#4A9DFF"} size={16} />
                  </View>
                </TouchableOpacity>

                {/* Bank Dropdown */}
                {showBankDropdown && (
                  <View style={styles.bankDropdown}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                      <Ionicons
                        name="search"
                        size={16}
                        color="#757B85"
                        style={styles.searchIcon}
                      />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search banks..."
                        placeholderTextColor="#757B85"
                        value={bankSearchQuery}
                        onChangeText={setBankSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {bankSearchQuery.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setBankSearchQuery("")}
                        >
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color="#757B85"
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Bank List */}
                    <ScrollView
                      style={styles.bankList}
                      nestedScrollEnabled={true}
                    >
                      {filteredBanks.map((bank) => (
                        <TouchableOpacity
                          key={bank.id}
                          style={[
                            styles.bankOption,
                            selectedBank?.id === bank.id &&
                              styles.selectedBankOption,
                          ]}
                          onPress={() => handleBankSelect(bank)}
                        >
                          <Text
                            style={[
                              styles.bankOptionText,
                              selectedBank?.id === bank.id &&
                                styles.selectedBankOptionText,
                            ]}
                          >
                            {bank.name}
                          </Text>
                          {selectedBank?.id === bank.id && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#34D058"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* Account Number Section */}
            <View style={{ flexDirection: "column", gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#B0BACB", fontSize: 16 }}>
                  Enter Account Number
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

              <View>
                <TextInput
                  style={[
                    styles.emailInput,
                    accountName && styles.validAccountInput,
                  ]}
                  placeholder="Enter account number"
                  placeholderTextColor="#757B85"
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  keyboardType="numeric"
                />

                {/* Account Name Display */}
                {accountName && (
                  <View style={styles.accountNameContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#34D058"
                    />
                    <Text style={styles.accountNameText}>{accountName}</Text>
                  </View>
                )}

                {/* Validation Error */}
                {selectedBank && accountNumber && !accountName && (
                  <View style={styles.accountErrorContainer}>
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color="#EF4444"
                    />
                    <Text style={styles.accountErrorText}>
                      Account number not found in {selectedBank.name}
                    </Text>
                  </View>
                )}
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
                      <Text style={styles.balanceText}>0.00678 USDC</Text>
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
            <Text style={[styles.swapButtonText, isSwapDisabled]}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default BankComponent;

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
    marginTop: 30,
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

  // Bank Selection Styles
  bankSelectContainer: {
    position: "relative",
  },
  bankSelect: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  // Currency Icon positioned absolutely
  currencyIconContainer: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 10,
  },
  currencyIconWrapper: {
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currencyTextContainer: {
    marginLeft: 4,
  },
  currencyName: {
    color: "#E2E6F0",
    fontWeight: "700",
    fontSize: 14,
  },
  bankDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    marginTop: 8,
    zIndex: 1000,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    padding: 0,
  },
  bankList: {
    maxHeight: 200,
  },
  bankOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  selectedBankOption: {
    backgroundColor: "#1C1C1C",
  },
  bankOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  selectedBankOptionText: {
    color: "#4A9DFF",
    fontWeight: "600",
  },

  emailInput: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#FFFFFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  validAccountInput: {
    borderColor: "#34D058",
  },
  accountNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  accountNameText: {
    color: "#34D058",
    fontSize: 14,
    fontWeight: "500",
  },
  accountErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  accountErrorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
});
