import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ProfileAndSettingsLayout() {
  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
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
            title: "Profile And Settings",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="username"
          options={{
            title: "Username",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="preferences"
          options={{
            title: "Preferences",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="security"
          options={{
            title: "Security/Privacy",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="about"
          options={{
            title: "About",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="support"
          options={{
            title: "Support",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
