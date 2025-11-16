import { StyleSheet } from "react-native";
import { COLORS } from "../colors";
import { SPACING } from "../spacing";

export const walletHomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: SPACING.xl,
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
    gap: SPACING.sm,
    alignItems: "center",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  balanceSection: {
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: 40,
    marginBottom: 36,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 32,
  },
  tokensHeader: {
    marginVertical: SPACING.xxl,
  },
  tokensTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
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
    gap: SPACING.md,
  },
});
