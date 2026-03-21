/* PIN API helpers */
const API_BASE = 'https://api.pay.flipeet.io';

export interface PinSignInRequestDTO {
  email: string;
  pin: number;
}

export async function requestPinOtp(email: string, token: string) {
  const url = `${API_BASE}/api/v1/user/mobile/pin/otp/request?email=${encodeURIComponent(email)}`;
  return fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function verifyPinOtp(pin: number, code: string, token: string) {
  const url = `${API_BASE}/api/v1/user/mobile/pin/otp/verify`;
  return fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pin, code }),
  });
}

export async function pinSignIn(email: string, pin: number) {
  const url = `${API_BASE}/api/v1/auth/mobile/pin/sign-in`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pin }),
  });
}

export async function isPinAvailable(email: string) {
  const url = `${API_BASE}/api/v1/auth/mobile/verify-pin-availablility?email=${encodeURIComponent(email)}`;
  return fetch(url, { method: 'GET' });
}

export default {
  requestPinOtp,
  verifyPinOtp,
  pinSignIn,
  isPinAvailable,
};
