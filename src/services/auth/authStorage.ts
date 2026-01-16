import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'auth_session';
const TOKEN_KEY = 'auth_token';

export async function saveSession(token?: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, 'true');
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function loadSession(): Promise<boolean> {
  const session = await SecureStore.getItemAsync(SESSION_KEY);
  return session === 'true';
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
