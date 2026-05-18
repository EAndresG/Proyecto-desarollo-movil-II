import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

const AuthContext = createContext(null);
const SESSION_KEY = 'auth:session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!raw || !isMounted) return;
        const parsed = JSON.parse(raw);
        if (parsed?.email) {
          setUser(parsed);
        }
      } catch (err) {
        // ignore restore errors
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.login(email, password);
      setUser(result);
      try {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(result));
      } catch (err) {
        // ignore storage errors
      }
      return result;
    } catch (err) {
      setError(err?.message || 'Credenciales inválidas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, nombre) => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.register(email, password, nombre);
      setUser(result);
      try {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(result));
      } catch (err) {
        // ignore storage errors
      }
      return result;
    } catch (err) {
      setError(err?.message || 'El email ya está registrado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  }), [user, loading, error, login, register, logout, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
