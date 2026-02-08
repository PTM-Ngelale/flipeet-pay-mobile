import HistoryIcon from "@/assets/images/history-icon.svg";
import ReceiveIcon from "@/assets/images/receive-icon.svg";
import SendIcon from "@/assets/images/send-icon.svg";
import ServicesIcon from "@/assets/images/services-icon.svg";
import SwapIcon from "@/assets/images/swap-icon.svg";
import USDCIcon from "@/assets/images/usdc-icon.svg";
import USDTIcon from "@/assets/images/usdt-icon.svg";
import { GlobalStyles } from "@/styles/global";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useProfile } from "./contexts/ProfileContext";
import type { AppDispatch, RootState } from "./store";
import { fetchUserBalances } from "./store/authSlice";

type IconComponentType = React.ComponentType<{ size?: number; color?: string }>;

const assetIcons = {
  "usdc.png": require("@/assets/images/usdc.png"),
  "usdt.png": require("@/assets/images/usdt.png"),
  "user.png": require("@/assets/images/user.png"),
};

const iconComponents: Record<string, IconComponentType> = {
  USDCIcon: USDCIcon,
  USDTIcon: USDTIcon,
};

const COLORS = {
  background: "#000000",
  textPrimary: "#FFFFFF",
  textSecondary: "#D1D5DB",
  textTertiary: "#9CA3AF",
  border: "#374151",
  lossBackground: "#453434",
  lossBorder: "#FF5F5F",
  lossText: "#FF5F5F",
  gainText: "#10B981",
  tabActive: "#FFFFFF",
  tabInactive: "#9CA3AF",
  icon: "#9CA3AF",
  actionIcon: "#4A9DFF",
};

// Constants
const LOSS_AMOUNT = 0.3;
const LOSS_PERCENTAGE = -3;

// Types
interface Asset {
  id: string;
  name: string;
  balance: number;
  usdValue: number;
  gain: number;
  icon: string;
}

interface ActionButton {
  icon: React.ReactNode;
  label: string;
  route: string;
}

export default function WalletHomeScreen() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { username, profileImage } = useProfile();
  const dispatch = useDispatch<AppDispatch>();

  // Get balances from Redux
  const balances = useSelector((state: RootState) => state.auth.balances);
  const balancesLoading = useSelector(
    (state: RootState) => state.auth.balancesLoading,
  );
  const token = useSelector((state: RootState) => state.auth.token);

  // Fetch balances on mount and when token becomes available
  useEffect(() => {
    if (token) {
      dispatch(fetchUserBalances());
    }
  }, [dispatch, token]);
  // Map API balances to assets with proper icons
  const assets = useMemo<Asset[]>(() => {
    if (!balances || !Array.isArray(balances) || balances.length === 0) {
      // Return default tokens showing 0 balance
      return [
        {
          id: "usdc",
          name: "USDC",
          balance: 0,
          usdValue: 0,
          gain: 0,
          icon: "USDCIcon",
        },
        {
          id: "usdt",
          name: "USDT",
          balance: 0,
          usdValue: 0,
          gain: 0,
          icon: "USDTIcon",
        },
      ];
    }

    // Group balances by token (sum across all networks)
    const grouped: {
      [key: string]: { balance: number; usdValue: number; networks: string[] };
    } = {};

    balances.forEach((balance: any) => {
      const symbol = (
        balance.asset ||
        balance.symbol ||
        balance.currency ||
        ""
      ).toUpperCase();
      const amount = parseFloat(balance.balance || balance.amount || 0);
      const usdValue = parseFloat(
        balance.usdValue || balance.usdBalance || balance.balanceUSD || amount,
      );
      const network = balance.network || "unknown";

      if (!grouped[symbol]) {
        grouped[symbol] = { balance: 0, usdValue: 0, networks: [] };
      }

      grouped[symbol].balance += amount;
      grouped[symbol].usdValue += usdValue;
      grouped[symbol].networks.push(network);
    });

    // Convert grouped data to array
    return Object.keys(grouped).map((symbol) => {
      const data = grouped[symbol];

      // Map symbol to icon
      let icon = "USDCIcon";
      if (symbol === "USDT") {
        icon = "USDTIcon";
      } else if (symbol === "USDC") {
        icon = "USDCIcon";
      }

      return {
        id: symbol.toLowerCase(),
        name: symbol,
        balance: data.balance,
        usdValue: data.usdValue,
        gain: 0, // Can be calculated if we have historical data
        icon: icon,
      };
    });
  }, [balances]);

  // Calculate total balance in USD from grouped assets
  const totalBalanceUSD = useMemo(() => {
    if (!assets || assets.length === 0) {
      console.log("[totalBalanceUSD] No assets found");
      return 0;
    }

    const total = assets.reduce((sum, asset) => {
      const assetUsdValue = asset.usdValue || 0;
      console.log(`[totalBalanceUSD] ${asset.name}: usdValue=${assetUsdValue}`);
      return sum + assetUsdValue;
    }, 0);

    console.log("[totalBalanceUSD] Final total from assets:", total);
    return total;
  }, [assets]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUserBalances());
    setRefreshing(false);
  };

  const actionButtons = useMemo<ActionButton[]>(
    () => [
      {
        icon: <ReceiveIcon width={24} height={24} fill={COLORS.actionIcon} />,
        label: "Receive",
        route: "/receive",
      },
      {
        icon: <SwapIcon width={24} height={24} fill={COLORS.actionIcon} />,
        label: "Swap",
        route: "/swap",
      },
      {
        icon: <SendIcon width={24} height={24} fill={COLORS.actionIcon} />,
        label: "Send",
        route: "/send",
      },
      {
        icon: <ServicesIcon width={24} height={24} fill={COLORS.actionIcon} />,
        label: "Services",
        route: "/services",
      },
    ],
    [],
  );

  // Helper functions
  const formatCurrency = (value: number) => value.toFixed(2);
  const roundUp = (value: number, decimals: number) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    const factor = Math.pow(10, decimals);
    return Math.ceil(safeValue * factor) / factor;
  };
  const formatBalance = (balance: number, symbol: string) =>
    `${roundUp(balance, 6).toFixed(6)} ${symbol.toUpperCase()}`;
  const formatTokenValue = (value: number) => roundUp(value, 2).toFixed(2);

  // Toggle balance visibility
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  // Handle action button press
  const handleActionPress = (route: string) => {
    router.push(route as any);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <TouchableOpacity
          onPress={() => router.push("/(profile-and-settings)")}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.userAvatar} />
          ) : (
            // <UserProfile width={48} height={48} />
            <Ionicons name="person-circle-outline" size={48} color="#B0BACB" />
          )}
        </TouchableOpacity>
        <View>
          {/* <Text style={[styles.userName, { color: "#B0BACB" }]}>Welcome</Text> */}
          <Text style={[styles.userName, { color: COLORS.textPrimary }]}>
            {username ? `@${username}` : ""}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => router.push("/(recent-activity)")}>
        <HistoryIcon />
      </TouchableOpacity>
    </View>
  );

  const renderBalanceSection = () => (
    <View style={styles.balanceSection}>
      <View style={styles.balanceRow}>
        <Text
          style={[
            styles.balanceAmount,
            { color: COLORS.textPrimary },
            GlobalStyles.textBold,
          ]}
        >
          {isBalanceVisible ? `$${totalBalanceUSD.toFixed(2)}` : "******"}
        </Text>
        <TouchableOpacity onPress={toggleBalanceVisibility}>
          <Entypo
            name={isBalanceVisible ? "eye" : "eye-with-line"}
            size={20}
            color={COLORS.icon}
          />
        </TouchableOpacity>
      </View>

      {/* <View style={styles.lossSection}>
        <Text
          style={[
            styles.lossAmount,
            { color: isBalanceVisible ? COLORS.lossText : COLORS.textPrimary },
          ]}
        >
          {isBalanceVisible ? `-$${LOSS_AMOUNT}` : "******"}
        </Text>
        {isBalanceVisible ? (
          <View
            style={[
              styles.lossPercentage,
              {
                backgroundColor: COLORS.lossBackground,
                borderColor: COLORS.lossBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.lossPercentageText,
                {
                  color: isBalanceVisible
                    ? COLORS.lossText
                    : COLORS.textTertiary,
                },
              ]}
            >
              {`${LOSS_PERCENTAGE}%`}
            </Text>
          </View>
        ) : (
          ""
        )}
      </View> */}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      {actionButtons.map((button) => (
        <TouchableOpacity
          key={button.label}
          onPress={() => handleActionPress(button.route)}
          style={styles.actionButton}
        >
          {button.icon}
          <Text
            style={[styles.actionButtonText, { color: COLORS.textPrimary }]}
          >
            {button.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTokenItem = (asset: Asset) => {
    const IconComponent = iconComponents[asset.icon];

    return (
      <View key={asset.id} style={[styles.tokenItem]}>
        <View style={styles.tokenLeft}>
          {IconComponent ? (
            <IconComponent size={40} />
          ) : (
            <Image
              source={assetIcons[asset.icon as keyof typeof assetIcons]}
              style={styles.tokenIcon}
            />
          )}
          <View>
            <Text style={[styles.tokenName, { color: COLORS.textPrimary }]}>
              {asset.name}
            </Text>
            <Text
              style={[
                styles.tokenBalance,
                {
                  color: isBalanceVisible
                    ? COLORS.textSecondary
                    : COLORS.textPrimary,
                },
              ]}
            >
              {isBalanceVisible
                ? formatBalance(asset.balance, asset.id)
                : "******"}
            </Text>
          </View>
        </View>
        <View style={styles.tokenRight}>
          <Text
            style={[
              styles.tokenValue,
              {
                color: isBalanceVisible
                  ? COLORS.textTertiary
                  : COLORS.textPrimary,
              },
            ]}
          >
            {isBalanceVisible
              ? `$${formatTokenValue(asset.usdValue)}`
              : "******"}
          </Text>
          <Text
            style={[
              isBalanceVisible
                ? asset.gain >= 0
                  ? styles.gainText
                  : styles.lossText
                : { color: COLORS.textPrimary },
            ]}
          >
            {isBalanceVisible
              ? `${asset.gain >= 0 ? "+" : "-"}$${roundUp(
                  Math.abs(asset.gain),
                  2,
                ).toFixed(2)}`
              : "******"}
          </Text>
        </View>
      </View>
    );
  };

  const renderTokensList = () => (
    <ScrollView
      style={styles.tokensScrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tokensScrollContent}
    >
      {balancesLoading ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.actionIcon} />
          <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>
            Loading balances...
          </Text>
        </View>
      ) : assets.length > 0 ? (
        <View style={styles.tokensList}>{assets.map(renderTokenItem)}</View>
      ) : (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>
            No tokens found
          </Text>
          <Text
            style={{
              color: COLORS.textTertiary,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Your wallet balances will appear here
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: COLORS.background }]}
        edges={["right", "left", "bottom"]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.textSecondary}
              colors={[COLORS.actionIcon]}
            />
          }
        >
          <ImageBackground
            source={require("@/assets/images/circle.png")}
            resizeMode="cover"
          >
            <View style={styles.content}>
              {renderHeader()}
              {renderBalanceSection()}
              {renderActionButtons()}

              {/* Tokens section header */}
              <View style={styles.tokensHeader}>
                <View style={styles.tokensTitleRow}>
                  <Text
                    style={[styles.tokensTitle, { color: COLORS.textPrimary }]}
                  >
                    Tokens
                  </Text>
                  <TouchableOpacity>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={24}
                      color="#757B85"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.tokensContainer}>{renderTokensList()}</View>
            </View>
          </ImageBackground>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    flex: 1,
    paddingTop: 65,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  userInfo: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  balanceSection: {
    alignItems: "center",
    gap: 8,
    marginTop: 40,
    marginBottom: 36,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  balanceAmount: {
    fontSize: 62,
    fontWeight: "bold",
  },
  lossSection: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  lossAmount: {
    fontSize: 18,
    fontWeight: "500",
  },
  lossPercentage: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lossPercentageText: {
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 32,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1A212A",
    height: 75,
    width: 75,
    borderRadius: 12,
    flexDirection: "column",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  tokensHeader: {
    marginVertical: 24,
  },
  tokensTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  tokensTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tokensContainer: {
    flex: 1,
  },
  tokensScrollView: {
    flex: 1,
  },
  tokensScrollContent: {
    paddingBottom: 20,
  },
  tokensList: {
    gap: 12,
  },
  tokenItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tokenBalance: {
    color: "#757B85",
    fontSize: 14,
  },
  tokenRight: {
    alignItems: "flex-end",
  },
  tokenValue: {
    color: "#757B85",
    fontSize: 12,
  },
  gainText: {
    fontSize: 14,
    color: "#10B981",
  },
  lossText: {
    fontSize: 14,
    color: "#FF5F5F",
  },
});
