import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useBankAccount } from "../contexts/BankAccountContext";

export default function SavedBankAccounts() {
  const router = useRouter();
  const {
    savedAccounts,
    removeBankAccount,
    selectedAccount,
    setSelectedAccount,
    loading,
  } = useBankAccount();
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const scaleAnim = useRef(new Animated.Value(0)).current;

  console.log("[SavedBankAccounts] savedAccounts:", savedAccounts);
  console.log(
    "[SavedBankAccounts] savedAccounts.length:",
    savedAccounts.length,
  );
  console.log("[SavedBankAccounts] loading:", loading);

  const handleSelectAccount = (account: any) => {
    setSelectedAccount(account);
    router.back();
  };

  const showMenu = (accountId: string, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX - 80, y: pageY + 10 });
    setMenuVisible(accountId);

    Animated.spring(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideMenu = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(null);
    });
  };

  const handleDeletePress = (accountId: string, accountNumber: string) => {
    hideMenu();
    Alert.alert(
      "Delete Bank Account",
      `Are you sure you want to delete account ending with ${accountNumber.slice(
        -4,
      )}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeBankAccount(accountId);
            if (selectedAccount?.id === accountId) {
              setSelectedAccount(
                savedAccounts.length > 1
                  ? savedAccounts.find((acc) => acc.id !== accountId) || null
                  : null,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#E2E6F0" />
          </TouchableOpacity>
          <Text style={styles.title}>Bank Accounts</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.mainContent}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              savedAccounts.length === 0 && styles.emptyStateContent,
            ]}
          >
            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Loading accounts...</Text>
              </View>
            ) : savedAccounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={64} color="#757B85" />
                <Text style={styles.emptyStateTitle}>No Bank Accounts</Text>
                <Text style={styles.emptyStateText}>
                  You haven't added any bank accounts yet.
                </Text>
              </View>
            ) : (
              <>
                {console.log("[SavedBankAccounts] Rendering accounts list")}
                {savedAccounts.map((account) => {
                  console.log(
                    "[SavedBankAccounts] Rendering account:",
                    account.id,
                    account.bankName,
                  );
                  return (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountCard,
                        selectedAccount?.id === account.id &&
                          styles.selectedAccountCard,
                      ]}
                      onPress={() => handleSelectAccount(account)}
                    >
                      <View style={styles.accountInfo}>
                        <View>
                          <Text style={styles.bankName}>
                            {account.bankName}
                          </Text>
                          <Text style={styles.accountName}>
                            {account.accountName}
                          </Text>
                        </View>
                        <Text style={styles.separator}>-</Text>

                        <Text style={styles.accountNumber}>
                          {account.accountNumber}
                        </Text>
                      </View>

                      <View style={styles.accountActions}>
                        {selectedAccount?.id === account.id && (
                          <Ionicons
                            name="checkmark"
                            size={24}
                            color="#4A9DFF"
                          />
                        )}
                        <TouchableOpacity
                          style={styles.menuButton}
                          onPress={(e) => showMenu(account.id, e)}
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={20}
                            color="#757B85"
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>

          {/* Delete Menu Modal */}
          <Modal
            visible={menuVisible !== null}
            transparent={true}
            animationType="none"
            onRequestClose={hideMenu}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={hideMenu}
            >
              <Animated.View
                style={[
                  styles.deleteMenu,
                  {
                    top: menuPosition.y,
                    left: menuPosition.x,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.deleteMenuItem}
                  onPress={() => {
                    if (menuVisible) {
                      const account = savedAccounts.find(
                        (acc) => acc.id === menuVisible,
                      );
                      if (account) {
                        handleDeletePress(account.id, account.accountNumber);
                      }
                    }
                  }}
                >
                  {/* <Ionicons name="trash-outline" size={16} color="#FF3B30" /> */}
                  <Text style={styles.deleteMenuText}>Delete</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </Modal>

          {/* Add New Account Button at Bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/(action)/add-bank-account")}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add New Account</Text>
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
  emptyStateContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: "#757B85",
    fontSize: 14,
    textAlign: "center",
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 1,
    borderColor: "#1C1C1C",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedAccountCard: {
    borderColor: "#4A9DFF",
  },
  accountInfo: {
    flex: 1,
    flexDirection: "row",
  },
  bankName: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  accountNumber: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  accountName: {
    color: "#B0BACB",
    fontSize: 14,
    //  textTransform: "uppercase",
  },

  separator: {
    color: "#757B85",
    marginHorizontal: 2,
    fontSize: 16,
    fontWeight: "300",
  },

  accountActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  deleteMenu: {
    position: "absolute",
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // borderWidth: 1,
    // borderColor: '#333333',
    minWidth: 100,
  },
  deleteMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  deleteMenuText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#000000",
    // borderTopWidth: 1,
    // borderTopColor: "#333333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
