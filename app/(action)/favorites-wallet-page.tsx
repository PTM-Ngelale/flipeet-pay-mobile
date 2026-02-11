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
import { useFavoriteWallets } from "../contexts/FavoriteWalletsContext";

export default function FavoritesWalletPage() {
  const router = useRouter();
  const {
    favoriteWallets,
    recentWallets,
    toggleFavorite,
    markWalletAsUsed,
    setSelectedWalletFromFavorite,
    refreshFavorites,
  } = useFavoriteWallets();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"favorites" | "recent">(
    "favorites",
  );

  useFocusEffect(
    useCallback(() => {
      void refreshFavorites();
    }, [refreshFavorites]),
  );

  const currentWallets =
    activeTab === "favorites" ? favoriteWallets : recentWallets;

  const filteredWallets = currentWallets.filter((wallet) =>
    wallet.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedWallets = [...filteredWallets].sort((a, b) => {
    if (activeTab === "recent") {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    }
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  const handleWalletSelect = (wallet: any) => {
    markWalletAsUsed(wallet.walletAddress);
    // Set the selected wallet in context and navigate back
    setSelectedWalletFromFavorite(wallet.walletAddress);
    router.back();
  };

  const handleToggleFavorite = (
    walletId: string,
    walletAddress: string,
    isCurrentlyFavorite: boolean,
  ) => {
    if (isCurrentlyFavorite) {
      Alert.alert(
        "Remove Favorite",
        `Are you sure you want to remove this wallet from favorites?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => toggleFavorite(walletId),
          },
        ],
      );
    } else {
      toggleFavorite(walletId);
    }
  };

  const isMostRecent = (wallet: any, index: number) => {
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
              sortedWallets.length === 0 && styles.emptyStateContent,
            ]}
          >
            {sortedWallets.length === 0 ? (
              <View style={styles.emptyState}>
                {searchQuery ? (
                  <>
                    <Ionicons name="search-outline" size={64} color="#757B85" />
                    <Text style={styles.emptyStateTitle}>No results found</Text>
                    <Text style={styles.emptyStateText}>
                      No{" "}
                      {activeTab === "favorites"
                        ? "favorite wallets"
                        : "recent wallets"}{" "}
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
                        ? "No Favorite Wallets"
                        : "No Recent Wallets"}
                    </Text>
                    <Text style={styles.emptyStateText}>
                      {activeTab === "favorites"
                        ? "Wallets you add to favorites will appear here."
                        : "Wallets you use will appear here."}
                    </Text>
                  </>
                )}
              </View>
            ) : (
              sortedWallets.map((wallet, index) => (
                <TouchableOpacity
                  key={wallet.id}
                  style={styles.walletCard}
                  onPress={() => handleWalletSelect(wallet)}
                >
                  <View style={styles.walletInfo}>
                    <View style={styles.walletHeader}>
                      <Text style={styles.walletAddress}>
                        {wallet.walletAddress}
                      </Text>
                      {isMostRecent(wallet, index) && (
                        <View style={styles.mostRecentBadge}>
                          <Text style={styles.mostRecentText}>Most recent</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.starButton}
                    onPress={() =>
                      handleToggleFavorite(
                        wallet.id,
                        wallet.walletAddress,
                        wallet.isFavorite,
                      )
                    }
                  >
                    <Ionicons
                      name={wallet.isFavorite ? "star" : "star-outline"}
                      size={17}
                      color={wallet.isFavorite ? "#fff" : "#757B85"}
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
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  walletAddress: {
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
  starButton: {
    marginLeft: 12,
  },
});
