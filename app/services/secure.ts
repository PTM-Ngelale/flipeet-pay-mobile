import * as SecureStore from 'expo-secure-store';

export async function saveToken(token: string) {
  return SecureStore.setItemAsync('authToken', token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('authToken');
}

export async function setPinEnabled(enabled: boolean) {
  return SecureStore.setItemAsync('pinEnabled', enabled ? 'true' : 'false');
}

export async function isPinEnabled(): Promise<boolean> {
  const v = await SecureStore.getItemAsync('pinEnabled');
  return v === 'true';
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync('authToken');
  await SecureStore.deleteItemAsync('pinEnabled');
}

export default {
  saveToken,
  getToken,
  setPinEnabled,
  isPinEnabled,
  clearAuth,
};
