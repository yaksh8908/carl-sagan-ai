import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi
      .me()
      .then((data) => active && setUser(data.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await authApi.updateProfile(payload);
    setUser(data.user);
    return data.user;
  }, []);

  /** Chamado quando o servidor responde 401 no meio do uso (sessão expirada). */
  const expireSession = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile, expireSession }),
    [user, loading, login, register, logout, updateProfile, expireSession]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
