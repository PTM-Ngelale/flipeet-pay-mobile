import ARS from "@/assets/images/flags/ars.svg";
import BRL from "@/assets/images/flags/brl.svg";
import GHS from "@/assets/images/flags/ghs.svg";
import KES from "@/assets/images/flags/kes.svg";
import NGN from "@/assets/images/flags/ngn.svg";
import USD from "@/assets/images/flags/usd.svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrency } from "../contexts/CurrencySelectorContext";

const currencies = [
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    icon: NGN,
    enabled: true,
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    icon: KES,
    enabled: false,
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "GH₵",
    icon: GHS,
    enabled: false,
  },
  {
    code: "USD",
    name: "United States Dollar",
    symbol: "$",
    icon: USD,
    enabled: false,
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    icon: BRL,
    enabled: false,
  },
  {
    code: "ARS",
    name: "Argentinian Peso",
    symbol: "$",
    icon: ARS,
    enabled: false,
  },
];

export default function CurrencySelector() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { savedCurrency, setSavedCurrency } = useCurrency(); // Use context values

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCurrencySelect = (currencyCode: string, enabled: boolean) => {
    if (!enabled) return; // Prevent selection of disabled currencies
    setSavedCurrency(currencyCode); // Update the context
    router.back();
  };

  const renderCurrencyIcon = (
    IconComponent: React.ComponentType<any>,
    code: string
  ) => {
    return <IconComponent width={45} height={45} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pick a Currency</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#757B85"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or code"
          placeholderTextColor="#757B85"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#757B85" />
          </TouchableOpacity>
        )}
      </View>

      {/* Currency List */}
      <Text style={styles.availableCurrenciesText}>Available currencies</Text>
      <FlatList
        data={filteredCurrencies}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.currencyItem,
              savedCurrency === item.code && styles.selectedCurrencyItem,
              !item.enabled && styles.disabledCurrencyItem,
            ]}
            onPress={() => handleCurrencySelect(item.code, item.enabled)}
            disabled={!item.enabled}
          >
            <View style={styles.currencyLeft}>
              {renderCurrencyIcon(item.icon, item.code)}
              <View style={styles.currencyInfo}>
                <Text
                  style={[
                    styles.currencyCode,
                    !item.enabled && styles.disabledText,
                  ]}
                >
                  {item.code}
                </Text>
                <Text
                  style={[
                    styles.currencyName,
                    !item.enabled && styles.disabledText,
                  ]}
                >
                  {item.name}
                </Text>
              </View>
            </View>
            <View style={styles.currencyRight}>
              {!item.enabled && (
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              )}
              {savedCurrency === item.code && item.enabled && (
                <Ionicons name="checkmark" size={20} color="#4A9DFF" />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  headerTitle: {
    color: "#757B85",
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#1C1C1C",
    borderWidth: 1,
    margin: 20,
    marginTop: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  availableCurrenciesText: {
    color: "#B0BACB",
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedCurrencyItem: {
    borderColor: "#4A9DFF",
  },
  disabledCurrencyItem: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#555",
  },
  comingSoonText: {
    color: "#757B85",
    fontSize: 12,
    fontStyle: "italic",
  },
  currencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currencyInfo: {
    marginLeft: 12,
  },
  currencyCode: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  currencyName: {
    color: "#757B85",
    fontSize: 14,
  },
  currencyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currencySymbol: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#2A2A2A",
  },
});
