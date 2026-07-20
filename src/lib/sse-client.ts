import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://rumah-keripik.vercel.app';
const COOKIE_KEY = 'rk_session_cookie';

type SSECallback = (event: string, data: unknown) => void;

export function connectSSE(
  path: string,
  callbacks: SSECallback | { onEvent?: SSECallback; onError?: (err: Error) => void },
): () => void {
  let aborted = false;

  const onEvent = typeof callbacks === 'function' ? callbacks : callbacks.onEvent || (() => {});
  const onError = typeof callbacks === 'function' ? () => {} : callbacks.onError || (() => {});

  async function start() {
    if (aborted) return;

    const storedCookie = await AsyncStorage.getItem(COOKIE_KEY);
    const headers: Record<string, string> = {};
    if (storedCookie) {
      headers['Cookie'] = storedCookie;
    }

    try {
      const res = await fetch(`${BASE_URL}${path}`, { headers });

      if (!res.ok || !res.body) {
        onError(new Error(`SSE connection failed: ${res.status}`));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = 'message';

      while (!aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            try {
              const data = JSON.parse(raw);
              onEvent(currentEvent, data);
            } catch {
              onEvent(currentEvent, raw);
            }
          } else if (line === '' && currentEvent) {
            currentEvent = 'message';
          }
        }
      }
    } catch (err) {
      if (!aborted) {
        onError(err instanceof Error ? err : new Error('SSE error'));
      }
    }
  }

  start();

  return () => { aborted = true; };
}
