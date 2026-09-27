import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setUnauthorizedHandler, TOKEN_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const saveSession = useCallback(({ token, user: nextUser }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      loading,
      logout,
      login: async (email, password) => saveSession((await api.post('/auth/login', { email, password })).data),
      register: async (form) => saveSession((await api.post('/auth/register', form)).data),
    }),
    [user, loading, logout, saveSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
