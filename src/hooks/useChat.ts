import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatCartDto,
  ChatMessageDto,
  ChatSessionSummary,
  CustomerContextDto,
} from '../lib/types';
import * as api from '../lib/api-client';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [cart, setCart] = useState<ChatCartDto | null>(null);
  const [chatSessionId, setChatSessionId] = useState('');
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState('idle');
  const autoStarted = useRef(false);

  const loadSessions = useCallback(async () => {
    try {
      const loaded = await api.getSessions();
      setSessions(loaded);
      return loaded;
    } catch {
      return [] as ChatSessionSummary[];
    }
  }, []);

  async function bootstrap(forceNew = false) {
    setLoading(true);
    setError('');
    try {
      const data = await api.createSession(forceNew);
      setChatSessionId(data.chatSession.id);
      setMessages(data.messages);
      setCart(data.cart);
      setStarted(data.messages.length > 0);
      setStage(data.chatSession.stage);
      loadSessions();

      if (data.messages.length === 0 && !forceNew) {
        triggerAutoGreeting(
          data.chatSession.id,
          data.customerContext,
          data.cart,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session gagal');
    } finally {
      setLoading(false);
    }
  }

  async function triggerAutoGreeting(
    sessionId: string,
    _ctx: CustomerContextDto | null,
    currentCart: ChatCartDto | null,
  ) {
    if (autoStarted.current) return;
    autoStarted.current = true;
    try {
      const data = await api.runAction(
        sessionId,
        'auto_greet_new',
        { hasCart: (currentCart?.itemCount ?? 0) > 0 },
      );
      setMessages(data.messages);
      setCart(data.cart);
      setStarted(data.messages.length > 0);
    } catch {
      autoStarted.current = false;
    }
  }

  async function sendMessage(text: string) {
    setSending(true);
    setError('');
    try {
      const sessionId =
        chatSessionId || (await api.createSession()).chatSession.id;
      if (!chatSessionId && sessionId) {
        setChatSessionId(sessionId);
      }
      const data = await api.sendMessage(sessionId, text);
      setMessages(data.messages);
      setCart(data.cart);
      setStarted(data.messages.length > 0);
      setStage(data.stage);
      loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pesan gagal');
    } finally {
      setSending(false);
    }
  }

  async function runAction(action: string, payload: Record<string, unknown> = {}) {
    if (action.startsWith('/') || action.startsWith('http')) {
      return;
    }
    setSending(true);
    setError('');
    try {
      const sessionId = chatSessionId || (await api.createSession()).chatSession.id;
      if (!chatSessionId && sessionId) setChatSessionId(sessionId);
      const data = await api.runAction(sessionId, action, payload);
      setMessages(data.messages);
      setCart(data.cart);
      setStarted(data.messages.length > 0);
      setStage(data.stage);
      loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aksi gagal');
    } finally {
      setSending(false);
    }
  }

  async function openSession(sessionId: string) {
    setLoading(true);
    setError('');
    try {
      const data = await api.getSessionState(sessionId);
      setChatSessionId(sessionId);
      setMessages(data.messages);
      setCart(data.cart);
      setStarted(data.messages.length > 0);
      setStage(data.stage);
      loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal buka sesi');
    } finally {
      setLoading(false);
    }
  }

  async function deleteSession(sessionId: string) {
    try {
      await api.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (chatSessionId === sessionId) {
        setChatSessionId('');
        setMessages([]);
        setCart(null);
        setStarted(false);
        setStage('idle');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal hapus');
    }
  }

  async function clearAllSessions() {
    try {
      await api.clearSessions();
      setSessions([]);
      setChatSessionId('');
      setMessages([]);
      setCart(null);
      setStarted(false);
      setStage('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal hapus semua');
    }
  }

  useEffect(() => {
    bootstrap(false);
  }, []);

  const isIdle = !started && messages.length === 0 && !loading && !sending;

  return {
    messages,
    cart,
    chatSessionId,
    sessions,
    loading,
    sending,
    error,
    started,
    stage,
    isIdle,
    sendMessage,
    runAction,
    openSession,
    deleteSession,
    clearAllSessions,
    startNewOrder: () => bootstrap(true),
  };
}
