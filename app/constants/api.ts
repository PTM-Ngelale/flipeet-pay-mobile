export const API_ROOT_URL = "https://api.pay.flipeet.io";
export const API_BASE_URL = `${API_ROOT_URL}/api/v1`;

// ─── Core ─────────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

/** Strip "Bearer " prefix so we can always attach it ourselves. */
export function normalizeAuthToken(token: unknown): string | null {
  if (!token || typeof token !== "string") return null;
  const t = token.trim();
  if (!t || t === "[object Object]") return null;
  return t.toLowerCase().startsWith("bearer ") ? t.slice(7).trim() : t;
}

async function handleResponse(res: Response): Promise<any> {
  if (!res.ok) {
    const text = await res.text();
    let body: any = text;
    let message = text;
    try {
      body = JSON.parse(text);
      message = body.message || body.error || JSON.stringify(body);
    } catch {
      // not JSON — keep raw text
    }
    const err = new Error(message) as Error & { status: number; body: unknown };
    err.status = res.status;
    (err as any).body = body;
    throw err;
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRequest(
  path: string,
  options: RequestOptions = {},
): Promise<any> {
  const { method = "GET", body, token, headers = {} } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (method !== "GET") {
    finalHeaders["Content-Type"] = "application/json";
  }

  const jwt = normalizeAuthToken(token);
  if (jwt) {
    finalHeaders.Authorization = `Bearer ${jwt}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse(res);
}

// Convenience wrappers
export function apiGet(path: string): Promise<any> {
  return apiRequest(path, { method: "GET" });
}

export function apiPost(path: string, body: unknown): Promise<any> {
  return apiRequest(path, { method: "POST", body });
}

export function apiGetAuth(path: string, token: string): Promise<any> {
  return apiRequest(path, { method: "GET", token });
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function getHealth(): Promise<any> {
  const res = await fetch(`${API_ROOT_URL}/api/health`);
  return handleResponse(res);
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export interface LogsQuery {
  sortBy?: "createdAt" | "updatedAt";
  orderBy?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export function getLogs(query: LogsQuery = {}): Promise<any> {
  const params = new URLSearchParams();
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.orderBy) params.append("orderBy", query.orderBy);
  if (query.page != null) params.append("page", String(query.page));
  if (query.limit != null) params.append("limit", String(query.limit));
  const qs = params.toString();
  return apiGet(`/logs${qs ? `?${qs}` : ""}`);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function mobilePinSignIn(payload: {
  email: string;
  pin: number;
}): Promise<any> {
  return apiPost("/auth/mobile/pin/sign-in", payload);
}

export function verifyPinAvailability(email: string): Promise<any> {
  return apiGet(
    `/auth/mobile/verify-pin-availablility?email=${encodeURIComponent(email)}`,
  );
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function requestEmailChangeOtp(
  email: string,
  token: string,
): Promise<any> {
  return apiRequest(
    `/user/email/otp/request?email=${encodeURIComponent(email)}`,
    { method: "GET", token },
  );
}

export function verifyEmailChangeOtp(
  payload: { email: string; code: string },
  token: string,
): Promise<any> {
  return apiRequest("/user/email/otp/verify", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function updatePassword(
  payload: { password: string; repeatPassword: string },
  token: string,
): Promise<any> {
  return apiRequest("/user/password/update", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function resetPassword(
  payload: { password: string; repeatPassword: string },
  token: string,
): Promise<any> {
  return apiRequest("/user/password/reset", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function confirmPasswordReset(
  payload: { code: string },
  token: string,
): Promise<any> {
  return apiRequest("/user/password/reset-confirmation", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function requestPinChangeOtp(
  email: string,
  token: string,
): Promise<any> {
  return apiRequest(
    `/user/mobile/pin/otp/request?email=${encodeURIComponent(email)}`,
    { method: "GET", token },
  );
}

export function verifyPinChangeOtp(
  payload: { pin: number; code: string },
  token: string,
): Promise<any> {
  return apiRequest("/user/mobile/pin/otp/verify", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function updateAvatar(
  payload: { avatar: string },
  token: string,
): Promise<any> {
  return apiRequest("/user/avatar/update", {
    method: "POST",
    body: payload,
    token,
  });
}

export function deleteUserAccount(token: string): Promise<any> {
  return apiRequest("/user/delete", { method: "DELETE", token });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface TransactionFilterQuery {
  merchantUUID: string;
  asset: "*" | "usdc" | "usdt";
  status: "cancelled" | "completed" | "expired" | "pending";
  sortBy: "latest" | "first";
  page: number;
  limit: number;
}

export function filterTransactions(
  query: TransactionFilterQuery,
  token: string,
): Promise<any> {
  const params = new URLSearchParams({
    merchantUUID: query.merchantUUID,
    asset: query.asset,
    status: query.status,
    sortBy: query.sortBy,
    page: String(query.page),
    limit: String(query.limit),
  });
  return apiRequest(`/transaction/filter?${params}`, { method: "GET", token });
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

export function getTransactionStatements(
  query: TransactionStatementsQuery,
  token: string,
): Promise<any> {
  const params = new URLSearchParams({
    type: query.type,
    page: String(query.page),
    limit: String(query.limit),
  });
  return apiRequest(`/transaction/statements?${params}`, {
    method: "GET",
    token,
  });
}

export function getTransactionChartData(
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
): Promise<any> {
  const params = new URLSearchParams({
    merchantUUID: query.merchantUUID,
    period: query.period,
    currency: query.currency,
  });
  return apiRequest(`/transaction/chart-data?${params}`, {
    method: "GET",
    token,
  });
}

export function getTransactionByTxRef(
  txRef: string,
  token: string,
): Promise<any> {
  return apiRequest(`/transaction?txRef=${encodeURIComponent(txRef)}`, {
    method: "GET",
    token,
  });
}

export function getTransactionByTxRefPath(
  txRef: string,
  token: string,
): Promise<any> {
  return apiRequest(`/transaction/${encodeURIComponent(txRef)}`, {
    method: "GET",
    token,
  });
}

export function downloadTransactionReceipt(
  txRef: string,
  token: string,
): Promise<any> {
  return apiRequest(`/transaction/${encodeURIComponent(txRef)}/receipt`, {
    method: "GET",
    token,
  });
}

export function cancelTransaction(txRef: string, token: string): Promise<any> {
  return apiRequest(`/transaction/cancel/${encodeURIComponent(txRef)}`, {
    method: "DELETE",
    token,
  });
}

export function convertPaymentAmount(payload: {
  amount: number;
  asset: string;
  currency: string;
}): Promise<any> {
  return apiRequest("/transaction/convert", { method: "POST", body: payload });
}

export function processPayment(payload: {
  asset: string;
  network: string;
  reference: string;
}): Promise<any> {
  return apiRequest("/transaction/process", { method: "POST", body: payload });
}

export function fundIndividualWallet(payload: {
  network: string;
}): Promise<any> {
  return apiRequest("/transaction/individual/fund", {
    method: "POST",
    body: payload,
  });
}

export function withdrawIndividualWallet(payload: {
  amount: number;
  asset: "usdc";
  network: "solana";
  payoutAddress: string;
  favorite: boolean;
}): Promise<any> {
  return apiRequest("/transaction/individual/withdrawal", {
    method: "POST",
    body: payload,
  });
}

export function internalTransfer(payload: {
  email: string;
  amount: number;
  asset: "usdc";
  network: "solana";
  favorite: boolean;
}): Promise<any> {
  return apiRequest("/transaction/internal/transfer", {
    method: "POST",
    body: payload,
  });
}

export function getBridgeQuota(payload: {
  amount: number;
  fromAsset: "usdc";
  toAsset: "usdc";
  fromNetwork: "solana";
  toNetwork: "solana";
}): Promise<any> {
  return apiRequest("/transaction/bridge/quota", {
    method: "POST",
    body: payload,
  });
}

export function executeBridge(payload: {
  amount: number;
  fromAsset: "usdc";
  toAsset: "usdc";
  fromNetwork: "solana";
  toNetwork: "solana";
}): Promise<any> {
  return apiRequest("/transaction/bridge/execute", {
    method: "POST",
    body: payload,
  });
}

// ─── Ramp ─────────────────────────────────────────────────────────────────────

export function getRampCurrencies(
  params: { provider?: string },
  token: string,
): Promise<any> {
  const search = new URLSearchParams();
  if (params.provider) search.append("provider", params.provider);
  const qs = search.toString();
  return apiRequest(`/ramp/currencies${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token,
  });
}

export function getRampRate(
  query: {
    amount: number;
    asset: string;
    currency: string;
    provider: string;
  },
  token: string,
): Promise<any> {
  const params = new URLSearchParams({
    amount: String(query.amount),
    asset: query.asset,
    currency: query.currency,
    provider: query.provider,
  });
  return apiRequest(`/ramp/rate?${params}`, { method: "GET", token });
}

export function getRampBanks(
  query: { currencyCode: string; provider?: string },
  token: string,
): Promise<any> {
  const params = new URLSearchParams({ currencyCode: query.currencyCode });
  if (query.provider) params.append("provider", query.provider);
  return apiRequest(`/ramp/banks?${params}`, { method: "GET", token });
}

export function getLocalAccounts(
  query: { currency?: string; provider?: string; sendFeature?: boolean },
  token: string,
): Promise<any> {
  const params = new URLSearchParams();
  if (query.currency) params.append("currency", query.currency);
  if (query.provider) params.append("provider", query.provider);
  if (query.sendFeature != null)
    params.append("sendFeature", String(query.sendFeature));
  return apiRequest(`/ramp/local/accounts?${params}`, {
    method: "GET",
    token,
  });
}

export function verifyLocalAccount(
  payload: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    currency: string;
    provider: string;
  },
  token: string,
): Promise<any> {
  return apiRequest("/ramp/local/verify-account", {
    method: "POST",
    body: payload,
    token,
  });
}

export function addLocalAccount(
  payload: {
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankName: string;
    currency: string;
    provider: string;
  },
  token: string,
): Promise<any> {
  return apiRequest("/ramp/local/add-account", {
    method: "POST",
    body: payload,
    token,
  });
}

export function deleteLocalAccount(id: string, token: string): Promise<any> {
  return apiRequest(`/ramp/local/account/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export function getRampWallets(
  query: { provider: string; page: number; walletId?: string },
  token: string,
): Promise<any> {
  const params = new URLSearchParams({
    provider: query.provider,
    page: String(query.page),
  });
  if (query.walletId) params.append("walletId", query.walletId);
  return apiRequest(`/ramp/local/wallets?${params}`, { method: "GET", token });
}

export function getOffRampQuota(
  payload: {
    amount: number;
    asset: string;
    currency: string;
    network: string;
    provider: string;
  },
  token: string,
): Promise<any> {
  return apiRequest("/ramp/off/quota", {
    method: "POST",
    body: payload,
    token,
  });
}

export function initializeOffRamp(
  payload: {
    localBankId: string;
    amount: number;
    asset: string;
    rate: number;
    network: string;
    provider: string;
  },
  token: string,
): Promise<any> {
  return apiRequest("/ramp/off/initialize", {
    method: "POST",
    body: payload,
    token,
  });
}

export function initializeSendOrder(
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
): Promise<any> {
  return apiRequest("/ramp/send/initialize", {
    method: "POST",
    body: payload,
    token,
  });
}

// ─── Commerce ─────────────────────────────────────────────────────────────────

export function getCommerceAirtimeCompanies(token: string): Promise<any> {
  return apiRequest("/commerce/airtime/companies", { method: "GET", token });
}

export function getCommerceElectricityCompanies(token: string): Promise<any> {
  return apiRequest("/commerce/electricity/companies", {
    method: "GET",
    token,
  });
}

export function initializeCommerceAirtime(
  payload: {
    provider: string;
    phoneNumber: string;
    disco: string;
    amount: number;
    asset: string;
    network: string;
  },
  token: string,
): Promise<any> {
  return apiRequest("/commerce/airtime/initialize", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getCommerceDiscoPrices(
  query: { service: "DATA" | "TV"; disco: string },
  token: string,
): Promise<any> {
  const params = new URLSearchParams({
    service: query.service,
    disco: query.disco,
  });
  return apiRequest(`/commerce/disco/prices?${params}`, {
    method: "GET",
    token,
  });
}

export function initializeCommerceDataTv(
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
): Promise<any> {
  return apiRequest("/commerce/dataTv/initialize", {
    method: "POST",
    body: payload,
    token,
  });
}

export function initializeCommerceElectricity(
  payload: {
    discoName: string;
    meterNumber: string;
    type: string;
    amount: number;
    phoneNumber?: string;
    asset: string;
    network: string;
  },
  token: string,
): Promise<any> {
  return apiRequest("/commerce/electricity/initialize", {
    method: "POST",
    body: payload,
    token,
  });
}

export function fetchCommerceElectricityMeterInfo(
  query: { provider: string; meterNumber: string; meterType?: string },
  token: string,
): Promise<any> {
  const params = new URLSearchParams({
    provider: query.provider,
    meterNumber: query.meterNumber,
  });
  if (query.meterType) params.append("meterType", query.meterType);
  return apiRequest(`/commerce/electricity/fetchMeter?${params}`, {
    method: "GET",
    token,
  });
}

export function verifyCommerceElectricityMeter(
  payload: { electId: string; meterNumber: string },
  token: string,
): Promise<any> {
  return apiRequest("/commerce/electricity/meter-verification", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getCommerceTransactionById(
  txRef: string,
  token: string,
): Promise<any> {
  return apiRequest(
    `/commerce/transactions/id?txRef=${encodeURIComponent(txRef)}`,
    { method: "GET", token },
  );
}

export async function uploadProfileImage(
  imageUri: string,
  token: string,
): Promise<any> {
  const filename = imageUri.split("/").pop() || "profile.jpg";
  const ext = filename.split(".").pop()?.toLowerCase();
  const type = ext === "png" ? "image/png" : "image/jpeg";

  const formData = new FormData();
  formData.append("file", { uri: imageUri, name: filename, type } as any);

  const jwt = normalizeAuthToken(token);
  const headers: Record<string, string> = {};
  if (jwt) headers.Authorization = `Bearer ${jwt}`;

  const res = await fetch(`${API_BASE_URL}/user/profile-image/update`, {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse(res);
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export function filterWebhooks(
  query: { page: number; limit: number; status: "*" | "successful" | "failed" },
  token: string,
): Promise<any> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    status: query.status,
  });
  return apiRequest(`/webhook/filter?${params}`, { method: "GET", token });
}

export function resendWebhook(webhookId: string, token: string): Promise<any> {
  return apiRequest(`/webhook/${encodeURIComponent(webhookId)}`, {
    method: "PUT",
    token,
  });
}
