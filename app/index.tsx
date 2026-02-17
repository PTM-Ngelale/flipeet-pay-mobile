import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const resolveInitialRoute = async () => {
      try {
        const raw = await AsyncStorage.getItem("flipeet_onboarding_seen_v1");
        const hasSeen = raw === "true";
        router.replace(hasSeen ? "/(auth)/login" : "/(intro)");
      } catch (error) {
        console.warn("Failed to read onboarding flag:", error);
        router.replace("/(intro)");
      }
    };

    void resolveInitialRoute();
  }, [router]);

  return null;
}
