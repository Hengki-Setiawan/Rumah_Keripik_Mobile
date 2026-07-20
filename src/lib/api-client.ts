import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ApiResponse,
  ChatCartDto,
  ChatMessageDto,
  ChatSessionSummary,
  CustomerContextDto,
} from './types';

const BASE_URL = 'https://rumah-keripik.vercel.app';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
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

const CUSTOMER_ID_KEY = 'customer_id';

export async function getCustomerId(): Promise<string | null> {
  return AsyncStorage.getItem(CUSTOMER_ID_KEY);
}

export async function setCustomerId(id: string): Promise<void> {
  await AsyncStorage.setItem(CUSTOMER_ID_KEY, id);
}
