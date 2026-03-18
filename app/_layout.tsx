import AuthErrorModal from "@/components/ui/AuthErrorModal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import "react-native-reanimated";
import { Provider as ReduxProvider } from "react-redux";
import { BankAccountProvider } from "../app/contexts/BankAccountContext";
import { BridgeTokenProvider } from "../app/contexts/BridgeTokenContext";
import { CurrencyProvider } from "../app/contexts/CurrencySelectorContext";
import { TokenProvider } from "../app/contexts/TokenContext";
import { AuthInitializer } from "./contexts/AuthInitializer";
import { FavoriteBanksProvider } from "./contexts/FavoriteBanksContext";
import { FavoriteEmailsProvider } from "./contexts/FavoriteEmailsContext";
import { FavoriteWalletsProvider } from "./contexts/FavoriteWalletsContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { store } from "./store";

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

  // Apply global font defaults and dynamic bold mapping
  try {
    const defaultTextProps: any = (Text as any).defaultProps || {};

    // Helper: decide fontFamily based on incoming style's fontWeight
    const resolveFontFamily = (style: any) => {
      const flat = StyleSheet.flatten(style) || {};
      if (flat.fontFamily) return flat.fontFamily;
      const fw = flat.fontWeight;
      const num = typeof fw === "string" ? parseInt(fw, 10) || 400 : fw || 400;
      return num > 500 ? "Lato-Bold" : "Lato-Regular";
    };

    if (!(Text as any)._flipeetFontPatched) {
      const oldRender = (Text as any).render;
      (Text as any).render = function render(...args: any[]) {
        const origin = oldRender.apply(this, args);
        try {
          const props = origin?.props || {};
          const fontFamily = resolveFontFamily(props.style);
          const newStyle = [props.style, { fontFamily }];
          return React.cloneElement(origin, { style: newStyle });
        } catch (e) {
          return origin;
        }
      };
      (Text as any)._flipeetFontPatched = true;
    }

    // TextInput: default to regular font
    const defaultInputProps: any = (TextInput as any).defaultProps || {};
    defaultInputProps.style = [
      defaultInputProps.style || {},
      { fontFamily: "Lato-Regular" },
    ];
    (TextInput as any).defaultProps = defaultInputProps;
  } catch (e) {
    // swallow — safe fallback if native Text shape differs
  }

  return (
    <ReduxProvider store={store}>
      <AuthInitializer />
      <BankAccountProvider>
        <CurrencyProvider>
          <TokenProvider>
            <BridgeTokenProvider>
              <FavoriteEmailsProvider>
                <FavoriteBanksProvider>
                  <FavoriteWalletsProvider>
                    <ProfileProvider>
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
                          name="(intro)"
                          options={{
                            headerShown: false,
                            statusBarTranslucent: true,
                          }}
                        />
                        <Stack.Screen
                          name="(auth)"
                          options={{
                            headerShown: false,
                            statusBarTranslucent: true,
                          }}
                        />

                        <Stack.Screen
                          name="(tabs)"
                          options={{
                            headerShown: false,
                            statusBarTranslucent: true,
                          }}
                        />

                        <Stack.Screen
                          name="home"
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
                        <Stack.Screen
                          name="(profile-and-settings)"
                          options={{ headerShown: false }}
                        />
                      </Stack>
                      <AuthErrorModal />
                    </ProfileProvider>
                  </FavoriteWalletsProvider>
                </FavoriteBanksProvider>
              </FavoriteEmailsProvider>
            </BridgeTokenProvider>
          </TokenProvider>
        </CurrencyProvider>
      </BankAccountProvider>
    </ReduxProvider>
  );
}
