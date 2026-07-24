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

export async function getPaymentMethods(): Promise<import('./types').PaymentMethodDto[]> {
  const res = await fetch(`${API_BASE}/api/public/payment-methods`);
  const json = await res.json();
  return json.methods || [];
}

export async function getSavedAddresses(): Promise<import('./types').SavedAddressDto[]> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/api/public/saved-addresses`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json();
  return json.addresses || [];
}

export async function getProfile(): Promise<{ profile: import('./types').CustomerProfileDto | null }> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/api/public/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

export async function checkPaymentStatus(orderId: string): Promise<{ isPaid: boolean; paymentStatus: string }> {
  const res = await fetch(`${API_BASE}/api/public/payment-status?orderId=${encodeURIComponent(orderId)}`);
  const json = await res.json();
  return { isPaid: json.isPaid || false, paymentStatus: json.paymentStatus || '' };
}

export async function getProducts(): Promise<import('./types').ProductDto[]> {
  const res = await fetch(`${API_BASE}/api/public/products`);
  const json = await res.json();
  return json.products || [];
}

export async function getSessions(): Promise<import('./types').ChatSessionSummary[]> {
  const res = await apiFetch<{ sessions: import('./types').ChatSessionSummary[] }>('/api/chat/sessions');
  return res.data?.sessions || [];
}

export async function createSession(forceNew?: boolean): Promise<{
  chatSession: { id: string; stage?: string };
  messages: import('./types').ChatMessageDto[];
  cart: import('./types').ChatCartDto | null;
  customerContext: import('./types').CustomerContextDto | null;
}> {
  const res = await apiFetch<{
    chatSession: { id: string; stage?: string };
    messages: import('./types').ChatMessageDto[];
    cart: import('./types').ChatCartDto | null;
    customerContext: import('./types').CustomerContextDto | null;
    stage: string;
  }>('/api/chat/sessions', { method: 'POST' });
  if (!res.ok || !res.data) throw new Error(res.error || 'Session gagal');
  return {
    chatSession: { id: res.data.chatSession.id, stage: (res.data as any).stage },
    messages: res.data.messages || [],
    cart: res.data.cart || null,
    customerContext: res.data.customerContext || null,
  };
}

export async function sendMessage(sessionId: string, text: string): Promise<{
  messages: import('./types').ChatMessageDto[];
  cart: import('./types').ChatCartDto | null;
  stage?: string;
}> {
  const res = await apiFetch<{
    messages: import('./types').ChatMessageDto[];
    cart: import('./types').ChatCartDto | null;
    stage?: string;
  }>('/api/chat/action', {
    method: 'POST',
    body: JSON.stringify({ chatSessionId: sessionId, action: 'send_message', payload: { text } }),
  });
  if (!res.ok || !res.data) throw new Error(res.error || 'Pesan gagal');
  return { messages: res.data.messages || [], cart: res.data.cart || null, stage: res.data.stage };
}

export async function runAction(
  sessionId: string,
  action: string,
  payload?: Record<string, unknown>
): Promise<{ messages: import('./types').ChatMessageDto[]; cart: import('./types').ChatCartDto | null }> {
  const res = await apiFetch<{
    messages: import('./types').ChatMessageDto[];
    cart: import('./types').ChatCartDto | null;
  }>('/api/chat/action', {
    method: 'POST',
    body: JSON.stringify({ chatSessionId: sessionId, action, payload }),
  });
  if (!res.ok || !res.data) throw new Error(res.error || 'Aksi gagal');
  return { messages: res.data.messages || [], cart: res.data.cart || null };
}

export async function getSessionState(sessionId: string): Promise<{
  messages: import('./types').ChatMessageDto[];
  cart: import('./types').ChatCartDto | null;
  stage: string;
}> {
  const res = await apiFetch<{
    messages: import('./types').ChatMessageDto[];
    cart: import('./types').ChatCartDto | null;
    stage: string;
    chatSession: { stage: string };
  }>(`/api/chat/state?chatSessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok || !res.data) throw new Error(res.error || 'Gagal muat state');
  return {
    messages: res.data.messages || [],
    cart: res.data.cart || null,
    stage: res.data.stage || res.data.chatSession?.stage || '',
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiFetch('/api/chat/sessions', {
    method: 'DELETE',
    body: JSON.stringify({ sessionId }),
  });
}

export async function clearSessions(): Promise<void> {
  await apiFetch('/api/chat/sessions', { method: 'DELETE' });
}

export async function submitRating(orderId: string, rating: number): Promise<void> {
  await fetch(`${API_BASE}/api/order/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getAccessToken()}` },
    body: JSON.stringify({ orderId, rating }),
  });
}
