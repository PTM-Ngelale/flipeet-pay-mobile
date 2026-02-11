import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  currency?: string;
  createdAt?: string;
  userId?: string;
}

export interface Bank {
  id: number | string;
  name: string;
  code: string;
  logoUrl?: string | null;
}

type BankAccountState = {
  loading: boolean;
  error: string | null;
  banks: Bank[];
  savedAccounts: BankAccount[];
  selectedAccount: BankAccount | null;
  verifying: boolean;
  banksLoading: boolean;
  banksCachedAt: number | null;
};

const initialState: BankAccountState = {
  loading: false,
  error: null,
  banks: [],
  savedAccounts: [],
  selectedAccount: null,
  verifying: false,
  banksLoading: false,
  banksCachedAt: null,
};

// Fetch list of banks
export const fetchBanks = createAsyncThunk(
  "bankAccount/fetchBanks",
  async (_, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;
      const { banks, banksCachedAt } = state.bankAccount;

      // Cache for 5 minutes (300000 ms)
      const CACHE_DURATION = 5 * 60 * 1000;
      const now = Date.now();

      // Return cached banks if available and fresh
      if (
        banks.length > 0 &&
        banksCachedAt &&
        now - banksCachedAt < CACHE_DURATION
      ) {
        console.log("[fetchBanks] Returning cached banks");
        return banks;
      }

      console.log("[fetchBanks] Starting bank fetch...");
      console.log("[fetchBanks] Token available:", !!token);
      console.log(
        "[fetchBanks] Token (first 20 chars):",
        token?.substring(0, 20) + "...",
      );

      if (!token) {
        console.error("[fetchBanks] No authentication token");
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const url =
        "https://api.pay.flipeet.io/api/v1/ramp/banks?currencyCode=NGN&provider=bread";
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      console.log("[fetchBanks] Request URL:", url);
      console.log("[fetchBanks] Request Headers:", {
        ...headers,
        Authorization: `Bearer ${token.substring(0, 20)}...`,
      });

      const response = await fetch(url, { headers });

      console.log("[fetchBanks] Response status:", response.status);

      if (!response.ok) {
        // Read the raw text once and try to parse JSON; some error responses
        // return HTML (e.g., an error page) which would throw on .json().
        const raw = await response.text();
        let errorData: any = { message: raw };
        try {
          errorData = JSON.parse(raw);
        } catch (parseErr) {
          // keep raw text in message
        }
        console.error("[fetchBanks] API error:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message ||
            `Failed to fetch banks (Status: ${response.status})`,
        );
      }

      // Successful response: parse JSON once
      const data = await response.json();
      console.log(
        "[fetchBanks] Full API response:",
        JSON.stringify(data, null, 2),
      );
      console.log("[fetchBanks] Response keys:", Object.keys(data));
      console.log(
        "[fetchBanks] data.data type:",
        typeof data.data,
        Array.isArray(data.data),
      );
      console.log(
        "[fetchBanks] data.banks type:",
        typeof data.banks,
        Array.isArray(data.banks),
      );
      console.log("[fetchBanks] data itself is array:", Array.isArray(data));

      // Handle different response structures
      let bankList;
      if (Array.isArray(data)) {
        bankList = data;
      } else if (Array.isArray(data.data)) {
        bankList = data.data;
      } else if (Array.isArray(data.banks)) {
        bankList = data.banks;
      } else {
        console.warn("[fetchBanks] Unexpected response structure:", data);
        bankList = [];
      }

      console.log("[fetchBanks] Bank list:", bankList);
      console.log("[fetchBanks] Is array:", Array.isArray(bankList));
      console.log("[fetchBanks] Length:", bankList?.length);

      if (Array.isArray(bankList) && bankList.length > 0) {
        const formattedBanks = bankList.map((bank: any, index: number) => ({
          id: bank.id || index + 1,
          name: bank.name || bank.bankName,
          code: bank.code || bank.bankCode,
          logoUrl:
            bank.logoUrl ||
            bank.logo ||
            bank.icon ||
            bank.imageUrl ||
            bank.image ||
            null,
        }));
        console.log(
          "[fetchBanks] Successfully formatted",
          formattedBanks.length,
          "banks",
        );
        console.log("[fetchBanks] First bank:", formattedBanks[0]);
        return formattedBanks;
      }

      console.warn("[fetchBanks] No banks found in response");
      return [];
    } catch (err: any) {
      console.error("[fetchBanks] Exception:", err);
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch banks");
    }
  },
);

// Verify bank account
export const verifyBankAccount = createAsyncThunk(
  "bankAccount/verifyBankAccount",
  async (
    {
      accountNumber,
      bankCode,
      bankName,
    }: { accountNumber: string; bankCode: string; bankName: string },
    thunkAPI: any,
  ) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const payload = {
        accountNumber,
        bankCode,
        bankName,
        currency: "NGN",
        provider: "bread",
      };

      console.log("[verifyBankAccount] Starting verification...");
      console.log(
        "[verifyBankAccount] Payload:",
        JSON.stringify(payload, null, 2),
      );
      console.log("[verifyBankAccount] Token available:", !!token);
      console.log(
        "[verifyBankAccount] Token (first 20 chars):",
        token?.substring(0, 20) + "...",
      );

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/ramp/local/verify-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      console.log("[verifyBankAccount] Response status:", response.status);

      // Read raw text once and attempt to parse JSON to avoid JSON parse errors
      const raw = await response.text();
      let data: any = { message: raw };
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        // keep raw message
      }

      console.log(
        "[verifyBankAccount] Full response:",
        typeof data === "string" ? data : JSON.stringify(data, null, 2),
      );

      if (!response.ok) {
        console.error("[verifyBankAccount] Error response:", data);
        const errorMessage =
          (data && (data.message || data.error)) ||
          data?.data?.message ||
          data?.data?.error ||
          `Verification failed (Status: ${response.status})`;
        return thunkAPI.rejectWithValue(errorMessage);
      }

      if (data && data.data) {
        const accountName =
          data.data.accountName || data.data.account_name || data.data.name;

        if (accountName) {
          console.log("[verifyBankAccount] Success:", accountName);
          return {
            accountName,
            accountNumber,
            bankCode,
            bankName,
          };
        } else {
          console.error(
            "[verifyBankAccount] No account name in response:",
            data.data,
          );
          return thunkAPI.rejectWithValue("Account name not found in response");
        }
      } else {
        console.error("[verifyBankAccount] No data field in response:", data);
        return thunkAPI.rejectWithValue("Invalid response format");
      }
    } catch (err: any) {
      console.error("[verifyBankAccount] Exception:", err);
      console.error("[verifyBankAccount] Error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
      return thunkAPI.rejectWithValue(
        err.message || "Failed to verify account",
      );
    }
  },
);

// Fetch saved bank accounts from API
export const fetchSavedBankAccounts = createAsyncThunk(
  "bankAccount/fetchSavedBankAccounts",
  async (_, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token, user } = state.auth;

      if (!token) {
        console.error("[fetchSavedBankAccounts] No authentication token");
        return thunkAPI.rejectWithValue("No authentication token");
      }

      console.log("[fetchSavedBankAccounts] Starting fetch...");
      console.log("[fetchSavedBankAccounts] User email:", user?.email);
      console.log(
        "[fetchSavedBankAccounts] User ID:",
        user?.id || user?.userId,
      );
      console.log("[fetchSavedBankAccounts] Token available:", !!token);
      console.log(
        "[fetchSavedBankAccounts] Token (first 20 chars):",
        token?.substring(0, 20) + "...",
      );

      const userId = user?.id || user?.userId;
      if (!userId) {
        console.error("[fetchSavedBankAccounts] No user ID available");
        return thunkAPI.rejectWithValue("User not authenticated");
      }

      const url = `https://api.pay.flipeet.io/api/v1/ramp/local/accounts?currency=NGN`;
      console.log("[fetchSavedBankAccounts] URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[fetchSavedBankAccounts] Response status:", response.status);

      if (!response.ok) {
        const raw = await response.text();
        let errorData: any = { message: raw };
        try {
          errorData = JSON.parse(raw);
        } catch (parseErr) {
          // leave raw
        }
        console.error("[fetchSavedBankAccounts] Error response:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message ||
            `Failed to fetch bank accounts (Status: ${response.status})`,
        );
      }

      const data = await response.json();
      console.log(
        "[fetchSavedBankAccounts] Full response:",
        JSON.stringify(data, null, 2),
      );

      const accounts = data.data || data.bankAccounts || data || [];
      console.log("[fetchSavedBankAccounts] Extracted accounts:", accounts);
      console.log(
        "[fetchSavedBankAccounts] Is array:",
        Array.isArray(accounts),
      );
      console.log("[fetchSavedBankAccounts] Count:", accounts.length);

      // Backend already filters by authenticated user via token
      // Return all accounts from the response
      return Array.isArray(accounts) ? accounts : [];
    } catch (err: any) {
      console.error("Failed to fetch bank accounts:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch bank accounts",
      );
    }
  },
);

// Save bank account to API
export const saveBankAccount = createAsyncThunk(
  "bankAccount/saveBankAccount",
  async (account: Omit<BankAccount, "id" | "createdAt">, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token, user } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const userId = user?.id || user?.userId;
      if (!userId) {
        return thunkAPI.rejectWithValue("User not authenticated");
      }

      const payload = {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        bankCode: account.bankCode,
        bankName: account.bankName,
        currency: account.currency || "NGN",
        provider: "bread",
        userId,
      };

      console.log("[saveBankAccount] Saving bank account:", payload);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/ramp/local/add-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      console.log(
        "[saveBankAccount] Save response:",
        JSON.stringify(data, null, 2),
      );

      if (!response.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to save bank account",
        );
      }

      const savedAccount = data.data || data.bankAccount || data;
      console.log("[saveBankAccount] Saved account:", savedAccount);

      // Ensure the account has all required fields
      const formattedAccount = {
        id: savedAccount.id || savedAccount._id || Date.now().toString(),
        bankName: savedAccount.bankName || account.bankName,
        accountNumber: savedAccount.accountNumber || account.accountNumber,
        accountName: savedAccount.accountName || account.accountName,
        bankCode: savedAccount.bankCode || account.bankCode,
        currency: savedAccount.currency || account.currency || "NGN",
        createdAt: savedAccount.createdAt || new Date().toISOString(),
      };

      console.log("[saveBankAccount] Formatted account:", formattedAccount);
      return formattedAccount;
    } catch (err: any) {
      console.error("Failed to save bank account:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to save bank account",
      );
    }
  },
);

// Delete bank account
export const deleteBankAccount = createAsyncThunk(
  "bankAccount/deleteBankAccount",
  async (accountId: string, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      console.log("[deleteBankAccount] Deleting account:", accountId);

      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1/ramp/local/account/${accountId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to delete bank account",
        );
      }

      return accountId;
    } catch (err: any) {
      console.error("Failed to delete bank account:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to delete bank account",
      );
    }
  },
);

const bankAccountSlice = createSlice({
  name: "bankAccount",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSelectedAccount(state, action: PayloadAction<BankAccount | null>) {
      state.selectedAccount = action.payload;
    },
    clearSelectedAccount(state) {
      state.selectedAccount = null;
    },
    clearBankAccountState(state) {
      state.savedAccounts = [];
      state.selectedAccount = null;
      state.banks = [];
      state.banksCachedAt = null;
      state.error = null;
      state.loading = false;
      state.verifying = false;
      state.banksLoading = false;
    },
    // For local-only operations before API persistence
    addBankAccountLocal(state, action: PayloadAction<BankAccount>) {
      state.savedAccounts.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch banks
      .addCase(fetchBanks.pending, (state) => {
        state.banksLoading = true;
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.banksLoading = false;
        state.banks = action.payload;
        state.banksCachedAt = Date.now();
      })
      .addCase(fetchBanks.rejected, (state, action: any) => {
        state.banksLoading = false;
        state.error = action.payload || "Failed to fetch banks";
        console.error("Failed to fetch banks:", action.payload);
      })

      // Verify bank account
      .addCase(verifyBankAccount.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifyBankAccount.fulfilled, (state) => {
        state.verifying = false;
      })
      .addCase(verifyBankAccount.rejected, (state, action: any) => {
        state.verifying = false;
        state.error = action.payload || "Failed to verify account";
      })

      // Fetch saved bank accounts
      .addCase(fetchSavedBankAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.savedAccounts = action.payload;
      })
      .addCase(fetchSavedBankAccounts.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch bank accounts";
      })

      // Save bank account
      .addCase(saveBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.savedAccounts.push(action.payload);
        state.selectedAccount = action.payload;
      })
      .addCase(saveBankAccount.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to save bank account";
      })

      // Delete bank account
      .addCase(deleteBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.savedAccounts = state.savedAccounts.filter(
          (account) => account.id !== action.payload,
        );
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null;
        }
      })
      .addCase(deleteBankAccount.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete bank account";
      });
  },
});

export const {
  clearError,
  setError,
  setSelectedAccount,
  clearSelectedAccount,
  clearBankAccountState,
  addBankAccountLocal,
} = bankAccountSlice.actions;

export default bankAccountSlice.reducer;
