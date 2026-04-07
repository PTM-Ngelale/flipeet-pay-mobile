import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiRequest } from "../constants/api";

/**
 * Requests permission and registers the device for push notifications.
 * Sends the Expo Push Token to the backend so it can target this device.
 *
 * Call this once after a successful login/auth restore, passing the auth token.
 */
export async function registerForPushNotifications(authToken: string): Promise<string | null> {
  // Push notifications don't work in Expo Go on physical devices for FCM/APNs,
  // but Expo Push Token works in development builds and production.
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // Android requires a notification channel
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

  // Send token to backend so it can send notifications to this device
  try {
    await apiRequest("/user/push-token", {
      method: "POST",
      body: { pushToken, platform: Platform.OS },
      token: authToken,
    });
  } catch (err) {
    // Non-fatal — backend may not have this endpoint yet
    console.warn("[notifications] Could not register push token with backend:", err);
  }

  return pushToken;
}
