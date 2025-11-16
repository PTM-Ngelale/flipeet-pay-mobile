import { StyleSheet } from "react-native";
import { COLORS } from "../colors";
import { SPACING } from "../spacing";
import { TYPOGRAPHY } from "../typography";

export const recentActivityStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.xl,
    paddingBottom: 0,
  },
  scrollView: {
    flex: 1,
    marginTop: 40,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  dateSection: {
    marginBottom: SPACING.xxl,
  },
  dateText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textQuaternary,
    fontWeight: "bold",
    marginBottom: SPACING.lg,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: 10,
    marginBottom: SPACING.md,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: "bold",
  },
  activityDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: "400",
    marginTop: SPACING.xs,
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityAmount: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: "bold",
  },
  activitySecondaryAmount: {
    color: COLORS.successLight,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: "bold",
    marginTop: SPACING.xs,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textQuaternary,
    fontWeight: "500",
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  emptyStateSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textQuaternary,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
});
