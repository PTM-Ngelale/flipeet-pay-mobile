import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, current, PayloadAction } from "@reduxjs/toolkit";
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
    { email }: { email: string; type: "signup" | "login" },
    thunkAPI: any,
  ) => {
    try {
      // Both signup and login use the same OTP request endpoint
      await apiGet(`/auth/otp/request?email=${encodeURIComponent(email)}`);
      return { email };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Failed to request OTP");
    }
  },
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
  },
);

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI: any,
  ) => {
    try {
      const data = await apiPost(`/auth/sign-in`, { email, password });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Sign in failed");
    }
  },
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
  },
);

export const googleSignIn = createAsyncThunk(
  "auth/googleSignIn",
  async (
    {
      idToken,
      provider,
      redirectUri,
    }: { idToken: string; provider: string; redirectUri: string },
    thunkAPI: any,
  ) => {
    try {
      const data = await apiPost(`/auth/oauth/validate`, {
        idToken,
        provider,
        redirectUri,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Google sign in failed");
    }
  },
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
        err.message || "Failed to fetch balances",
      );
    }
  },
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

      const { getTransactionStatements } = await import("../constants/api");
      const data = await getTransactionStatements(
        { type: "*", page: 1, limit: 50 },
        token,
      );
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch transactions",
      );
    }
  },
);

export const updateUsername = createAsyncThunk(
  "auth/updateUsername",
  async (username: string, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const { apiRequest } = await import("../constants/api");
      await apiRequest("/user/username/update", {
        method: "POST",
        body: { username },
        token,
      });

      return { username };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to update username",
      );
    }
  },
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
  },
);

export const updateProfileImage = createAsyncThunk(
  "auth/updateProfileImage",
  async (imageUri: string, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const { uploadProfileImage } = await import("../constants/api");
      const data = await uploadProfileImage(imageUri, token);
      console.log("[updateProfileImage] server response:", JSON.stringify(data));
      return { imageUri, data };
    } catch (err: any) {
      console.log("[updateProfileImage] upload error status:", err?.status);
      console.log("[updateProfileImage] upload error body:", JSON.stringify(err?.body));
      return thunkAPI.rejectWithValue(
        err.message || "Failed to update profile image",
      );
    }
  },
);

export const changePin = createAsyncThunk(
  "auth/changePin",
  async (
    { oldPin, newPin }: { oldPin: string; newPin: string },
    thunkAPI: any,
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
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to change PIN",
        );
      }

      await response.json();
      return { success: true };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Failed to change PIN");
    }
  },
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
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to change email",
        );
      }

      await response.json();
      return { email: newEmail };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Failed to change email");
    }
  },
);

// Load authentication state from AsyncStorage
export const loadAuthState = createAsyncThunk(
  "auth/loadAuthState",
  async (_, thunkAPI: any) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const userJson = await AsyncStorage.getItem("auth_user");
      const email = await AsyncStorage.getItem("auth_email");

      if (token && userJson) {
        const user = JSON.parse(userJson);
        return { token, user, email };
      }
      return thunkAPI.rejectWithValue("No saved auth state");
    } catch (err: any) {
      return thunkAPI.rejectWithValue("Failed to load auth state");
    }
  },
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
        // Try to safely extract user and token from various response structures
        try {
          const data = payload.data || {};
          const credentials = data.credentials || {};

          const incomingUser = payload.user || data.user || null;
          if (incomingUser) {
            // Preserve uploaded avatar if server still returns "default"
            const existingAvatar = state.user?.avatar;
            const serverAvatar = incomingUser.avatar;
            incomingUser.avatar =
              serverAvatar && serverAvatar !== "default"
                ? serverAvatar
                : existingAvatar && existingAvatar !== "default"
                  ? existingAvatar
                  : serverAvatar;
          }
          state.user = incomingUser;
          state.token =
            credentials.accessToken ||
            payload.accessToken ||
            payload.token ||
            data.accessToken ||
            data.token ||
            null;
          // Persist to AsyncStorage
          if (state.token) {
            AsyncStorage.setItem("auth_token", state.token);
          }
          if (state.user) {
            AsyncStorage.setItem("auth_user", JSON.stringify(state.user));
          }
          if (state.email) {
            AsyncStorage.setItem("auth_email", state.email);
          }
        } catch (e) {
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
      .addCase(googleSignIn.pending, (state: any) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.error = null;
        try {
          const payload = action.payload || {};
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
          if (state.token) {
            AsyncStorage.setItem("auth_token", state.token);
          }
          if (state.user) {
            AsyncStorage.setItem("auth_user", JSON.stringify(state.user));
          }
          if (state.user?.email) {
            state.email = state.user.email;
            AsyncStorage.setItem("auth_email", state.user.email);
          }
        } catch (e) {
          state.user = null;
          state.token = null;
        }
      })
      .addCase(googleSignIn.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || String(action.error?.message || "Google sign in failed");
      })
      .addCase(loadAuthState.fulfilled, (state: any, action: any) => {
        const { token, user, email } = action.payload;
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
        const balancesPayload =
          payload.balances || (payload.data && payload.data.balances);

        // Handle nested structure: { balances: { network: { token: amount | { amount, usdValue } } } }
        if (balancesPayload && typeof balancesPayload === "object") {
          const flatBalances: any[] = [];
          const networks = balancesPayload;

          Object.keys(networks).forEach((network) => {
            const tokens = networks[network];
            Object.keys(tokens).forEach((token) => {
              const tokenData = tokens[token];

              // Handle both formats:
              // 1. Simple number: { token: 100 }
              // 2. Object: { token: { amount: 100, usdValue: 50 } }
              let balance = 0;
              let usdValue = 0;

              if (typeof tokenData === "number") {
                balance = parseFloat(tokenData.toString());
                // For stablecoins (USDC, USDT), assume 1:1
                const tokenSymbol = token.toUpperCase();
                if (tokenSymbol === "USDC" || tokenSymbol === "USDT") {
                  usdValue = balance;
                } else {
                  // For other tokens, we'd need price data from backend
                  usdValue = balance;
                }
              } else if (typeof tokenData === "object" && tokenData !== null) {
                balance = parseFloat(
                  (tokenData.amount || tokenData.balance || 0).toString(),
                );
                usdValue = parseFloat(
                  (
                    tokenData.usdValue ||
                    tokenData.usd_value ||
                    tokenData.value_usd ||
                    tokenData.priceInUsd ||
                    balance
                  ).toString(),
                );
              }

              flatBalances.push({
                network: network,
                asset: token.toUpperCase(),
                balance: balance,
                token: token,
                usdValue: usdValue,
              });
            });
          });

          state.balances = flatBalances;
        } else {
          state.balances = payload.data || payload || [];
        }
      })
      .addCase(fetchUserBalances.rejected, (state: any) => {
        state.balancesLoading = false;
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
      })
      .addCase(fetchTransactions.rejected, (state: any) => {
        state.transactionsLoading = false;
      })
      .addCase(updateUsername.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(updateUsername.fulfilled, (state: any, action: any) => {
        state.loading = false;
        if (state.user) {
          state.user.username = action.payload.username;
          state.user.name = action.payload.username;
          AsyncStorage.setItem("auth_user", JSON.stringify(current(state.user)));
        }
      })
      .addCase(updateUsername.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to update username";
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
      })
      .addCase(fetchUserProfile.rejected, (state: any) => {
        state.loading = false;
      })
      .addCase(updateProfileImage.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(updateProfileImage.fulfilled, (state: any, action: any) => {
        state.loading = false;
        const serverUrl =
          action.payload?.data?.data?.url ||
          action.payload?.data?.url ||
          action.payload?.imageUri;
        if (state.user) {
          state.user.avatar = serverUrl;
          AsyncStorage.setItem("auth_user", JSON.stringify(current(state.user)));
        }
      })
      .addCase(updateProfileImage.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to update profile image";
      })
      .addCase(changePin.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(changePin.fulfilled, (state: any) => {
        state.loading = false;
      })
      .addCase(changePin.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to change PIN";
      })
      .addCase(changeEmail.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(changeEmail.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.email = action.payload.email;
        AsyncStorage.setItem("auth_email", action.payload.email);
      })
      .addCase(changeEmail.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to change email";
      });
  },
});

export const { clearError, setError, setPin, setEmail, logout } =
  authSlice.actions;
export default authSlice.reducer;
