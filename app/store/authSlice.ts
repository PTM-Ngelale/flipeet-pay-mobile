import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "../constants/api";

type AuthState = {
  loading: boolean;
  error: string | null;
  email?: string | null;
  user?: any | null;
  token?: string | null;
  pin?: string | null;
  balances?: any[] | null;
  transactions?: any[] | null;
  balancesLoading?: boolean;
  transactionsLoading?: boolean;
};

const initialState: AuthState = {
  loading: false,
  error: null,
  email: null,
  user: null,
  token: null,
  pin: null,
  balances: null,
  transactions: null,
  balancesLoading: false,
  transactionsLoading: false,
};

export const requestOtp = createAsyncThunk(
  "auth/requestOtp",
  async (
    { email, type }: { email: string; type: "signup" | "login" },
    thunkAPI: any
  ) => {
    try {
      if (type === "signup") {
        // GET /auth/otp/request?email=...
        await apiGet(`/auth/otp/request?email=${encodeURIComponent(email)}`);
      } else {
        // GET /auth/otp/authenticator?email=...
        await apiGet(
          `/auth/otp/authenticator?email=${encodeURIComponent(email)}`
        );
      }
      return { email };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Failed to request OTP");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, code }: { email: string; code: string }, thunkAPI: any) => {
    try {
      await apiPost(`/auth/otp/verify`, { email, code });
      return { email };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "OTP verification failed");
    }
  }
);

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI: any
  ) => {
    try {
      const data = await apiPost(`/auth/sign-in`, { email, password });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Sign in failed");
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (payload: any, thunkAPI: any) => {
    try {
      const data = await apiPost(`/auth/sign-up`, payload);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Sign up failed");
    }
  }
);

export const googleSignIn = createAsyncThunk(
  "auth/googleSignIn",
  async ({ token }: { token: string }, thunkAPI: any) => {
    try {
      const data = await apiPost(`/auth/oauth/validate`, { token });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Google sign in failed");
    }
  }
);

export const fetchUserBalances = createAsyncThunk(
  "auth/fetchUserBalances",
  async (_, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token, user } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      if (!user?.id && !user?.userId) {
        return thunkAPI.rejectWithValue("No user ID found");
      }

      const userId = user.id || user.userId;
      const { apiGetAuth } = await import("../constants/api");
      const data = await apiGetAuth(`/user/${userId}/balances`, token);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch balances"
      );
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "auth/fetchTransactions",
  async (_, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token, user } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      if (!user?.id && !user?.userId) {
        return thunkAPI.rejectWithValue("No user ID found");
      }

      const userId = user.id || user.userId;
      const { apiGetAuth } = await import("../constants/api");
      const data = await apiGetAuth(`/user/${userId}/transactions`, token);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch transactions"
      );
    }
  }
);

export const updateUsername = createAsyncThunk(
  "auth/updateUsername",
  async (username: string, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token, user } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/user/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to update username"
        );
      }

      const data = await response.json();
      return { username };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to update username"
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const { apiGetAuth } = await import("../constants/api");
      const data = await apiGetAuth("/user/profile", token);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch profile");
    }
  }
);

export const changePin = createAsyncThunk(
  "auth/changePin",
  async (
    { oldPin, newPin }: { oldPin: string; newPin: string },
    thunkAPI: any
  ) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/user/pin",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPin, newPin }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to change PIN"
        );
      }

      const data = await response.json();
      return { success: true };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Failed to change PIN");
    }
  }
);

export const changeEmail = createAsyncThunk(
  "auth/changeEmail",
  async (newEmail: string, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/user/email",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: newEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to change email"
        );
      }

      const data = await response.json();
      return { email: newEmail };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Failed to change email");
    }
  }
);

// Load authentication state from AsyncStorage
export const loadAuthState = createAsyncThunk(
  "auth/loadAuthState",
  async (_, thunkAPI: any) => {
    try {
      console.log("Loading auth state from AsyncStorage...");
      const token = await AsyncStorage.getItem("auth_token");
      const userJson = await AsyncStorage.getItem("auth_user");
      const email = await AsyncStorage.getItem("auth_email");

      if (token && userJson) {
        const user = JSON.parse(userJson);
        console.log(
          "Auth state loaded successfully. Token:",
          token.substring(0, 20) + "..."
        );
        return { token, user, email };
      }

      console.log("No saved auth state found");
      return thunkAPI.rejectWithValue("No saved auth state");
    } catch (err: any) {
      console.error("Failed to load auth state:", err);
      return thunkAPI.rejectWithValue("Failed to load auth state");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state: any) {
      state.error = null;
    },
    setError(state: any, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setPin(state: any, action: PayloadAction<string>) {
      state.pin = action.payload;
    },
    setEmail(state: any, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    logout(state: any) {
      state.email = null;
      state.user = null;
      state.token = null;
      state.pin = null;
      state.error = null;
      state.loading = false;
      state.balances = [];
      state.transactions = [];
      // Clear AsyncStorage
      AsyncStorage.multiRemove(["auth_token", "auth_user", "auth_email"]);
      
      // Note: Bank account state will be cleared by a separate dispatch
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(requestOtp.pending, (state: any) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.email = action.payload?.email || null;
      })
      .addCase(requestOtp.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || String(action.error?.message || "");
      })
      .addCase(verifyOtp.pending, (state: any) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state: any) => {
        state.loading = false;
      })
      .addCase(verifyOtp.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || String(action.error?.message || "");
      })
      .addCase(signIn.pending, (state: any) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.error = null;
        // Handle different possible response structures
        const payload = action.payload || {};
        console.log(
          "signIn fulfilled payload:",
          JSON.stringify(payload, null, 2)
        );

        // Try to safely extract user and token from various response structures
        try {
          const data = payload.data || {};
          const credentials = data.credentials || {};

          state.user = payload.user || data.user || null;
          state.token =
            credentials.accessToken ||
            payload.accessToken ||
            payload.token ||
            data.accessToken ||
            data.token ||
            null;

          // Persist to AsyncStorage
          if (state.token) {
            console.log(
              "Saving token to AsyncStorage:",
              state.token.substring(0, 20) + "..."
            );
            AsyncStorage.setItem("auth_token", state.token);
          } else {
            console.warn("No token found in response to save");
          }
          if (state.user) {
            console.log("Saving user to AsyncStorage:", state.user);
            AsyncStorage.setItem("auth_user", JSON.stringify(state.user));
          }
          if (state.email) {
            AsyncStorage.setItem("auth_email", state.email);
          }
        } catch (e) {
          console.error("Error extracting auth data:", e);
          state.user = null;
          state.token = null;
        }
      })
      .addCase(signIn.rejected, (state: any, action: any) => {
        state.loading = false;
        const raw = String(action.payload || action.error?.message || "");
        const msg = raw.toLowerCase();

        if (msg.includes("network request failed") || msg.includes("fetch")) {
          state.error =
            "Cannot connect to server. Check your internet connection.";
        } else if (
          msg.includes("not found") ||
          msg.includes("no user") ||
          msg.includes("does not exist") ||
          msg.includes("no account")
        ) {
          state.error = "Account not found. Please sign up.";
        } else if (msg.includes("invalid") && msg.includes("password")) {
          state.error = "Incorrect password. Please try again.";
        } else {
          state.error = action.payload || String(action.error?.message || "");
        }
      })
      .addCase(signUp.pending, (state: any) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state: any, action: any) => {
        state.loading = false;
        const payload = action.payload || {};
        const data = payload.data || {};
        state.user = payload.user || data.user || state.user;
        state.token =
          payload.accessToken ||
          payload.token ||
          data.accessToken ||
          data.token ||
          null;
      })
      .addCase(signUp.rejected, (state: any, action: any) => {
        state.loading = false;
        const raw = String(action.payload || action.error?.message || "");
        const msg = raw.toLowerCase();

        if (msg.includes("network request failed") || msg.includes("fetch")) {
          state.error =
            "Cannot connect to server. Check your internet connection.";
        } else if (
          msg.includes("already") &&
          (msg.includes("exist") || msg.includes("registered"))
        ) {
          state.error = "Account already exists. Please log in.";
        } else {
          state.error = action.payload || String(action.error?.message || "");
        }
      })
      .addCase(loadAuthState.fulfilled, (state: any, action: any) => {
        const { token, user, email } = action.payload;
        console.log("loadAuthState fulfilled - restoring token to Redux state");
        state.token = token;
        state.user = user;
        state.email = email;
        state.loading = false;
      })
      .addCase(loadAuthState.rejected, (state: any) => {
        state.loading = false;
      })
      .addCase(fetchUserBalances.pending, (state: any) => {
        state.balancesLoading = true;
      })
      .addCase(fetchUserBalances.fulfilled, (state: any, action: any) => {
        state.balancesLoading = false;
        const payload = action.payload || {};
        console.log("Balances API response:", JSON.stringify(payload, null, 2));

        // Handle nested structure: { balances: { network: { token: amount } } }
        if (payload.balances && typeof payload.balances === "object") {
          // Flatten nested structure into array
          const flatBalances: any[] = [];
          const networks = payload.balances;

          Object.keys(networks).forEach((network) => {
            const tokens = networks[network];
            Object.keys(tokens).forEach((token) => {
              const balance = tokens[token];
              // Only include tokens with balance > 0 or always include for display
              flatBalances.push({
                network: network,
                asset: token.toUpperCase(),
                balance: balance,
                usdValue: balance, // Assuming 1:1 for stablecoins, can be improved
              });
            });
          });

          state.balances = flatBalances;
          console.log("Flattened balances:", flatBalances);
        } else {
          state.balances = payload.data || payload || [];
        }
      })
      .addCase(fetchUserBalances.rejected, (state: any, action: any) => {
        state.balancesLoading = false;
        console.error("Failed to fetch balances:", action.payload);
      })
      .addCase(fetchTransactions.pending, (state: any) => {
        state.transactionsLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state: any, action: any) => {
        state.transactionsLoading = false;
        const payload = action.payload || {};
        // Handle different response structures
        state.transactions =
          payload.data || payload.transactions || payload || [];
        console.log("Transactions fetched:", state.transactions);
      })
      .addCase(fetchTransactions.rejected, (state: any, action: any) => {
        state.transactionsLoading = false;
        console.error("Failed to fetch transactions:", action.payload);
      })
      .addCase(updateUsername.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(updateUsername.fulfilled, (state: any, action: any) => {
        state.loading = false;
        // Update username in user object
        if (state.user) {
          state.user.username = action.payload.username;
          AsyncStorage.setItem("auth_user", JSON.stringify(state.user));
        }
        console.log("Username updated:", action.payload.username);
      })
      .addCase(updateUsername.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to update username";
        console.error("Failed to update username:", action.payload);
      })
      .addCase(fetchUserProfile.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state: any, action: any) => {
        state.loading = false;
        const payload = action.payload || {};
        // Update user profile data
        if (payload.data) {
          state.user = { ...state.user, ...payload.data };
          AsyncStorage.setItem("auth_user", JSON.stringify(state.user));
        }
        console.log("User profile fetched:", payload.data);
      })
      .addCase(fetchUserProfile.rejected, (state: any, action: any) => {
        state.loading = false;
        console.error("Failed to fetch profile:", action.payload);
      })
      .addCase(changePin.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(changePin.fulfilled, (state: any) => {
        state.loading = false;
        console.log("PIN changed successfully");
      })
      .addCase(changePin.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to change PIN";
        console.error("Failed to change PIN:", action.payload);
      })
      .addCase(changeEmail.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(changeEmail.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.email = action.payload.email;
        AsyncStorage.setItem("auth_email", action.payload.email);
        console.log("Email changed successfully:", action.payload.email);
      })
      .addCase(changeEmail.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to change email";
        console.error("Failed to change email:", action.payload);
      });
  },
});

export const { clearError, setError, setPin, setEmail, logout } =
  authSlice.actions;
export default authSlice.reducer;
