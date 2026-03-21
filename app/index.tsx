import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import pinApi from "./services/pinApi";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const resolveInitialRoute = async () => {
      try {
        const raw = await AsyncStorage.getItem("flipeet_onboarding_seen_v1");
        const hasSeen = raw === "true";

        if (!hasSeen) {
          router.replace("/(intro)");
          return;
        }

        const token = await AsyncStorage.getItem("auth_token");
        const email = await AsyncStorage.getItem("auth_email");

        // Check PIN availability whenever we have an email (with or without token)
        if (email) {
          try {
            const res = await pinApi.isPinAvailable(email);
            if (res.ok) {
              const body = await res.json().catch(() => ({}));
              const available =
                body?.data?.available ??
                body?.data?.isPinSet ??
                body?.available ??
                false;
              if (available) {
                router.replace("/(auth)/pin-sign-in");
                return;
              }
            }
          } catch {
            // Network error — fall through
          }
        }

        if (!token) {
          router.replace("/(auth)/login");
          return;
        }

        router.replace("/home");
      } catch (error) {
        console.warn("Failed to resolve initial route:", error);
        router.replace("/(intro)");
      }
    };

    void resolveInitialRoute();
  }, [router]);

  return null;
}
