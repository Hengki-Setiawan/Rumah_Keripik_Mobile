import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = 'offline_queue';

interface QueueItem {
  id: string;
  type: 'chat_message' | 'cart_update' | 'rating';
  payload: unknown;
  createdAt: number;
  attempts: number;
  lastError?: string;
}

export async function enqueue(item: Omit<QueueItem, 'createdAt' | 'attempts'>) {
  const queue = await getQueue();
  queue.push({ ...item, createdAt: Date.now(), attempts: 0 });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function processQueue(fetchFn: (item: QueueItem) => Promise<boolean>) {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;
  const queue = await getQueue();
  if (queue.length === 0) return;
  const remaining: QueueItem[] = [];
  for (const item of queue) {
    if (item.attempts >= 5) { remaining.push(item); continue; }
    try {
      item.attempts++;
      const ok = await fetchFn(item);
      if (!ok) { remaining.push(item); }
    } catch { remaining.push(item); }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}

export async function clearQueue() {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([]));
}

export async function getQueueStatus() {
  const q = await getQueue();
  return { total: q.length, pending: q.filter((i) => i.attempts < 5).length, stuck: q.filter((i) => i.attempts >= 5).length };
}
