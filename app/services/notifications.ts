// Push notifications are temporarily disabled.
// Restore this file when re-enabling push notification support.

/*
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiRequest } from "../constants/api";

export async function registerForPushNotifications(authToken: string): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0A66D3",
    });
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  if (!projectId) {
    console.warn("[notifications] No EAS projectId found — cannot get push token");
    return null;
  }

  const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

  try {
    await apiRequest("/user/push-token", {
      method: "POST",
      body: { pushToken, platform: Platform.OS },
      token: authToken,
    });
  } catch (err) {
    console.warn("[notifications] Could not register push token with backend:", err);
  }

  return pushToken;
}
*/

export {};
