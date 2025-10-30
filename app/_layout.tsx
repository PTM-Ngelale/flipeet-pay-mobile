import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { BankAccountProvider } from "../app/contexts/BankAccountContext";
import { BridgeTokenProvider } from "../app/contexts/BridgeTokenContext";
import { CurrencyProvider } from "../app/contexts/CurrencySelectorContext";
import { TokenProvider } from "../app/contexts/TokenContext";
import { FavoriteBanksProvider } from "./contexts/FavoriteBanksContext";
import { FavoriteEmailsProvider } from "./contexts/FavoriteEmailsContext";
import { FavoriteWalletsProvider } from "./contexts/FavoriteWalletsContext";

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
              <FavoriteEmailsProvider>
                <FavoriteBanksProvider>
                  <FavoriteWalletsProvider>
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
                          headerShown: false,
                          statusBarTranslucent: true,
                        }}
                      />
                      <Stack.Screen
                        name="(action)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="(recent-activity)"
                        options={{ headerShown: false }}
                      />
                    </Stack>
                  </FavoriteWalletsProvider>
                </FavoriteBanksProvider>
              </FavoriteEmailsProvider>
            </BridgeTokenProvider>
          </TokenProvider>
        </CurrencyProvider>
      </BankAccountProvider>
    </>
  );
}
