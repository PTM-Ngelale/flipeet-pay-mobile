import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  currency?: string;
  createdAt?: string;
}

export interface Bank {
  id: number | string;
  name: string;
  code: string;
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
      console.log("[fetchBanks] Token (first 20 chars):", token?.substring(0, 20) + "...");

      if (!token) {
        console.error("[fetchBanks] No authentication token");
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const url = "https://api.pay.flipeet.io/api/v1/ramp/banks";
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
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("[fetchBanks] API error:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message ||
            `Failed to fetch banks (Status: ${response.status})`
        );
      }

      const data = await response.json();
      console.log(
        "[fetchBanks] Full API response:",
        JSON.stringify(data, null, 2)
      );
      console.log("[fetchBanks] Response keys:", Object.keys(data));
      console.log("[fetchBanks] data.data type:", typeof data.data, Array.isArray(data.data));
      console.log("[fetchBanks] data.banks type:", typeof data.banks, Array.isArray(data.banks));
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
        }));
        console.log(
          "[fetchBanks] Successfully formatted",
          formattedBanks.length,
          "banks"
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
  }
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
    thunkAPI: any
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
      };

      console.log("Verifying account:", payload);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/ramp/local/verify-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Account verification response:", data);

      if (response.ok && data.data) {
        const accountName =
          data.data.accountName || data.data.account_name || data.data.name;

        if (accountName) {
          return {
            accountName,
            accountNumber,
            bankCode,
            bankName,
          };
        } else {
          return thunkAPI.rejectWithValue("Account name not found in response");
        }
      } else {
        return thunkAPI.rejectWithValue(
          data.message || "Account verification failed"
        );
      }
    } catch (err: any) {
      console.error("Account verification error:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to verify account"
      );
    }
  }
);

// Fetch saved bank accounts from API
export const fetchSavedBankAccounts = createAsyncThunk(
  "bankAccount/fetchSavedBankAccounts",
  async (_, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token, user } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const userId = user?.id || user?.userId;
      if (!userId) {
        return thunkAPI.rejectWithValue("No user ID found");
      }

      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1/user/${userId}/bank-accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to fetch bank accounts"
        );
      }

      const data = await response.json();
      console.log("Fetched bank accounts:", data);

      const accounts = data.data || data.bankAccounts || data || [];
      return Array.isArray(accounts) ? accounts : [];
    } catch (err: any) {
      console.error("Failed to fetch bank accounts:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch bank accounts"
      );
    }
  }
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
        return thunkAPI.rejectWithValue("No user ID found");
      }

      const payload = {
        bankName: account.bankName,
        bankCode: account.bankCode,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        currency: account.currency || "NGN",
      };

      console.log("Saving bank account:", payload);

      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1/user/${userId}/bank-accounts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Save bank account response:", data);

      if (!response.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to save bank account"
        );
      }

      const savedAccount = data.data || data.bankAccount || data;
      return savedAccount;
    } catch (err: any) {
      console.error("Failed to save bank account:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to save bank account"
      );
    }
  }
);

// Delete bank account
export const deleteBankAccount = createAsyncThunk(
  "bankAccount/deleteBankAccount",
  async (accountId: string, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token, user } = state.auth;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token");
      }

      const userId = user?.id || user?.userId;
      if (!userId) {
        return thunkAPI.rejectWithValue("No user ID found");
      }

      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1/user/${userId}/bank-accounts/${accountId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to delete bank account"
        );
      }

      return accountId;
    } catch (err: any) {
      console.error("Failed to delete bank account:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to delete bank account"
      );
    }
  }
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
          (account) => account.id !== action.payload
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

export const { clearError, setError, setSelectedAccount, addBankAccountLocal } =
  bankAccountSlice.actions;

export default bankAccountSlice.reducer;
