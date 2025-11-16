import { StyleSheet } from "react-native";
import { COLORS } from "../colors";
import { SPACING } from "../spacing";
import { TYPOGRAPHY } from "../typography";

export const tokenItemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  balance: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textQuaternary,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  usdValue: {
    ...TYPOGRAPHY.bodyXSmall,
    color: COLORS.textQuaternary,
  },
  gain: {
    ...TYPOGRAPHY.bodySmall,
  },
  gainPositive: {
    color: COLORS.success,
  },
  gainNegative: {
    color: COLORS.error,
  },
  gainHidden: {
    color: COLORS.textPrimary,
  },
});
