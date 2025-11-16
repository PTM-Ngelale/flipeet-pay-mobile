import { StyleSheet } from "react-native";
import { COLORS } from "../colors";
import { SPACING } from "../spacing";
import { TYPOGRAPHY } from "../typography";

export const actionButtonStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.backgroundTertiary,
    height: 75,
    width: 75,
    borderRadius: 12,
    flexDirection: "column",
    justifyContent: "center",
  },
  iconContainer: {
    width: 24,
    height: 24,
  },
  label: {
    ...TYPOGRAPHY.bodyXSmall,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
});
