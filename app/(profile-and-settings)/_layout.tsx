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

        <Stack.Screen
          name="change-email"
          options={{
            title: "New Email",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="verify-email"
          options={{
            title: "Verify Email",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="success-email"
          options={{
            title: "Success",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="change-pin"
          options={{
            title: "Change Pin",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="create-new-pin"
          options={{
            title: "Create New Pin",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="success-pin"
          options={{
            title: "Success",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="reauthenticate"
          options={{
            title: "PIN Authentication",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="setup-mobile-pin"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
