import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { useFavoriteEmails } from "../contexts/FavoriteEmailsContext";

export default function FavoritesPage() {
  const router = useRouter();
  const {
    favoriteEmails,
    recentEmails,
    toggleFavorite,
    markEmailAsUsed,
    setSelectedEmailFromFavorite,
  } = useFavoriteEmails();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"favorites" | "recent">(
    "favorites"
  );

  const currentEmails =
    activeTab === "favorites" ? favoriteEmails : recentEmails;

  const filteredEmails = currentEmails.filter((email) =>
    email.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEmails = [...filteredEmails].sort((a, b) => {
    if (activeTab === "recent") {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    }
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  const handleEmailSelect = (email: any) => {
    markEmailAsUsed(email.email);
    // Set the selected email in context and navigate back
    setSelectedEmailFromFavorite(email.email);
    router.back();
  };

  const handleToggleFavorite = (
    emailId: string,
    email: string,
    isCurrentlyFavorite: boolean
  ) => {
    if (isCurrentlyFavorite) {
      Alert.alert(
        "Remove Favorite",
        `Are you sure you want to remove ${email} from favorites?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => toggleFavorite(emailId),
          },
        ]
      );
    } else {
      toggleFavorite(emailId);
    }
  };

  const isMostRecent = (email: any, index: number) => {
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
              sortedEmails.length === 0 && styles.emptyStateContent,
            ]}
          >
            {sortedEmails.length === 0 ? (
              <View style={styles.emptyState}>
                {searchQuery ? (
                  <>
                    <Ionicons name="search-outline" size={64} color="#757B85" />
                    <Text style={styles.emptyStateTitle}>No results found</Text>
                    <Text style={styles.emptyStateText}>
                      No{" "}
                      {activeTab === "favorites"
                        ? "favorite emails"
                        : "recent emails"}{" "}
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
                        ? "No Favorite Emails"
                        : "No Recent Emails"}
                    </Text>
                    <Text style={styles.emptyStateText}>
                      {activeTab === "favorites"
                        ? "Emails you add to favorites will appear here."
                        : "Emails you use will appear here."}
                    </Text>
                  </>
                )}
              </View>
            ) : (
              sortedEmails.map((email, index) => (
                <TouchableOpacity
                  key={email.id}
                  style={styles.emailCard}
                  onPress={() => handleEmailSelect(email)}
                >
                  <View style={styles.emailInfo}>
                    <View style={styles.emailHeader}>
                      <Text style={styles.emailAddress}>{email.email}</Text>
                      {isMostRecent(email, index) && (
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
                        email.id,
                        email.email,
                        email.isFavorite
                      )
                    }
                  >
                    <Ionicons
                      name={email.isFavorite ? "star" : "star-outline"}
                      size={17}
                      color={email.isFavorite ? "#fff" : "#757B85"}
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
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 12,
  },
  emailInfo: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  emailAddress: {
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
