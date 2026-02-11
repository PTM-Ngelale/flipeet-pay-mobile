import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFavoriteBanks } from "../contexts/FavoriteBanksContext";

export default function FavoritesBankPage() {
  const router = useRouter();
  const {
    favoriteBanks,
    recentBanks,
    toggleFavorite,
    markBankAsUsed,
    setSelectedBankFromFavorite,
    refreshFavorites,
  } = useFavoriteBanks();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"favorites" | "recent">(
    "favorites",
  );

  useFocusEffect(
    useCallback(() => {
      void refreshFavorites();
    }, [refreshFavorites]),
  );

  const currentBanks = activeTab === "favorites" ? favoriteBanks : recentBanks;

  const filteredBanks = currentBanks.filter(
    (bank) =>
      bank.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.bankName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedBanks = [...filteredBanks].sort((a, b) => {
    if (activeTab === "recent") {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    }
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  const handleBankSelect = (bank: any) => {
    markBankAsUsed(bank.accountNumber);
    // Set the selected bank in context and navigate back
    setSelectedBankFromFavorite({
      accountNumber: bank.accountNumber,
      bankName: bank.bankName,
    });
    router.back();
  };

  const handleToggleFavorite = (
    bankId: string,
    accountNumber: string,
    isCurrentlyFavorite: boolean,
  ) => {
    if (isCurrentlyFavorite) {
      Alert.alert(
        "Remove Favorite",
        `Are you sure you want to remove ${accountNumber} from favorites?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => toggleFavorite(bankId),
          },
        ],
      );
    } else {
      toggleFavorite(bankId);
    }
  };

  const isMostRecent = (bank: any, index: number) => {
    return index === 0;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}></Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
            onPress={() => setActiveTab("favorites")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "favorites" && styles.activeTabText,
              ]}
            >
              Favorites
            </Text>
            <View
              style={[
                styles.tabUnderline,
                activeTab === "favorites"
                  ? styles.activeTabUnderline
                  : styles.inactiveTabUnderline,
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "recent" && styles.activeTab]}
            onPress={() => setActiveTab("recent")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "recent" && styles.activeTabText,
              ]}
            >
              Recent
            </Text>
            <View
              style={[
                styles.tabUnderline,
                activeTab === "recent"
                  ? styles.activeTabUnderline
                  : styles.inactiveTabUnderline,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#757B85"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#757B85"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#757B85" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              sortedBanks.length === 0 && styles.emptyStateContent,
            ]}
          >
            {sortedBanks.length === 0 ? (
              <View style={styles.emptyState}>
                {searchQuery ? (
                  <>
                    <Ionicons name="search-outline" size={64} color="#757B85" />
                    <Text style={styles.emptyStateTitle}>No results found</Text>
                    <Text style={styles.emptyStateText}>
                      No{" "}
                      {activeTab === "favorites"
                        ? "favorite banks"
                        : "recent banks"}{" "}
                      match your search.
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name={
                        activeTab === "favorites"
                          ? "star-outline"
                          : "time-outline"
                      }
                      size={64}
                      color="#757B85"
                    />
                    <Text style={styles.emptyStateTitle}>
                      {activeTab === "favorites"
                        ? "No Favorite Banks"
                        : "No Recent Banks"}
                    </Text>
                    <Text style={styles.emptyStateText}>
                      {activeTab === "favorites"
                        ? "Banks you add to favorites will appear here."
                        : "Banks you use will appear here."}
                    </Text>
                  </>
                )}
              </View>
            ) : (
              sortedBanks.map((bank, index) => (
                <TouchableOpacity
                  key={bank.id}
                  style={styles.bankCard}
                  onPress={() => handleBankSelect(bank)}
                >
                  <View style={styles.bankInfo}>
                    <View style={styles.bankHeader}>
                      <Text style={styles.accountNumber}>
                        {bank.accountNumber}
                      </Text>
                      {isMostRecent(bank, index) && (
                        <View style={styles.mostRecentBadge}>
                          <Text style={styles.mostRecentText}>Most recent</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.bankName}>{bank.bankName}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.starButton}
                    onPress={() =>
                      handleToggleFavorite(
                        bank.id,
                        bank.accountNumber,
                        bank.isFavorite,
                      )
                    }
                  >
                    <Ionicons
                      name={bank.isFavorite ? "star" : "star-outline"}
                      size={17}
                      color={bank.isFavorite ? "#fff" : "#757B85"}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
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
    paddingBottom: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 24,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {},
  tabText: {
    color: "#757B85",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
  },
  activeTabUnderline: {
    backgroundColor: "#34D058",
  },
  inactiveTabUnderline: {
    backgroundColor: "#757B85",
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333333",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    padding: 0,
  },
  scrollView: {
    flex: 1,
    paddingTop: 8,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
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
    lineHeight: 20,
  },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  accountNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  mostRecentBadge: {
    backgroundColor: "#3886655C",
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 0,
  },
  mostRecentText: {
    color: "#34D058",
    fontSize: 10,
    fontWeight: "600",
  },
  bankName: {
    color: "#757B85",
    fontSize: 12,
  },
  starButton: {
    marginLeft: 12,
  },
});
