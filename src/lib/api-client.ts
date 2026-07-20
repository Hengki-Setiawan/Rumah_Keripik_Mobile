import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ApiResponse,
  ChatCartDto,
  ChatMessageDto,
  ChatSessionSummary,
  CustomerContextDto,
  CustomerProfileDto,
  SavedAddressDto,
  OrderDto,
  PaymentMethodDto,
  OrderTrackResponse,
} from './types';

const BASE_URL = 'https://rumah-keripik.vercel.app';
const COOKIE_KEY = 'rk_session_cookie';

async function getStoredCookie(): Promise<string | null> {
  return AsyncStorage.getItem(COOKIE_KEY);
}

async function saveCookieFromResponse(res: Response): Promise<void> {
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    await AsyncStorage.setItem(COOKIE_KEY, setCookie);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const storedCookie = await getStoredCookie();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (storedCookie) {
    headers['Cookie'] = storedCookie;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  await saveCookieFromResponse(res);

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export async function createSession(
  forceNew = false,
): Promise<{
  chatSession: { id: string; stage: string };
  messages: ChatMessageDto[];
  cart: ChatCartDto | null;
  customerContext: CustomerContextDto | null;
}> {
  return request('/api/customer/session', {
    method: 'POST',
    body: JSON.stringify({ forceNew }),
  });
}

export async function sendMessage(
  chatSessionId: string,
  message: string,
): Promise<{
  messages: ChatMessageDto[];
  cart: ChatCartDto | null;
  stage: string;
}> {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ chatSessionId, message }),
  });
}

export async function runAction(
  chatSessionId: string,
  action: string,
  payload: Record<string, unknown> = {},
): Promise<{
  messages: ChatMessageDto[];
  cart: ChatCartDto | null;
  stage: string;
}> {
  return request('/api/chat/action', {
    method: 'POST',
    body: JSON.stringify({ chatSessionId, action, payload }),
  });
}

export async function getSessions(): Promise<ChatSessionSummary[]> {
  const data = await request<{ sessions: ChatSessionSummary[] }>(
    '/api/chat/sessions',
  );
  return data.sessions;
}

export async function getSessionState(chatSessionId: string): Promise<{
  messages: ChatMessageDto[];
  cart: ChatCartDto | null;
  stage: string;
}> {
  return request(
    `/api/chat/state?chatSessionId=${encodeURIComponent(chatSessionId)}`,
  );
}

export async function deleteSession(chatSessionId: string): Promise<void> {
  await request(`/api/chat/sessions/${encodeURIComponent(chatSessionId)}`, {
    method: 'DELETE',
  });
}

export async function clearSessions(): Promise<void> {
  await request('/api/chat/sessions', {
    method: 'DELETE',
  });
}

export async function getProducts() {
  const data = await request<{ products: unknown[] }>(
    '/api/public/products',
  );
  return data.products;
}

export async function getProfile(): Promise<{
  profile: CustomerProfileDto | null;
  addresses: SavedAddressDto[];
  orders: OrderDto[];
}> {
  const data = await request<{
    profile: CustomerProfileDto | null;
    addresses: SavedAddressDto[];
    orders: OrderDto[];
  }>('/api/public/me');
  return data;
}

export async function saveProfile(profile: { nama: string; phone: string; email: string }) {
  return request('/api/public/me', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

export async function getPaymentMethods() {
  const data = await request<{ methods: PaymentMethodDto[] }>('/api/public/payment-methods');
  return data.methods;
}

export async function getSavedAddresses() {
  const data = await request<{ addresses: SavedAddressDto[] }>('/api/public/saved-addresses');
  return data.addresses;
}

export async function saveAddress(address: Partial<SavedAddressDto>) {
  return request('/api/public/saved-addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  });
}

export async function checkPaymentStatus(orderId: string): Promise<{ status: string; paymentStatus: string }> {
  return request(`/api/public/payment-status?orderId=${encodeURIComponent(orderId)}`);
}

export async function trackOrder(code: string, phone?: string, token?: string) {
  const params = new URLSearchParams({ code });
  if (phone) params.set('phone', phone);
  if (token) params.set('token', token);
  return request<OrderTrackResponse>(`/api/order/track?${params.toString()}`);
}

export async function clearSessionCookie(): Promise<void> {
  await AsyncStorage.removeItem(COOKIE_KEY);
}
