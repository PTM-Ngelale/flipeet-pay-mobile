import React from "react";
import { Image, Text, View } from "react-native";
import { tokenItemStyles } from "../styles/components/tokenItem";

interface TokenItemProps {
  name: string;
  balance: number;
  usdValue: number;
  gain: number;
  icon: any;
  isBalanceVisible: boolean;
  formatBalance: (balance: number, symbol: string) => string;
}

export const TokenItem: React.FC<TokenItemProps> = ({
  name,
  balance,
  usdValue,
  gain,
  icon,
  isBalanceVisible,
  formatBalance,
}) => {
  const isGain = gain >= 0;

  return (
    <View style={tokenItemStyles.container}>
      <View style={tokenItemStyles.leftSection}>
        <Image source={icon} style={tokenItemStyles.icon} />
        <View>
          <Text style={tokenItemStyles.name}>{name}</Text>
          <Text style={tokenItemStyles.balance}>
            {isBalanceVisible ? formatBalance(balance, name) : "******"}
          </Text>
        </View>
      </View>

      <View style={tokenItemStyles.rightSection}>
        <Text style={tokenItemStyles.usdValue}>
          {isBalanceVisible ? `$${usdValue}` : "******"}
        </Text>
        <Text
          style={[
            tokenItemStyles.gain,
            isBalanceVisible
              ? isGain
                ? tokenItemStyles.gainPositive
                : tokenItemStyles.gainNegative
              : tokenItemStyles.gainHidden,
          ]}
        >
          {isBalanceVisible
            ? `${isGain ? "+" : "-"}$${Math.abs(gain).toLocaleString()}`
            : "******"}
        </Text>
      </View>
    </View>
  );
};
