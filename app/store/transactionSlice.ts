import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { normalizeAuthToken } from "../constants/api";

// Types
export interface PaymentInitPayload {
  amount: number;
  currency: string;
  email?: string;
  memo?: string;
  reference: string;
  redirectUrl: string;
  theme: "light" | "dark";
}

export interface PaymentInitResponse {
  id: string;
  reference: string;
  status: string;
  authorizationUrl?: string;
}

export interface ProcessPaymentPayload {
  asset: string;
  network: string;
  reference: string;
}

export interface ProcessPaymentResponse {
  id: string;
  txRef: string;
  status: "completed" | "pending" | "failed";
  receipt?: string;
}

export interface FundWalletPayload {
  network: string;
}

export interface FundWalletResponse {
  walletAddress: string;
  network: string;
  amount?: number;
  fee?: number;
}

export interface WithdrawalPayload {
  amount: number;
  asset: string;
  network: string;
  payoutAddress: string;
  favorite: boolean;
}

export interface WithdrawalResponse {
  id: string;
  txRef: string;
  status: "initiated" | "processing";
}

export interface InternalTransferPayload {
  email: string;
  amount: number;
  asset: string;
  network: string;
  favorite: boolean;
}

export interface InternalTransferResponse {
  id: string;
  txRef: string;
  status: "completed" | "pending";
  recipient: string;
}

export interface BridgeQuotaPayload {
  amount: number;
  fromAsset: string;
  toAsset: string;
  fromNetwork: string;
  toNetwork: string;
}

export interface BridgeQuotaResponse {
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  minAmount: number;
  maxAmount: number;
}

export interface BridgeExecutePayload {
  amount: number;
  fromAsset: string;
  toAsset: string;
  fromNetwork: string;
  toNetwork: string;
}

export interface BridgeExecuteResponse {
  id: string;
  txRef: string;
  status: "initiated" | "processing" | "completed";
  toAmount: number;
}

type TransactionState = {
  loading: boolean;
  error: string | null;

  // Initialize Payment
  paymentInit: PaymentInitResponse | null;

  // Process Payment
  processedPayment: ProcessPaymentResponse | null;

  // Fund Wallet
  fundWalletResponse: FundWalletResponse | null;

  // Withdrawals
  withdrawal: WithdrawalResponse | null;
  withdrawalLoading: boolean;

  // Internal Transfer
  transfer: InternalTransferResponse | null;
  transferLoading: boolean;

  // Bridge
  bridgeQuota: BridgeQuotaResponse | null;
  bridgeQuotaLoading: boolean;
  bridgeExecution: BridgeExecuteResponse | null;
  bridgeLoading: boolean;
};

const initialState: TransactionState = {
  loading: false,
  error: null,
  paymentInit: null,
  processedPayment: null,
  fundWalletResponse: null,
  withdrawal: null,
  withdrawalLoading: false,
  transfer: null,
  transferLoading: false,
  bridgeQuota: null,
  bridgeQuotaLoading: false,
  bridgeExecution: null,
  bridgeLoading: false,
};

// 2.1 Initialize Payment
export const initializePayment = createAsyncThunk(
  "transaction/initializePayment",
  async (payload: PaymentInitPayload, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;
      const normalizedToken = normalizeAuthToken(token);

      if (!normalizedToken) {
        return thunkAPI.rejectWithValue("Not authenticated");
      }

      console.log("[initializePayment] Starting payment initialization...");
      console.log("[initializePayment] Payload:", payload);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      console.log("[initializePayment] Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("[initializePayment] Error response:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message || `Failed to initialize payment`,
        );
      }

      const data = await response.json();
      console.log("[initializePayment] Success:", data);
      return data.data || data;
    } catch (err: any) {
      console.error("[initializePayment] Exception:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to initialize payment",
      );
    }
  },
);

// 2.2 Process Payment
export const processPayment = createAsyncThunk(
  "transaction/processPayment",
  async (payload: ProcessPaymentPayload, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;
      const normalizedToken = normalizeAuthToken(token);

      if (!normalizedToken) {
        return thunkAPI.rejectWithValue("Not authenticated");
      }

      console.log("[processPayment] Starting payment processing...");
      console.log("[processPayment] Payload:", payload);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/process",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      console.log("[processPayment] Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("[processPayment] Error response:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message || `Failed to process payment`,
        );
      }

      const data = await response.json();
      console.log("[processPayment] Success:", data);
      return data.data || data;
    } catch (err: any) {
      console.error("[processPayment] Exception:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to process payment",
      );
    }
  },
);

// 2.3 Fund Individual Wallet
export const fundWallet = createAsyncThunk(
  "transaction/fundWallet",
  async (payload: FundWalletPayload, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;
      const normalizedToken = normalizeAuthToken(token);

      if (!normalizedToken) {
        return thunkAPI.rejectWithValue("Not authenticated");
      }

      const normalizeNetwork = (value: string) => {
        const normalized = (value || "").toLowerCase().replace(/\s+/g, "-");
        if (
          normalized === "binance" ||
          normalized === "bnb" ||
          normalized === "bsc" ||
          normalized === "bnb-chain" ||
          normalized === "bnb-smart-chain"
        ) {
          return "bnb-smart-chain";
        }
        return normalized;
      };

      const normalizedPayload = {
        ...payload,
        network: normalizeNetwork(payload.network),
      };

      console.log("[fundWallet] Starting wallet funding...");
      console.log("[fundWallet] Network:", normalizedPayload.network);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/individual/fund",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
          body: JSON.stringify(normalizedPayload),
        },
      );

      console.log("[fundWallet] Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("[fundWallet] Error response:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message || `Failed to generate wallet address`,
        );
      }

      const data = await response.json();
      console.log("[fundWallet] Success:", data);
      return data.data || data;
    } catch (err: any) {
      console.error("[fundWallet] Exception:", err);
      return thunkAPI.rejectWithValue(err.message || "Failed to fund wallet");
    }
  },
);

// 2.4 Withdraw from Individual Wallet
export const withdrawWallet = createAsyncThunk(
  "transaction/withdrawWallet",
  async (payload: WithdrawalPayload, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;
      const normalizedToken = normalizeAuthToken(token);

      if (!normalizedToken) {
        return thunkAPI.rejectWithValue("Not authenticated");
      }

      // Validation
      if (payload.amount <= 0) {
        return thunkAPI.rejectWithValue("Amount must be greater than 0");
      }

      if (!payload.payoutAddress) {
        return thunkAPI.rejectWithValue("Payout address is required");
      }

      console.log("[withdrawWallet] Starting wallet withdrawal...");
      console.log("[withdrawWallet] Payload:", payload);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/individual/withdrawal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      console.log("[withdrawWallet] Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("[withdrawWallet] Error response:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message || `Failed to withdraw from wallet`,
        );
      }

      const data = await response.json();
      console.log("[withdrawWallet] Success:", data);
      return data.data || data;
    } catch (err: any) {
      console.error("[withdrawWallet] Exception:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to withdraw from wallet",
      );
    }
  },
);

// 2.5 Internal Transfer
export const internalTransfer = createAsyncThunk(
  "transaction/internalTransfer",
  async (payload: InternalTransferPayload, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token, user } = state.auth;
      const normalizedToken = normalizeAuthToken(token);

      if (!normalizedToken) {
        return thunkAPI.rejectWithValue("Not authenticated");
      }

      // Validation
      if (payload.amount <= 0) {
        return thunkAPI.rejectWithValue("Amount must be greater than 0");
      }

      if (!payload.email) {
        return thunkAPI.rejectWithValue("Recipient email is required");
      }

      if (payload.email === user?.email) {
        return thunkAPI.rejectWithValue(
          "Cannot send to your own email address",
        );
      }

      console.log("[internalTransfer] Starting internal transfer...");
      console.log("[internalTransfer] Payload:", payload);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/internal/transfer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      console.log("[internalTransfer] Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("[internalTransfer] Error response:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message || `Failed to transfer funds`,
        );
      }

      const data = await response.json();
      console.log("[internalTransfer] Success:", data);
      return data.data || data;
    } catch (err: any) {
      console.error("[internalTransfer] Exception:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to transfer funds",
      );
    }
  },
);

// 2.6 Bridge/Swap Quota
export const getBridgeQuota = createAsyncThunk(
  "transaction/getBridgeQuota",
  async (payload: BridgeQuotaPayload, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;
      const normalizedToken = normalizeAuthToken(token);

      if (!normalizedToken) {
        return thunkAPI.rejectWithValue("Not authenticated");
      }

      // Validation
      if (payload.amount <= 0) {
        return thunkAPI.rejectWithValue("Amount must be greater than 0");
      }

      console.log("[getBridgeQuota] Fetching bridge quota...");
      console.log("[getBridgeQuota] Payload:", payload);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/bridge/quota",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      console.log("[getBridgeQuota] Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("[getBridgeQuota] Error response:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message || `Failed to fetch bridge quota`,
        );
      }

      const data = await response.json();
      console.log("[getBridgeQuota] Success:", data);
      return data.data || data;
    } catch (err: any) {
      console.error("[getBridgeQuota] Exception:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch bridge quota",
      );
    }
  },
);

// 2.7 Execute Bridge/Swap
export const executeBridge = createAsyncThunk(
  "transaction/executeBridge",
  async (payload: BridgeExecutePayload, thunkAPI: any) => {
    try {
      const state = thunkAPI.getState();
      const { token } = state.auth;
      const normalizedToken = normalizeAuthToken(token);

      if (!normalizedToken) {
        return thunkAPI.rejectWithValue("Not authenticated");
      }

      // Validation
      if (payload.amount <= 0) {
        return thunkAPI.rejectWithValue("Amount must be greater than 0");
      }

      const normalizeNetwork = (value: string) => {
        const normalized = (value || "").toLowerCase().replace(/\s+/g, "-");
        if (
          normalized === "bnb-chain" ||
          normalized === "bnb-smart-chain" ||
          normalized === "bnb" ||
          normalized === "bsc"
        ) {
          return "bnb-smart-chain";
        }
        return normalized;
      };

      const normalizedPayload = {
        ...payload,
        fromNetwork: normalizeNetwork(payload.fromNetwork),
        toNetwork: normalizeNetwork(payload.toNetwork),
        fromAsset: payload.fromAsset.toLowerCase(),
        toAsset: payload.toAsset.toLowerCase(),
      };

      console.log("[executeBridge] Starting bridge execution...");
      console.log("[executeBridge] Payload:", normalizedPayload);

      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/bridge/execute",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
          body: JSON.stringify(normalizedPayload),
        },
      );

      console.log("[executeBridge] Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("[executeBridge] Error response:", errorData);
        return thunkAPI.rejectWithValue(
          errorData.message || `Failed to execute bridge`,
        );
      }

      const data = await response.json();
      console.log("[executeBridge] Success:", data);
      return data.data || data;
    } catch (err: any) {
      console.error("[executeBridge] Exception:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Failed to execute bridge",
      );
    }
  },
);

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearPaymentInit(state) {
      state.paymentInit = null;
    },
    clearProcessedPayment(state) {
      state.processedPayment = null;
    },
    clearBridgeQuota(state) {
      state.bridgeQuota = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize Payment
    builder
      .addCase(initializePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentInit = action.payload;
      })
      .addCase(initializePayment.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to initialize payment";
      })

      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.processedPayment = action.payload;
      })
      .addCase(processPayment.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to process payment";
      })

      // Fund Wallet
      .addCase(fundWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fundWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.fundWalletResponse = action.payload;
      })
      .addCase(fundWallet.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to generate wallet address";
      })

      // Withdraw Wallet
      .addCase(withdrawWallet.pending, (state) => {
        state.withdrawalLoading = true;
        state.error = null;
      })
      .addCase(withdrawWallet.fulfilled, (state, action) => {
        state.withdrawalLoading = false;
        state.withdrawal = action.payload;
      })
      .addCase(withdrawWallet.rejected, (state, action: any) => {
        state.withdrawalLoading = false;
        state.error = action.payload || "Failed to withdraw";
      })

      // Internal Transfer
      .addCase(internalTransfer.pending, (state) => {
        state.transferLoading = true;
        state.error = null;
      })
      .addCase(internalTransfer.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.transfer = action.payload;
      })
      .addCase(internalTransfer.rejected, (state, action: any) => {
        state.transferLoading = false;
        state.error = action.payload || "Failed to transfer";
      })

      // Get Bridge Quota
      .addCase(getBridgeQuota.pending, (state) => {
        state.bridgeQuotaLoading = true;
        state.error = null;
      })
      .addCase(getBridgeQuota.fulfilled, (state, action) => {
        state.bridgeQuotaLoading = false;
        state.bridgeQuota = action.payload;
      })
      .addCase(getBridgeQuota.rejected, (state, action: any) => {
        state.bridgeQuotaLoading = false;
        state.error = action.payload || "Failed to fetch bridge quota";
      })

      // Execute Bridge
      .addCase(executeBridge.pending, (state) => {
        state.bridgeLoading = true;
        state.error = null;
      })
      .addCase(executeBridge.fulfilled, (state, action) => {
        state.bridgeLoading = false;
        state.bridgeExecution = action.payload;
      })
      .addCase(executeBridge.rejected, (state, action: any) => {
        state.bridgeLoading = false;
        state.error = action.payload || "Failed to execute bridge";
      });
  },
});

export const {
  clearError,
  clearPaymentInit,
  clearProcessedPayment,
  clearBridgeQuota,
} = transactionSlice.actions;

export default transactionSlice.reducer;
