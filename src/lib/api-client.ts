import * as SecureStore from 'expo-secure-store';

const API_BASE = 'https://rumah-keripik.vercel.app';
const ACCESS_TOKEN_KEY = 'rumah_kripik_access_token';
const REFRESH_TOKEN_KEY = 'rumah_kripik_refresh_token';

let accessToken: string | null = null;

export function getApiBase(): string {
  return API_BASE;
}

export async function setTokens(access: string, refresh: string) {
  accessToken = access;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

export async function clearTokens() {
  accessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  if (accessToken) return accessToken;
  accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  return accessToken;
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/api/mobile/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    await setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401 && token) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const newToken = await getAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, error: json?.error || `HTTP ${res.status}`, status: res.status };
  }
  return { ok: true, data: json, status: res.status };
}

export async function trackOrder(
  code: string,
  phone?: string
): Promise<import('./types').OrderTrackResponse> {
  const params = new URLSearchParams({ code });
  if (phone) params.set('phone', phone);
  const res = await fetch(`${API_BASE}/api/order/track?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || 'Pesanan tidak ditemukan');
  }
  return res.json();
}
