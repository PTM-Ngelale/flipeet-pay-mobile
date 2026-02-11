import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useBankAccount } from "../contexts/BankAccountContext";
import type { AppDispatch, RootState } from "../store";
import { fetchBanks, verifyBankAccount } from "../store/bankAccountSlice";

export default function AddBankAccount() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { addBankAccount } = useBankAccount();
  const banks = useSelector((state: RootState) => state.bankAccount.banks);
  const banksLoading = useSelector(
    (state: RootState) => state.bankAccount.banksLoading,
  );
  const verifying = useSelector(
    (state: RootState) => state.bankAccount.verifying,
  );
  const token = useSelector((state: RootState) => state.auth.token);

  // Fetch banks from API on mount
  useEffect(() => {
    if (token && banks.length === 0 && !banksLoading) {
      console.log("[AddBankAccount] Dispatching fetchBanks");
      dispatch(fetchBanks())
        .unwrap()
        .then((banks) => {
          console.log("[AddBankAccount] Banks loaded:", banks.length);
        })
        .catch((error) => {
          console.error("[AddBankAccount] Failed to load banks:", error);
          Alert.alert(
            "Failed to Load Banks",
            `Could not fetch bank list: ${error}. Please check your internet connection and try again.`,
            [
              { text: "OK" },
              {
                text: "Retry",
                onPress: () => dispatch(fetchBanks()),
              },
            ],
          );
        });
    }
  }, [token, dispatch]);

  // Filter banks based on search query
  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to handle bank selection
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setShowBankList(false);
    setSearchQuery(""); // Clear search when bank is selected
    // Clear account name and error when bank changes
    setAccountName("");
    setError("");
  };

  // Function to handle account number change
  const handleAccountNumberChange = (text) => {
    // Only allow numbers and limit to 10 digits
    const numericText = text.replace(/[^0-9]/g, "");
    setAccountNumber(numericText);
    setAccountName("");
    setError("");

    // Look up account name when we have 10 digits and a selected bank
    if (numericText.length === 10 && selectedBank) {
      lookupAccountName(selectedBank.id, numericText);
    }
  };

  // Function to lookup account name based on bank and account number
  const lookupAccountName = async (bankId: number, accNumber: string) => {
    if (!token) {
      setError("Please log in to verify account");
      return;
    }

    setError("");
    setAccountName("");

    try {
      const bank = banks.find((b) => b.id === bankId);
      if (!bank) {
        setError("Bank not found");
        return;
      }

      const result = await dispatch(
        verifyBankAccount({
          accountNumber: accNumber,
          bankCode: bank.code,
          bankName: bank.name,
          currency: "NGN",
        }),
      ).unwrap();

      if (result.accountName) {
        setAccountName(result.accountName);
        setError("");
      } else {
        setError("Account name not found");
      }
    } catch (err: any) {
      console.error("Account verification error:", err);
      const errorMsg = err.message || "Failed to verify account";
      setError(`${errorMsg}. You can enter the account name manually below.`);
    }
  };

  const validateForm = () => {
    if (!selectedBank) {
      setError("Please select a bank");
      return false;
    }
    if (accountNumber.length !== 10) {
      setError("Please enter a valid 10-digit account number");
      return false;
    }
    if (!accountName) {
      setError("Account verification failed");
      return false;
    }
    return true;
  };

  const handleAddAccount = () => {
    if (validateForm()) {
      const newAccount = {
        bankName: selectedBank.name,
        accountNumber: accountNumber,
        accountName: accountName,
        bankCode: selectedBank.code,
      };

      addBankAccount(newAccount);
      router.back();
    }
  };

  const handleDropdownToggle = () => {
    setShowBankList(!showBankList);
    if (!showBankList) {
      setSearchQuery("");
    }
  };

  const renderBankLogo = (bank: any) => {
    if (bank?.logoUrl) {
      return (
        <Image
          source={{ uri: bank.logoUrl }}
          style={styles.bankLogo}
          resizeMode="contain"
        />
      );
    }

    const initial = (bank?.name || "?").trim().charAt(0).toUpperCase();
    return (
      <View style={styles.bankLogoFallback}>
        <Text style={styles.bankLogoFallbackText}>{initial}</Text>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Bank Account</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.mainContent}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Debug info - remove this after testing */}
            {__DEV__ && (
              <View
                style={{
                  padding: 10,
                  backgroundColor: "#f0f0f0",
                  marginBottom: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: "#333" }}>
                  🔍 Debug: {banks.length} banks loaded | Loading:{" "}
                  {banksLoading ? "Yes" : "No"} | Token: {token ? "✓" : "✗"}
                </Text>
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Bank Name</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={handleDropdownToggle}
              >
                <View style={styles.dropdownRow}>
                  {selectedBank ? renderBankLogo(selectedBank) : null}
                  <Text
                    style={
                      selectedBank
                        ? styles.dropdownText
                        : styles.placeholderText
                    }
                  >
                    {selectedBank ? selectedBank.name : "Select a bank"}
                  </Text>
                </View>
                <Ionicons
                  name={showBankList ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#4A9DFF"
                />
              </TouchableOpacity>

              {/* Bank List with Search */}
              {showBankList && (
                <View style={styles.bankList}>
                  {/* Search Input */}
                  <View style={styles.searchContainer}>
                    <Ionicons
                      name="search"
                      size={20}
                      color="#757B85"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search banks..."
                      placeholderTextColor="#757B85"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoFocus={true}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#757B85"
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Bank List */}
                  <ScrollView
                    style={styles.bankScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {banksLoading ? (
                      <View style={{ padding: 20, alignItems: "center" }}>
                        <ActivityIndicator size="small" color="#4A9DFF" />
                        <Text style={{ color: "#757B85", marginTop: 8 }}>
                          Loading banks...
                        </Text>
                      </View>
                    ) : banks.length === 0 && !banksLoading ? (
                      <View style={styles.noResults}>
                        <Text style={styles.noResultsText}>
                          No banks available
                        </Text>
                        <TouchableOpacity
                          style={{
                            marginTop: 10,
                            padding: 10,
                            backgroundColor: "#4A9DFF",
                            borderRadius: 8,
                          }}
                          onPress={() => {
                            console.log("[AddBankAccount] Manual retry");
                            dispatch(fetchBanks());
                          }}
                        >
                          <Text
                            style={{ color: "#FFFFFF", textAlign: "center" }}
                          >
                            Retry Loading Banks
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : filteredBanks.length > 0 ? (
                      filteredBanks.map((bank) => (
                        <TouchableOpacity
                          key={bank.id}
                          style={styles.bankItem}
                          onPress={() => handleBankSelect(bank)}
                        >
                          <View style={styles.bankInfo}>
                            {renderBankLogo(bank)}
                            <Text style={styles.bankName}>{bank.name}</Text>
                          </View>
                          {selectedBank?.id === bank.id && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color="#4A9DFF"
                            />
                          )}
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noResults}>
                        <Text style={styles.noResultsText}>
                          No banks match your search
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Account Number Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Account Number</Text>
              <View style={styles.accountNumberContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder=""
                  placeholderTextColor="#757B85"
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Account Verification Status */}
            {verifying ? (
              <View style={styles.fieldContainer}>
                <View style={styles.verifyingContainer}>
                  <ActivityIndicator size="small" color="#4A9DFF" />
                  <Text style={styles.verifyingText}>Verifying account...</Text>
                </View>
              </View>
            ) : accountName ? (
              <View style={styles.fieldContainer}>
                <View style={styles.accountNameDisplay}>
                  <Text style={styles.accountNameText}>
                    {accountNumber} - {accountName}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Error Message */}
            {error ? (
              <View style={styles.fieldContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Save Button at Bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.addButton,
                (!selectedBank ||
                  accountNumber.length !== 10 ||
                  !accountName) &&
                  styles.addButtonDisabled,
              ]}
              disabled={
                !selectedBank || accountNumber.length !== 10 || !accountName
              }
              onPress={handleAddAccount}
            >
              <Text style={styles.addButtonText}>Save</Text>
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
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  title: {
    color: "#757B85",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 24,
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    padding: 16,
  },
  dropdownText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  placeholderText: {
    color: "#757B85",
    fontSize: 16,
  },
  bankList: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 400,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    padding: 0,
  },
  bankScroll: {
    maxHeight: 300,
  },
  bankItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  bankInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bankName: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 2,
  },
  bankLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#111111",
  },
  bankLogoFallback: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  bankLogoFallbackText: {
    color: "#E2E6F0",
    fontSize: 10,
    fontWeight: "700",
  },
  noResults: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    color: "#757B85",
    fontSize: 14,
  },
  accountNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  verifyingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  verifyingText: {
    color: "#4A9DFF",
    fontSize: 16,
  },
  accountNameDisplay: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#1C1C1C",
    borderRadius: 8,
    padding: 16,
  },
  accountNameText: {
    color: "#388665",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#000000",
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#333333",
    opacity: 0.5,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
