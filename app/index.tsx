import HistoryIcon from "@/assets/images/history-icon.svg";
import ReceiveIcon from "@/assets/images/receive-icon.svg";
import SendIcon from "@/assets/images/send-icon.svg";
import ServicesIcon from "@/assets/images/services-icon.svg";
import SwapIcon from "@/assets/images/swap-icon.svg";
import USDCIcon from "@/assets/images/usdc-icon.svg";
import USDTIcon from "@/assets/images/usdt-icon.svg";
import UserProfile from "@/assets/images/user.svg";
import { GlobalStyles } from "@/styles/global";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
const TOTAL_BALANCE_USD = 9.0;
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
  const router = useRouter();

  // Memoized data with dynamic icons based on color scheme
  const assets = useMemo<Asset[]>(
    () => [
      {
        id: "usdc",
        name: "USDC",
        balance: 0.5564,
        usdValue: 0.55,
        gain: 142500,
        icon: "USDCIcon",
      },
      {
        id: "usdt",
        name: "USDT",
        balance: 0.5564,
        usdValue: 0.55,
        gain: -5000,
        icon: "USDTIcon",
      },
    ],
    []
  );

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
    []
  );

  // Helper functions
  const formatCurrency = (value: number) => value.toFixed(2);
  const formatBalance = (balance: number, symbol: string) =>
    `${balance} ${symbol.toUpperCase()}`;

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
        <UserProfile width={48} height={48} />
        <View>
          <Text style={[styles.userName, { color: "#B0BACB" }]}>Welcome</Text>
          {/* <Text style={[styles.userName, { color: COLORS.textPrimary }]}>
            Heritage
          </Text> */}
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
          {isBalanceVisible
            ? `$${formatCurrency(TOTAL_BALANCE_USD)}`
            : "******"}
        </Text>
        <TouchableOpacity onPress={toggleBalanceVisibility}>
          <Entypo
            name={isBalanceVisible ? "eye" : "eye-with-line"}
            size={20}
            color={COLORS.icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.lossSection}>
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
      </View>
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
            {isBalanceVisible ? `$${asset.usdValue}` : "******"}
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
              ? `${asset.gain >= 0 ? "+" : "-"}$${Math.abs(
                  asset.gain
                ).toLocaleString()}`
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
      <View style={styles.tokensList}>{assets.map(renderTokenItem)}</View>
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
    gap: 8,
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
    fontSize: 22,
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
