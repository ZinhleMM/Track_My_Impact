"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  setToken,
  clearToken,
  getToken,
} from "@/lib/api";
import type { UserProfile } from "@/types/user";
import type { RegisterPayload } from "@/types/auth";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 const bootstrap = useCallback(async () => {
   const token = getToken();
   if (!token) {
     setUser(null);
     setLoading(false);
     return;
   }

   try {
     const profile = await fetchCurrentUser();
     setUser(profile);
      setError(null);
   } catch (err) {
      console.info("Clearing expired credentials", err);
      clearToken();
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const token = await loginRequest(username, password);
      setToken(token);
      const profile = await fetchCurrentUser();
      setUser(profile);
      setError(null);
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err?.message || "Unable to sign in");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      await registerRequest(payload);
      await login(payload.username, payload.password);
    } catch (err: any) {
      console.error("Registration failed", err);
      setError(err?.message || "Unable to register");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.warn("Logout request failed", err);
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout, refresh: bootstrap }),
    [user, loading, error, login, register, logout, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
