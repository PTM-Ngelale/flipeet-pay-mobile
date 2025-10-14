import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { BankAccountProvider } from "../app/contexts/BankAccountContext";
import { CurrencyProvider } from "../app/contexts/CurrencySelectorContext";
import { BridgeTokenProvider } from "./contexts/BridgeTokenContext";
import { TokenProvider } from "./contexts/TokenContext";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Lato-Regular": require("@/assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("@/assets/fonts/Lato-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <BankAccountProvider>
        <CurrencyProvider>
          <TokenProvider>
            <BridgeTokenProvider>
              {/* <StatusBar style="light" /> */}
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
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(action)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(recent-activity)"
                  options={{ headerShown: false }}
                />
              </Stack>
            </BridgeTokenProvider>
          </TokenProvider>
        </CurrencyProvider>
      </BankAccountProvider>
    </>
  );
}
