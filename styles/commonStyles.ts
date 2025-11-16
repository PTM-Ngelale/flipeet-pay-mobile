import { StyleSheet } from "react-native";
import { COLORS } from "./colors";
import { SPACING } from "./spacing";
import { TYPOGRAPHY } from "./typography";

export const commonStyles = StyleSheet.create({
  // Safe area
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Containers
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // Cards
  card: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },

  // Inputs
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    color: COLORS.textPrimary,
    fontSize: 16,
    padding: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    paddingVertical: SPACING.lg,
    borderRadius: 8,
    alignItems: "center",
  },

  // Text
  textPrimary: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
  },
  textSecondary: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  textTertiary: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textTertiary,
  },
});
