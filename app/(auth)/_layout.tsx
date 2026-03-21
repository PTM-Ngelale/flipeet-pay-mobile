import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
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
          name="login"
          options={{
            title: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            title: "Sign Up",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="verify-email"
          options={{
            headerShown: false,
            statusBarTranslucent: true,
          }}
        />
        <Stack.Screen
          name="pin"
          options={{
            headerShown: false,
            statusBarTranslucent: true,
          }}
        />
        <Stack.Screen
          name="success-screen"
          options={{
            headerShown: false,
            statusBarTranslucent: true,
          }}
        />
        <Stack.Screen
          name="pin-sign-in"
          options={{
            headerShown: false,
            statusBarTranslucent: true,
          }}
        />
        <Stack.Screen
          name="request-pin-otp"
          options={{
            headerShown: false,
            statusBarTranslucent: true,
          }}
        />
        <Stack.Screen
          name="verify-pin-otp"
          options={{
            headerShown: false,
            statusBarTranslucent: true,
          }}
        />
      </Stack>
    </>
  );
}
