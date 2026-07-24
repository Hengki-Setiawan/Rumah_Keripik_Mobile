import { useState, useEffect, useCallback } from 'react';
import { apiFetch, setTokens, clearTokens } from './api-client';

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  customer: { phone: string; name: string } | null;
}

export function useJwtAuth() {
  const [state, setState] = useState<AuthState>({ isLoggedIn: false, isLoading: true, customer: null });

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const res = await apiFetch('/api/mobile/auth/me');
    if (res.ok && res.data) {
      setState({ isLoggedIn: true, isLoading: false, customer: (res.data as { customer: { phone: string; name: string } }).customer });
    } else {
      setState({ isLoggedIn: false, isLoading: false, customer: null });
    }
  }

  const login = useCallback(async (phone: string, pin: string) => {
    const res = await fetch('https://rumah-keripik.vercel.app/api/mobile/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin }),
    });
    const data = await res.json();
    if (!data.ok) return { ok: false as const, error: data.error || 'Login gagal' };
    await setTokens(data.accessToken, data.refreshToken);
    setState({ isLoggedIn: true, isLoading: false, customer: data.customer });
    return { ok: true as const };
  }, []);

  const register = useCallback(async (phone: string, name: string, pin: string) => {
    const res = await fetch('https://rumah-keripik.vercel.app/api/mobile/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, register: true, name, pin }),
    });
    const data = await res.json();
    if (!data.ok) return { ok: false as const, error: data.error || 'Registrasi gagal' };
    await setTokens(data.accessToken, data.refreshToken);
    setState({ isLoggedIn: true, isLoading: false, customer: data.customer });
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setState({ isLoggedIn: false, isLoading: false, customer: null });
  }, []);

  return { ...state, login, register, logout };
}
