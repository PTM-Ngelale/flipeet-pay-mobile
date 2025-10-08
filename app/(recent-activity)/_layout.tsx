import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";

export default function RecentActivityLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const CustomHeaderBackground = () => (
    <View
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
      }}
    />
  );

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerBackground: () => <CustomHeaderBackground />,
          headerTintColor: colorScheme === "dark" ? "#757B85" : "#000000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Recent Activity",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="activities-details"
          options={{
            title: "Activity Details",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
