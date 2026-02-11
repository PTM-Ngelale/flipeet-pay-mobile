import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function IntroLayout() {
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
            title: "Intro",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
