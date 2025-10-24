import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";

export default function RecentActivityLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();



  return (
    <>
      <StatusBar 
        style="light"
        translucent
        backgroundColor="transparent"
      />
      <Stack
         screenOptions={{
          headerStyle: {
            backgroundColor: "#000000",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
            fontFamily: "Lato-Regular",
          },

          contentStyle: {
            backgroundColor: "transparent",
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
