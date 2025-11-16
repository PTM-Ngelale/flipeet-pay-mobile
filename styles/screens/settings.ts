import { StyleSheet } from "react-native";
import { COLORS } from "../colors";
import { SPACING } from "../spacing";
import { TYPOGRAPHY } from "../typography";

export const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  profileSection: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: SPACING.xl,
    marginTop: 55,
    borderRadius: 16,
    gap: SPACING.lg,
    position: "relative",
  },
  userInfo: {
    flex: 1,
    gap: SPACING.sm,
  },
  username: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textPrimary,
    fontWeight: "600",
    textAlign: "center",
  },
  email: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textTertiary,
    fontWeight: "600",
    textAlign: "center",
  },
  addUsernameButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 54,
    paddingVertical: 18,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 8,
  },
  addUsernameText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: "500",
  },
  changeUsernameButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 8,
  },
  changeUsernameText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: "500",
  },
  settingsSection: {
    marginTop: 32,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.backgroundSecondary,
    gap: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    borderRadius: 10,
  },
  lastSettingsItem: {
    borderBottomWidth: 0,
  },
  settingsContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  settingsTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  settingsDescription: {
    ...TYPOGRAPHY.bodyXSmall,
    color: COLORS.textQuaternary,
    lineHeight: 18,
  },
});
