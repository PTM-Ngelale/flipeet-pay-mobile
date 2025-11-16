import { StyleSheet } from "react-native";
import { COLORS } from "../colors";
import { SPACING } from "../spacing";
import { TYPOGRAPHY } from "../typography";

export const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.header3,
    color: COLORS.textQuaternary,
  },
  button: {
    padding: SPACING.xs,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
