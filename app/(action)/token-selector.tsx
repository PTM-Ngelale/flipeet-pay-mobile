// app/(action)/token-selector.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToken } from "../contexts/TokenContext";

import Arbitrum from "@/assets/images/networks/arbitrum.svg";
import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Link from "@/assets/images/networks/link.svg";
import Polygon from "@/assets/images/networks/polygon.svg";
import Solana from "@/assets/images/networks/solana.svg";

import USDC from "@/assets/images/tokens/usdc.svg";
import USDT from "@/assets/images/tokens/usdt.svg";

// Networks data with icons
const networks = [
  {
    id: "solana",
    name: "Solana",
    icon: Solana,
  },
  {
    id: "base",
    name: "Base",
    icon: Base,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    icon: Arbitrum,
  },
  {
    id: "bnb",
    name: "BNB Chain",
    icon: Bnb,
  },
  {
    id: "link",
    name: "Link",
    icon: Link,
  },
  {
    id: "polygon",
    name: "Polygon",
    icon: Polygon,
  },
];

// Tokens data with icons
const tokens = [
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "0.00678",
    network: "solana",
    icon: USDC,
  },
  {
    symbol: "USDT",
    name: "Tether",
    balance: "0.00000",
    network: "solana",
    icon: USDT,
  },
];

export default function TokenSelector() {
  const router = useRouter();
  const [selectedNetwork, setSelectedNetwork] = useState("solana");
  const { selectedToken, setSelectedToken } = useToken();

  // Filter tokens based on selected network
  const filteredTokens = tokens.filter(
    (token) => token.network === selectedNetwork
  );

  const handleTokenSelect = (token: any) => {
    const network = networks.find((net) => net.id === token.network);
    setSelectedToken({
      ...token,
      network: network?.name || token.network,
    });
    router.back();
  };

  const renderNetworkIcon = (IconComponent: React.ComponentType<any>) => {
    return <IconComponent width={40} height={40} />;
  };

  const renderTokenIcon = (IconComponent: React.ComponentType<any>) => {
    return <IconComponent width={40} height={40} />;
  };

  const renderNetworkItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.networkItem,
        selectedNetwork === item.id && styles.selectedNetworkItem,
      ]}
      onPress={() => setSelectedNetwork(item.id)}
    >
      <View style={styles.networkLeft}>
        {renderNetworkIcon(item.icon)}
        <View style={styles.networkInfo}>
          <Text style={styles.networkName}>{item.name}</Text>
        </View>
      </View>
      <View style={styles.networkRight}>
        {selectedNetwork === item.id && (
          <Ionicons name="checkmark" size={20} color="#4A9DFF" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTokenItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.tokenItem,
        selectedToken.symbol === item.symbol &&
          selectedToken.network === item.network &&
          styles.selectedTokenItem,
      ]}
      onPress={() => handleTokenSelect(item)}
    >
      <View style={styles.tokenLeft}>
        {renderTokenIcon(item.icon)}
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenSymbol}>{item.symbol}</Text>
        </View>
      </View>
      <View style={styles.tokenRight}>
        {selectedToken.symbol === item.symbol &&
          selectedToken.network === item.network && (
            <Ionicons name="checkmark" size={20} color="#4A9DFF" />
          )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Select Token</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Tokens List */}
            <View style={[styles.section, { marginTop: 30 }]}>
              <Text style={styles.sectionTitle}>Available Tokens</Text>
              <FlatList
                data={filteredTokens}
                scrollEnabled={false}
                keyExtractor={(item) => `${item.symbol}-${item.network}`}
                renderItem={renderTokenItem}
              />
            </View>

            {/* Networks List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Networks</Text>
              <FlatList
                data={networks}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={renderNetworkItem}
              />
            </View>
          </>
        }
        renderItem={null}
        keyExtractor={() => "header"}
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
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#B0BACB",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginHorizontal: 20,
  },
  networkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedNetworkItem: {
    borderColor: "#4A9DFF",
  },
  networkLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  networkInfo: {
    marginLeft: 12,
  },
  networkName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  networkRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedTokenItem: {
    borderColor: "#4A9DFF",
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tokenInfo: {
    marginLeft: 12,
  },
  tokenSymbol: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tokenName: {
    color: "#757B85",
    fontSize: 14,
  },
  tokenRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tokenBalance: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});
