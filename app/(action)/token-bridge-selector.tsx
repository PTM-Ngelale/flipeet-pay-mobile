// app/(action)/token-selector.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { useBridgeToken } from "../contexts/TokenContext";
import { useSelector } from "react-redux";
import { useBridgeToken } from "../contexts/BridgeTokenContext";
import type { RootState } from "../store";

import Base from "@/assets/images/networks/base.svg";
import Bnb from "@/assets/images/networks/bnb.svg";
import Solana from "@/assets/images/networks/solana.svg";

import USDC from "@/assets/images/tokens/usdc.svg";
import USDT from "@/assets/images/tokens/usdt.svg";

const networkIconMap: Record<
  string,
  { id: string; name: string; icon: React.ComponentType<any> }
> = {
  solana: { id: "solana", name: "Solana", icon: Solana },
  base: { id: "base", name: "Base", icon: Base },
  "bnb-smart-chain": {
    id: "bnb-smart-chain",
    name: "BNB Smart Chain",
    icon: Bnb,
  },
};

const tokenIconMap: Record<
  string,
  { symbol: string; name: string; icon: React.ComponentType<any> }
> = {
  usdc: { symbol: "USDC", name: "USD Coin", icon: USDC },
  usdt: { symbol: "USDT", name: "Tether", icon: USDT },
};

export default function TokenSelector() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedNetwork, setSelectedNetwork] = useState("solana");
  const { fromToken, toToken, setFromToken, setToToken } = useBridgeToken();
  const balances = useSelector((state: RootState) => state.auth.balances);

  const normalizeNetworkId = (networkName: string) => {
    const normalized = (networkName || "").toLowerCase().replace(/\s+/g, "-");
    if (
      normalized === "bnb-chain" ||
      normalized === "bnb" ||
      normalized === "bsc"
    ) {
      return "bnb-smart-chain";
    }
    return normalized;
  };

  const networks = useMemo(() => {
    if (balances && Array.isArray(balances) && balances.length > 0) {
      const unique = new Set<string>();
      balances.forEach((b: any) => {
        if (b?.network) unique.add(normalizeNetworkId(b.network));
      });

      const dynamic = Array.from(unique)
        .map((id) => networkIconMap[id])
        .filter(Boolean);

      return dynamic.length > 0
        ? dynamic
        : [
            networkIconMap.solana,
            networkIconMap.base,
            networkIconMap["bnb-smart-chain"],
          ];
    }

    return [
      networkIconMap.solana,
      networkIconMap.base,
      networkIconMap["bnb-smart-chain"],
    ];
  }, [balances]);

  const tokens = useMemo(() => {
    if (balances && Array.isArray(balances) && balances.length > 0) {
      const unique = new Map<string, any>();
      balances.forEach((b: any) => {
        const symbol = (b.asset || b.token || "").toLowerCase();
        const network = normalizeNetworkId(b.network || "");
        const tokenMeta = tokenIconMap[symbol];
        const networkMeta = networkIconMap[network];
        if (!tokenMeta || !networkMeta) return;

        const key = `${tokenMeta.symbol}-${network}`;
        if (!unique.has(key)) {
          unique.set(key, {
            symbol: tokenMeta.symbol,
            name: tokenMeta.name,
            balance: String(b.balance ?? "0"),
            network: networkMeta.id,
            icon: tokenMeta.icon,
          });
        }
      });
      return Array.from(unique.values());
    }

    return Object.values(networkIconMap).flatMap((network) => [
      {
        symbol: "USDC",
        name: "USD Coin",
        balance: "0",
        network: network.id,
        icon: USDC,
      },
      {
        symbol: "USDT",
        name: "Tether",
        balance: "0",
        network: network.id,
        icon: USDT,
      },
    ]);
  }, [balances]);

  useEffect(() => {
    const currentNetwork = normalizeNetworkId(
      (isFromToken ? fromToken.network : toToken.network) || "solana",
    );
    setSelectedNetwork(currentNetwork);
  }, [fromToken.network, toToken.network, isFromToken]);

  useEffect(() => {
    if (
      !networks.find((n) => n.id === selectedNetwork) &&
      networks.length > 0
    ) {
      setSelectedNetwork(networks[0].id);
    }
  }, [networks, selectedNetwork]);

  // Get selection type from route params
  const selectionType = params.selectionType as string;
  const isFromToken = selectionType === "from";

  // Filter tokens based on selected network
  const filteredTokens = tokens.filter(
    (token) => token.network === selectedNetwork,
  );

  const handleTokenSelect = (token: any) => {
    const network = networks.find((net) => net.id === token.network);
    const updatedToken = {
      ...token,
      network: network?.name || token.network,
    };

    if (isFromToken) {
      setFromToken(updatedToken);
    } else {
      setToToken(updatedToken);
    }

    router.back();
  };

  // Use the appropriate token for selection highlighting
  const currentToken = isFromToken ? fromToken : toToken;

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

  const renderTokenItem = ({ item }: { item: any }) => {
    // Check if this token is currently selected
    const isSelected =
      currentToken &&
      currentToken.symbol === item.symbol &&
      currentToken.network ===
        networks.find((net) => net.id === item.network)?.name;

    return (
      <TouchableOpacity
        style={[styles.tokenItem, isSelected && styles.selectedTokenItem]}
        onPress={() => handleTokenSelect(item)}
      >
        <View style={styles.tokenLeft}>
          {renderTokenIcon(item.icon)}
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenSymbol}>{item.symbol}</Text>
            <Text style={styles.tokenName}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.tokenRight}>
          <Text style={styles.tokenBalance}>
            {Number.isFinite(Number(item.balance))
              ? Number(item.balance).toFixed(6)
              : "0.000000"}{" "}
            {item.symbol}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark" size={20} color="#4A9DFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
              <Text style={styles.headerTitle}>
                Select {isFromToken ? "From" : "To"} Token
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Tokens List */}
            <View style={styles.section}>
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
    color: "#757B85",
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
    marginTop: 40,
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
    // backgroundColor: "#1A1A1A",
  },
  selectedNetworkItem: {
    borderColor: "#4A9DFF",
    // backgroundColor: "#1A2A3A",
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
    // backgroundColor: "#1A1A1A",
  },
  selectedTokenItem: {
    borderColor: "#4A9DFF",
    // backgroundColor: "#1A2A3A",
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
