import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://rumah-keripik.vercel.app';
const COOKIE_KEY = 'rk_session_cookie';
const MAX_RETRIES = 5;
const RETRY_BASE_DELAY = 2000;

type SSECallbacks = {
  onEvent: (event: string, data: unknown) => void;
  onError?: (err: Error) => void;
};

export function connectSSE(
  path: string,
  callbacks: SSECallbacks | ((event: string, data: unknown) => void),
): () => void {
  let aborted = false;
  let retryCount = 0;

  const onEvent = typeof callbacks === 'function' ? callbacks : callbacks.onEvent;
  const onError = typeof callbacks === 'function' ? () => {} : callbacks.onError || (() => {});

  async function connect() {
    if (aborted) return;

    const storedCookie = await SecureStore.getItemAsync(COOKIE_KEY);
    const headers: Record<string, string> = {};
    if (storedCookie) {
      headers['Cookie'] = storedCookie;
    }

    try {
      const res = await fetch(`${BASE_URL}${path}`, { headers });

      if (!res.ok || !res.body) {
        throw new Error(`SSE connection failed: ${res.status}`);
      }

      retryCount = 0;
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
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = RETRY_BASE_DELAY * Math.pow(2, retryCount - 1);
          setTimeout(connect, delay);
        }
      }
      return;
    }

    if (!aborted && retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(connect, RETRY_BASE_DELAY);
    }
  }

  connect();

  return () => { aborted = true; };
}
