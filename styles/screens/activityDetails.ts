import { StyleSheet } from "react-native";
import { COLORS } from "../colors";
import { SPACING } from "../spacing";
import { TYPOGRAPHY } from "../typography";

export const activityDetailsStyles = StyleSheet.create({
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
  headerTitle: {
    ...TYPOGRAPHY.header3,
    color: COLORS.textQuaternary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  transactionHeader: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    borderRadius: 10,
    padding: SPACING.xxl,
  },
  transactionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  transactionIconContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: SPACING.md,
  },
  transactionIcon: {
    width: 86,
    height: 86,
  },
  transactionTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    fontWeight: "bold",
  },
  transactionDetails: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    borderRadius: 10,
    padding: SPACING.xl,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  detailLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textQuaternary,
    flex: 1,
  },
  detailValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: "bold",
    textAlign: "right",
    marginRight: SPACING.xs,
  },
  networkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  networkContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  networkIcon: {
    width: 20,
    height: 20,
    marginRight: SPACING.sm,
  },
  networkText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    textAlign: "right",
  },
  downloadButton: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: "bold",
    marginLeft: SPACING.sm,
  },
  helpSection: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    marginTop: SPACING.xl,
  },
  helpText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  helpLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: "bold",
  },
});
