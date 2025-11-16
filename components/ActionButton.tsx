import { actionButtonStyles } from "@/styles/components/actionButton";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        actionButtonStyles.container,
        disabled && actionButtonStyles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={actionButtonStyles.iconContainer}>{icon}</View>
      <Text style={actionButtonStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
};
