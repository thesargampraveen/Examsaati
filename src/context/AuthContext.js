import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);
// (kept untyped on purpose — screens are plain JS; App.tsx casts its own types)

const TOKEN_KEY = '@examsaathi/token';
const USER_KEY = '@examsaathi/user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setAuthToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // ignore corrupt storage — fall through to login
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistSession = async (newToken, newUser) => {
    setToken(newToken);
    setAuthToken(newToken);
    setUser(newUser);
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      async signInWithToken(newToken, newUser) {
        await persistSession(newToken, newUser);
      },
      async updateUser(partial) {
        const merged = { ...user, ...partial };
        setUser(merged);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(merged));
        try {
          const fresh = await api.me();
          if (fresh?.user) {
            setUser(fresh.user);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh.user));
          }
        } catch {
          // keep the merged copy when offline
        }
      },
      async signOut() {
        setToken(null);
        setAuthToken(null);
        setUser(null);
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
      },
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
