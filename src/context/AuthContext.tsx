import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import * as api from '../services/api';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userId: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
  loading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('fate0_userId'));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, password);
      setUserId(data.userId);
      localStorage.setItem('fate0_userId', data.userId);
    } catch (e) {
      setError(e instanceof api.ApiError ? e.message : 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register(email, password);
      setUserId(data.userId);
      localStorage.setItem('fate0_userId', data.userId);
    } catch (e) {
      setError(e instanceof api.ApiError ? e.message : 'Registration failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUserId(null);
    localStorage.removeItem('fate0_userId');
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: api.isLoggedIn(),
        userId,
        login,
        register,
        logout,
        error,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
