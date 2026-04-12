import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import pinApi from "./services/pinApi";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const resolveInitialRoute = async () => {
      try {
        router.replace("/(intro)");
        return;

        const email = await AsyncStorage.getItem("auth_email");

        // Always require PIN or login — never bypass straight to home
        if (email) {
          try {
            const res = await pinApi.isPinAvailable(email);
            if (res.ok) {
              const body = await res.json().catch(() => ({}));
              const hasPinSet =
                body?.data?.pinExists === true ||
                body?.data?.available === true ||
                body?.data?.isPinSet === true ||
                body?.available === true;
              if (hasPinSet) {
                router.replace("/(auth)/pin-sign-in");
                return;
              }
            }
          } catch {
            // Network error — fall through to login
          }
        }

        // No PIN set (or no email) — send to login regardless of token
        router.replace("/(auth)/login");
      } catch (error) {
        console.warn("Failed to resolve initial route:", error);
        router.replace("/(intro)");
      }
    };

    void resolveInitialRoute();
  }, [router]);

  return null;
}
