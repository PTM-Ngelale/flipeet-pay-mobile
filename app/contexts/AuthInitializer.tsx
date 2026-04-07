import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerForPushNotifications } from "../services/notifications";
import { AppDispatch, RootState } from "../store";
import { loadAuthState } from "../store/authSlice";

/**
 * AuthInitializer Component
 *
 * Restores authentication state from AsyncStorage on app startup.
 * This ensures that if a user was previously logged in, their token and profile
 * are restored when they reopen the app, allowing balances to be fetched immediately.
 *
 * Also registers the device for push notifications once a valid auth token is available.
 *
 * This component must be placed inside the Redux Provider so it can dispatch actions.
 */
export function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    console.log("[AuthInitializer] Restoring auth state from AsyncStorage...");
    dispatch(loadAuthState());
  }, [dispatch]);

  // Once a token is available (restored or freshly logged in), register for push notifications
  useEffect(() => {
    if (token) {
      registerForPushNotifications(token);
    }
  }, [token]);

  // This component doesn't render anything
  return null;
}
