export const API_ROOT_URL = "https://api.pay.flipeet.io";
export const API_BASE_URL = `${API_ROOT_URL}/api/v1`;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  token?: string | null;
  headers?: Record<string, string>;
}

function findTokenValue(value: any): string | null {
  if (!value || typeof value !== "object") return null;

  const directKeys = ["accessToken", "token", "jwt", "idToken"];
  for (const key of directKeys) {
    if (typeof value[key] === "string" && value[key].trim()) {
      return value[key].trim();
    }
  }

  const nestedKeys = ["data", "credentials", "session", "auth"];
  for (const key of nestedKeys) {
    if (value[key]) {
      const nested = findTokenValue(value[key]);
      if (nested) return nested;
    }
  }

  return null;
}

export function normalizeAuthToken(token?: unknown): string | null {
  if (!token) return null;

  if (typeof token === "object") {
    const extracted = findTokenValue(token);
    return extracted || null;
  }

  let raw = String(token).trim();
  if (!raw || raw === "[object Object]") return null;

  if (raw.toLowerCase().startsWith("bearer ")) {
    raw = raw.slice(7).trim();
  }

  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      const extracted = findTokenValue(parsed);
      if (extracted) return extracted;
    } catch {
      // ignore parse errors and fall back to raw
    }
  }

  return raw;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch {}
    throw new Error(errorMessage);
  }
  // Some endpoints may return no body (204, file download, etc.)
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRequest(path: string, options: RequestOptions = {}) {
  const { method = "GET", body, token, headers = {} } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const normalizedToken = normalizeAuthToken(token);
  if (normalizedToken) {
    finalHeaders.Authorization = `Bearer ${normalizedToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse(res);
}

export async function apiGet(path: string) {
  return apiRequest(path, { method: "GET" });
}

export async function apiPost(path: string, body: any) {
  return apiRequest(path, { method: "POST", body });
}

export async function apiGetAuth(path: string, token: string) {
  return apiRequest(path, { method: "GET", token });
}

// ---------- Health & Logs ----------

export async function getHealth() {
  // /api/health lives one level above /api/v1
  const res = await fetch(`${API_ROOT_URL}/api/health`, {
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

export interface LogsQuery {
  sortBy?: "createdAt" | "updatedAt";
  orderBy?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function getLogs(query: LogsQuery = {}) {
  const params = new URLSearchParams();
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.orderBy) params.append("orderBy", query.orderBy);
  if (query.page != null) params.append("page", String(query.page));
  if (query.limit != null) params.append("limit", String(query.limit));

  const qs = params.toString();
  return apiGet(`/logs${qs ? `?${qs}` : ""}`);
}

// ---------- Auth (additional helpers, existing flows already integrated) ----------

export async function mobilePinSignIn(payload: { email: string; pin: number }) {
  return apiPost(`/auth/mobile/pin/sign-in`, payload);
}

export async function verifyPinAvailability(email: string) {
  return apiGet(
    `/auth/mobile/verify-pin-availablility?email=${encodeURIComponent(email)}`,
  );
}

// ---------- User management helpers ----------

export async function requestEmailChangeOtp(email: string, token: string) {
  return apiRequest(
    `/user/email/otp/request?email=${encodeURIComponent(email)}`,
    { method: "GET", token },
  );
}

export async function verifyEmailChangeOtp(
  payload: { email: string; code: string },
  token: string,
) {
  return apiRequest(`/user/email/otp/verify`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function updatePassword(
  payload: { password: string; repeatPassword: string },
  token: string,
) {
  return apiRequest(`/user/password/update`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function resetPassword(
  payload: { password: string; repeatPassword: string },
  token: string,
) {
  return apiRequest(`/user/password/reset`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function confirmPasswordReset(
  payload: { code: string },
  token: string,
) {
  return apiRequest(`/user/password/reset-confirmation`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function requestPinChangeOtp(email: string, token: string) {
  return apiRequest(
    `/user/mobile/pin/otp/request?email=${encodeURIComponent(email)}`,
    { method: "GET", token },
  );
}

export async function verifyPinChangeOtp(
  payload: { pin: number; code: string },
  token: string,
) {
  return apiRequest(`/user/mobile/pin/otp/verify`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function updateAvatar(payload: { avatar: string }, token: string) {
  return apiRequest(`/user/avatar/update`, {
    method: "POST",
    body: payload,
    token,
  });
}

export async function deleteUserAccount(token: string) {
  return apiRequest(`/user/delete`, {
    method: "DELETE",
    token,
  });
}

// ---------- Transaction helpers ----------

export interface TransactionFilterQuery {
  merchantUUID: string;
  asset: "*" | "usdc" | "usdt";
  status: "cancelled" | "completed" | "expired" | "pending";
  sortBy: "latest" | "first";
  page: number;
  limit: number;
}

export async function filterTransactions(
  query: TransactionFilterQuery,
  token: string,
) {
  const params = new URLSearchParams();
  params.append("merchantUUID", query.merchantUUID);
  params.append("asset", query.asset);
  params.append("status", query.status);
  params.append("sortBy", query.sortBy);
  params.append("page", String(query.page));
  params.append("limit", String(query.limit));

  return apiRequest(`/transaction/filter?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export interface TransactionStatementsQuery {
  type:
    | "*"
    | "deposit"
    | "withdrawal"
    | "internal_transfer"
    | "bridge"
    | "offramp"
    | "onramp"
    | "purchase"
    | "airtime"
    | "electricity";
  page: number;
  limit: number;
}

export async function getTransactionStatements(
  query: TransactionStatementsQuery,
  token: string,
) {
  const params = new URLSearchParams();
  params.append("type", query.type);
  params.append("page", String(query.page));
  params.append("limit", String(query.limit));

  return apiRequest(`/transaction/statements?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function getTransactionChartData(
  query: {
    merchantUUID: string;
    period:
      | "today"
      | "allTime"
      | "last7days"
      | "last30days"
      | "last90days"
      | "thisMonth"
      | "thisYear";
    currency:
      | "XOF-BEN"
      | "XOF-CIV"
      | "UGX"
      | "TZS"
      | "KES"
      | "GHS"
      | "NGN"
      | "USD";
  },
  token: string,
) {
  const params = new URLSearchParams();
  params.append("merchantUUID", query.merchantUUID);
  params.append("period", query.period);
  params.append("currency", query.currency);

  return apiRequest(`/transaction/chart-data?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function getTransactionByTxRef(txRef: string, token: string) {
  return apiRequest(`/transaction?txRef=${encodeURIComponent(txRef)}`, {
    method: "GET",
    token,
  });
}

export async function getTransactionByTxRefPath(txRef: string, token: string) {
  return apiRequest(`/transaction/${encodeURIComponent(txRef)}`, {
    method: "GET",
    token,
  });
}

export async function downloadTransactionReceipt(txRef: string, token: string) {
  return apiRequest(`/transaction/${encodeURIComponent(txRef)}/receipt`, {
    method: "GET",
    token,
  });
}

export async function cancelTransaction(txRef: string, token: string) {
  return apiRequest(`/transaction/cancel/${encodeURIComponent(txRef)}`, {
    method: "DELETE",
    token,
  });
}

export async function convertPaymentAmount(payload: {
  amount: number;
  asset: string;
  currency: string;
}) {
  return apiRequest(`/transaction/convert`, {
    method: "POST",
    body: payload,
  });
}

export async function processPayment(payload: {
  asset: string;
  network: string;
  reference: string;
}) {
  return apiRequest(`/transaction/process`, {
    method: "POST",
    body: payload,
  });
}

export async function fundIndividualWallet(payload: { network: string }) {
  return apiRequest(`/transaction/individual/fund`, {
    method: "POST",
    body: payload,
  });
}

export async function withdrawIndividualWallet(payload: {
  amount: number;
  asset: "usdc";
  network: "solana";
  payoutAddress: string;
  favorite: boolean;
}) {
  return apiRequest(`/transaction/individual/withdrawal`, {
    method: "POST",
    body: payload,
  });
}

export async function internalTransfer(payload: {
  email: string;
  amount: number;
  asset: "usdc";
  network: "solana";
  favorite: boolean;
}) {
  return apiRequest(`/transaction/internal/transfer`, {
    method: "POST",
    body: payload,
  });
}

export async function getBridgeQuota(payload: {
  amount: number;
  fromAsset: "usdc";
  toAsset: "usdc";
  fromNetwork: "solana";
  toNetwork: "solana";
}) {
  return apiRequest(`/transaction/bridge/quota`, {
    method: "POST",
    body: payload,
  });
}

export async function executeBridge(payload: {
  amount: number;
  fromAsset: "usdc";
  toAsset: "usdc";
  fromNetwork: "solana";
  toNetwork: "solana";
}) {
  return apiRequest(`/transaction/bridge/execute`, {
    method: "POST",
    body: payload,
  });
}

// ---------- Ramp helpers ----------

export async function getRampCurrencies(
  params: { provider?: string },
  token: string,
) {
  const search = new URLSearchParams();
  if (params.provider) search.append("provider", params.provider);
  return apiRequest(
    `/ramp/currencies${search.toString() ? `?${search.toString()}` : ""}`,
    {
      method: "GET",
      token,
    },
  );
}

export async function getRampRate(
  query: {
    amount: number;
    asset: string;
    currency: string;
    provider: string;
  },
  token: string,
) {
  const params = new URLSearchParams();
  params.append("amount", String(query.amount));
  params.append("asset", query.asset);
  params.append("currency", query.currency);
  params.append("provider", query.provider);

  return apiRequest(`/ramp/rate?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function getRampBanks(
  query: {
    currencyCode: string;
    provider?: string;
  },
  token: string,
) {
  const params = new URLSearchParams();
  params.append("currencyCode", query.currencyCode);
  if (query.provider) params.append("provider", query.provider);

  return apiRequest(`/ramp/banks?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function getLocalAccounts(
  query: {
    currency?: string;
    provider?: string;
    sendFeature?: boolean;
  },
  token: string,
) {
  const params = new URLSearchParams();
  if (query.currency) params.append("currency", query.currency);
  if (query.provider) params.append("provider", query.provider);
  if (query.sendFeature != null)
    params.append("sendFeature", String(query.sendFeature));

  return apiRequest(`/ramp/local/accounts?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function verifyLocalAccount(
  payload: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    currency: string;
    provider: string;
  },
  token: string,
) {
  return apiRequest(`/ramp/local/verify-account`, {
    method: "POST",
    body: payload,
    token,
  });
}

export async function addLocalAccount(
  payload: {
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankName: string;
    currency: string;
    provider: string;
  },
  token: string,
) {
  return apiRequest(`/ramp/local/add-account`, {
    method: "POST",
    body: payload,
    token,
  });
}

export async function deleteLocalAccount(id: string, token: string) {
  return apiRequest(`/ramp/local/account/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export async function getRampWallets(
  query: { provider: string; page: number; walletId?: string },
  token: string,
) {
  const params = new URLSearchParams();
  params.append("provider", query.provider);
  params.append("page", String(query.page));
  if (query.walletId) params.append("walletId", query.walletId);

  return apiRequest(`/ramp/local/wallets?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function getOffRampQuota(
  payload: {
    amount: number;
    asset: string;
    currency: string;
    network: string;
    provider: string;
  },
  token: string,
) {
  return apiRequest(`/ramp/off/quota`, {
    method: "POST",
    body: payload,
    token,
  });
}

export async function initializeOffRamp(
  payload: {
    localBankId: string;
    amount: number;
    asset: string;
    rate: number;
    network: string;
    provider: string;
  },
  token: string,
) {
  return apiRequest(`/ramp/off/initialize`, {
    method: "POST",
    body: payload,
    token,
  });
}

export async function initializeSendOrder(
  payload: {
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankName: string;
    amount: number;
    asset: string;
    rate: number;
    network: string;
    currency: string;
    favorite: boolean;
    provider: string;
  },
  token: string,
) {
  return apiRequest(`/ramp/send/initialize`, {
    method: "POST",
    body: payload,
    token,
  });
}

// ---------- Commerce helpers ----------

export interface AirtimeCompany {
  id?: string | number;
  name?: string;
  code?: string;
  provider?: string;
  disco?: string;
  logo?: string;
  logoUrl?: string;
}

export async function getCommerceAirtimeCompanies(token: string) {
  return apiRequest(`/commerce/airtime/companies`, {
    method: "GET",
    token,
  });
}

export async function getCommerceElectricityCompanies(token: string) {
  return apiRequest(`/commerce/electricity/companies`, {
    method: "GET",
    token,
  });
}

export async function initializeCommerceAirtime(
  payload: {
    provider: string;
    phoneNumber: string;
    disco?: string;
    amount: number;
    asset: string;
    network: string;
  },
  token: string,
) {
  return apiRequest(`/commerce/airtime/initialize`, {
    method: "POST",
    body: payload,
    token,
  });
}

export async function getCommerceDiscoPrices(
  query: { service: "DATA" | "TV"; disco: string },
  token: string,
) {
  const params = new URLSearchParams();
  params.append("service", query.service);
  params.append("disco", query.disco);

  return apiRequest(`/commerce/disco/prices?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function initializeCommerceDataTv(
  payload: {
    number: string;
    disco: string;
    tariffClass: string;
    amount: number;
    phoneNumber: string;
    type: "DATA" | "TV";
    asset: string;
    network: string;
  },
  token: string,
) {
  return apiRequest(`/commerce/dataTv/initialize`, {
    method: "POST",
    body: payload,
    token,
  });
}

// ---------- Webhook helpers ----------

export async function filterWebhooks(
  query: { page: number; limit: number; status: "*" | "successful" | "failed" },
  token: string,
) {
  const params = new URLSearchParams();
  params.append("page", String(query.page));
  params.append("limit", String(query.limit));
  params.append("status", query.status);

  return apiRequest(`/webhook/filter?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function resendWebhook(webhookId: string, token: string) {
  return apiRequest(`/webhook/${encodeURIComponent(webhookId)}`, {
    method: "PUT",
    token,
  });
}
