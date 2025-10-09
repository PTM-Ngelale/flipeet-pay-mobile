import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";

export default function ActionLayout() {
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
          name="receive"
          options={{
            title: "Receive",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="swap"
          options={{
            title: "Swap",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="send"
          options={{
            title: "Send",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="services"
          options={{
            title: "Services",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="qr-screen"
          options={{
            title: "QR Code",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="review-transaction"
          options={{
            title: "Review Transaction",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="success-screen"
          options={{
            title: "Success",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
