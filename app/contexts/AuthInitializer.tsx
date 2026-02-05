import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { loadAuthState } from "../store/authSlice";

/**
 * AuthInitializer Component
 *
 * Restores authentication state from AsyncStorage on app startup.
 * This ensures that if a user was previously logged in, their token and profile
 * are restored when they reopen the app, allowing balances to be fetched immediately.
 *
 * This component must be placed inside the Redux Provider so it can dispatch actions.
 */
export function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log("[AuthInitializer] Restoring auth state from AsyncStorage...");
    dispatch(loadAuthState());
  }, [dispatch]);

  // This component doesn't render anything
  return null;
}
