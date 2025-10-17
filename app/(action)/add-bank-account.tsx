import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useBankAccount } from "../contexts/BankAccountContext";

// Dummy array of Nigerian banks
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

// Dummy bank accounts with account numbers and names
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
    accountName: "Heritage Chibugwu Egwim",
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

export default function AddBankAccount() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedAccount, setSavedAccount] = useState(null);
  const { addBankAccount } = useBankAccount();

  // Filter banks based on search query
  const filteredBanks = NIGERIAN_BANKS.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
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
  const lookupAccountName = (bankId, accNumber) => {
    // Find matching account in dummy data
    const matchedAccount = DUMMY_BANK_ACCOUNTS.find(
      (account) =>
        account.bankId === bankId && account.accountNumber === accNumber
    );

    if (matchedAccount) {
      setAccountName(matchedAccount.accountName);
      setError("");
    } else {
      setAccountName("");
      setError("Account number not found for selected bank");
    }
  };

  // Function to validate form before submission
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

  // Function to handle adding bank account
  const handleAddAccount = () => {
    if (validateForm()) {
      const newAccount = {
        bank: selectedBank,
        accountNumber: accountNumber,
        accountName: accountName,
      };
      console.log("Adding bank account:", newAccount);

      // Save the account using context
      addBankAccount(newAccount);
      router.back();
    }
  };

  const handleDropdownToggle = () => {
    setShowBankList(!showBankList);
    if (!showBankList) {
      setSearchQuery(""); // Clear search only when opening
    }
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
            {/* Bank Selection Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Bank Name</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={handleDropdownToggle}
              >
                <Text
                  style={
                    selectedBank ? styles.dropdownText : styles.placeholderText
                  }
                >
                  {selectedBank ? selectedBank.name : "Select a bank"}
                </Text>
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
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank) => (
                        <TouchableOpacity
                          key={bank.id}
                          style={styles.bankItem}
                          onPress={() => handleBankSelect(bank)}
                        >
                          <View style={styles.bankInfo}>
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
                        <Text style={styles.noResultsText}>No banks found</Text>
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

            {/* Account Name Display */}
            {accountName ? (
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
  },
  bankName: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 2,
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
