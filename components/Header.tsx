import { headerStyles } from "@/styles/components/header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightComponent,
  onBackPress,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={headerStyles.container}>
      <TouchableOpacity onPress={handleBackPress} style={headerStyles.button}>
        {showBackButton && (
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      <Text style={headerStyles.title}>{title}</Text>

      <View style={headerStyles.button}>
        {rightComponent || <View style={{ width: 24 }} />}
      </View>
    </View>
  );
};
