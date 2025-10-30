import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export default function ActionLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar
        // style={colorScheme === "dark" ? "light" : "dark"}
        style="light"
        translucent
        backgroundColor="transparent"
      />
      <Stack
        // screenOptions={{
        //   headerBackground: () => <CustomHeaderBackground />,
        //   headerTintColor: colorScheme === "dark" ? "#757B85" : "#000000",
        //   headerTitleStyle: {
        //     fontWeight: "bold",
        //   },
        // }}
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
          name="review-bridge"
          options={{
            title: "Review Transaction",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="add-bank-account"
          options={{
            title: "Add Bank Account",
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

        <Stack.Screen
          name="currency-selector"
          options={{
            title: "Currency Selector",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="token-selector"
          options={{
            title: "Token Selector",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="token-bridge-selector"
          options={{
            title: "Token Bridge Selector",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="saved-bank-accounts"
          options={{
            title: "Saved Bank Accounts",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="favorites-page"
          options={{
            title: "Favorites",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="favorites-bank-page"
          options={{
            title: "Favorite Banks",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="favorites-wallet-page"
          options={{
            title: "Favorite Wallets",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
