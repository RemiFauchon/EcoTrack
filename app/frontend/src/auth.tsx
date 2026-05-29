import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, tokenStore } from './api';
import { User } from './types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired?: boolean; mfaToken?: string }>;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tokenStore.access) loadMe();
    else setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.mfaRequired) return { mfaRequired: true, mfaToken: data.mfaToken as string };
    tokenStore.set(data.accessToken, data.refreshToken);
    await loadMe();
    return {};
  }

  async function verifyMfa(mfaToken: string, code: string) {
    const { data } = await api.post('/auth/mfa/verify', { mfaToken, code });
    tokenStore.set(data.accessToken, data.refreshToken);
    await loadMe();
  }

  async function register(payload: { email: string; password: string; firstName: string; lastName: string }) {
    const { data } = await api.post('/auth/register', payload);
    tokenStore.set(data.accessToken, data.refreshToken);
    await loadMe();
  }

  function logout() {
    api.post('/auth/logout').catch(() => undefined);
    tokenStore.clear();
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, verifyMfa, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
